import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useAuth } from "@/lib/auth";
import { validateGmail, validatePassword } from "@/lib/validation";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Lumen" },
      { name: "description", content: "Sign in to your Lumen account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/" });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateGmail(email);
    const pErr = password ? null : "Password is required";
    setErrors({ email: eErr, password: pErr });
    if (eErr || pErr) return;

    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (error) {
      const msg = error.toLowerCase().includes("invalid")
        ? "Incorrect email or password."
        : error;
      toast.error(msg);
    } else {
      toast.success("Welcome back!");
      navigate({ to: "/" });
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error);
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to Lumen">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FloatingInput
          label="Gmail address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: null }));
          }}
          onBlur={() => setErrors((p) => ({ ...p, email: validateGmail(email) }))}
          error={errors.email}
        />
        <FloatingInput
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((p) => ({ ...p, password: null }));
          }}
          error={errors.password}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => toast.info("Password reset will be available soon.")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center"><span className="bg-card px-2 text-xs text-muted-foreground">or</span></div>
      </div>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Continue with Google" />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="font-medium text-primary hover:underline">Create one</Link>
      </p>
    </AuthShell>
  );
}
