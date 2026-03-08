import type { Category } from "@/types/figures";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const CATEGORIES: { key: Category; colorClass: string }[] = [
  { key: "science", colorClass: "bg-science" },
  { key: "religion", colorClass: "bg-religion" },
  { key: "authority", colorClass: "bg-authority" },
  { key: "philosophy", colorClass: "bg-philosophy" },
];

interface Props {
  active: Category[];
  onToggle: (cat: Category) => void;
}

export default function CategoryFilter({ active, onToggle }: Props) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap gap-3">
      {CATEGORIES.map((cat) => {
        const isActive = active.includes(cat.key);
        return (
          <motion.button
            key={cat.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggle(cat.key)}
            className={`
              flex items-center gap-2 rounded-full px-4 py-2 font-body text-sm font-medium
              transition-colors border
              ${
                isActive
                  ? `${cat.colorClass} text-primary-foreground border-transparent`
                  : "bg-card text-foreground border-border hover:bg-secondary"
              }
            `}
          >
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${cat.colorClass} ${
                isActive ? "opacity-70" : ""
              }`}
            />
            {t(cat.key)}
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
