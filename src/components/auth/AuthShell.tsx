import { Sparkles, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen w-full bg-background text-foreground relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Soft background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="absolute top-5 right-5 h-9 w-9 grid place-items-center rounded-lg hover:bg-accent transition-colors"
      >
        {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
      </button>

      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="h-11 w-11 rounded-xl bg-gradient-primary grid place-items-center shadow-glow mb-3">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-elegant p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
