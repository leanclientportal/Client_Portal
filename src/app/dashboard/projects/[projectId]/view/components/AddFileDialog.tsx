'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, File, UploadCloud } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label';
import { addDocument } from '@/lib/api';
import type { NewDocument } from '@/lib/types';
import { uploadFile } from '@/lib/storage';

interface AddFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUploaded: () => void;
  projectId: string;
}

interface FileWithPreview extends File {
  preview: string;
}

export default function AddFileDialog({ isOpen, onClose, onFileUploaded, projectId }: AddFileDialogProps) {
  const { toast } = useToast();
  const { token, activeProfile, activeProfileId } = useAuth();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setFiles(prevFiles => [...prevFiles, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    }
  });

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove && fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({ title: "No files selected", description: "Please select files to upload.", variant: "destructive" });
      return;
    }
    if (!token) {
      toast({ title: "Authentication Error", description: "Authentication details are missing.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // This handles one file at a time. To handle multiple files, this would need to be a loop.
      const fileToUpload = files[0];
      const docUrl = await uploadFile('documents', projectId, fileToUpload);

      const newDocument: NewDocument = {
        name: title || fileToUpload.name,
        description,
        docUrl: docUrl.downloadURL,
        uploadedBy: activeProfile as string,
        uploaderId: activeProfileId as string
      };

      const response = await addDocument(token, projectId, newDocument);
      toast({ title: "Success", description: response.message || "Document uploaded successfully" });
      onFileUploaded();
      onClose();
    } catch (error: any) {
      toast({ title: "Error uploading document", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      files.forEach(file => URL.revokeObjectURL(file.preview));
      setFiles([]);
    }
  };

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        files.forEach(file => URL.revokeObjectURL(file.preview));
        setFiles([]);
      }
      onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 max-h-[70vh] overflow-y-auto'>
          <div>
            <Label htmlFor="title">Document Title</Label>
            <Input id="title" placeholder="E.g. Invoice #123" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe the document" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

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
                    {file.type.startsWith('image/') ? (
                      <img src={file.preview} alt={file.name} className="h-10 w-10 object-cover rounded-md" />
                    ) : (
                      <File className="h-5 w-5 text-gray-500" />
                    )}
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
