
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest, { params }: { params: { clientId: string, projectId: string } }) {
    try {
        const { clientId, projectId } = params;
        const { name, content } = await request.json();

        if (!name || !content) {
            return NextResponse.json({ error: 'Missing required fields: name and content' }, { status: 400 });
        }

        const result = await sql`
            INSERT INTO documents (client_id, project_id, name, content)
            VALUES (${clientId}, ${projectId}, ${name}, ${content})
            RETURNING *;
        `;

        const newDocument = result.rows[0];

        return NextResponse.json({ success: true, message: 'Document created successfully.', data: newDocument }, { status: 201 });
    } catch (error) {
        console.error('Error creating document:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
