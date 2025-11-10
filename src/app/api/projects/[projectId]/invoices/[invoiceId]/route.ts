
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';

export async function PUT(request: NextRequest, { params }: { params: { projectId: string, invoiceId: string } }) {
  noStore();

  const { invoiceId } = params;
  let { dueDate, status } = await request.json();

  if (!dueDate || !status) {
    return NextResponse.json({ message: 'Due date and status are required' }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateObj = new Date(dueDate);

  if (status === 'due' && dueDateObj < today) {
    status = 'overdue';
  }

  try {
    await sql`
      UPDATE invoices
      SET due_date = ${dueDate}, status = ${status}
      WHERE id = ${invoiceId};
    `;
    return NextResponse.json({ message: 'Invoice updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ message: 'Failed to update invoice' }, { status: 500 });
  }
}
