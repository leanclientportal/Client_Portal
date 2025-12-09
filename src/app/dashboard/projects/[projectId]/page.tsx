
'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import EditProjectForm from "./components/EditProjectForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function EditProjectPageContent({ params }: { params: Promise<{ clientId: string, projectId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const handleBack = () => {
    // In a real application, you might check for unsaved changes here
    // For now, we'll just go back.
    router.back();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Edit Project</h1>
      </div>
      {/* Removed the back button from here */}
      <EditProjectForm
        clientId={resolvedParams.clientId}
        projectId={resolvedParams.projectId}
        onBack={handleBack}
      />
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave? Your changes will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.back()}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function EditProjectPage({ params }: { params: Promise<{ clientId: string, projectId: string }> }) {
  return <EditProjectPageContent params={params} />;
}
