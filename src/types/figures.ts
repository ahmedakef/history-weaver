export type Category = "science" | "religion" | "authority" | "philosophy";

export type RelationType =
  | "father_of"
  | "mother_of"
  | "child_of"
  | "teacher_of"
  | "student_of"
  | "influenced"
  | "colleague";

export interface Relation {
  type: RelationType;
  target: string;
}

export interface Figure {
  id: string;
  name: string;
  born: number;
  died: number;
  categories: Category[];
  description: string;
  relations?: Relation[];
}

export interface FiguresData {
  figures: Figure[];
}
