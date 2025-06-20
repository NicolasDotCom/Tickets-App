import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}


//Tipos para el proyecto
export type Speciality = 'Software' | 'Hardware' | 'Networking' | 'Operating Systems';

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    created_at: string;
    updated_at: string;
    tickets_count?: number;
}

export interface Support {
    id: number;
    name: string;
    email: string;
    phone: string;
    speciality: Speciality;
    created_at: string;
    updated_at: string;
    tickets_count?: number;
}

export interface Ticket {
    id:number;
    customer_id: number;
    support_id: number | null;
    description: string;
    status: 'Open' | 'In Progress' | 'Closed';
    created_at: string;
    updated_at: string;
    customer: Customer | null;
    support: Support | null;
}

//Para pagination
export interface PaginationLinks {
    url:string | null;
    label: string;
    active: boolean
}
export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
    links: PaginationLinks[];
}

export interface PageProps {
    flash: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    customers?: PaginatedData<Customer> | { id: number; name: string }[] ;
    supports?: PaginatedData<Support> | { id: number; name: string }[];
    tickets: PaginatedData<Ticket>;
    search?: string;
    [key: string]: unknown;
    totalCustomers: number;
    totalTickets: number;
    totalSupports: number;
    technicalSupportSpeciality: Record<string, number>;
    ticketByStatus: Record<Ticket['status'], number>;
}
