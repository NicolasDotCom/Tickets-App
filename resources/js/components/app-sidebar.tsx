import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, BriefcaseMedical, ClipboardList, Folder, LayoutGrid, Users } from 'lucide-react';
import AppLogo from './app-logo';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';


// Todos los elementos de navegación disponibles
// Ahora basado en permisos en lugar de roles específicos
const allMainNavItems: NavItem[] = [
    {
        title: 'Panel de Control',
        href: '/dashboard',
        icon: LayoutGrid,
        roles: ['*'], // Todos los usuarios autenticados pueden ver el dashboard
    },
    {
        title: 'Clientes',
        href: '/customers',
        icon: Users,
        permission: 'view customer', // Basado en permiso en lugar de roles específicos
    },
    {
        title: 'Soporte Técnico',
        href: '/supports',
        icon: BriefcaseMedical,
        permission: 'view support', // Basado en permiso en lugar de roles específicos
    },
    {
        title: 'Tickets',
        href: '/tickets',
        icon: ClipboardList,
        permission: 'view ticket', // Basado en permiso en lugar de roles específicos
    },
];

const allFooterNavItems: NavItem[] = [
    {
        title: 'Roles',
        href: '/roles',
        icon: Folder,
        roles: ['admin'], // Solo admin puede gestionar roles
    },
    {
        title: 'Asignación de Roles',
        href: '/users/roles',
        icon: BookOpen,
        roles: ['admin'], // Solo admin puede asignar roles
    },
    {
        title: 'Usuarios',
        href: '/users',
        icon: BookOpen,
        roles: ['admin'], // Solo admin puede gestionar usuarios
    },
];

export function AppSidebar() {
    const { canAccessNavItem } = usePermissions();

    // Filtrar elementos de navegación según los permisos del usuario
    const mainNavItems = allMainNavItems.filter(item => canAccessNavItem(item));

    const footerNavItems = allFooterNavItems.filter(item => canAccessNavItem(item));
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
