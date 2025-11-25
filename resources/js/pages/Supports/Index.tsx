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
import { PageProps, Support, type BreadcrumbItem } from '@/types';
import { normalizePaginatedData } from '@/utils/pagination';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Soporte Técnico',
        href: '/supports',
    },
];

export default function Index() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);

    const { supports } = usePage<PageProps>().props;
    const normalizedSupports = normalizePaginatedData<Support>(supports);

    const columns: ColumnDef<Support>[] = [
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
            accessorKey: 'phone',
            header: 'Teléfono',
        },
        {
            accessorKey: 'speciality',
            header: 'Especialidad',
        },
    ];

    const handleSearch = useCallback((searchTerm: string) => {
        router.get(
            route('supports.index'),
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['supports'],
            },
        );
    }, []);

    const handlePageChange = useCallback((url: string | null) => {
        if (url) {
            router.get(url, undefined, {
                preserveState: true,
                preserveScroll: true,
                only: ['supports'],
            });
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Soporte Técnico" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Soporte Técnico</h1>
                </div>

                <DataTable
                    columns={columns}
                    data={normalizedSupports.data}
                    pagination={{
                        from: normalizedSupports.from,
                        to: normalizedSupports.to,
                        total: normalizedSupports.total,
                        links: normalizedSupports.links,
                        onPageChange: handlePageChange,
                    }}
                    onSearch={handleSearch}
                    searchPlaceholder="Buscar..."
                />

                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                {selectedSupport?.tickets_count && selectedSupport.tickets_count > 0 ? (
                                    <span className="font-semibold text-red-600">
                                        Este soporte tiene {selectedSupport.tickets_count} ticket{selectedSupport.tickets_count > 1 ? 's' : ''}{' '}
                                        asignado{selectedSupport.tickets_count > 1 ? 's' : ''}. No puedes eliminarlo mientras existan tickets.
                                    </span>
                                ) : (
                                    'Esta acción no se puede deshacer. El registro se eliminará permanentemente.'
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            {selectedSupport?.tickets_count === 0 && (
                                <AlertDialogAction
                                    onClick={() => {
                                        if (selectedSupport) {
                                            router.delete(route('supports.destroy', selectedSupport.id));
                                        }
                                    }}
                                >
                                    Eliminar
                                </AlertDialogAction>
                            )}
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
