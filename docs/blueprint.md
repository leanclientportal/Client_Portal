# **App Name**: Udyami Hub

## Core Features:

- Tenant Authentication: Secure tenant login with email and password, storing JWT and tenantId upon successful authentication.
- Responsive Dashboard: Dashboard layout with a collapsible sidebar and top navigation, optimized for mobile and desktop views.
- Client List Management: Fetch, display, and manage client data through a responsive table or card view. Supports edit, delete, and view actions.
- Client Form Handling: Dynamic form for adding or editing client information, complete with validation using React Hook Form and Zod.
- API Integration: Centralized API service using Axios to manage client data with endpoints for fetching, creating, updating, and deleting clients, ensuring each request includes tenantId.
- Profile Picture Generation: Generate a suitable placeholder image for the client using AI if none is uploaded, such as initials of the name or a simple avatar.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) for a professional and trustworthy feel.
- Background color: Very light gray (#F5F5F5), nearly white, for a clean, modern aesthetic.
- Accent color: Teal (#009688), providing contrast and highlighting key actions.
- Body and headline font: 'Inter' (sans-serif) for a modern and neutral appearance suitable for both headings and body text.
- Lucide-react icons for a consistent and clean look throughout the application.
- Mobile-first design approach with a focus on responsive components using Tailwind CSS, including a collapsible sidebar.
- Subtle animations on form submissions and data loading to enhance user experience.