import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label: string;
  error?: string | null;
}

export const FloatingInput = forwardRef<HTMLInputElement, Props>(function FloatingInput(
  { label, error, type = "text", className, id, ...rest }, ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [showPwd, setShowPwd] = useState(false);
  const isPwd = type === "password";
  const effectiveType = isPwd ? (showPwd ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          placeholder=" "
          className={cn(
            "peer w-full h-12 rounded-lg border bg-background px-3 pt-4 pb-1 text-sm transition-all",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            error ? "border-destructive focus:ring-destructive/30 focus:border-destructive" : "border-input",
            isPwd && "pr-10",
            className,
          )}
          {...rest}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-3 text-muted-foreground transition-all",
            "top-1/2 -translate-y-1/2 text-sm",
            "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary",
            "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs",
            error && "peer-focus:text-destructive",
          )}
        >
          {label}
        </label>
        {isPwd && (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive animate-fade-in pl-1">{error}</p>
      )}
    </div>
  );
});
