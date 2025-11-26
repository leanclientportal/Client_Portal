
import { NextResponse } from 'next/server';
import { uploadFile, deleteFileFromStorage } from '@/lib/storage';
import fs from 'fs/promises';
import path from 'path';

const invoicesPath = path.join(process.cwd(), 'projectinvoices');
const metadataPath = path.join(invoicesPath, 'metadata.json');

// Function to ensure the directory exists
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}

// Function to read metadata
async function readMetadata() {
  try {
    await fs.access(metadataPath);
    const metadata = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(metadata);
  } catch (error) {
    return {};
  }
}

// Function to write metadata
async function writeMetadata(metadata) {
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}

// GET handler to list invoices
export async function GET(request, { params }) {
  const { projectId } = params;
  const metadata = await readMetadata();
  const projectInvoices = metadata[projectId] || [];

  return NextResponse.json(projectInvoices);
}

// POST handler to upload a new invoice
export async function POST(request, { params }) {
  const { projectId } = params;
  await ensureDirectoryExists(invoicesPath);

  const formData = await request.formData();
  const file = formData.get('file');
  const amount = formData.get('amount');
  const dueDate = formData.get('dueDate');
  const status = formData.get('status');
  const paymentLink = formData.get('paymentLink');

  const metadata = await readMetadata();
  if (!metadata[projectId]) {
    metadata[projectId] = [];
  }

  const newInvoice = {
    id: `${Date.now()}`,
    projectId,
    amount,
    dueDate,
    status,
    paymentLink: paymentLink || '',
    createdAt: new Date().toISOString(),
  };

  if (file && file.name) {
    const { downloadURL, storagePath } = await uploadFile('invoices', projectId, file);
    newInvoice.fileName = file.name;
    newInvoice.downloadURL = downloadURL;
    newInvoice.storagePath = storagePath;
  }

  metadata[projectId].push(newInvoice);
  await writeMetadata(metadata);

  return NextResponse.json(newInvoice, { status: 201 });
}

// DELETE handler to delete an invoice
export async function DELETE(request, { params }) {
  const { projectId } = params;
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get('id');
  
  if (!invoiceId) {
    return NextResponse.json({ message: 'Invoice ID is required.' }, { status: 400 });
  }

  const metadata = await readMetadata();
  const projectInvoices = metadata[projectId] || [];
  const invoiceToDelete = projectInvoices.find(inv => inv.id === invoiceId);

  if (!invoiceToDelete) {
    return NextResponse.json({ message: 'Invoice not found.' }, { status: 404 });
  }

  if (invoiceToDelete.storagePath) {
    try {
        await deleteFileFromStorage(invoiceToDelete.storagePath);
    } catch (err) {
        console.error(`Failed to delete invoice file from storage: ${invoiceToDelete.storagePath}`, err);
    }
  }

  metadata[projectId] = projectInvoices.filter(inv => inv.id !== invoiceId);
  await writeMetadata(metadata);

  return NextResponse.json({ message: 'Invoice deleted successfully.' });
}
