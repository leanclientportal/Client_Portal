'use client';

import { TemplateTable } from './components/TemplateTable';

export default function TemplatesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Email Templates</h1>
      <TemplateTable />
    </div>
  );
}
