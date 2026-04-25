import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useAuth } from "@/lib/auth";
import { validateGmail, validateName, validatePassword } from "@/lib/validation";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Lumen" },
      { name: "description", content: "Create your Lumen account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    name?: string | null; email?: string | null; password?: string | null; confirm?: string | null;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/" });
  }, [user, authLoading, navigate]);

  const validateAll = () => {
    const next = {
      name: validateName(name),
      email: validateGmail(email),
      password: validatePassword(password),
      confirm: confirm !== password ? "Passwords do not match" : null,
    };
    setErrors(next);
    return !next.name && !next.email && !next.password && !next.confirm;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setSubmitting(true);
    const { error } = await signUp(email.trim(), password, name.trim());
    setSubmitting(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Account created — welcome to Lumen!");
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
    <AuthShell title="Create your account" subtitle="Start organizing your day with Lumen">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FloatingInput
          label="Full name"
          autoComplete="name"
          value={name}
          onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: null })); }}
          onBlur={() => setErrors((p) => ({ ...p, name: validateName(name) }))}
          error={errors.name}
        />
        <FloatingInput
          label="Gmail address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: null })); }}
          onBlur={() => setErrors((p) => ({ ...p, email: validateGmail(email) }))}
          error={errors.email}
        />
        <FloatingInput
          label="Password (min 6 characters)"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: null })); }}
          onBlur={() => setErrors((p) => ({ ...p, password: validatePassword(password) }))}
          error={errors.password}
        />
        <FloatingInput
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); if (errors.confirm) setErrors((p) => ({ ...p, confirm: null })); }}
          onBlur={() => setErrors((p) => ({ ...p, confirm: confirm !== password ? "Passwords do not match" : null }))}
          error={errors.confirm}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center"><span className="bg-card px-2 text-xs text-muted-foreground">or</span></div>
      </div>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
