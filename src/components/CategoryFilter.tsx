import type { Category } from "@/types/figures";
import { motion } from "framer-motion";

const CATEGORIES: { key: Category; label: string; colorClass: string }[] = [
  { key: "science", label: "Science", colorClass: "bg-science" },
  { key: "religion", label: "Religion", colorClass: "bg-religion" },
  { key: "authority", label: "Authority", colorClass: "bg-authority" },
  { key: "philosophy", label: "Philosophy", colorClass: "bg-philosophy" },
];

interface Props {
  active: Category[];
  onToggle: (cat: Category) => void;
}

export default function CategoryFilter({ active, onToggle }: Props) {
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
            {cat.label}
          </motion.button>
        );
      })}
      {active.length > 0 && (
        <button
          onClick={() => active.forEach(onToggle)}
          className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
