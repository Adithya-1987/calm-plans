import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pin, Trash2, GripVertical, Calendar as CalIcon, Pencil } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import type { Task } from "@/lib/types";
import { CATEGORIES, PRIORITIES } from "@/lib/types";
import { useTasks } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  task: Task;
  onEdit?: (t: Task) => void;
  draggable?: boolean;
}

export function TaskCard({ task, onEdit, draggable = true }: Props) {
  const { toggleComplete, deleteTask, togglePin } = useTasks();
  const sortable = useSortable({ id: task.id, disabled: !draggable });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const style = draggable
    ? { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
    : undefined;

  const cat = CATEGORIES.find((c) => c.id === task.category)!;
  const pri = PRIORITIES.find((p) => p.id === task.priority)!;

  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && !task.completed && isPast(due) && !isToday(due);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl bg-card border border-border p-4 shadow-soft hover-lift animate-scale-in",
        task.completed && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        {draggable && (
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={() => toggleComplete(task.id)}
          className={cn(
            "mt-0.5 h-5 w-5 rounded-md border-2 grid place-items-center transition-all shrink-0",
            task.completed
              ? "bg-gradient-primary border-transparent shadow-glow"
              : "border-border hover:border-primary",
          )}
          aria-label="Toggle complete"
        >
          {task.completed && (
            <svg viewBox="0 0 24 24" className="h-3 w-3 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className={cn("font-medium leading-snug truncate", task.completed && "line-through text-muted-foreground")}>
              {task.title}
            </h3>
            {task.pinned && <Pin className="h-3.5 w-3.5 text-primary fill-current shrink-0 mt-0.5" />}
          </div>
          {task.notes && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.notes}</p>}

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-md"
              style={{ backgroundColor: `color-mix(in oklab, ${cat.color} 18%, transparent)`, color: cat.color }}
            >
              {cat.label}
            </span>
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-md",
              pri.id === "high" && "bg-destructive/15 text-destructive",
              pri.id === "medium" && "bg-warning/20 text-warning-foreground",
              pri.id === "low" && "bg-muted text-muted-foreground",
            )}>
              {pri.label}
            </span>
            {due && (
              <span className={cn(
                "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md",
                overdue ? "bg-destructive/15 text-destructive" : "bg-secondary text-secondary-foreground",
              )}>
                <CalIcon className="h-3 w-3" />
                {isToday(due) ? "Today" : format(due, "MMM d")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => togglePin(task.id)} className="h-8 w-8 grid place-items-center rounded-md hover:bg-accent" aria-label="Pin">
            <Pin className={cn("h-4 w-4", task.pinned && "text-primary fill-current")} />
          </button>
          {onEdit && (
            <button onClick={() => onEdit(task)} className="h-8 w-8 grid place-items-center rounded-md hover:bg-accent" aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => deleteTask(task.id)} className="h-8 w-8 grid place-items-center rounded-md hover:bg-destructive/10 text-destructive" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
