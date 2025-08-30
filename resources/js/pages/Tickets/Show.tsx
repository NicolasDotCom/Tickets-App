import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Download, FileText, Trash2, Edit, ArrowLeft } from 'lucide-react';

interface Ticket {
    id: number;
    description: string;
    phone: string;
    address: string;
    brand: string;
    model: string;
    serial: string;
    status: string;
    created_at: string;
    updated_at: string;
    customer: {
        id: number;
        name: string;
        email: string;
    };
    support: {
        id: number;
        name: string;
    } | null;
    documents: TicketDocument[];
}

interface TicketDocument {
    id: number;
    original_name: string;
    file_name: string;
    file_path: string;
    mime_type: string;
    file_size: number;
    formatted_size: string;
    file_url: string;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tickets',
        href: '/tickets',
    },
    {
        title: 'Detalles',
        href: '',
    },
];

const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'open':
            return 'open';
        case 'in progress':
            return 'progress';
        case 'closed':
            return 'closed';
        default:
            return 'outline';
    }
};

const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
        case 'open':
            return 'Abierto';
        case 'in progress':
            return 'En Progreso';
        case 'closed':
            return 'Cerrado';
        default:
            return status;
    }
};

export default function Show() {
    const { ticket } = usePage<PageProps & { ticket: Ticket }>().props;

    const handleDownload = (documentId: number) => {
        window.open(route('ticket-documents.download', documentId), '_blank');
    };

    const handleDeleteDocument = (documentId: number, fileName: string) => {
        if (confirm(`¿Estás seguro de que quieres eliminar el documento "${fileName}"?`)) {
            router.delete(route('ticket-documents.destroy', documentId));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ticket #${ticket.id}`} />
            
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit(route('tickets.index'))}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <h1 className="text-2xl font-bold">Ticket #{ticket.id}</h1>
                        <Badge variant={getStatusBadgeVariant(ticket.status)}>
                            {getStatusLabel(ticket.status)}
                        </Badge>
                    </div>
                    
                    <Link href={route('tickets.edit', ticket.id)}>
                        <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Información del Ticket */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Ticket</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Cliente</label>
                                <p className="text-lg">{ticket.customer.name}</p>
                                <p className="text-sm text-gray-600">{ticket.customer.email}</p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-500">Técnico Asignado</label>
                                <p className="text-lg">
                                    {ticket.support ? ticket.support.name : 'Sin asignar'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                                <p className="text-lg">{ticket.phone}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Dirección</label>
                                <p className="text-lg">{ticket.address}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Marca</label>
                                    <p className="text-lg">{ticket.brand}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Modelo</label>
                                    <p className="text-lg">{ticket.model}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Serial</label>
                                    <p className="text-lg">{ticket.serial}</p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-500">Descripción</label>
                                <p className="text-lg whitespace-pre-wrap">{ticket.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Creado</label>
                                    <p className="text-sm">{formatDate(ticket.created_at)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Actualizado</label>
                                    <p className="text-sm">{formatDate(ticket.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documentos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Documentos ({ticket.documents.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ticket.documents.length > 0 ? (
                                <div className="space-y-3">
                                    {ticket.documents.map((document: TicketDocument) => (
                                        <div 
                                            key={document.id} 
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-8 w-8 text-blue-500" />
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {document.original_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {document.formatted_size} • {formatDate(document.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(document.id)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteDocument(document.id, document.original_name)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No hay documentos adjuntos</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
