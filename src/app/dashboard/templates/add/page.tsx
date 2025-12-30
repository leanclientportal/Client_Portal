'use client';
import { AddTemplateForm } from '../components/AddTemplateForm';

export default function AddTemplatePage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Add New Email Template</h1>
      <AddTemplateForm />
    </div>
  );
}
