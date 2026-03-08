import type { Category } from "@/types/figures";
import type { CategoryDef } from "@/types/figures";
import { resolveTranslation } from "@/types/figures";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const CAT_COLOR_CLASS: Record<string, string> = {
  science: "bg-science",
  religion: "bg-religion",
  authority: "bg-authority",
  philosophy: "bg-philosophy",
};

interface Props {
  active: Category[];
  onToggle: (cat: Category) => void;
  categoryDefs: CategoryDef[];
}

export default function CategoryFilter({ active, onToggle, categoryDefs }: Props) {
  const { lang, t } = useI18n();

  return (
    <div className="flex flex-wrap gap-3">
      {categoryDefs.map((cat) => {
        const isActive = active.includes(cat.id);
        const colorClass = CAT_COLOR_CLASS[cat.id] || "bg-muted";
        return (
          <motion.button
            key={cat.id}
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
        );
      })}
      {active.length > 0 && (
        <button
          onClick={() => active.forEach(onToggle)}
          className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("clear_all")}
        </button>
      )}
    </div>
  );
}
