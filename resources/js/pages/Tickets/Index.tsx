import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { PageProps, Ticket, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2, Eye, FileText } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { useCallback, useState } from 'react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tickets',
        href: '/tickets',
    },
];

export default function Index() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [recordIdToDelete, setRecordIdToDelete] = useState<number | null>(null);

    const { tickets, auth } = usePage<PageProps>().props;
    console.log(auth);


    const getStatus = (status: Ticket['status']) : 'open' | 'progress' | 'closed' | 'outline' => {
        switch (status) {
            case 'Open':
                return 'open';
                break;
            case 'In Progress':
                return 'progress';
            case 'Closed':
                return 'closed'
            default:
                return 'outline'
                break;
        }
    }

    const columns: ColumnDef<Ticket>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
        },
        {
            accessorKey: 'customer.id',
            header: 'Customer',
            cell: ({row}) => row.original.customer?.name || 'Unassigned'
        },
        {
            accessorKey: 'support.id',
            header: 'Technical Support',
            cell: ({row}) => row.original.support?.name || 'Unassigned'
        },
        {
            accessorKey: 'brand',
            header: 'Marca'
        },
        {
            accessorKey: 'model',
            header: 'Modelo'
        },
        {
            accessorKey: 'description',
            header: 'Description'
        },
        {
            accessorKey: 'status',
            header: 'State',
            cell: ({row}) => {
                const status = row.original.status;
                return (
                    <Badge variant={getStatus(status)} className='capitalize'>
                        {status}
                    </Badge>
                )
            }
        },
        {
            id: 'documents',
            header: 'Documentos',
            cell: ({ row }) => {
                const documentsCount = row.original.documents_count || 0;
                return (
                    <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{documentsCount}</span>
                    </div>
                );
            }
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const ticket = row.original;
                return (
                    <div className='flex gap-2'>
                        <Link href={route('tickets.show', ticket.id)}>
                            <Button size="sm" variant="outline">
                                <Eye className='h-4 w-4'/>
                            </Button>
                        </Link>
                        <Link href={route('tickets.edit', ticket.id)}>
                            <Button size="sm" variant="default">
                                <Pencil className='h-4 w-4'/>
                            </Button>
                        </Link>
                        {/* Boton eliminar deshabilitado por temas de auditoría */}
                        {/* <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={()=>setRecordIdToDelete(ticket.id)}
                                >
                                    <Trash2 className='h-4 w-4'/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿You're sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. The record will be permanently deleted.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={()=>{
                                            if(recordIdToDelete){
                                                router.delete(route('tickets.destroy', recordIdToDelete));
                                            }
                                        }}
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog> */}
                    </div>
                );
            },
        },
    ];



    const handleSearch = useCallback((searchTerm:string) => {
        router.get( route('tickets.index'), {search:searchTerm},
        {
            preserveState: true,
            preserveScroll: true,
            only: ['tickets'],
        })
    }, []);

    const handlePageChange = useCallback((url:string | null) => {
        if(url) {
            router.get(url, undefined, {
                preserveState: true,
                preserveScroll: true,
                only: ['tickets'],
            });
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tickets" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Tickets</h1>
                    <Link href={route('tickets.create')}>
                        <Button>
                            <Plus className='mr-2 h-4 w-4' /> Add Ticket
                        </Button>
                    </Link>
                </div>

                <DataTable
                    columns={columns}
                    data={tickets.data}
                    pagination={{
                        from: tickets.from,
                        to: tickets.to,
                        total: tickets.total,
                        links: tickets.links,
                        onPageChange: handlePageChange,
                    }}
                    onSearch={handleSearch}
                    searchPlaceholder='Search...'
                />
            </div>
        </AppLayout>
    );
}
