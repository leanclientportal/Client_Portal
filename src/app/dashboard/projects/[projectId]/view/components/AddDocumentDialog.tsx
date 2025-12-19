'use client';

import { FC, useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { X, File, UploadCloud } from 'lucide-react';
import { uploadFile } from '@/lib/storage';
import { addDocument, updateDocument } from '@/lib/api';
import type { Documents, NewDocument, CommonApiResponse, ApiAddResponseData } from '@/lib/types'; // Updated imports
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { capitalizeFirstLetter } from '@/lib/utils';

interface FileWithPreview extends File {
  preview: string;
}

interface AddDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUploaded: () => void;
  projectId: string;
  documents: Documents[]; // Pass existing documents to check for overwrites
}

const AddDocumentDialog: FC<AddDocumentDialogProps> = ({ isOpen, onClose, onFileUploaded, projectId, documents }) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const { toast } = useToast();
  const { token, activeProfile, activeProfileId } = useAuth();

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
      'application/msword': ['.doc', '.docx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'text/csv': ['.csv'],
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

    const uploadPromises: Promise<void>[] = []; // Changed to Promise<void>
    let uploadedBy = activeProfile as string;
    if (activeProfile) { uploadedBy = capitalizeFirstLetter(activeProfile) };

    for (const fileToUpload of files) {
      const existingDoc = documents.find(doc => doc.name === fileToUpload.name);
      
      // Check if file exists and overwrite is not selected, or if user lacks permission
      if (existingDoc && !overwrite) {
        toast({
          title: "File already exists",
          description: `"${fileToUpload.name}" already exists. To replace it, check the "Overwrite" box.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return; // Stop the entire upload process
      }
      
      if (existingDoc && overwrite && existingDoc.uploaderId._id !== activeProfileId) {
        toast({
          title: "Permission Denied",
          description: `You do not have permission to overwrite "${fileToUpload.name}". It was uploaded by another user.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      uploadPromises.push(
        (async () => {
          const docUrlResponse = await uploadFile('documents', projectId, fileToUpload);
          const newDocumentData: NewDocument = {
            name: fileToUpload.name,
            docUrl: docUrlResponse.downloadURL,
            uploadedBy: uploadedBy,
            uploaderId: activeProfileId as string,
            isOverwrite: overwrite
          };

          let apiResponse: CommonApiResponse<ApiAddResponseData>;

          if (existingDoc && overwrite) {
            // If overwriting, call updateDocument
            apiResponse = await updateDocument(token, projectId, existingDoc._id, newDocumentData);
          } else {
            // Otherwise, add new document
            apiResponse = await addDocument(token, projectId, newDocumentData);
          }

          if (!apiResponse.success) {
            throw new Error(apiResponse.message || `Failed to process document: ${fileToUpload.name}`);
          }
        })()
      );
    }

    try {
      await Promise.all(uploadPromises);

      toast({ title: "Success", description: "All documents processed successfully." });
      onFileUploaded();
      onClose();
    } catch (error: any) {
      toast({ title: "Error uploading documents", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      files.forEach(file => URL.revokeObjectURL(file.preview));
      setFiles([]);
      setOverwrite(false);
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
        setOverwrite(false);
      }
      onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}>
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            {isDragActive ?
              <p>Drop the files here ...</p> :
              <p>Drag and drop files here, or click to select files</p>
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
                      <span className="text-sm truncate max-w-xs">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox id="overwrite" checked={overwrite} onCheckedChange={(checked) => setOverwrite(!!checked)} />
                <Label htmlFor="overwrite" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Overwrite file if same name exists
                </Label>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleUpload} disabled={isLoading || files.length === 0}>
            {isLoading ? `Processing ${files.length} files...` : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDocumentDialog;