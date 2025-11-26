
import { NextResponse } from 'next/server';
import { uploadFile, deleteFileFromStorage } from '@/lib/storage';
import fs from 'fs/promises';
import path from 'path';

const metadataPath = path.join(process.cwd(), 'projectdocs', 'metadata.json');

// Function to ensure the metadata file exists
async function ensureMetadataFileExists() {
  try {
    await fs.access(metadataPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(metadataPath), { recursive: true });
      await fs.writeFile(metadataPath, JSON.stringify({}));
    }
  }
}

// Function to read metadata
async function readMetadata() {
  await ensureMetadataFileExists();
  const metadata = await fs.readFile(metadataPath, 'utf8');
  return JSON.parse(metadata);
}

// Function to write metadata
async function writeMetadata(metadata) {
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}

// GET handler to list files for a project
export async function GET(request, { params }) {
  const { projectId } = params;
  const metadata = await readMetadata();
  const projectFiles = metadata[projectId] || [];
  return NextResponse.json(projectFiles);
}

// POST handler to upload files for a project
export async function POST(request, { params }) {
  const { projectId } = params;
  const formData = await request.formData();
  const files = formData.getAll('files');

  if (!files || files.length === 0) {
    return NextResponse.json({ message: 'No files uploaded' }, { status: 400 });
  }

  const metadata = await readMetadata();
  if (!metadata[projectId]) {
    metadata[projectId] = [];
  }

  const uploadPromises = files.map(async (file) => {
    const { downloadURL, storagePath } = await uploadFile('project-files', projectId, file);
    const fileMetadata = {
      name: file.name,
      storagePath,
      downloadURL,
      date: new Date().toISOString(),
      type: file.type,
    };
    metadata[projectId].push(fileMetadata);
    return fileMetadata;
  });

  const uploadedFiles = await Promise.all(uploadPromises);
  await writeMetadata(metadata);

  return NextResponse.json({ 
      message: 'Files uploaded successfully', 
      files: uploadedFiles 
  });
}

// DELETE handler to delete a file from a project
export async function DELETE(request, { params }) {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);
    const storagePath = searchParams.get('storagePath');

    if (!storagePath) {
        return NextResponse.json({ message: 'No file specified for deletion' }, { status: 400 });
    }

    try {
        await deleteFileFromStorage(storagePath);
        
        const metadata = await readMetadata();
        if (metadata[projectId]) {
            metadata[projectId] = metadata[projectId].filter(file => file.storagePath !== storagePath);
            await writeMetadata(metadata);
        }

        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Failed to delete file:', error);
        return NextResponse.json({ message: 'Error deleting file' }, { status: 500 });
    }
}
