import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTasks } from "@/lib/store";
import { isToday, isPast, format } from "date-fns";
import { Flame, Plus, Sparkles, TrendingUp, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/TaskList";
import { TaskDialog } from "@/components/TaskDialog";
import type { Task } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lumen" },
      { name: "description", content: "Your daily productivity dashboard." },
    ],
  }),
  component: Dashboard,
});

const QUOTES = [
  "Small steps every day add up to remarkable results.",
  "Focus on progress, not perfection.",
  "Done is better than perfect.",
  "The secret of getting ahead is getting started.",
  "You don't have to be great to start, but you have to start to be great.",
];

function Dashboard() {
  const { tasks, streak } = useTasks();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    const today = tasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate)));
    const overdue = tasks.filter((t) => t.dueDate && !t.completed && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)));
    return { total, done, today, overdue, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [tasks]);

  const todays = useMemo(() => {
    return [...tasks]
      .filter((t) => !t.completed && (t.pinned || (t.dueDate && isToday(new Date(t.dueDate)))))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [tasks]);

  const quote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], []);

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (t: Task) => { setEditing(t); setOpen(true); };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-primary p-7 lg:p-9 shadow-elegant text-primary-foreground">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-sm/6 opacity-80">{format(new Date(), "EEEE, MMMM d")}</p>
            <h1 className="mt-1 text-3xl lg:text-4xl font-semibold tracking-tight">
              {stats.percent === 100 && stats.total > 0 ? "All done — amazing! 🎉" : `Good ${greet()}, let's get things done.`}
            </h1>
            <p className="mt-3 text-sm/6 opacity-90 max-w-xl flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0" />
              {quote}
            </p>
          </div>
          <Button onClick={openNew} size="lg" className="bg-white text-primary hover:bg-white/90 shadow-soft">
            <Plus className="h-4 w-4 mr-1.5" /> New task
          </Button>
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Progress" value={`${stats.percent}%`} hint={`${stats.done}/${stats.total} completed`} icon={TrendingUp} progress={stats.percent} />
        <StatCard label="Today" value={String(stats.today.length)} hint="due today" icon={ListTodo} />
        <StatCard label="Overdue" value={String(stats.overdue.length)} hint="needs attention" icon={ListTodo} tone="destructive" />
        <StatCard label="Streak" value={`${streak.current}d`} hint={`best ${streak.longest}d`} icon={Flame} tone="warning" />
      </section>

      {/* Today / Pinned */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Today & Pinned</h2>
            <p className="text-sm text-muted-foreground">Your focus for the day.</p>
          </div>
          <Link to="/tasks" className="text-sm font-medium text-primary hover:underline">View all →</Link>
        </div>
        <TaskList
          tasks={todays}
          onEdit={openEdit}
          emptyTitle="Nothing on your plate"
          emptyHint="Pin important tasks or set a due date for today to see them here."
        />
      </section>

      <TaskDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function StatCard({
  label, value, hint, icon: Icon, progress, tone = "primary",
}: {
  label: string; value: string; hint: string;
  icon: React.ComponentType<{ className?: string }>;
  progress?: number;
  tone?: "primary" | "destructive" | "warning";
}) {
  const toneCls =
    tone === "destructive" ? "bg-destructive/10 text-destructive" :
    tone === "warning" ? "bg-warning/20 text-warning-foreground" :
    "bg-primary/10 text-primary";
  return (
    <div className="rounded-xl bg-card border border-border p-4 shadow-soft hover-lift">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</span>
        <span className={`h-7 w-7 rounded-md grid place-items-center ${toneCls}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
      {typeof progress === "number" && (
        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-primary transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
