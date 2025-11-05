import EditClientForm from "./components/EditClientForm";

export default function EditClientPage({ params }: { params: { clientId: string } }) {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Client</h1>
      <EditClientForm clientId={params.clientId} />
    </div>
  );
}
