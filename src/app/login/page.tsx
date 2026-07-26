"use client";

import { Suspense, useState, type SubmitEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = formString(formData, "email");
    const password = formString(formData, "password");

    const result = await signIn.email({ email, password });
    setPending(false);

    if (result.error) {
      setError(result.error.message || "Sign in failed.");
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="mb-8 text-center">
        <div className="mb-5 flex justify-center">
          <BrandLogo
            markClassName="size-14 rounded-2xl shadow-lg shadow-primary/20 [&_svg]:size-6"
            showWordmark={false}
          />
        </div>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Empire Cuisine
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to the staff reservation board.
        </p>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/90 p-6 shadow-xl shadow-foreground/5 backdrop-blur-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                autoFocus
                placeholder="admin@empire.local"
                className="h-11 pl-9"
                disabled={pending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={8}
                placeholder="Enter your password"
                className="h-11 pr-10 pl-9"
                disabled={pending}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className={cn(
                  "absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors",
                  "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                )}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <Alert variant="destructive" className="py-3">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full text-sm font-medium"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>

    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Skeleton className="size-14 rounded-2xl" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="space-y-5 rounded-2xl border border-border/80 bg-card/90 p-6 sm:p-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-4 py-12 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.95_0.03_255),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.96_0.03_90),transparent_50%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--background)_85%)]"
      />
      <div className="relative z-10 flex w-full justify-center">
        <Suspense fallback={<LoginSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
