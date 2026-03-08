import YAML from "yaml";
import type { FiguresData } from "@/types/figures";

export async function loadFigures(): Promise<FiguresData> {
  const base = import.meta.env.BASE_URL;
  const response = await fetch(`${base}data/figures.yaml`);
  const text = await response.text();
  return YAML.parse(text) as FiguresData;
}
