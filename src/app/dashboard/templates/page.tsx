'use client';

import BreadcrumbComp from '../layout/shared/breadcrumb/BreadcrumbComp';
import { TemplateTable } from './components/TemplateTable';

export default function TemplatesPage() {
  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Email Templates" },
  ];
  return (
    <>
      <BreadcrumbComp title="Email Templates" items={BCrumb} />
      <TemplateTable />
    </>
  );
}
