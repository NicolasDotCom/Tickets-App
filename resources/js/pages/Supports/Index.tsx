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
        title: 'Technical Supports',
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
            header: 'Name',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
        },
        {
            accessorKey: 'speciality',
            header: 'Speciality',
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const support = row.original;
                return (
                    <div className="flex gap-2">
                        <Link href={route('supports.edit', support.id)}>
                            <Button size="sm" variant="default">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setSelectedSupport(support);
                                setIsDialogOpen(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
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
            <Head title="Technical Supports" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Technical Supports</h1>
                    <Link href={route('supports.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Technical Support
                        </Button>
                    </Link>
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
                    searchPlaceholder="Search..."
                />

                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿You're sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                {selectedSupport?.tickets_count && selectedSupport.tickets_count > 0 ? (
                                    <span className="font-semibold text-red-600">
                                        This support has {selectedSupport.tickets_count} ticket{selectedSupport.tickets_count > 1 ? 's' : ''}{' '}
                                        assigned. You cannot delete them while tickets exist.
                                    </span>
                                ) : (
                                    'This action cannot be undone. The record will be permanently deleted.'
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            {selectedSupport?.tickets_count === 0 && (
                                <AlertDialogAction
                                    onClick={() => {
                                        if (selectedSupport) {
                                            router.delete(route('supports.destroy', selectedSupport.id));
                                        }
                                    }}
                                >
                                    Delete
                                </AlertDialogAction>
                            )}
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
