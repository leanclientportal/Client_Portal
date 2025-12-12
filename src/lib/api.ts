
import type { Client, GetClientsResponse, GetProjectsResponse, GetTasksResponse, NewClient, NewProject, NewTask, Project, Task, ProjectFile, User, AuthResponse, LoginCredentials, UpdateUserPayload, GetAccountsResponse, SwitchAccountPayload, SwitchAccountResponse, Tenant, NewProfile, CreateProfileResponse, MergeProfilesPayload, MergeProfilesResponse, NewDocument, GetDocumentsResponse, NewInvoice, GetInvoicesResponse, SelectList, SelectListItem, ProjectFilterParams } from "./types";

interface Invoice {
    id: string;
    projectId: string;
    // Add other invoice properties as needed
}

interface ApiListResponse {
    success: boolean;
    message: string;
    data: GetClientsResponse;
}

interface ApiSelectListResponse {
    success: boolean;
    message: string;
    data: SelectList;
}

interface ApiProjectsListResponse {
    success: boolean;
    message: string;
    data: GetProjectsResponse;
}

interface ApiTasksListResponse {
    success: boolean;
    message: string;
    data: GetTasksResponse;
}

interface ApiDocumentsListResponse {
    success: boolean;
    message: string;
    data: GetDocumentsResponse;
}

interface ApiInvoicesListResponse {
    success: boolean;
    message: string;
    data: GetInvoicesResponse;
}


interface ApiSingleResponse {
    success: boolean;
    message: string;
    data: Client;
}

interface ApiSingleProjectResponse {
    success: boolean;
    message: string;
    data: Project;
}

interface ApiSingleTaskResponse {
    success: boolean;
    message: string;
    data: Task;
}

interface ApiSingleInvoiceResponse {
    success: boolean;
    message: string;
    data: Invoice;
}

interface ApiAddResponse {
    success: boolean;
    message: string;
    clientId?: string;
}
interface ApiResponse {
    success: boolean;
    message: string;
}

// Function to retrieve a paginated list of clients
export async function getClients(tenantId: string, token: string, page: number, limit: number, search: any): Promise<GetClientsResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = new URL(`${baseUrl}/clients/${tenantId}`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    if (search)
        url.searchParams.append('search', search);

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to fetch clients. Status: ${response.status}`);
        }

        const responseData: ApiListResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error("Error getting clients:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

export async function getClientsSelectList(tenantId: string, token: string): Promise<SelectListItem[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = new URL(`${baseUrl}/clients/${tenantId}/dropdown`);

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to fetch tenants. Status: ${response.status}`);
        }

        const responseData: { success: boolean, count: number, message?: string, data: SelectListItem[] } = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error("Error getting clients:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to get projects for a specific client, now with filtering
export async function getProjects(
    activeProfile: string,
    token: string,
    activeProfileId: string,
    filters: ProjectFilterParams = {} // Accepts a filter object
): Promise<GetProjectsResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/projects/${activeProfile}/${activeProfileId}`; // New endpoint

    try {
        const response = await fetch(url, {
            method: 'POST', // Changed to POST
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(filters), // Send filters in the body
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Provide a more specific error for 404
            if (response.status === 404) {
                return { projects: [], pagination: { current: 1, total: 0, count: 0, totalRecords: 0 } };
            }
            throw new Error(errorData?.message || `Failed to fetch projects. Status: ${response.status}`);
        }

        const responseData: ApiProjectsListResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error(`Error getting projects for client ${activeProfileId}:`, error);
        throw error instanceof Error ? error : new Error("An unknown error occurred while fetching projects.");
    }
}

// Function to get tasks for a specific project
export async function getTasks(token: string, projectId: string, activeProfile: string): Promise<GetTasksResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/tasks/${projectId}/${activeProfile}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            if (response.status === 404) {
                return { tasks: [], pagination: { current: 1, total: 0, count: 0, totalRecords: 0 } };
            }
            throw new Error(errorData?.message || `Failed to fetch tasks. Status: ${response.status}`);
        }

        const responseData: ApiTasksListResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error(`Error getting tasks for project ${projectId}:`, error);
        throw error instanceof Error ? error : new Error("An unknown error occurred while fetching tasks.");
    }
}


// Function to get documents for a specific project
export async function getDocuments(token: string, projectId: string): Promise<GetDocumentsResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/documents/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            if (response.status === 404) {
                return { documents: [], pagination: { current: 1, total: 0, count: 0, totalRecords: 0 } };
            }
            throw new Error(errorData?.message || `Failed to fetch tasks. Status: ${response.status}`);
        }

        const responseData: ApiDocumentsListResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error(`Error getting tasks for project ${projectId}:`, error);
        throw error instanceof Error ? error : new Error("An unknown error occurred while fetching tasks.");
    }
}

// Function to get documents for a specific project
export async function getInvoices(token: string, projectId: string): Promise<GetInvoicesResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/invoices/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            if (response.status === 404) {
                return { invoice: [], pagination: { current: 1, total: 0, count: 0, totalRecords: 0 } };
            }
            throw new Error(errorData?.message || `Failed to fetch tasks. Status: ${response.status}`);
        }

        const responseData: ApiInvoicesListResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error(`Error getting tasks for project ${projectId}:`, error);
        throw error instanceof Error ? error : new Error("An unknown error occurred while fetching tasks.");
    }
}


// Function to add a new client
export async function addClient(tenantId: string, token: string, newClient: NewClient): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/clients/${tenantId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newClient),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to add client. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error adding client:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to add a new project for a client
export async function addProject(tenantId: string, token: string, clientId: string, newProject: NewProject): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/projects/${tenantId}/${clientId}/add`;
    const { clientId: _, ...projectData } = newProject;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(projectData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to add project. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error adding project:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}


// Function to add a new task to a project
export async function addTask(token: string, projectId: string, newTask: NewTask): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/tasks/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newTask),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to add task. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error adding task:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}


// Function to add a new task to a project
export async function addDocument(token: string, projectId: string, newDocument: NewDocument): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/documents/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newDocument),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to add document. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error adding task:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}


// Function to add a new invoice to a project
export async function addInvoice(token: string, projectId: string, newInvoice: NewInvoice): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/invoices/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newInvoice),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to add invoice. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error adding invoice:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}



// Function to add a new invoice to a project
export async function updateInvoice(token: string, projectId: string, invoiceId: string, newInvoice: Partial<NewInvoice>): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/invoices/${projectId}/${invoiceId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newInvoice),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to add invoice. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error adding invoice:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}


// Function to add a new invoice to a project
export async function updateDocument(token: string, projectId: string, newInvoice: NewInvoice): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/invoices/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newInvoice),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to add invoice. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error adding invoice:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}


// Function to retrieve a single client by ID
export async function getClient(token: string, tenantId: string, clientId: string): Promise<Client> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/clients/${tenantId}/${clientId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to fetch client. Status: ${response.status}`);
        }

        const responseData: ApiSingleResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error("Error getting client:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to retrieve a single project by ID
export async function getProject(token: string, projectId: string): Promise<Project> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/projects/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to fetch project. Status: ${response.status}`);
        }

        const responseData: ApiSingleProjectResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error("Error getting project:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to retrieve a single task by ID
export async function getTask(token: string, taskId: string): Promise<Task> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/tasks/single/${taskId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to fetch task. Status: ${response.status}`);
        }

        const responseData: ApiSingleTaskResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error("Error getting task:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to retrieve a single invoice by ID
export async function getInvoice(token: string, invoiceId: string): Promise<Invoice> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/invoices/${invoiceId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to fetch invoice. Status: ${response.status}`);
        }

        const responseData: ApiSingleInvoiceResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error("Error getting invoice:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to update an existing client
export async function updateClient(tenantId: string, token: string, clientId: string, updatedClient: Partial<NewClient>): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/clients/${tenantId}/${clientId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedClient),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to update client. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error updating client:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to update an existing project
export async function updateProject(token: string, projectId: string, updatedProject: Partial<NewProject>): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/projects/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedProject),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to update project. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error updating project:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to delete an existing project
export async function deleteProject(token: string, projectId: string): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/projects/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to delete project. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error deleting project:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

export async function deleteClient(tenantId: string, token: string, clientId: string): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/clients/${tenantId}/${clientId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to delete client. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error deleting client:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

export async function deleteTask(token: string, projectId: string, taskId: string): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/tasks/${projectId}/${taskId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to delete task. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

export async function deleteDocument(token: string, projectId: string, documentId: string): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/documents/${projectId}/${documentId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to delete document. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error deleting document:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

export async function deleteInvoice(token: string, projectId: string, invoiceId: string): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/invoices/${projectId}/${invoiceId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to delete invoice. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error deleting invoice:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to update an existing task
export async function updateTask(token: string, projectId: string, taskId: string, updatedTask: Partial<NewTask>): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/tasks/${projectId}/${taskId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify(updatedTask),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to update task. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error updating task:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

export async function updateUser(token: string, payload: UpdateUserPayload): Promise<{ success: boolean; data: User }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/users/me`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to update user');
        }

        return await response.json();
    } catch (error) {
        console.error('Update user error:', error);
        throw error;
    }
}


// Function to get accounts for a user
export async function getAccounts(token: string, userId: string): Promise<GetAccountsResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = new URL(`${baseUrl}/auth/get-accounts/${userId}`);
    url.searchParams.append('timestamp', Date.now().toString());

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to fetch accounts. Status: ${response.status}`);
        }

        const responseData = await response.json();

        return responseData;
    } catch (error) {
        console.error("Error getting accounts:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

export async function switchAccount(userId: string, token: string, payload: SwitchAccountPayload): Promise<SwitchAccountResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/auth/switch-account/${userId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to switch account. Status: ${response.status}`);
        }

        const responseData: SwitchAccountResponse = await response.json();


        return responseData;
    } catch (error) {
        console.error("Error switching account:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to retrieve a paginated list of tenants by client
export async function getTenantsByClient(clientId: string, token: string): Promise<SelectListItem[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = new URL(`${baseUrl}/tenant/by-client/${clientId}`);

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to fetch tenants. Status: ${response.status}`);
        }

        const responseData: { success: boolean, count: number, message?: string, data: SelectListItem[] } = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error("Error getting tenants:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to create a new profile
export async function createProfile(userId: string, token: string, newProfile: NewProfile): Promise<CreateProfileResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/auth/create-profile/${userId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newProfile),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to create profile. Status: ${response.status}`);
        }

        const responseData: CreateProfileResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error creating profile:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to update an existing profile
export async function updateProfile(userId: string, token: string, accountId: string, updatedProfile: Partial<NewProfile>): Promise<CreateProfileResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/auth/update-profile/${userId}/${accountId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedProfile),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to update profile. Status: ${response.status}`);
        }

        const responseData: CreateProfileResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to verify an invitation token
export async function verifyInvitation(token: string): Promise<{ success: boolean; message: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/auth/verify-invitation?token=${token}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to verify invitation. Status: ${response.status}`);
        }

        const responseData: { success: boolean; message: string } = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error verifying invitation:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to merge profiles
export async function mergeProfiles(userId: string, token: string, payload: MergeProfilesPayload): Promise<MergeProfilesResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/auth/merge-profiles/${userId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to merge profiles. Status: ${response.status}`);
        }

        const responseData: MergeProfilesResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error merging profiles:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}


export async function resendInvitation(tenantId: string, clientId: string): Promise<ApiResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/clients/${tenantId}/${clientId}/resend-invitation`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify({ email, otp, type, ...options }),
        });

        const data = await response.json();
        return { ...data, status: response.status };
    } catch (error) {
        console.error('Verify OTP error:', error);
        throw error;
    }
}

// Function to mark an invoice as paid
export async function markInvoiceAsPaid(token: string, projectId: string, invoiceId: string): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/invoices/${projectId}/${invoiceId}/pay`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to mark invoice as paid. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error marking invoice as paid:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}
