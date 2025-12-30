export interface DashboardWidgetsResponse {
  totalClients: number;
  totalTenants: number;
  activeProjects: number;
  pendingTasks: number;
  outstandingInvoices: number;
}

export interface TopClient {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface TopTenant {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface TopProject {
  _id: string;
  name: string;
  status: string;
}

export interface LatestTask {
  _id: string;
  title: string;
  status: string;
}

export interface LatestDocument {
  _id: string;
  name: string;
  uploadedBy: string;
  docUrl: string;
}

export interface LatestInvoice {
  _id: string;
  title: string;
  status: string;
  amount: number;
}

export interface LatestNotification {
  _id: string;
  message: string;
}

export interface DashboardOverviewResponse {
  topClients: TopClient[];
  topTenants: TopTenant[];
  topProjects: TopProject[];
  latestTasks: LatestTask[];
  latestDocuments: LatestDocument[];
  latestInvoices: LatestInvoice[];
  latestNotifications: LatestNotification[];
}

