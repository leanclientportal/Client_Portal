'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AddProjectForm from './components/AddProjectForm';

export default function AddProjectPage() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Add New Project</h1>
      </div>
      <AddProjectForm onBack={handleBackClick} />
    </div>
  );
}
