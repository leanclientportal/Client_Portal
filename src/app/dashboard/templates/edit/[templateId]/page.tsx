'use client';
import { useParams } from 'next/navigation';
import { EditTemplateForm } from '../../components/EditTemplateForm';
import BreadcrumbComp from '@/app/dashboard/layout/shared/breadcrumb/BreadcrumbComp';

export default function EditTemplatePage() {
  const params = useParams();
  const { templateId } = params;
  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Edit Email Template" },
  ];
  return (
    <>
      <BreadcrumbComp title="Edit Email Template" items={BCrumb} />
        {templateId && <EditTemplateForm templateId={templateId as string} />}
    </>
  );
}
