import { useState, useCallback } from "react";
import { useFigures } from "@/hooks/useFigures";
import type { Category } from "@/types/figures";
import CategoryFilter from "@/components/CategoryFilter";
import Timeline from "@/components/Timeline";
import LanguageCalendarControls from "@/components/LanguageCalendarControls";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const Index = () => {
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const { t, dir } = useI18n();

  const toggleCategory = useCallback((cat: Category) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const { filtered, allFigures, isLoading, error, categoryDefs } =
    useFigures(activeCategories);

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                {t("title")}
              </h1>
              <p className="mt-1 text-muted-foreground font-body">
                {t("subtitle")}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <LanguageCalendarControls />
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 font-body">
            {t("filter_label")}
          </h2>
          <CategoryFilter active={activeCategories} onToggle={toggleCategory} categoryDefs={categoryDefs} />
        </motion.div>

        {/* Timeline */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            {t("error")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {t("no_results")}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-x-auto pb-4"
          >
            <div className="min-w-[800px]">
              <Timeline figures={filtered} allFigures={allFigures} categoryDefs={categoryDefs} />
            </div>
          </motion.div>
        )}

        {/* Footer note */}
        <div className="mt-12 text-center text-xs text-muted-foreground border-t pt-6">
          {t("footer_note")}{" "}
          <a
            href="https://github.com/ahmedakef/history-weaver/edit/main/public/data/figures.yaml"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            public/data/figures.yaml
          </a>{" "}
          {t("footer_edit")}
        </div>
      </main>
    </div>
  );
};

export default Index;
