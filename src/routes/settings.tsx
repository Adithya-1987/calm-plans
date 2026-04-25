import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Trash2, Flame, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { useTasks } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Lumen" },
      { name: "description", content: "Customize your experience." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { tasks, streak } = useTasks();

  const clearAll = () => {
    if (!confirm("Delete ALL tasks? This cannot be undone.")) return;
    localStorage.removeItem("lovable-todos-v1");
    location.reload();
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "lumen-tasks.json"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Tasks exported");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your Lumen experience.</p>
      </div>

      <Section title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Theme</div>
            <div className="text-sm text-muted-foreground">Toggle between light and dark mode.</div>
          </div>
          <Button variant="secondary" onClick={toggle}>
            {theme === "dark" ? <><Sun className="h-4 w-4 mr-1.5" /> Light</> : <><Moon className="h-4 w-4 mr-1.5" /> Dark</>}
          </Button>
        </div>
      </Section>

      <Section title="Achievements">
        <div className="grid sm:grid-cols-2 gap-3">
          <Badge icon={Flame} title="Current streak" value={`${streak.current} day${streak.current === 1 ? "" : "s"}`} tone="warning" />
          <Badge icon={Award} title="Longest streak" value={`${streak.longest} day${streak.longest === 1 ? "" : "s"}`} tone="primary" />
        </div>
      </Section>

      <Section title="Data">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportData}>Export tasks</Button>
          <Button variant="destructive" onClick={clearAll}>
            <Trash2 className="h-4 w-4 mr-1.5" /> Clear all data
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Your data is stored locally in your browser.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-card border border-border p-5 shadow-soft">
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Badge({ icon: Icon, title, value, tone }: { icon: React.ComponentType<{ className?: string }>; title: string; value: string; tone: "warning" | "primary" }) {
  const cls = tone === "warning" ? "bg-warning/20 text-warning-foreground" : "bg-primary/15 text-primary";
  return (
    <div className="rounded-lg border border-border p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-lg grid place-items-center ${cls}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}
