// Placeholder until #19 builds the dashboard (and moves Log out into Settings).
export default function PortalHome() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="font-display text-3xl font-bold uppercase">Owner portal</h1>
      <form action="/portal/logout" method="post" className="mt-6">
        <button
          type="submit"
          className="min-h-12 rounded-md border border-line bg-surface-raised px-6 font-display text-lg font-semibold tracking-wide uppercase"
        >
          Log out
        </button>
      </form>
    </main>
  );
}
