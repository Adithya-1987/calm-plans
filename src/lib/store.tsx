import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Task, Category, Priority } from "./types";

const STORAGE_KEY = "lovable-todos-v1";
const STREAK_KEY = "lovable-todos-streak-v1";

interface StreakData {
  current: number;
  longest: number;
  lastDay?: string; // YYYY-MM-DD
}

interface Ctx {
  tasks: Task[];
  addTask: (t: Omit<Task, "id" | "createdAt" | "completed" | "pinned" | "order">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  togglePin: (id: string) => void;
  reorder: (ids: string[]) => void;
  streak: StreakData;
}

const TasksContext = createContext<Ctx | null>(null);

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedTasks();
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

function loadStreak(): StreakData {
  if (typeof window === "undefined") return { current: 0, longest: 0 };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { current: 0, longest: 0 };
    return JSON.parse(raw);
  } catch {
    return { current: 0, longest: 0 };
  }
}

function seedTasks(): Task[] {
  const today = new Date();
  const iso = (d: Date) => d.toISOString();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const inThree = new Date(today); inThree.setDate(today.getDate() + 3);
  return [
    { id: crypto.randomUUID(), title: "Welcome to your new to-do app ✨", category: "personal", priority: "medium", completed: false, pinned: true, createdAt: iso(today), order: 0, notes: "Click the checkbox to complete a task. Drag to reorder." },
    { id: crypto.randomUUID(), title: "Plan the week", category: "work", priority: "high", dueDate: iso(tomorrow), completed: false, pinned: false, createdAt: iso(today), order: 1 },
    { id: crypto.randomUUID(), title: "Submit assignment draft", category: "assignments", priority: "high", dueDate: iso(inThree), completed: false, pinned: false, createdAt: iso(today), order: 2 },
    { id: crypto.randomUUID(), title: "Morning workout", category: "personal", priority: "low", completed: true, pinned: false, createdAt: iso(today), completedAt: iso(today), order: 3 },
  ];
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [streak, setStreak] = useState<StreakData>(() => loadStreak());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  }, [streak]);

  const updateStreakOnComplete = () => {
    const key = todayKey();
    setStreak((s) => {
      if (s.lastDay === key) return s;
      // If yesterday, increment, else reset to 1
      const y = new Date(); y.setDate(y.getDate() - 1);
      const yKey = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
      const current = s.lastDay === yKey ? s.current + 1 : 1;
      return { current, longest: Math.max(s.longest, current), lastDay: key };
    });
  };

  const value: Ctx = useMemo(() => ({
    tasks,
    addTask: (t) =>
      setTasks((prev) => [
        {
          ...t,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          completed: false,
          pinned: false,
          order: prev.length,
        },
        ...prev,
      ]),
    updateTask: (id, patch) =>
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    deleteTask: (id) => setTasks((prev) => prev.filter((t) => t.id !== id)),
    toggleComplete: (id) =>
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const completed = !t.completed;
          if (completed) updateStreakOnComplete();
          return { ...t, completed, completedAt: completed ? new Date().toISOString() : undefined };
        }),
      ),
    togglePin: (id) =>
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t))),
    reorder: (ids) =>
      setTasks((prev) => {
        const map = new Map(prev.map((t) => [t.id, t]));
        const reordered = ids.map((id, i) => ({ ...(map.get(id) as Task), order: i }));
        const remaining = prev.filter((t) => !ids.includes(t.id));
        return [...reordered, ...remaining];
      }),
    streak,
  }), [tasks, streak]);

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used inside TasksProvider");
  return ctx;
}

// Filter/search helpers
export function filterTasks(
  tasks: Task[],
  opts: { query?: string; category?: Category | "all"; priority?: Priority | "all"; status?: "all" | "active" | "completed" },
) {
  return tasks.filter((t) => {
    if (opts.query && !`${t.title} ${t.notes ?? ""}`.toLowerCase().includes(opts.query.toLowerCase())) return false;
    if (opts.category && opts.category !== "all" && t.category !== opts.category) return false;
    if (opts.priority && opts.priority !== "all" && t.priority !== opts.priority) return false;
    if (opts.status === "active" && t.completed) return false;
    if (opts.status === "completed" && !t.completed) return false;
    return true;
  });
}
