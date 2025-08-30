import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useCallback } from 'react';
import type { PageProps, Role, UserWithRoles, PaginatedData } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Roles',
        href: '/users/roles',
    },
];
export default function UserRolesPage() {
    const { users, roles } = usePage<PageProps>().props;

    const usersList: UserWithRoles[] = Array.isArray(users) ? users : users.data;
    const roleItems: Role[] = Array.isArray(roles) ? roles : roles.data;

    const initialRoles: Record<number, string> = {};
    usersList.forEach((user) => {
        initialRoles[user.id] = user.roles?.[0]?.name || '';
    });

    const { data, setData, put, processing } = useForm<{ roles: Record<number, string> }>({
        roles: initialRoles,
    });

    const handleChange = (userId: number, role: string) => {
        setData('roles', {
            ...data.roles,
            [userId]: role,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('users.roles.update'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleCancel = () => {
        router.visit(route('dashboard'));
    };

    const columns = [
        {
            header: 'Name',
            accessorKey: 'name',
        },
        {
            header: 'Email',
            accessorKey: 'email',
        },
        {
            header: 'Role',
            id: 'role',
            cell: ({ row }: { row: { original: UserWithRoles } }) => (
                <Select value={data.roles[row.original.id]} onValueChange={(value) => handleChange(row.original.id, value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        {roleItems.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                                {role.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ),
        },
    ];

    const handleSearch = useCallback((searchTerm: string) => {
        router.get(
            route('users.roles.index'),
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

    const paginatedUsers = users as PaginatedData<UserWithRoles>;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assign Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Assign Roles to Users</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardContent>
                            <DataTable
                                columns={columns}
                                data={paginatedUsers.data}
                                pagination={{
                                    from: paginatedUsers.from,
                                    to: paginatedUsers.to,
                                    total: paginatedUsers.total,
                                    links: paginatedUsers.links,
                                    onPageChange: handlePageChange,
                                }}
                                onSearch={handleSearch}
                                searchPlaceholder="Search users..."
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Save
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
