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
import { Pencil, Plus, Trash2, Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import { SupportMobileCard } from '@/components/support-mobile-card';
import { SupportDetailModal } from '@/components/support-detail-modal';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Soporte Técnico',
        href: '/supports',
    },
];

export default function Index() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [mobileSearchTerm, setMobileSearchTerm] = useState('');

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

    const handleViewDetails = (support: Support) => {
        setSelectedSupport(support);
        setIsDetailModalOpen(true);
    };

    const filteredMobileSupports = normalizedSupports.data.filter((support: Support) => {
        if (!mobileSearchTerm) return true;
        const searchLower = mobileSearchTerm.toLowerCase();
        return (
            support.name?.toLowerCase().includes(searchLower) ||
            support.email?.toLowerCase().includes(searchLower) ||
            support.phone?.toLowerCase().includes(searchLower) ||
            support.speciality?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Soporte Técnico" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-2 sm:p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-bold">Soporte Técnico</h1>
                </div>

                {/* Vista Desktop */}
                <div className="hidden md:block">
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
                </div>

                {/* Vista Móvil */}
                <div className="md:hidden space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar soporte..."
                            value={mobileSearchTerm}
                            onChange={(e) => setMobileSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="space-y-3">
                        {filteredMobileSupports.length > 0 ? (
                            filteredMobileSupports.map((support: Support) => (
                                <SupportMobileCard
                                    key={support.id}
                                    support={support}
                                    onViewDetails={handleViewDetails}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No se encontraron soportes
                            </div>
                        )}
                    </div>

                    {normalizedSupports.links && normalizedSupports.links.length > 3 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {normalizedSupports.links[0].url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(normalizedSupports.links[0].url)}
                                >
                                    Anterior
                                </Button>
                            )}
                            <span className="flex items-center px-3 text-sm text-gray-600">
                                {normalizedSupports.from} - {normalizedSupports.to} de {normalizedSupports.total}
                            </span>
                            {normalizedSupports.links[normalizedSupports.links.length - 1].url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(normalizedSupports.links[normalizedSupports.links.length - 1].url)}
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

                {/* Modal de detalles */}
                <SupportDetailModal
                    support={selectedSupport}
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                />
            </div>
        </AppLayout>
    );
}
