export type Priority = "low" | "medium" | "high";
export type Category = "personal" | "work" | "assignments";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  category: Category;
  priority: Priority;
  dueDate?: string; // ISO date
  completed: boolean;
  pinned: boolean;
  createdAt: string;
  completedAt?: string;
  order: number;
}

export const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id: "personal", label: "Personal", color: "oklch(0.72 0.14 200)" },
  { id: "work", label: "Work", color: "oklch(0.7 0.16 280)" },
  { id: "assignments", label: "Assignments", color: "oklch(0.78 0.15 75)" },
];

export const PRIORITIES: { id: Priority; label: string; tone: string }[] = [
  { id: "low", label: "Low", tone: "muted" },
  { id: "medium", label: "Medium", tone: "warning" },
  { id: "high", label: "High", tone: "destructive" },
];
