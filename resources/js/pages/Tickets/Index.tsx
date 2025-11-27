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
import { TicketMobileCard } from '@/components/ticket-mobile-card';
import { TicketDetailModal } from '@/components/ticket-detail-modal';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tickets',
        href: '/tickets',
    },
];

export default function Index() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [recordIdToDelete, setRecordIdToDelete] = useState<number | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [mobileSearchTerm, setMobileSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    // Filtros para NO soporte
    const [ticketIdFilter, setTicketIdFilter] = useState('');
    const [clientFilter, setClientFilter] = useState<string>('all');
    const [supportFilter, setSupportFilter] = useState<string>('all');
    const [brandFilter, setBrandFilter] = useState<string>('all');
    const [statusFilterNonSupport, setStatusFilterNonSupport] = useState<string>('all');

    const { tickets, auth } = usePage<PageProps>().props;

    const isSupportRole = auth?.roles?.includes('support');
    
    // Obtener listas únicas para filtros
    const uniqueClients = Array.from(
        new Map(tickets.data.filter((t: Ticket) => t.customer).map((t: Ticket) => [t.customer!.id, t.customer!])).values()
    );
    
    const uniqueSupports = Array.from(
        new Map(tickets.data.filter((t: Ticket) => t.support).map((t: Ticket) => [t.support!.id, t.support!])).values()
    );
    
    const uniqueBrands = Array.from(new Set(tickets.data.map((t: Ticket) => t.brand).filter(Boolean)));


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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Open':
                return 'Abierto';
            case 'In Progress':
                return 'En Progreso';
            case 'Closed':
                return 'Cerrado';
            default:
                return status;
        }
    }

    const columns: ColumnDef<Ticket>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
        },
        {
            accessorKey: 'customer.id',
            header: 'Cliente',
            cell: ({row}) => row.original.customer?.name || 'Sin asignar'
        },
        {
            accessorKey: 'support.id',
            header: 'Soporte Técnico',
            cell: ({row}) => row.original.support?.name || 'Sin asignar'
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
            header: 'Descripción'
        },
        {
            accessorKey: 'status',
            header: 'Estado',
            cell: ({row}) => {
                const status = row.original.status;
                return (
                    <Badge variant={getStatus(status)} className='capitalize'>
                        {getStatusLabel(status)}
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
            header: 'Acciones',
            cell: ({ row }) => {
                const ticket = row.original;
                return (
                    <div className='flex gap-2'>
                        <Link href={route('tickets.show', ticket.id)}>
                            <Button size="sm" variant="outline">
                                <Eye className='h-4 w-4'/>
                            </Button>
                        </Link>
                        {auth?.roles?.includes('admin') && (
                            <Link href={route('tickets.edit', ticket.id)}>
                                <Button size="sm" variant="default">
                                    <Pencil className='h-4 w-4'/>
                                </Button>
                            </Link>
                        )}
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

    const handleViewDetails = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsDetailModalOpen(true);
    };

    // Función para filtrar tickets
    const applyFilters = (ticketsList: Ticket[]) => {
        return ticketsList.filter((ticket: Ticket) => {
            // Filtros para soporte técnico
            if (isSupportRole) {
                if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
                return true;
            }
            
            // Filtros para NO soporte técnico
            if (ticketIdFilter && !ticket.id.toString().includes(ticketIdFilter)) return false;
            if (clientFilter !== 'all' && ticket.customer?.id.toString() !== clientFilter) return false;
            if (supportFilter !== 'all') {
                if (supportFilter === 'unassigned' && ticket.support_id) return false;
                if (supportFilter !== 'unassigned' && ticket.support_id?.toString() !== supportFilter) return false;
            }
            if (brandFilter !== 'all' && ticket.brand !== brandFilter) return false;
            if (statusFilterNonSupport !== 'all' && ticket.status !== statusFilterNonSupport) return false;
            
            return true;
        });
    };

    // Filtrar tickets para vista móvil
    const filteredMobileTickets = tickets.data.filter((ticket: Ticket) => {
        // Filtro por búsqueda móvil
        if (mobileSearchTerm) {
            const searchLower = mobileSearchTerm.toLowerCase();
            const matchesSearch = (
                ticket.id.toString().includes(searchLower) ||
                ticket.customer?.name?.toLowerCase().includes(searchLower) ||
                ticket.brand?.toLowerCase().includes(searchLower) ||
                ticket.model?.toLowerCase().includes(searchLower) ||
                ticket.description?.toLowerCase().includes(searchLower)
            );
            if (!matchesSearch) return false;
        }

        // Aplicar filtros adicionales
        return applyFilters([ticket]).length > 0;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tickets" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold">Tickets</h1>
                    <Link href={route('tickets.create')}>
                        <Button className="w-full sm:w-auto">
                            <Plus className='mr-2 h-4 w-4' /> Crear Ticket
                        </Button>
                    </Link>
                </div>

                {/* Vista Desktop - Tabla */}
                <div className="hidden md:block space-y-4">
                    {/* Filtros para soporte técnico */}
                    {isSupportRole && (
                        <div className="flex items-center gap-3 p-4 rounded-lg">
                            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                                Filtrar por Estado:
                            </label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-64">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="Open">Abierto</SelectItem>
                                    <SelectItem value="In Progress">En Progreso</SelectItem>
                                    <SelectItem value="Closed">Cerrado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Filtros específicos para NO soporte técnico */}
                    {!isSupportRole && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 rounded-lg">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-700">
                                    # Ticket
                                </label>
                                <Input
                                    placeholder="123"
                                    value={ticketIdFilter}
                                    onChange={(e) => setTicketIdFilter(e.target.value)}
                                    type="number"
                                    className="h-9"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-700">
                                    Cliente
                                </label>
                                <Select value={clientFilter} onValueChange={setClientFilter}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {uniqueClients.map((client: any) => (
                                            <SelectItem key={client.id} value={client.id.toString()}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-700">
                                    Soporte Técnico
                                </label>
                                <Select value={supportFilter} onValueChange={setSupportFilter}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="unassigned">Sin asignar</SelectItem>
                                        {uniqueSupports.map((support: any) => (
                                            <SelectItem key={support.id} value={support.id.toString()}>
                                                {support.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-700">
                                    Marca
                                </label>
                                <Select value={brandFilter} onValueChange={setBrandFilter}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {uniqueBrands.map((brand: string) => (
                                            <SelectItem key={brand} value={brand}>
                                                {brand}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-700">
                                    Estado
                                </label>
                                <Select value={statusFilterNonSupport} onValueChange={setStatusFilterNonSupport}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="Open">Abierto</SelectItem>
                                        <SelectItem value="In Progress">En Progreso</SelectItem>
                                        <SelectItem value="Closed">Cerrado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <DataTable
                        columns={columns}
                        data={applyFilters(tickets.data)}
                        pagination={{
                            from: tickets.from,
                            to: tickets.to,
                            total: tickets.total,
                            links: tickets.links,
                            onPageChange: handlePageChange,
                        }}
                        onSearch={isSupportRole ? handleSearch : undefined}
                        searchPlaceholder={isSupportRole ? 'Buscar...' : undefined}
                    />
                </div>

                {/* Vista Móvil - Cards */}
                <div className="md:hidden space-y-4">
                    {/* Buscador móvil (solo para soporte) */}
                    {isSupportRole && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar tickets..."
                                value={mobileSearchTerm}
                                onChange={(e) => setMobileSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    )}

                    {/* Filtro por estado (solo para soporte técnico) */}
                    {isSupportRole && (
                        <div className="flex flex-col gap-2 p-3 rounded-lg">
                            <label className="text-xs font-semibold text-gray-700">
                                Estado
                            </label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="Open">Abierto</SelectItem>
                                    <SelectItem value="In Progress">En Progreso</SelectItem>
                                    <SelectItem value="Closed">Cerrado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Filtros específicos para NO soporte técnico (móvil) */}
                    {!isSupportRole && (
                        <div className="space-y-3 p-3 rounded-lg">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-700"># Ticket</label>
                                <Input
                                    placeholder="123"
                                    value={ticketIdFilter}
                                    onChange={(e) => setTicketIdFilter(e.target.value)}
                                    type="number"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-700">Cliente</label>
                                <Select value={clientFilter} onValueChange={setClientFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {uniqueClients.map((client: any) => (
                                            <SelectItem key={client.id} value={client.id.toString()}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-700">Soporte Técnico</label>
                                <Select value={supportFilter} onValueChange={setSupportFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="unassigned">Sin asignar</SelectItem>
                                        {uniqueSupports.map((support: any) => (
                                            <SelectItem key={support.id} value={support.id.toString()}>
                                                {support.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-700">Marca</label>
                                <Select value={brandFilter} onValueChange={setBrandFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {uniqueBrands.map((brand: string) => (
                                            <SelectItem key={brand} value={brand}>
                                                {brand}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-700">Estado</label>
                                <Select value={statusFilterNonSupport} onValueChange={setStatusFilterNonSupport}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="Open">Abierto</SelectItem>
                                        <SelectItem value="In Progress">En Progreso</SelectItem>
                                        <SelectItem value="Closed">Cerrado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Lista de cards */}
                    <div className="space-y-3">
                        {filteredMobileTickets.length > 0 ? (
                            filteredMobileTickets.map((ticket: Ticket) => (
                                <TicketMobileCard
                                    key={ticket.id}
                                    ticket={ticket}
                                    onViewDetails={handleViewDetails}
                                    canEdit={auth?.roles?.includes('admin')}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No se encontraron tickets
                            </div>
                        )}
                    </div>

                    {/* Paginación móvil simplificada */}
                    {tickets.links && tickets.links.length > 3 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {tickets.links[0].url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(tickets.links[0].url)}
                                >
                                    Anterior
                                </Button>
                            )}
                            <span className="flex items-center px-3 text-sm text-gray-600">
                                {tickets.from} - {tickets.to} de {tickets.total}
                            </span>
                            {tickets.links[tickets.links.length - 1].url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(tickets.links[tickets.links.length - 1].url)}
                                >
                                    Siguiente
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de detalles */}
            <TicketDetailModal
                ticket={selectedTicket}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                canEdit={auth?.roles?.includes('admin')}
            />
        </AppLayout>
    );
}
