
import { getStorage, ref, uploadString, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { app } from './firebase';
import { v4 as uuidv4 } from 'uuid';

const storage = getStorage(app, 'gs://media_storage_001');

/**
 * Uploads a base64 image and returns the download URL.
 * This is used for client profile pictures.
 */
export async function uploadImageAndGetURL(tenantId: string, base64Image: string, fileName: string): Promise<string> {
  const imageId = uuidv4();
  const storagePath = `profile_images/${tenantId}/${imageId}_${fileName}`;
  const storageRef = ref(storage, storagePath);
  await uploadString(storageRef, base64Image, 'data_url');
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

/**
 * Uploads a file buffer to Firebase Storage.
 * @param folder The folder in the bucket (e.g., 'invoices', 'project-files').
 * @param projectId The ID of the project.
 * @param file The file object to upload.
 * @returns An object with the downloadURL and the storagePath.
 */
export async function uploadFile(folder: string, projectId: string, file: File): Promise<{ downloadURL: string; storagePath: string; }> {
  const fileName = `${uuidv4()}-${file.name}`;
  const storagePath = `${folder}/${projectId}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  const fileBuffer = await file.arrayBuffer();
  await uploadBytes(storageRef, fileBuffer);

  const downloadURL = await getDownloadURL(storageRef);

  return { downloadURL, storagePath };
}

/**
 * Deletes a file from Firebase Storage using its storage path.
 * @param storagePath The full path to the file in Firebase Storage.
 */
export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}
