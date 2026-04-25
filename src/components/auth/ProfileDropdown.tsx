import { useEffect, useRef, useState } from "react";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export function ProfileDropdown() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  const displayName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "User";
  const email = profile?.email ?? user.email ?? "";
  const avatar = profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined);
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-accent transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-sm font-semibold overflow-hidden shadow-soft">
          {avatar ? (
            <img src={avatar} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">{displayName}</span>
        <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-popover shadow-elegant p-1 animate-fade-in z-50">
          <div className="px-3 py-2.5 border-b border-border">
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground truncate">{email}</div>
          </div>
          <button
            disabled
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-muted-foreground cursor-default"
          >
            <UserIcon className="h-4 w-4" /> Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
