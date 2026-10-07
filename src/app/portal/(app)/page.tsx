import { countCustomers, requireOwner } from "@/lib/auth";

export default async function PortalPage() {
  const owner = await requireOwner();
  const customers = await countCustomers();
  return <main className="mx-auto w-full max-w-3xl p-6"><p className="mb-4 text-sm text-amber-400">DEV MODE: signed in as {owner.email}</p><h1 className="text-3xl font-bold">Portal</h1><p className="mt-4">{customers} customers in the database</p></main>;
}
