
export interface Client {
    _id: string;
    tenantId: string;
    name: string;
    email: string;
    phone: string | null;
    address?: string;
    profileImageUrl?: string;
    createdAt: string;
    updatedAt: string;
    profileImageBinary?: string;
    isActive: boolean;
    lastActivityDate?: string;
    invitationToken?: string;
}

export interface SelectListItem {
    value: string;
    label: string;
}

export interface APIResponse<T> {
    data: T;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalPages: number;
    currentPage: number;
}

export interface ProjectFile {
    _id: string;
    fileName: string;
    fileType: string;
    fileBinary: string;
}

export interface Project {
    _id: string;
    clientId: Client;
    tenantId: Tenant;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on-hold';
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    lastActivityDate: string;
    projectFiles: ProjectFile[];
}

export interface Task {
    _id: string;
    projectId: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'in-review' | 'completed';
    dueDate: string;
    createdDate: string;
    updatedAt: string;
    visibleToClient: boolean;
}

export interface Documents {
    _id: string;
    projectId: string;
    title: string;
    description: string;
    createdDate: string;
    updatedBy: string;
    docUrl: string;
}

export interface NewClient {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    profileImageUrl?: string;
    profileImageBinary?: string;
    profileImageName?: string;
    isActive?: boolean;
    invitationToken?: string;
}

export interface NewProject {
    name: string;
    description: string;
    status: 'active' | 'on-hold' | 'completed';
    isDeleted?: boolean;
    clientId: string;
    projectFileBinary?: string;
    projectFileName?: string;
    projectFileType?: string;
}

export interface NewTask {
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'in-review' | 'completed';
    dueDate: string;
    visibleToClient: boolean;
}


export interface NewDocument {
    name: string;
    tag?: string;
    uploadedBy?: string;
    uploaderId?: string;
    description?: string;
    docUrl?: string;
}

export interface NewInvoice {
    invoiceUrl: string;
    title?: string;
    description?: string;
    status: string;
    amount: number;
    dueDate: string;
    paymentLink?: string;
}


export interface User {
    id: string;
    name: string;
    email: string;

}

export interface AuthState {
    user: User | null;
    token: string | null;
    tenantId: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface GetClientsResponse {
    clients: Client[];
    pagination: Pagination;
}

export interface SelectList {
    Item: SelectListItem[];
}

export interface GetProjectsResponse {
    projects: Project[];
    pagination: Pagination;
}
export interface GetTasksResponse {
    tasks: Task[];
    pagination: Pagination;
}

export interface GetDocumentsResponse {
    documents: Documents[];
    pagination: Pagination;
}
export interface GetInvoicesResponse {
    invoice: Invoice[];
    pagination: Pagination;
}

export interface Pagination {
    current: number;
    total: number;
    count: number;
    totalRecords: number;
}

export interface Document {
    _id: string;
    projectId: string;
    clientId: string;
    name: string;
    url: string;
    tag: string;
    createdDate: string;
    uploadedBy: string;
    uploaderId: string;
}

export interface LoginCredentials {
    emailOrPhone: string;
    password: string;
}

export interface Tenant {
    _id: string;
    companyName: string;
    email: string;
    phone: string;
    isActive: boolean;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        userId: string;
    };
    status: number;
}
export interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    userId: string;
    activeProfile: string;
    activeProfileId: string;
    email: string;
    status: number;
}

export interface UpdateUserPayload {
    name?: string;
    email?: string;
}

export interface RegisterCredentials {
    email?: string;
    password?: string;
    activeProfile?: string;
}

export interface Account {
    type: 'client' | 'tenant';
    id: string;
    name: string;
    email: string;
    phone: string;
    profileImageUrl?: string;
}

export interface GetAccountsResponse {
    accounts: Account[];
}

export interface SwitchAccountPayload {
    activeProfile: 'client' | 'tenant';
    masterId: string;
}

export interface SwitchAccountResponse {
    token: string;
    userId: string;
    activeProfile: string;
    activeProfileId: string;
    activeProfileImage: string | null;
    profileName: string;
}

export interface VerifyOtpResponse {
    status: number;
    success: boolean;
    message: string;
    token: string;
    userId: string;
    activeProfile: string;
    activeProfileId: string;
    activeProfileImage: string | null;
    profileName: string;
}
export interface NewProfile {
    name: string;
    email: string;
    profileType: 'client' | 'tenant';
    phone: string | null;
    profileImageUrl?: string;
    profileImageBinary?: string;
    profileImageName?: string;
}

export interface CreateProfileResponse {
    success: boolean;
    message: string;
}

export interface MergeProfilesPayload {
    sourceProfileId: string;
    targetProfileId: string;
    profileType: 'client' | 'tenant';
}

export interface MergeProfilesResponse {
    success: boolean;
    message: string;
}

export interface ProjectDocument {
    name: string;
    storagePath: string;
    downloadURL: string;
    date: string;
    type: string;
}

export interface Invoice {
    _id: string;
    projectId: string;
    title: string;
    invoiceUrl: string;
    amount: number;
    dueDate: string;
    status: string;
    paymentLink?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ProjectFilterParams {
    searchTerm?: string;
    selectedClient?: string;
    dateFrom?: string;
    dateTo?: string;
}
