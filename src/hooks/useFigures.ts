import { useQuery } from "@tanstack/react-query";
import { loadFigures } from "@/lib/loadFigures";
import type { Category, Figure, CategoryDef } from "@/types/figures";

export function useFigures(activeCategories: Category[]) {
  const query = useQuery({
    queryKey: ["figures"],
    queryFn: loadFigures,
  });

  const allFigures = query.data?.figures ?? [];
  const categoryDefs = query.data?.categories ?? [];

  const filtered =
    activeCategories.length === 0
      ? allFigures
      : allFigures.filter((f) =>
          f.categories.some((c) => activeCategories.includes(c))
        );

  return { ...query, allFigures, filtered, categoryDefs };
}
