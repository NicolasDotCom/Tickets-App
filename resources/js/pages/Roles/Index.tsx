import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PageProps, Role } from '@/types';
import { normalizePaginatedData } from '@/utils/pagination';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus } from 'lucide-react';
import { useCallback } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
];

export default function Index() {
    const { roles } = usePage<PageProps>().props;
    //normalizamos los datos de roles
    const normalizedRoles = normalizePaginatedData<Role>(roles);

    const columns: ColumnDef<Role>[] = [
        {
            header: 'Role',
            accessorKey: 'name',
            cell: (info: any) => info.getValue(),
        },
        {
            header: 'Permissions',
            accessorKey: 'permissions_count',
            cell: (info: any) => info.getValue(),
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }: any) => (
                <Link href={route('roles.edit', { role: row.original.id })}>
                    <Button size="sm" variant="default">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </Link>
            ),
        },
    ];

    const handleSearch = useCallback((searchTerm: string) => {
        router.get(
            route('roles.index'),
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['roles'],
            },
        );
    }, []);

    const handlePageChange = useCallback((url: string | null) => {
        if (url) {
            router.get(url, undefined, {
                preserveState: true,
                preserveScroll: true,
                only: ['roles'],
            });
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Roles</h1>
                    <Link href={route('roles.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Role
                        </Button>
                    </Link>
                </div>
                <DataTable
                    columns={columns}
                    data={normalizedRoles.data}
                    pagination={{
                        from: normalizedRoles.from,
                        to: normalizedRoles.to,
                        total: normalizedRoles.total,
                        links: normalizedRoles.links,
                        onPageChange: handlePageChange,
                    }}
                    onSearch={handleSearch}
                    searchPlaceholder="Search ..."
                />
            </div>
        </AppLayout>
    );
}
