import { safeNextPath } from "@/lib/safe-next";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/portal/login">) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(Array.isArray(next) ? next[0] : next);

  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-4 py-12">
      <h1 className="font-display text-3xl font-bold uppercase">Owner login</h1>
      <LoginForm next={nextPath} />
    </main>
  );
}
