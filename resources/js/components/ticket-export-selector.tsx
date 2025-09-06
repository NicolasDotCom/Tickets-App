import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Filter, Calendar } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Ticket } from '@/types';

interface TicketExportSelectorProps {
    tickets: Ticket[];
}

export default function TicketExportSelector({ tickets }: TicketExportSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>(tickets);

    // Filtrar tickets basado en búsqueda y filtros
    useEffect(() => {
        let filtered = tickets;

        // Filtro por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(ticket => 
                ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.support?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.model?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por estado
        if (statusFilter !== 'all') {
            filtered = filtered.filter(ticket => ticket.status === statusFilter);
        }

        // Filtro por rango de fechas
        if (startDate) {
            filtered = filtered.filter(ticket => {
                const ticketDate = new Date(ticket.created_at).toISOString().split('T')[0];
                return ticketDate >= startDate;
            });
        }

        if (endDate) {
            filtered = filtered.filter(ticket => {
                const ticketDate = new Date(ticket.created_at).toISOString().split('T')[0];
                return ticketDate <= endDate;
            });
        }

        setFilteredTickets(filtered);
    }, [tickets, searchTerm, statusFilter, startDate, endDate]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedTickets(filteredTickets.map(ticket => ticket.id));
        } else {
            setSelectedTickets([]);
        }
    };

    const handleSelectTicket = (ticketId: number, checked: boolean) => {
        if (checked) {
            setSelectedTickets(prev => [...prev, ticketId]);
        } else {
            setSelectedTickets(prev => prev.filter(id => id !== ticketId));
        }
    };

    const handleExport = () => {
        if (selectedTickets.length === 0) {
            alert('Por favor selecciona al menos un ticket para exportar.');
            return;
        }

        router.get(route('dashboard.export-tickets'), {
            tickets: selectedTickets.join(',')
        });
        
        setIsOpen(false);
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Open':
                return 'destructive';
            case 'In Progress':
                return 'default';
            case 'Closed':
                return 'secondary';
            default:
                return 'outline';
        }
    };

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
    };

    const clearDateFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="space-y-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Filter className="w-4 h-4 mr-2" />
                        Seleccionar Tickets
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                    <DialogHeader className="pb-3 shrink-0">
                        <DialogTitle>Seleccionar Tickets para Exportar</DialogTitle>
                        <DialogDescription>
                            Selecciona los tickets que deseas exportar a CSV. Puedes usar los filtros para encontrar tickets específicos.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Filtros */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 py-3 border-b shrink-0">
                        <div>
                            <Label htmlFor="search" className="text-xs font-medium">Buscar</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Buscar tickets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 h-9"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="status" className="text-xs font-medium">Estado</Label>
                            <select
                                id="status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1"
                            >
                                <option value="all">Todos los estados</option>
                                <option value="Open">Abierto</option>
                                <option value="In Progress">En Progreso</option>
                                <option value="Closed">Cerrado</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="start-date" className="text-xs font-medium">Fecha Desde</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-9 mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="end-date" className="text-xs font-medium">Fecha Hasta</Label>
                            <div className="flex gap-1 mt-1">
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-9 flex-1"
                                />
                                {(startDate || endDate) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={clearDateFilters}
                                        className="h-9 px-2"
                                        title="Limpiar filtros de fecha"
                                    >
                                        ×
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Seleccionar todos */}
                    <div className="flex items-center justify-between py-2 border-b bg-muted/20 shrink-0">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="select-all"
                                checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                                onCheckedChange={handleSelectAll}
                            />
                            <Label htmlFor="select-all" className="font-medium text-sm">
                                Seleccionar todos ({filteredTickets.length} tickets)
                            </Label>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {selectedTickets.length} seleccionados
                        </span>
                    </div>

                    {/* Lista de tickets - Con altura fija y scroll mejorado */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <div className="h-full overflow-y-auto border rounded-md bg-background">
                            <div className="p-2">
                                <div className="space-y-2">
                                    {filteredTickets.map((ticket) => (
                                        <div key={ticket.id} className="flex items-start space-x-2 p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <Checkbox
                                                id={`ticket-${ticket.id}`}
                                                checked={selectedTickets.includes(ticket.id)}
                                                onCheckedChange={(checked) => handleSelectTicket(ticket.id, checked as boolean)}
                                                className="mt-0.5 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor={`ticket-${ticket.id}`} className="font-medium cursor-pointer text-sm">
                                                            #{ticket.id.toString().padStart(4, '0')}
                                                        </Label>
                                                        <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-xs">
                                                            {getStatusLabel(ticket.status)}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(ticket.created_at).toLocaleDateString('es-CO')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                                                    {ticket.description || 'Sin descripción'}
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-[10px] text-muted-foreground">
                                                    <span className="truncate">Cliente: {ticket.customer?.name || 'N/A'}</span>
                                                    <span className="truncate">Técnico: {ticket.support?.name || 'Sin asignar'}</span>
                                                    <span className="truncate">Equipo: {ticket.brand} {ticket.model}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredTickets.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            No se encontraron tickets con los filtros aplicados.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-3 border-t shrink-0">
                        <Button variant="outline" onClick={() => setIsOpen(false)} className="h-9">
                            Cancelar
                        </Button>
                        <Button onClick={handleExport} disabled={selectedTickets.length === 0} className="h-9">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar {selectedTickets.length} Tickets
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
