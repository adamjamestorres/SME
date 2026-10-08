"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="username" value="owner" autoComplete="username" readOnly />
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          aria-invalid={state?.error ? true : undefined}
          aria-describedby={state?.error ? "login-error" : undefined}
          className="min-h-12 rounded-md border border-line bg-surface-raised px-3 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </label>
      {state?.error ? (
        <p id="login-error" role="alert" className="text-sm text-red-500">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-md bg-brand px-6 font-display text-lg font-bold tracking-wide text-brand-ink uppercase transition-colors hover:bg-brand-hover disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm text-muted">Forgot it? Contact the person who set up this site.</p>
    </form>
  );
}
