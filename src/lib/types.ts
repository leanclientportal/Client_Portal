// src/lib/types.ts

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
    totalProjects: number;
}

export interface SelectListItem {
    value: string;
    label: string;
}

export interface CommonApiResponse<T = undefined> {
    success: boolean;
    code: number;
    message: string;
    data?: T;
    pagination?: Pagination;
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
    name: string;
    uploadedBy?: string;
    uploaderId?: any;
    createdDate: string;
    docUrl?: string;
    isOverwrite: boolean;
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
    uploadedBy?: string;
    uploaderId?: string;
    docUrl?: string;
    isOverwrite: boolean;
}

export interface NewInvoice {
    invoiceUrl?: string;
    title: string;
    description?: string;
    status: string;
    amount: number;
    dueDate: string;
    invoiceDate: string;
    paidDate?: string;
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
}

export interface SelectList {
    Item: SelectListItem[];
}

export interface GetProjectsResponse {
    projects: Project[];
}
export interface GetTasksResponse {
    tasks: Task[];
}

export interface GetDocumentsResponse {
    documents: Documents[];
}
export interface GetInvoicesResponse {
    invoices: Invoice[];
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
    uploaderId: any;
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

export interface AuthResponseData {
    token: string;
    userId: string;
    activeProfile?: string;
    activeProfileId?: string;
    activeProfileImage?: string | null;
    profileName?: string;
}

export interface ApiAddResponseData {
    clientId?: string;
    message?: string;
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

export interface SwitchAccountResponseData {
    token: string;
    userId: string;
    activeProfile: string;
    activeProfileId: string;
    activeProfileImage: string | null;
    profileName: string;
}

export interface VerifyInvitationResponseData {
    success: boolean;
    message: string;
}

export interface VerifyOtpResponseData {
    token: string;
    userId: string;
    activeProfile: string;
    activeProfileId: string;
    activeProfileImage: string;
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
}

export interface MergeProfilesPayload {
    sourceProfileId: string;
    targetProfileId: string;
    profileType: 'client' | 'tenant';
}

export interface MergeProfilesResponse {
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
    invoiceDate: string;
    paymentLink?: string;
    createdAt: string;
    paidDate: string;
    updatedAt?: string;
}

export interface ProjectFilterParams {
    searchTerm?: string;
    selectedClient?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface Template {
    _id: string;
    tenantId: string;
    name: string;
    subject: string;
    body: string;
    templateTypeName: string;
    templateId: number;
    createdAt: string;
    updatedAt: string;
}

export interface NewTemplate {
    name: string;
    subject: string;
    body: string;
    templateId: number;
}

export interface GetTemplatesResponse {
    templates: Template[];
    pagination?: Pagination;
}

export interface EmailTemplateType {
    code: number;
    displayName: string;
}

export interface ChatMessage {
    _id: string;
    senderId: string;
    senderType: 'client' | 'tenant';
    receiverId: string;
    receiverType: 'client' | 'tenant';
    message: string;
    read: boolean;
    createdAt: string;
}

export interface ChatConversation {
    _id: string;
    name: string;
    profileImageUrl?: string;
    lastMessage?: string;
    lastMessageDate?: string;
    unreadCount: number;
    type: 'client' | 'tenant';
}

export interface GeneralSettings {
    dateFormat?: string;
    amountFormat?: string;
}
