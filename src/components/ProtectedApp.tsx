import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";

const PUBLIC_ROUTES = new Set(["/login", "/signup"]);

/**
 * Top-level auth gate.
 * - Public routes (/login, /signup): render bare (no AppLayout).
 * - Protected routes: redirect to /login if not authenticated; otherwise wrap in AppLayout.
 */
export function ProtectedApp({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isPublic = PUBLIC_ROUTES.has(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      navigate({ to: "/login" });
    }
  }, [loading, user, isPublic, navigate]);

  // While checking auth, show a soft splash
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground grid place-items-center">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="h-11 w-11 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Public routes always render bare
  if (isPublic) {
    return <>{children}</>;
  }

  // Not authenticated and on a protected route — render nothing while redirect runs
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-background grid place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Authenticated — render the app
  return <AppLayout>{children}</AppLayout>;
}
