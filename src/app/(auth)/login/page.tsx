import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Tiuwoo</h1>
        <p className="text-muted-foreground text-center text-sm">
          Sign in to your account
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
