import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import AddClientForm from "./components/AddClientForm";

export default function AddClientPage() {
  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Add New Client" },
  ];

  return (
    <>
      <BreadcrumbComp title="Add New Client" items={BCrumb} />
        <AddClientForm />
    </>
  );
}
