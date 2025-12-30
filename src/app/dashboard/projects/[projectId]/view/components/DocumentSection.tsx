'use client';

import { FC, useState, useMemo, MouseEvent, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Paperclip, Loader2, Download, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import AddDocumentDialog from './AddDocumentDialog'; // Corrected component name
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { deleteDocument } from '@/lib/api'; // getDocuments might not be needed if passed as prop
import type { Documents, CommonApiResponse, ApiAddResponseData } from '@/lib/types'; // Added CommonApiResponse, ApiAddResponseData
import { ActionButton } from './ActionButton'; // Assuming ActionButton is also extracted
import { format } from 'date-fns';
import { formatDate } from '@/lib/utils';

interface DocumentSectionProps {
    projectId: string;
    projectFiles: Documents[]; // Changed to Documents[] based on original file context
    isLoadingFiles: boolean;
    fetchFiles: () => Promise<void>;
}

const DocumentSection: FC<DocumentSectionProps> = ({ projectId, projectFiles, isLoadingFiles, fetchFiles }) => {
    const { toast } = useToast();
    const { token } = useAuth();

    const [isAddFileOpen, setAddFileOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<Documents | null>(null); // Changed type to Documents
    const [isDeletingFile, setIsDeletingFile] = useState(false);

    const [fileSortKey, setFileSortKey] = useState<keyof Documents>('createdDate');
    const [fileSortOrder, setFileSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleDownload = (downloadUrl: any, fileName: string) => {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const sortedFiles = useMemo(() => {
        const sorted = [...projectFiles].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (fileSortKey === 'createdDate') {
                aValue = new Date(a[fileSortKey]).getTime();
                bValue = new Date(b[fileSortKey]).getTime();
            } else {
                aValue = (a[fileSortKey as keyof Documents] || '').toString().toLowerCase(); // Cast to keyof Documents
                bValue = (b[fileSortKey as keyof Documents] || '').toString().toLowerCase(); // Cast to keyof Documents
            }

            if (aValue < bValue) {
                return fileSortOrder === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return fileSortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    }, [projectFiles, fileSortKey, fileSortOrder]);

    const handleFileSort = (key: keyof Documents) => {
        if (fileSortKey === key) {
            setFileSortOrder(fileSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setFileSortKey(key);
            setFileSortOrder('asc');
        }
    };

    const handleDeleteFileClick = (e: MouseEvent, file: Documents) => {
        e.stopPropagation();
        setFileToDelete(file);
    };

    const handleConfirmDeleteFile = async () => {
        if (!fileToDelete || !token) return;
        setIsDeletingFile(true);
        try {
            const response: CommonApiResponse<ApiAddResponseData> = await deleteDocument(token, projectId, fileToDelete._id);
            if (response.success) {
              toast({ title: "Success", description: response.message || "Document deleted successfully" });
              fetchFiles();
              setFileToDelete(null);
            } else {
              toast({ title: "Error", description: response.message || "Failed to delete document.", variant: "destructive" });
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to delete file.", variant: "destructive" });
        } finally {
            setIsDeletingFile(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Documents</CardTitle>
                    <Dialog open={isAddFileOpen} onOpenChange={setAddFileOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out">
                                <Paperclip className="mr-2 h-4 w-4" />
                                Add Documents
                            </Button>
                        </DialogTrigger>
                        <AddDocumentDialog
                            isOpen={isAddFileOpen}
                            onClose={() => setAddFileOpen(false)}
                            onFileUploaded={() => {
                                fetchFiles();
                                setAddFileOpen(false);
                            }}
                            projectId={projectId}
                            documents={projectFiles}
                        />
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {isLoadingFiles ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleFileSort('name')}>
                                        File Name
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleFileSort('uploadedBy')}>
                                        Uploaded By
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleFileSort('createdDate')}>
                                        Uploaded Date
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedFiles.length > 0 ? sortedFiles.map((file, index) => (
                                <TableRow key={file._id || index}> {/* Use file._id for key if available, fallback to index */}
                                    <TableCell>{file.name}</TableCell>
                                    <TableCell>{file.uploadedBy}<br />{file.uploaderId.email}</TableCell>
                                    <TableCell>{formatDate(file.createdDate)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="inline-flex justify-end items-center gap-1 rounded-full bg-muted p-1">
                                            <ActionButton
                                                onClick={() => handleDownload(file.docUrl, file.name)}
                                                label="Download"
                                                className="text-blue-500 hover:bg-blue-500"
                                            >
                                                <Download className="h-5 w-5" />
                                            </ActionButton>
                                            {/* <ActionButton
                                                onClick={(e) => handleDeleteFileClick(e, file)}
                                                label="Delete"
                                                className="text-red-500 hover:bg-red-500"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </ActionButton> */}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No files found for this project.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <AlertDialog open={!!fileToDelete} onOpenChange={(isOpen) => !isOpen && setFileToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the file from the project.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDeleteFile} disabled={isDeletingFile}>
                            {isDeletingFile ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default DocumentSection;