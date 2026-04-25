import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task } from "@/lib/types";
import { useTasks } from "@/lib/store";
import { TaskCard } from "./TaskCard";
import { CheckCircle2 } from "lucide-react";

interface Props {
  tasks: Task[];
  onEdit?: (t: Task) => void;
  emptyTitle?: string;
  emptyHint?: string;
}

export function TaskList({ tasks, onEdit, emptyTitle = "No tasks yet", emptyHint = "Add your first task to get started." }: Props) {
  const { reorder } = useTasks();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center animate-fade-in">
        <div className="mx-auto h-12 w-12 rounded-full bg-gradient-primary grid place-items-center shadow-glow mb-4">
          <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <h3 className="font-semibold text-lg">{emptyTitle}</h3>
        <p className="text-sm text-muted-foreground mt-1">{emptyHint}</p>
      </div>
    );
  }

  const handleEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = tasks.map((t) => t.id);
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    reorder(arrayMove(ids, oldIdx, newIdx));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5">
          {tasks.map((t) => <TaskCard key={t.id} task={t} onEdit={onEdit} />)}
        </div>
      </SortableContext>
    </DndContext>
  );
}
