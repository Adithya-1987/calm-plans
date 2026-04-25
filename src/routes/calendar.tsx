import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format,
  isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek, subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/lib/store";
import { TaskCard } from "@/components/TaskCard";
import { TaskDialog } from "@/components/TaskDialog";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Lumen" },
      { name: "description", content: "Visualize tasks and deadlines on a monthly calendar." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { tasks } = useTasks();
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const tasksForDay = (d: Date) =>
    tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), d));

  const selectedTasks = tasksForDay(selected);

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (t: Task) => { setEditing(t); setOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">See your deadlines at a glance.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" /> New task</Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Calendar */}
        <div className="rounded-2xl bg-card border border-border shadow-soft p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">{format(cursor, "MMMM yyyy")}</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => setCursor((d) => subMonths(d, 1))} className="h-8 w-8 grid place-items-center rounded-md hover:bg-accent" aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setCursor(new Date())} className="px-2.5 h-8 rounded-md text-sm hover:bg-accent">Today</button>
              <button onClick={() => setCursor((d) => addMonths(d, 1))} className="h-8 w-8 grid place-items-center rounded-md hover:bg-accent" aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-xs text-muted-foreground font-medium mb-1">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
              <div key={d} className="px-2 py-1.5">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const dayTasks = tasksForDay(d);
              const inMonth = isSameMonth(d, cursor);
              const isSel = isSameDay(d, selected);
              const isTd = isToday(d);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelected(d)}
                  className={cn(
                    "min-h-[72px] sm:min-h-[88px] rounded-lg p-1.5 text-left transition-all border",
                    inMonth ? "bg-background" : "bg-muted/30 text-muted-foreground/60",
                    isSel ? "border-primary shadow-glow" : "border-transparent hover:border-border",
                  )}
                >
                  <div className={cn(
                    "inline-flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full text-xs font-medium",
                    isTd && "bg-gradient-primary text-primary-foreground shadow-glow",
                  )}>
                    {format(d, "d")}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div key={t.id} className={cn(
                        "truncate text-[11px] px-1.5 py-0.5 rounded-md",
                        t.completed ? "bg-muted text-muted-foreground line-through" : "bg-primary/15 text-primary",
                      )}>
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[10px] text-muted-foreground">+{dayTasks.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day panel */}
        <div className="rounded-2xl bg-card border border-border shadow-soft p-4 h-fit">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-muted-foreground">{format(selected, "EEEE")}</div>
              <h3 className="font-semibold text-lg">{format(selected, "MMM d, yyyy")}</h3>
            </div>
            <Button size="sm" variant="secondary" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {selectedTasks.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">No tasks for this day.</div>
          ) : (
            <div className="space-y-2.5">
              {selectedTasks.map((t) => <TaskCard key={t.id} task={t} onEdit={openEdit} draggable={false} />)}
            </div>
          )}
        </div>
      </div>

      <TaskDialog open={open} onOpenChange={setOpen} editing={editing} defaultDate={format(selected, "yyyy-MM-dd")} />
    </div>
  );
}
