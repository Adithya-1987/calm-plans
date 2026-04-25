import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskList } from "@/components/TaskList";
import { TaskDialog } from "@/components/TaskDialog";
import { filterTasks, useTasks } from "@/lib/store";
import { CATEGORIES, PRIORITIES, type Category, type Priority, type Task } from "@/lib/types";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Lumen" },
      { name: "description", content: "Manage all your tasks with filters, search, and drag-and-drop." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { tasks } = useTasks();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [status, setStatus] = useState<"all" | "active" | "completed">("all");

  const filtered = useMemo(() => {
    const list = filterTasks(tasks, { query, category, priority, status });
    // Pinned first, then by order
    return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.order - b.order);
  }, [tasks, query, category, priority, status]);

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (t: Task) => { setEditing(t); setOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All tasks</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {tasks.length} shown</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" /> New task</Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-card border border-border p-3 shadow-soft flex flex-col lg:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 lg:flex lg:gap-2">
          <Select value={category} onValueChange={(v) => setCategory(v as Category | "all")}>
            <SelectTrigger className="lg:w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority | "all")}>
            <SelectTrigger className="lg:w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITIES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as "all" | "active" | "completed")}>
            <SelectTrigger className="lg:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <TaskList
        tasks={filtered}
        onEdit={openEdit}
        emptyTitle={tasks.length === 0 ? "No tasks yet" : "No matching tasks"}
        emptyHint={tasks.length === 0 ? "Click 'New task' to add your first one." : "Try a different filter or search term."}
      />

      <TaskDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}
