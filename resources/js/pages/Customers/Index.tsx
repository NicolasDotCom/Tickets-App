import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { Customer, PageProps, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Usuarios</h1>
                </div>

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
            </div>
        </AppLayout>
    );
}

