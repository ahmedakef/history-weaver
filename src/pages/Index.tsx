import { useState, useCallback } from "react";
import { useFigures } from "@/hooks/useFigures";
import type { Category } from "@/types/figures";
import CategoryFilter from "@/components/CategoryFilter";
import Timeline from "@/components/Timeline";
import { motion } from "framer-motion";

const Index = () => {
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);

  const toggleCategory = useCallback((cat: Category) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const { filtered, allFigures, isLoading, error } =
    useFigures(activeCategories);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
              Historical Figures
            </h1>
            <p className="mt-1 text-muted-foreground font-body">
              Explore the lives and connections of scholars, rulers, and
              thinkers across history
            </p>
          </motion.div>
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
            Filter by category
          </h2>
          <CategoryFilter active={activeCategories} onToggle={toggleCategory} />
        </motion.div>

        {/* Timeline */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            Failed to load data
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No figures match the selected filters
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-x-auto pb-4"
          >
            <div className="min-w-[800px]">
              <Timeline figures={filtered} allFigures={allFigures} />
            </div>
          </motion.div>
        )}

        {/* Footer note */}
        <div className="mt-12 text-center text-xs text-muted-foreground border-t pt-6">
          Data is stored in{" "}
          <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">
            public/data/figures.yaml
          </code>{" "}
          — edit it to add more historical figures
        </div>
      </main>
    </div>
  );
};

export default Index;
