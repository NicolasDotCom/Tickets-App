import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { PageProps, Ticket, type BreadcrumbItem } from '@/types';

interface TicketWithDocuments extends Ticket {
    documents?: Array<{
        id: number;
        original_name: string;
        file_name: string;
        file_path: string;
        mime_type: string;
        file_size: number;
        formatted_size: string;
        created_at: string;
    }>;
}
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Loader2, Upload, X, Download, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tickets',
        href: '/tickets',
    },
    {
        title: 'Edit',
        href: '',
    },
];

const statuses = [
    { value: 'Open', label: 'Open' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Closed', label: 'Closed' },
];

export default function Edit() {
    const {ticket, supports } = usePage<PageProps & {ticket: TicketWithDocuments}>().props;

    const { data, setData, put, processing, errors } = useForm({
        support_id: ticket.support_id ? String(ticket.support_id) : '',
        description: ticket.description || '',
        phone: ticket.phone || 'No especificado',
        address: ticket.address || 'No especificado',
        brand: ticket.brand || 'No especificado',
        model: ticket.model || 'No especificado',
        serial: ticket.serial || 'No especificado',
        status: ticket.status, // Mantener el valor original con mayúscula
        documents: [] as File[],
    });

    const [supportOpen, setSupportOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.description) {
            alert('Description is required.');
            return;
        }
        
        // Usar post con _method para manejar archivos
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'documents') {
                data.documents.forEach((file, index) => {
                    formData.append(`documents[${index}]`, file);
                });
            } else {
                formData.append(key, data[key as keyof typeof data] as string);
            }
        });
        formData.append('_method', 'PUT');
        
        router.post(route('tickets.update', ticket.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                // El redirect se maneja en el backend
            },
            onError: () => {
                // Los errores se manejan automáticamente por Inertia
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            const validTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.xlsx', '.xls'];
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
            return validTypes.includes(fileExtension) && file.size <= 10240 * 1024; // 10MB
        });
        
        if (validFiles.length > 0) {
            setData('documents', [...data.documents, ...validFiles]);
        }
        
        if (files.length > validFiles.length) {
            alert('Algunos archivos fueron rechazados. Solo se permiten archivos PDF, DOC, DOCX, TXT, JPG, PNG, XLSX menores a 10MB.');
        }
        
        // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        const newFiles = data.documents.filter((_, i) => i !== index);
        setData('documents', newFiles);
    };

    const handleDownload = (documentId: number) => {
        window.open(route('ticket-documents.download', documentId), '_blank');
    };

    const handleDeleteDocument = (documentId: number, fileName: string) => {
        if (confirm(`¿Estás seguro de que quieres eliminar el documento "${fileName}"?`)) {
            router.delete(route('ticket-documents.destroy', documentId));
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        const validFiles = files.filter(file => {
            const validTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.xlsx', '.xls'];
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
            return validTypes.includes(fileExtension) && file.size <= 10240 * 1024; // 10MB
        });
        
        if (validFiles.length > 0) {
            setData('documents', [...data.documents, ...validFiles]);
        }
        
        if (files.length > validFiles.length) {
            alert('Algunos archivos fueron rechazados. Solo se permiten archivos PDF, DOC, DOCX, TXT, JPG, PNG, XLSX menores a 10MB.');
        }
    };

    const handleCancel = () => {
        if (
            data.support_id !== (ticket.support_id ? String(ticket.support_id) : '') ||
            data.description !== ticket.description ||
            data.status !== ticket.status.toLowerCase() ||
            data.documents.length > 0
        ) {
            if (!confirm('Are you sure you want to leave? Unsaved changes will be lost.')) {
                return;
            }
        }
        router.visit(route('tickets.index'));
    };

    const supportsList = supports as { id: number; name: string }[];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Tickets" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Edit Ticket</h1>
                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader></CardHeader>
                        <CardContent className="flex flex-col gap-4">

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="customer">Customer</Label>
                                <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    {ticket.customer?.name || 'No customer assigned'}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    disabled={processing}
                                />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="support_id">Technical Support</Label>
                                <Popover open={supportOpen} onOpenChange={setSupportOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={supportOpen}
                                            className="w-full justify-between"
                                            disabled={processing}
                                        >
                                            {data.support_id
                                                ? supportsList.find((s) => s.id === Number(data.support_id))?.name
                                                : 'Select technical support...'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search technical support..." />
                                            <CommandList>
                                                <CommandEmpty>No technical support found.</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value=""
                                                        onSelect={() => {
                                                            setData('support_id', '');
                                                            setSupportOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                data.support_id === '' ? 'opacity-100' : 'opacity-0'
                                                            )}
                                                        />
                                                        No assigned
                                                    </CommandItem>
                                                    {supportsList.map((support) => (
                                                        <CommandItem
                                                            key={support.id}
                                                            value={support.name}
                                                            onSelect={() => {
                                                                setData('support_id', String(support.id));
                                                                setSupportOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    data.support_id === String(support.id)
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0'
                                                                )}
                                                            />
                                                            {support.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.support_id && (
                                    <p className="text-sm text-red-500">{errors.support_id}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    disabled={processing}
                                />
                                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="brand">Marca</Label>
                                <Input
                                    id="brand"
                                    value={data.brand}
                                    onChange={(e) => setData('brand', e.target.value)}
                                    disabled={processing}
                                />
                                {errors.brand && <p className="text-sm text-red-500">{errors.brand}</p>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="model">Modelo</Label>
                                <Input
                                    id="model"
                                    value={data.model}
                                    onChange={(e) => setData('model', e.target.value)}
                                    disabled={processing}
                                />
                                {errors.model && <p className="text-sm text-red-500">{errors.model}</p>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="serial">Serial</Label>
                                <Input
                                    id="serial"
                                    value={data.serial}
                                    onChange={(e) => setData('serial', e.target.value)}
                                    disabled={processing}
                                />
                                {errors.serial && <p className="text-sm text-red-500">{errors.serial}</p>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    disabled={processing}
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="status">Status</Label>
                                <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={statusOpen}
                                            className="w-full justify-between"
                                            disabled={processing}
                                        >
                                            {data.status
                                                ? statuses.find((s) => s.value === data.status)?.label
                                                : 'Select status...'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search status..." />
                                            <CommandList>
                                                <CommandEmpty>No status found.</CommandEmpty>
                                                <CommandGroup>
                                                    {statuses.map((status) => (
                                                        <CommandItem
                                                            key={status.value}
                                                            value={status.value}
                                                            onSelect={(currentValue) => {
                                                                setData('status', currentValue as 'Open' | 'In Progress' | 'Closed');
                                                                setStatusOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    data.status === status.value
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
                                {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                            </div>

                        </CardContent>

                        <CardFooter className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </div>
                                ) : (
                                    'Save'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Card separado para documentos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Documentos del Ticket</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Documentos existentes */}
                        {ticket.documents && ticket.documents.length > 0 && (
                            <div>
                                <Label>Documentos actuales:</Label>
                                <div className="mt-2 space-y-2">
                                    {ticket.documents.map((document: any) => (
                                        <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
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
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(document.id)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
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
                            </div>
                        )}

                        {/* Agregar nuevos documentos */}
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="documents">Agregar nuevos documentos (Opcional)</Label>
                            <label 
                                htmlFor="documents" 
                                className={`cursor-pointer border-2 border-dashed rounded-lg p-6 transition-colors ${
                                    isDragOver 
                                        ? 'border-blue-400 bg-blue-50' 
                                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-4">
                                        <span className="mt-2 block text-sm font-medium text-gray-900">
                                            {isDragOver ? 'Suelta los archivos aquí' : 'Haz clic aquí para seleccionar archivos'}
                                        </span>
                                        <p className="mt-1 text-xs text-gray-500">
                                            o arrastra y suelta tus archivos aquí
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            PDF, DOC, DOCX, TXT, JPG, PNG, XLSX (máx. 10MB cada uno)
                                        </p>
                                    </div>
                                </div>
                                <Input
                                    id="documents"
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
                                    disabled={processing}
                                />
                            </label>
                            
                            {/* Lista de archivos nuevos seleccionados */}
                            {data.documents.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <Label>Nuevos archivos a subir:</Label>
                                    {data.documents.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                disabled={processing}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {errors.documents && (
                                <p className="text-sm text-red-500">{errors.documents}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
