// Gmail-only validation per project requirement
const GMAIL_RE = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

export function validateGmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!GMAIL_RE.test(email.trim())) return "Please use a valid @gmail.com address";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  if (password.length > 72) return "Password must be at most 72 characters";
  return null;
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Full name is required";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (trimmed.length > 80) return "Name is too long";
  return null;
}
