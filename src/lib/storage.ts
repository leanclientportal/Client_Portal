
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
 * Deletes a file from Firebase Storage.
 * @param storagePath The path of the file in Storage.
 */
export async function deleteFileByPath(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}

/**
 * Uploads a logo to Firebase Storage.
 * @param tenantId The ID of the tenant.
 * @param logo The logo file to upload.
 * @returns The download URL of the uploaded logo.
 */
export async function uploadLogo(tenantId: string, logo: File): Promise<string> {
  try {
    const { downloadURL } = await uploadFile('logos', tenantId, logo);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw new Error('Failed to upload logo.');
  }
}
