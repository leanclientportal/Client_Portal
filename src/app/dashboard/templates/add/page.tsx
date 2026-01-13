'use client';
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp';
import { AddTemplateForm } from '../components/AddTemplateForm';

export default function AddTemplatePage() {
  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Add New Email Template" },
  ];
  return (
    <>
      <BreadcrumbComp title="Add New Email Template" items={BCrumb} />
        <AddTemplateForm />
      <div className="max-w-4xl mx-auto py-8">
      </div>
    </>
  );
}
