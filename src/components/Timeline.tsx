import type { Figure, CategoryDef, RelationTypeDef } from "@/types/figures";
import { resolveTranslation, flattenCategories } from "@/types/figures";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { formatRange, formatYear, gregorianToHijri } from "@/lib/hijri";

/** Root-level category color classes */
const ROOT_CAT_COLORS: Record<string, string> = {
  science: "bg-science",
  religion: "bg-religion",
  authority: "bg-authority",
  philosophy: "bg-philosophy",
};

const ROOT_CAT_BORDER: Record<string, string> = {
  science: "border-science",
  religion: "border-religion",
  authority: "border-authority",
  philosophy: "border-philosophy",
};

interface Props {
  figures: Figure[];
  allFigures: Figure[];
  categoryDefs: CategoryDef[];
  relationTypeDefs: RelationTypeDef[];
  rootMap: Map<string, string>;
}

export default function Timeline({ figures, allFigures, categoryDefs, relationTypeDefs, rootMap }: Props) {
  const { lang, calendar, t } = useI18n();

  const allCatDefs = useMemo(() => flattenCategories(categoryDefs), [categoryDefs]);

  const catNameMap = useMemo(() => {
    const m = new Map<string, string>();
    allCatDefs.forEach((c) => m.set(c.id, resolveTranslation(c.name, lang)));
    return m;
  }, [allCatDefs, lang]);

  const relTypeNameMap = useMemo(() => {
    const m = new Map<string, string>();
    relationTypeDefs.forEach((r) => m.set(r.id, resolveTranslation(r.name, lang)));
    return m;
  }, [relationTypeDefs, lang]);

  const [selected, setSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const figureRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number; path: string; labelX: number; labelY: number; label: string }[]
  >([]);

  const figureMap = useMemo(() => {
    const m = new Map<string, Figure>();
    allFigures.forEach((f) => m.set(f.id, f));
    return m;
  }, [allFigures]);

  const { minYear, maxYear } = useMemo(() => {
    if (figures.length === 0) return { minYear: 900, maxYear: 1300 };
    const born = figures.map((f) => f.born);
    const died = figures.map((f) => f.died);
    return {
      minYear: Math.floor(Math.min(...born) / 50) * 50,
      maxYear: Math.ceil(Math.max(...died) / 50) * 50,
    };
  }, [figures]);

  const span = maxYear - minYear || 1;

  const ticks = useMemo(() => {
    const step = span <= 200 ? 25 : span <= 500 ? 50 : 100;
    const arr: number[] = [];
    for (let y = minYear; y <= maxYear; y += step) arr.push(y);
    return arr;
  }, [minYear, maxYear, span]);

  const getLeft = (year: number) => ((year - minYear) / span) * 100;

  const sorted = useMemo(
    () => [...figures].sort((a, b) => a.born - b.born),
    [figures]
  );

  const rows = useMemo(() => {
    const ends: number[] = [];
    return sorted.map((f) => {
      for (let r = 0; r < ends.length; r++) {
        if (f.born >= ends[r]) {
          ends[r] = f.died;
          return r;
        }
      }
      ends.push(f.died);
      return ends.length - 1;
    });
  }, [sorted]);

  const selectedFigure = selected ? figureMap.get(selected) : null;

  const computeLines = useCallback(() => {
    if (!selected || !containerRef.current) {
      setLines([]);
      return;
    }
    const fig = figureMap.get(selected);
    if (!fig?.relations) {
      setLines([]);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: typeof lines = [];

    for (const rel of fig.relations) {
      const srcEl = figureRefs.current[fig.id];
      const tgtEl = figureRefs.current[rel.target];
      if (!srcEl || !tgtEl) continue;

      const srcRect = srcEl.getBoundingClientRect();
      const tgtRect = tgtEl.getBoundingClientRect();

      const x1 = srcRect.left + srcRect.width / 2 - containerRect.left;
      const y1 = srcRect.top + srcRect.height / 2 - containerRect.top;
      const x2 = tgtRect.left + tgtRect.width / 2 - containerRect.left;
      const y2 = tgtRect.top + tgtRect.height / 2 - containerRect.top;

      // Create a curved path that arcs above/below the bars
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curveOffset = Math.min(dist * 0.4, 120) * (y2 >= y1 ? -1 : 1);

      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2 + curveOffset;

      newLines.push({
        x1, y1, x2, y2,
        path: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`,
        labelX: mx,
        labelY: my,
        label: relTypeNameMap.get(rel.type) || rel.type,
      });
    }

    setLines(newLines);
  }, [selected, figureMap, relTypeNameMap]);

  useEffect(() => {
    computeLines();
    window.addEventListener("resize", computeLines);
    return () => window.removeEventListener("resize", computeLines);
  }, [computeLines]);

  const relatedIds = useMemo(() => {
    if (!selectedFigure?.relations) return new Set<string>();
    return new Set(selectedFigure.relations.map((r) => r.target));
  }, [selectedFigure]);

  /** Get the root category color for a figure (uses first category) */
  const getRootColor = (catId: string) => rootMap.get(catId) || catId;

  const formatTickYear = (year: number) => {
    return formatYear(year, calendar, lang).replace(/ (AH|CE|BCE|هـ|م|ق\.م)$/, '');
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* SVG overlay for relation lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M 0 0 L 8 3 L 0 6 Z" fill="hsl(var(--primary))" fillOpacity="0.6" />
          </marker>
        </defs>
        <AnimatePresence>
          {lines.map((line, i) => (
            <g key={`${line.x1}-${line.y1}-${line.x2}-${line.y2}-${i}`}>
              <motion.path
                d={line.path}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                markerEnd="url(#arrowhead)"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 0.5, pathLength: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              <motion.text
                x={line.labelX}
                y={line.labelY - 6}
                textAnchor="middle"
                fontSize="10"
                fill="hsl(var(--muted-foreground))"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
              >
                {line.label}
              </motion.text>
            </g>
          ))}
        </AnimatePresence>
      </svg>

      {/* Timeline axis */}
      <div className="relative h-10 mb-2 overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        {ticks.map((year) => (
          <div
            key={year}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${getLeft(year)}%` }}
          >
            <span className="text-xs text-muted-foreground font-body">
              {formatTickYear(year)}
            </span>
            <div className="w-px h-3 bg-border mt-1" />
          </div>
        ))}
      </div>

      {/* Figure bars */}
      <div
        className="relative"
        style={{ minHeight: `${(Math.max(...rows, 0) + 1) * 64 + 16}px` }}
      >
        <AnimatePresence>
          {sorted.map((figure, i) => {
            const row = rows[i];
            const left = getLeft(figure.born);
            const width = getLeft(figure.died) - left;
            const isSelected = selected === figure.id;
            const isRelated = relatedIds.has(figure.id);
            const dimmed = selected && !isSelected && !isRelated;
            const primaryRoot = getRootColor(figure.categories[0]);
            const borderClass = ROOT_CAT_BORDER[primaryRoot] || "border-border";

            return (
              <motion.div
                key={figure.id}
                ref={(el) => {
                  figureRefs.current[figure.id] = el;
                }}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: dimmed ? 0.3 : 1,
                  y: 0,
                }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`
                  absolute cursor-pointer rounded-lg border-2 px-3 py-1.5
                  transition-shadow font-body
                  ${borderClass}
                  ${isSelected ? "shadow-lg z-20 ring-2 ring-primary/30" : "shadow-sm z-0"}
                  bg-card hover:shadow-md
                `}
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 8)}%`,
                  top: `${row * 64}px`,
                }}
                onClick={() => setSelected(isSelected ? null : figure.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex gap-1 shrink-0">
                    {figure.categories.map((cat) => {
                      const root = getRootColor(cat);
                      const colorClass = ROOT_CAT_COLORS[root] || "bg-muted";
                      return (
                        <span
                          key={cat}
                          className={`inline-block h-2 w-2 rounded-full ${colorClass}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-sm font-semibold truncate">
                    {resolveTranslation(figure.name, lang)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatRange(figure.born, figure.died, calendar, lang)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedFigure && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 rounded-xl border bg-card p-6 shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                {selectedFigure.image && (
                  <img
                    src={selectedFigure.image}
                    alt={resolveTranslation(selectedFigure.name, lang)}
                    className="w-20 h-20 rounded-lg object-cover border shadow-sm shrink-0"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-display font-bold">
                    {resolveTranslation(selectedFigure.name, lang)}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatRange(selectedFigure.born, selectedFigure.died, calendar, lang)}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {selectedFigure.categories.map((cat) => {
                      const root = getRootColor(cat);
                      const colorClass = ROOT_CAT_COLORS[root] || "bg-muted";
                      return (
                        <span
                          key={cat}
                          className={`${colorClass} text-primary-foreground text-xs px-2.5 py-0.5 rounded-full font-medium`}
                        >
                          {catNameMap.get(cat) || cat}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="mt-4 text-foreground/80 leading-relaxed font-body">
              {resolveTranslation(selectedFigure.description, lang)}
            </p>
            {selectedFigure.wikipedia && (
              <a
                href={selectedFigure.wikipedia[lang] || selectedFigure.wikipedia["en"] || Object.values(selectedFigure.wikipedia)[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:text-primary/80 underline underline-offset-2 transition-colors font-body"
              >
                {t("wikipedia")} ↗
              </a>
            )}
            {selectedFigure.relations && selectedFigure.relations.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t("relations")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFigure.relations.map((rel) => {
                    const target = figureMap.get(rel.target);
                    return (
                      <button
                        key={rel.target}
                        onClick={() => setSelected(rel.target)}
                        className="text-sm bg-secondary hover:bg-secondary/80 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        <span className="text-muted-foreground">
                          {relTypeNameMap.get(rel.type) || rel.type}
                        </span>{" "}
                        <span className="font-medium">
                          {target ? resolveTranslation(target.name, lang) : rel.target}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
