'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, File, UploadCloud } from 'lucide-react';

interface AddFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUploaded: () => void;
  projectId: string;
}

export default function AddFileDialog({ isOpen, onClose, onFileUploaded, projectId }: AddFileDialogProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({ title: "No files selected", description: "Please select files to upload.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const result = await response.json();
      toast({ title: "Success", description: result.message || "Files uploaded successfully" });
      onFileUploaded();
      onClose();
    } catch (error: any) {
      toast({ title: "Error uploading files", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>
        <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}>
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          {isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag and drop some files here, or click to select files</p>
          }
        </div>
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold">Selected Files:</h4>
            <ul className="divide-y divide-gray-200">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <File className="h-5 w-5 text-gray-500" />
                    <span>{file.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpload} disabled={isLoading || files.length === 0}>
            {isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
