'use client';
import { useParams } from 'next/navigation';
import { EditTemplateForm } from '../../components/EditTemplateForm';

export default function EditTemplatePage() {
  const params = useParams();
  const { templateId } = params;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Email Template</h1>
      {templateId && <EditTemplateForm templateId={templateId as string} />}
    </div>
  );
}
