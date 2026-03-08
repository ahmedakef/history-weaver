import type { CategoryDef } from "@/types/figures";
import { resolveTranslation } from "@/types/figures";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

/** Root category colors — subcategories inherit from root */
const ROOT_COLOR_CLASS: Record<string, string> = {
  science: "bg-science",
  religion: "bg-religion",
  authority: "bg-authority",
  philosophy: "bg-philosophy",
};

function getCatColor(catId: string, rootId?: string): string {
  return ROOT_COLOR_CLASS[rootId || catId] || ROOT_COLOR_CLASS[catId] || "bg-muted";
}

interface Props {
  active: string[];
  onToggle: (cat: string) => void;
  categoryDefs: CategoryDef[];
}

export default function CategoryFilter({ active, onToggle, categoryDefs }: Props) {
  const { lang, t } = useI18n();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (catId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {categoryDefs.map((cat) => (
          <CategoryChip
            key={cat.id}
            cat={cat}
            rootId={cat.id}
            active={active}
            onToggle={onToggle}
            expanded={expanded}
            toggleExpand={toggleExpand}
            lang={lang}
            depth={0}
          />
        ))}
        {active.length > 0 && (
          <button
            onClick={() => active.forEach(onToggle)}
            className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("clear_all")}
          </button>
        )}
      </div>
    </div>
  );
}

function CategoryChip({
  cat,
  rootId,
  active,
  onToggle,
  expanded,
  toggleExpand,
  lang,
  depth,
}: {
  cat: CategoryDef;
  rootId: string;
  active: string[];
  onToggle: (cat: string) => void;
  expanded: Set<string>;
  toggleExpand: (catId: string) => void;
  lang: string;
  depth: number;
}) {
  const isActive = active.includes(cat.id);
  const hasChildren = cat.children && cat.children.length > 0;
  const isExpanded = expanded.has(cat.id);
  const colorClass = getCatColor(cat.id, rootId);

  return (
    <div className={depth > 0 ? "" : ""}>
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggle(cat.id)}
          className={`
            flex items-center gap-2 rounded-full px-4 py-2 font-body text-sm font-medium
            transition-colors border
            ${
              isActive
                ? `${colorClass} text-primary-foreground border-transparent`
                : "bg-card text-foreground border-border hover:bg-secondary"
            }
          `}
        >
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass} ${
              isActive ? "opacity-70" : ""
            }`}
          />
          {resolveTranslation(cat.name, lang)}
        </motion.button>
        {hasChildren && (
          <button
            onClick={() => toggleExpand(cat.id)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 mt-2 ms-6">
              {cat.children!.map((child) => (
                <CategoryChip
                  key={child.id}
                  cat={child}
                  rootId={rootId}
                  active={active}
                  onToggle={onToggle}
                  expanded={expanded}
                  toggleExpand={toggleExpand}
                  lang={lang}
                  depth={depth + 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
