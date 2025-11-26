import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps, type UserWithRoles } from '@/types';
import { normalizePaginatedData } from '@/utils/pagination';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2, Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import { UserMobileCard } from '@/components/user-mobile-card';
import { UserDetailModal } from '@/components/user-detail-modal';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/users',
    },
];

export default function Index() {
    const { users } = usePage<PageProps>().props;
    const normalizedUsers = normalizePaginatedData<UserWithRoles>(users);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [recordIdToDelete, setRecordIdToDelete] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [mobileSearchTerm, setMobileSearchTerm] = useState('');

    // Función para traducir nombres de roles al español
    const translateRole = (roleName: string) => {
        const translations: { [key: string]: string } = {
            'admin': 'Administrador',
            'customer': 'Cliente',
            'support': 'Soporte Técnico'
        };
        return translations[roleName] || roleName;
    };

    const columns: ColumnDef<UserWithRoles>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
        },
        {
            accessorKey: 'name',
            header: 'Nombre',
        },
        {
            accessorKey: 'email',
            header: 'Correo',
        },
        {
            id: 'roles',
            header: 'Roles',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1 text-xs">
                    {row.original.roles.map((role) => (
                        <span key={role.id} className="bg-muted rounded-md px-2 py-1">
                            {translateRole(role.name)}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Link href={route('users.edit', row.original.id)}>
                        <Button size="sm" variant="default">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            setRecordIdToDelete(row.original.id);
                            setIsDialogOpen(true);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const handleSearch = useCallback((searchTerm: string) => {
        router.get(
            route('users.index'),
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['users'],
            },
        );
    }, []);

    const handlePageChange = useCallback((url: string | null) => {
        if (url) {
            router.get(url, undefined, {
                preserveState: true,
                preserveScroll: true,
                only: ['users'],
            });
        }
    }, []);

    const handleViewDetails = (user: UserWithRoles) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    const filteredMobileUsers = normalizedUsers.data.filter((user: UserWithRoles) => {
        if (!mobileSearchTerm) return true;
        const searchLower = mobileSearchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.roles.some(role => translateRole(role.name).toLowerCase().includes(searchLower))
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold">Usuarios</h1>
                    <Link href={route('users.create')}>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Agregar Usuario
                        </Button>
                    </Link>
                </div>

                {/* Vista Desktop */}
                <div className="hidden md:block">
                    <DataTable
                        columns={columns}
                        data={normalizedUsers.data}
                        pagination={{
                            from: normalizedUsers.from,
                            to: normalizedUsers.to,
                            total: normalizedUsers.total,
                            links: normalizedUsers.links,
                            onPageChange: handlePageChange,
                        }}
                        onSearch={handleSearch}
                        searchPlaceholder="Buscar usuario..."
                    />
                </div>

                {/* Vista Móvil */}
                <div className="md:hidden space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar usuarios..."
                            value={mobileSearchTerm}
                            onChange={(e) => setMobileSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="space-y-3">
                        {filteredMobileUsers.length > 0 ? (
                            filteredMobileUsers.map((user: UserWithRoles) => (
                                <UserMobileCard
                                    key={user.id}
                                    user={user}
                                    onViewDetails={handleViewDetails}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No se encontraron usuarios
                            </div>
                        )}
                    </div>

                    {normalizedUsers.links && normalizedUsers.links.length > 3 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {normalizedUsers.links[0].url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(normalizedUsers.links[0].url)}
                                >
                                    Anterior
                                </Button>
                            )}
                            <span className="flex items-center px-3 text-sm text-gray-600">
                                {normalizedUsers.from} - {normalizedUsers.to} de {normalizedUsers.total}
                            </span>
                            {normalizedUsers.links[normalizedUsers.links.length - 1].url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(normalizedUsers.links[normalizedUsers.links.length - 1].url)}
                                >
                                    Siguiente
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>Este usuario será eliminado permanentemente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (recordIdToDelete) {
                                        router.post(route('users.destroy', recordIdToDelete), {
                                            _method: 'delete',
                                        });
                                    }
                                }}
                            >
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Modal de detalles */}
                <UserDetailModal
                    user={selectedUser}
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    canEdit={true}
                />
            </div>
        </AppLayout>
    );
}
