import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { Download, FileText, Trash2, Edit, ArrowLeft, Check, ChevronsUpDown, Paperclip, Send, User } from 'lucide-react';
import { useState, useRef } from 'react';

interface Ticket {
    id: number;
    subject: string;
    description: string;
    phone: string;
    nombre_contacto: string;
    address: string;
    brand: string;
    model: string;
    serial: string;
    status: string;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
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
    comments: TicketComment[];
    user: {
        id: number;
        name: string;
    };
}

interface TicketComment {
    id: number;
    comment: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    attachments: CommentAttachment[];
}

interface CommentAttachment {
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    created_at: string;
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

const statuses = [
    { value: 'Open', label: 'Abierto' },
    { value: 'In Progress', label: 'En Progreso' },
    { value: 'Closed', label: 'Cerrado' },
];

export default function Show() {
    const { ticket, auth } = usePage<PageProps & { ticket: Ticket }>().props;
    const [statusOpen, setStatusOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(ticket.status);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { data, setData, post, processing, reset } = useForm({
        comment: '',
        attachments: [] as File[],
    });

    const handleStatusChange = (newStatus: string) => {
        if (confirm(`¿Estás seguro de que quieres cambiar el estado a "${statuses.find(s => s.value === newStatus)?.label}"?`)) {
            router.patch(route('tickets.update-status', ticket.id), {
                status: newStatus,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedStatus(newStatus);
                },
            });
        }
        setStatusOpen(false);
    };

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

    const handleRealizarReporte = () => {
        // Detectar si es dispositivo móvil
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        const appDeepLink = 'appsheet://start/03aa385a-941e-47f2-9610-67f468263dc4?view=Servicios';
        const webUrl = 'https://www.appsheet.com/start/03aa385a-941e-47f2-9610-67f468263dc4?platform=desktop#appName=InforTes-858189668&vss=H4sIAAAAAAAAA6WOOw7CMBBE7zK1T-AWUSAETRANpjD2RrJI7Ch2ApHlu7PhWwPlzuq9mYzR0aVK2pwhD_lzrWmCRFbYTR0pSIVF8KkPjYJQ2Or2EVbUj864EBUKylG8BIkiZP6Sl3_2CzhLPrnaUT_LZpQlT5DfM8bBG0IRaIekTw3dNzNUCmd1MEMku-cxv4yIK7-8dtrbTbDsrHUTqdwAnSmppGoBAAA=&view=Servicios';
        
        if (isMobile) {
            // Intentar abrir la app instalada primero
            window.location.href = appDeepLink;
            
            // Si la app no se abre en 2 segundos, abrir la versión web como fallback
            setTimeout(() => {
                if (!document.hidden) {
                    window.open(webUrl, '_blank');
                }
            }, 2000);
        } else {
            // En escritorio, abrir directamente la versión web
            window.open(webUrl, '_blank');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setData('attachments', [...data.attachments, ...Array.from(files)]);
        }
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = data.attachments.filter((_, i) => i !== index);
        setData('attachments', newFiles);
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validar que haya al menos comentario o archivos
        if (!data.comment.trim() && data.attachments.length === 0) {
            alert('Debes agregar un comentario o adjuntar al menos un archivo.');
            return;
        }

        post(route('tickets.comments.store', ticket.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleDownloadAttachment = (attachmentId: number) => {
        window.open(route('comment-attachments.download', attachmentId), '_blank');
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ticket #${ticket.id}`} />
            
            <div className="flex flex-col gap-4 sm:gap-6 p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit(route('tickets.index'))}
                            className="flex-shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <h1 className="text-lg sm:text-2xl font-bold">Ticket #{ticket.id}</h1>
                        <Badge variant={getStatusBadgeVariant(ticket.status)}>
                            {getStatusLabel(ticket.status)}
                        </Badge>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                        {auth?.roles?.includes('support') && (
                            <Button 
                                variant="default"
                                onClick={handleRealizarReporte}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Realizar Reporte
                            </Button>
                        )}
                        {auth?.roles?.includes('admin') && (
                            <Link href={route('tickets.edit', ticket.id)}>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Información del Ticket */}
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Información del Ticket</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Asunto</label>
                                <p className="text-lg font-semibold">{ticket.subject}</p>
                            </div>

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

                            {(auth?.roles?.includes('support') || auth?.roles?.includes('admin')) && (
                                <div>
                                    <Label htmlFor="status" className="text-sm font-medium text-gray-500">Estado</Label>
                                    <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={statusOpen}
                                                className="w-full justify-between mt-1"
                                            >
                                                {selectedStatus
                                                    ? statuses.find((s) => s.value === selectedStatus)?.label
                                                    : 'Seleccionar estado...'}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar estado..." />
                                                <CommandList>
                                                    <CommandEmpty>No se encontró estado.</CommandEmpty>
                                                    <CommandGroup>
                                                        {statuses.map((status) => (
                                                            <CommandItem
                                                                key={status.value}
                                                                value={status.value}
                                                                onSelect={(currentValue) => {
                                                                    handleStatusChange(currentValue);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        selectedStatus === status.value
                                                                            ? 'opacity-100'
                                                                            : 'opacity-0'
                                                                    )}
                                                                />
                                                                {status.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-500">Nombre de contacto</label>
                                <p className="text-lg">{ticket.nombre_contacto}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                                <p className="text-lg">{ticket.phone}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Dirección</label>
                                <p className="text-lg">{ticket.address}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-500">Marca</label>
                                    <p className="text-base sm:text-lg">{ticket.brand}</p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-500">Modelo</label>
                                    <p className="text-base sm:text-lg">{ticket.model}</p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-500">Serial</label>
                                    <p className="text-base sm:text-lg">{ticket.serial}</p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-500">Descripción</label>
                                <p className="text-lg whitespace-pre-wrap">{ticket.description}</p>
                            </div>
                            
                            <div className={ticket.status === 'Closed' && ticket.closed_at ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1'}>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Creado</label>
                                    <p className="text-sm">{formatDate(ticket.created_at)}</p>
                                </div>
                                {ticket.status === 'Closed' && ticket.closed_at && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Cerrado</label>
                                        <p className="text-sm">{formatDate(ticket.closed_at)}</p>
                                    </div>
                                )}
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

                {/* Sección de Comentarios */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comentarios ({ticket.comments?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Lista de comentarios existentes */}
                        {ticket.comments && ticket.comments.length > 0 ? (
                            <div className="space-y-4 mb-6">
                                {ticket.comments.map((comment: TicketComment) => (
                                    <div key={comment.id} className="border rounded-lg p-4 bg-white shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-blue-100 rounded-full p-2">
                                                <User className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-semibold text-sm text-gray-900">{comment.user.name}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                                                </div>
                                                <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3">{comment.comment}</p>
                                                
                                                {/* Archivos adjuntos del comentario */}
                                                {comment.attachments && comment.attachments.length > 0 && (
                                                    <div className="space-y-2">
                                                        {comment.attachments.map((attachment: CommentAttachment) => (
                                                            <div 
                                                                key={attachment.id} 
                                                                className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Paperclip className="h-4 w-4 text-blue-600" />
                                                                    <span className="text-sm text-gray-900 font-medium">{attachment.file_name}</span>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDownloadAttachment(attachment.id)}
                                                                    className="hover:bg-blue-200"
                                                                >
                                                                    <Download className="h-4 w-4 text-blue-600" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500 mb-6">
                                <p className="text-sm">No hay comentarios aún</p>
                            </div>
                        )}

                        {/* Formulario para agregar nuevo comentario - Solo para soporte técnico */}
                        {auth?.roles?.includes('support') && (
                            <form onSubmit={handleSubmitComment} className="border-t pt-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="comment">Agregar Comentario</Label>
                                        <Textarea
                                            id="comment"
                                            placeholder="Escribe tu comentario aquí..."
                                            value={data.comment}
                                            onChange={(e) => setData('comment', e.target.value)}
                                            rows={4}
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* Archivos seleccionados */}
                                    {data.attachments.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-gray-900">Archivos seleccionados:</Label>
                                            {data.attachments.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                                                    <div className="flex items-center gap-2">
                                                        <Paperclip className="h-4 w-4 text-blue-600" />
                                                        <span className="text-sm text-gray-900 font-medium">{file.name}</span>
                                                        <span className="text-xs text-gray-600">({formatFileSize(file.size)})</span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveFile(index)}
                                                        className="hover:bg-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            multiple
                                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Paperclip className="h-4 w-4 mr-2" />
                                            Adjuntar Archivos
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing || (!data.comment.trim() && data.attachments.length === 0)}
                                            className="ml-auto"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {processing ? 'Enviando...' : 'Enviar'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
