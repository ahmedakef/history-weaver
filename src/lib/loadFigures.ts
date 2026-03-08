import YAML from "yaml";
import type { FiguresData } from "@/types/figures";

export async function loadFigures(): Promise<FiguresData> {
  const response = await fetch("/data/figures.yaml");
  const text = await response.text();
  return YAML.parse(text) as FiguresData;
}
