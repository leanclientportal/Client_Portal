
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest, { params }: { params: { tenantId: string, clientId: string } }) {
    try {
        const { tenantId, clientId } = params;
        const { rows } = await sql`
            SELECT * FROM projects
            WHERE tenant_id = ${tenantId} AND client_id = ${clientId};
        `;

        return NextResponse.json({ projects: rows }, { status: 200 });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: { tenantId: string, clientId: string } }) {
    try {
        const { tenantId, clientId } = params;
        const { name, description, status, isActive } = await request.json();

        if (!name || !description || !status || isActive === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await sql`
            INSERT INTO projects (tenant_id, client_id, name, description, status, is_active)
            VALUES (${tenantId}, ${clientId}, ${name}, ${description}, ${status}, ${isActive})
            RETURNING *;
        `;

        return NextResponse.json({ project: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
