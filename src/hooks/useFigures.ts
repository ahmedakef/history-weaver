import { useQuery } from "@tanstack/react-query";
import { loadFigures } from "@/lib/loadFigures";
import { buildCategoryMaps } from "@/types/figures";
import { useMemo } from "react";

export function useFigures(activeCategories: string[]) {
  const query = useQuery({
    queryKey: ["figures"],
    queryFn: loadFigures,
  });

  const allFigures = query.data?.figures ?? [];
  const categoryDefs = query.data?.categories ?? [];
  const relationTypeDefs = query.data?.relation_types ?? [];

  const { rootMap, descendantsMap } = useMemo(
    () => buildCategoryMaps(categoryDefs),
    [categoryDefs]
  );

  // Expand active categories to include all descendants
  const expandedCategories = useMemo(() => {
    const expanded = new Set<string>();
    for (const catId of activeCategories) {
      const descs = descendantsMap.get(catId);
      if (descs) descs.forEach((d) => expanded.add(d));
      else expanded.add(catId);
    }
    return expanded;
  }, [activeCategories, descendantsMap]);

  const filtered =
    activeCategories.length === 0
      ? allFigures
      : allFigures.filter((f) =>
          f.categories.some((c) => expandedCategories.has(c))
        );

  return { ...query, allFigures, filtered, categoryDefs, relationTypeDefs, rootMap };
}
