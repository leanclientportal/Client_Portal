import Link from 'next/link';
import { Button } from "@/components/ui/button";
import ClientTable from "./components/ClientTable";
import BreadcrumbComp from '../layout/shared/breadcrumb/BreadcrumbComp';

export default function ClientsPage() {
  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Clients" },
  ];

  return (
    <>
      <BreadcrumbComp title="Clients" items={BCrumb} />
        <ClientTable />
    </>
  );
}
