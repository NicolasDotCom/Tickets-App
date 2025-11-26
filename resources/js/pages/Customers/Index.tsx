import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { Customer, PageProps, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2, Search } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
import { useCallback, useState } from 'react';
import { normalizePaginatedData } from '@/utils/pagination';
import { CustomerMobileCard } from '@/components/customer-mobile-card';
import { CustomerDetailModal } from '@/components/customer-detail-modal';
import { Input } from '@/components/ui/input';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/customers',
    },
];

export default function Index() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [recordIdToDelete, setRecordIdToDelete] = useState<number | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [mobileSearchTerm, setMobileSearchTerm] = useState('');

    const { customers } = usePage<PageProps>().props;
    //normalizamos los datos de customers
    const normalizedCustomers = normalizePaginatedData<Customer>(customers);

        const columns: ColumnDef<Customer>[] = [
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
            header: 'Email',
        },
        {
            accessorKey: 'name_user',
            header: 'Nombre de Usuario',
        },
        {
            accessorKey: 'phone',
            header: 'Teléfono',
        },
        {
            accessorKey: 'tickets_count',
            header: 'Tickets',
        },
    ];

    const handleSearch = useCallback((searchTerm: string) => {
        router.get(route('customers.index'), { search: searchTerm }, {
            preserveState: true,
            preserveScroll: true,
            only: ['customers'],
        });
    }, []);

    const handlePageChange = useCallback((url: string | null) => {
        if (url) {
            router.get(url, undefined, {
                preserveState: true,
                preserveScroll: true,
                only: ['customers'],
            });
        }
    }, []);

    const handleViewDetails = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDetailModalOpen(true);
    };

    // Filtrar customers para vista móvil
    const filteredMobileCustomers = normalizedCustomers.data.filter((customer: Customer) => {
        if (!mobileSearchTerm) return true;
        const searchLower = mobileSearchTerm.toLowerCase();
        return (
            customer.name?.toLowerCase().includes(searchLower) ||
            customer.email?.toLowerCase().includes(searchLower) ||
            customer.name_user?.toLowerCase().includes(searchLower) ||
            customer.phone?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-2 sm:p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-bold">Usuarios</h1>
                </div>

                {/* Vista Desktop */}
                <div className="hidden md:block">
                    <DataTable
                        columns={columns}
                        data={normalizedCustomers.data}
                        pagination={{
                            from: normalizedCustomers.from,
                            to: normalizedCustomers.to,
                            total: normalizedCustomers.total,
                            links: normalizedCustomers.links,
                            onPageChange: handlePageChange,
                        }}
                        onSearch={handleSearch}
                        searchPlaceholder='Buscar...'
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
                        {filteredMobileCustomers.length > 0 ? (
                            filteredMobileCustomers.map((customer: Customer) => (
                                <CustomerMobileCard
                                    key={customer.id}
                                    customer={customer}
                                    onViewDetails={handleViewDetails}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No se encontraron usuarios
                            </div>
                        )}
                    </div>

                    {normalizedCustomers.links && normalizedCustomers.links.length > 3 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {normalizedCustomers.links[0].url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(normalizedCustomers.links[0].url)}
                                >
                                    Anterior
                                </Button>
                            )}
                            <span className="flex items-center px-3 text-sm text-gray-600">
                                {normalizedCustomers.from} - {normalizedCustomers.to} de {normalizedCustomers.total}
                            </span>
                            {normalizedCustomers.links[normalizedCustomers.links.length - 1].url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(normalizedCustomers.links[normalizedCustomers.links.length - 1].url)}
                                >
                                    Siguiente
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* ✅ Dialog fuera del loop, muestra si tiene tickets */}
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                {selectedCustomer?.tickets_count && selectedCustomer.tickets_count > 0 ? (
                                    <span className="text-red-600 font-semibold">
                                        Este usuario tiene {selectedCustomer.tickets_count} ticket{selectedCustomer.tickets_count > 1 ? 's' : ''}. Al eliminarlo también se eliminarán todos los tickets asociados.
                                    </span>
                                ) : (
                                    'El registro será eliminado permanentemente.'
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>

                            <AlertDialogAction
                                onClick={() => {
                                    if (recordIdToDelete) {
                                        router.post(route('customers.destroy', recordIdToDelete), {
                                            _method: 'delete',
                                            confirm: true,
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
                <CustomerDetailModal
                    customer={selectedCustomer}
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                />
            </div>
        </AppLayout>
    );
}

