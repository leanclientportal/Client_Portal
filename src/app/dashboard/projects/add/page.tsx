'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AddProjectForm from './components/AddProjectForm';
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp';

export default function AddProjectPage() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Add New Project" },
  ];
  return (
    <>
      <BreadcrumbComp title="Add New Project" items={BCrumb} />
      <AddProjectForm onBack={handleBackClick} />
    </>
  );
}
