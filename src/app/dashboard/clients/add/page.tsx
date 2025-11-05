import AddClientForm from "./components/AddClientForm";

export default function AddClientPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Add New Client</h1>
      <AddClientForm />
    </div>
  );
}
