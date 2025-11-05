import Link from 'next/link';
import { Button } from "@/components/ui/button";
import ClientTable from "./components/ClientTable";

export default function ClientsPage() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link href="/dashboard/clients/add">
          <Button>Create Client</Button>
        </Link>
      </div>
      <ClientTable />
    </div>
  );
}
