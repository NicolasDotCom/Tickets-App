import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Loader2, Upload, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tickets',
        href: '/tickets',
    },
    {
        title: 'Crear',
        href: '',
    },
];

const statuses = [
    { value: 'Open', label: 'Abierto' },
    { value: 'In Progress', label: 'En Progreso' },
    { value: 'Closed', label: 'Cerrado' },
];

const subjects = [
    { value: 'Mantenimiento Preventivo', label: 'Mantenimiento Preventivo' },
    { value: 'Manchas', label: 'Manchas' },
    { value: 'Atascos', label: 'Atascos' },
    { value: 'Configuración ó Escaner', label: 'Configuración ó Escaner' },
    { value: 'Código de Error', label: 'Código de Error' },
    { value: 'Remoto', label: 'Remoto' },
    { value: 'Servicio de Ingeniería', label: 'Servicio de Ingeniería' },
    { value: 'Solicitud de Toner', label: 'Solicitud de Toner' },
    { value: 'Otros', label: 'Otros' },
];

export default function Create() {
    const { customers, supports, companies, isCustomer, preselectedCustomer, auth } = usePage<PageProps>().props;
    
    // Verificar si el usuario tiene rol comercial (case insensitive)
    const isComercial = auth?.user?.roles?.some((role: any) => role.name.toLowerCase() === 'comercial');
    
    // Verificar si el usuario tiene rol de soporte técnico
    const isSupport = auth?.user?.roles?.some((role: any) => role.name.toLowerCase() === 'support');

    // Obtener el ID del soporte técnico si el usuario tiene rol support
    const getUserSupportId = () => {
        if (isSupport && auth?.user?.email && Array.isArray(supports)) {
            const userSupport = supports.find((support: any) => support.email === auth.user.email);
            return userSupport ? String(userSupport.id) : '';
        }
        return '';
    };

    const { data, setData, post, processing, errors } = useForm({
        company_name: '', // Cambiar a company_name para el nombre de la empresa
        customer_id: '',
        support_id: getUserSupportId(),
        subject: '',
        description: '',
        phone: '',
        nombre_contacto: '',
        address: '',
        brand: '',
        model: '',
        serial: '',
        status: 'Open',
        documents: [] as File[],
    });

    const [companyOpen, setCompanyOpen] = useState(false);
    const [customerOpen, setCustomerOpen] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);
    const [subjectOpen, setSubjectOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // Filtrar customers por empresa seleccionada
    const filteredCustomers = data.company_name && customers && Array.isArray(customers)
        ? customers.filter((customer: { id: number; name: string; name_user: string }) => 
            customer.name === data.company_name) // Cambiar: filtrar por name (empresa)
        : [];

    // Pre-poblar datos cuando es cliente
    useEffect(() => {
        if (isCustomer && preselectedCustomer && typeof preselectedCustomer === 'object' && 'name' in preselectedCustomer && 'id' in preselectedCustomer) {
            setData(prevData => ({
                ...prevData,
                company_name: (preselectedCustomer as any).name,
                customer_id: String((preselectedCustomer as any).id)
            }));
        }
    }, [isCustomer, preselectedCustomer, setData]);

    // Limpiar customer_id cuando cambie la empresa
    const handleCompanyChange = (companyName: string) => {
        setData('company_name', companyName);
        setData('customer_id', ''); // Limpiar el cliente seleccionado
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación base
        if (!data.company_name || !data.customer_id || !data.subject || !data.description || !data.phone || !data.nombre_contacto || !data.address) {
            alert('Empresa, Usuario, Asunto, Teléfono, Nombre de Contacto, Dirección y Descripción son requeridos.');
            return;
        }
        
        // Si NO es "Solicitud de Toner", validar marca, modelo y serial
        if (data.subject !== 'Solicitud de Toner') {
            if (!data.brand || !data.model || !data.serial) {
                alert('Para este tipo de asunto, Marca, Modelo y Serial son requeridos.');
                return;
            }
        }
        
        post(route('tickets.store'), {
            forceFormData: true,
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        if (data.customer_id || data.support_id || data.description || data.phone || data.nombre_contacto || data.address || data.brand || data.model || data.serial || data.status !== 'open' || data.documents.length > 0) {
            if (!confirm('¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.')) {
                return;
            }
        }
        router.visit(route('tickets.index'));
    };
    const customersList = customers as { id: number; name: string }[];
    const supportsList = supports as { id: number; name: string }[];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Tickets" />
            <div className="flex flex-col gap-3 sm:gap-4 p-2 sm:p-4">
                <h1 className="text-xl sm:text-2xl font-bold">Crear Ticket</h1>
                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="p-4 sm:p-6"></CardHeader>
                        <CardContent className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6">

                            {!isComercial && (
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="name_user">Empresa</Label>
                                <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={companyOpen}
                                            className="w-full justify-between"
                                            disabled={processing || Boolean(isCustomer)}
                                        >
                                            {data.company_name || 'Seleccionar empresa...'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar empresa..." />
                                            <CommandList>
                                                <CommandEmpty>No se encontró empresa.</CommandEmpty>
                                                <CommandGroup>
                                                    {companies?.map((company) => (
                                                        <CommandItem
                                                            key={company}
                                                            value={company}
                                                            onSelect={() => {
                                                                handleCompanyChange(company);
                                                                setCompanyOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    data.company_name === company ? 'opacity-100' : 'opacity-0',
                                                                )}
                                                            />
                                                            {company}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.company_name && <div className="text-red-500 text-sm">{errors.company_name}</div>}
                            </div>
                            )}

                            {!isComercial && (
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="customer_id">Usuario</Label>
                                <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={customerOpen}
                                            className="w-full justify-between"
                                            disabled={processing || !data.company_name || Boolean(isCustomer)}
                                        >
                                            {data.customer_id
                                                ? filteredCustomers.find((c) => c.id === Number(data.customer_id))?.name_user
                                                : data.company_name ? 'Seleccionar usuario...' : 'Primero selecciona una empresa'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar usuario..." />
                                            <CommandList>
                                                <CommandEmpty>No se encontró usuario.</CommandEmpty>
                                                <CommandGroup>
                                                    {filteredCustomers.map((customer) => (
                                                        <CommandItem
                                                            key={customer.id}
                                                            value={customer.name_user}
                                                            onSelect={() => {
                                                                setData('customer_id', String(customer.id));
                                                                setCustomerOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    data.customer_id === String(customer.id) ? 'opacity-100' : 'opacity-0',
                                                                )}
                                                            />
                                                            {customer.name_user}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id}</p>}
                            </div>
                            )}

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="subject">Asunto</Label>
                                <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={subjectOpen}
                                            className="w-full justify-between"
                                            disabled={processing}
                                        >
                                            {data.subject
                                                ? subjects.find((s) => s.value === data.subject)?.label
                                                : 'Seleccionar asunto...'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar asunto..." />
                                            <CommandList>
                                                <CommandEmpty>No se encontró asunto.</CommandEmpty>
                                                <CommandGroup>
                                                    {subjects.map((subject) => (
                                                        <CommandItem
                                                            key={subject.value}
                                                            value={subject.value}
                                                            onSelect={(currentValue) => {
                                                                setData('subject', currentValue);
                                                                setSubjectOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    data.subject === subject.value
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0'
                                                                )}
                                                            />
                                                            {subject.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
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
                                <Label htmlFor="nombre_contacto">Nombre de Contacto</Label>
                                <Input
                                    id="nombre_contacto"
                                    value={data.nombre_contacto}
                                    onChange={(e) => setData('nombre_contacto', e.target.value)}
                                    disabled={processing}
                                    placeholder="Nombre de la persona de contacto"
                                />
                                {errors.nombre_contacto && <p className="text-sm text-red-500">{errors.nombre_contacto}</p>}
                            </div>

                            {!isCustomer && !isComercial && (
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="support_id">Soporte Técnico</Label>
                                    <Popover open={supportOpen} onOpenChange={setSupportOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={supportOpen}
                                                className="w-full justify-between"
                                                disabled={processing || isSupport}
                                            >
                                                {data.support_id && Array.isArray(supports)
                                                    ? supports.find((s: any) => s.id === Number(data.support_id))?.name || 'Seleccionar soporte técnico...'
                                                    : 'Seleccionar soporte técnico...'}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar soporte técnico..." />
                                                <CommandList>
                                                    <CommandEmpty>No se encontró soporte técnico.</CommandEmpty>
                                                    <CommandGroup>
                                                        {!isSupport && (
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
                                                                Sin asignar
                                                            </CommandItem>
                                                        )}
                                                        {Array.isArray(supports) && supports
                                                            .filter((support: any) => !isSupport || support.email === auth?.user?.email)
                                                            .map((support: any) => (
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
                            )}

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

                            {data.subject !== 'Solicitud de Toner' && (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <Label htmlFor="brand">Marca *</Label>
                                        <Input
                                            id="brand"
                                            value={data.brand}
                                            onChange={(e) => setData('brand', e.target.value)}
                                            disabled={processing}
                                        />
                                        {errors.brand && <p className="text-sm text-red-500">{errors.brand}</p>}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Label htmlFor="model">Modelo *</Label>
                                        <Input
                                            id="model"
                                            value={data.model}
                                            onChange={(e) => setData('model', e.target.value)}
                                            disabled={processing}
                                        />
                                        {errors.model && <p className="text-sm text-red-500">{errors.model}</p>}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Label htmlFor="serial">Serial *</Label>
                                        <Input
                                            id="serial"
                                            value={data.serial}
                                            onChange={(e) => setData('serial', e.target.value)}
                                            disabled={processing}
                                        />
                                        {errors.serial && <p className="text-sm text-red-500">{errors.serial}</p>}
                                    </div>
                                </>
                            )}

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="description">Descripción</Label>
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

                            {!auth?.roles?.includes('customer') && (
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="status">Estado</Label>
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
                                                                    setData('status', currentValue);
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
                            )}

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="documents">Documentos (Opcional)</Label>
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
                                
                                {/* Lista de archivos seleccionados */}
                                {data.documents.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <Label>Archivos seleccionados:</Label>
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

                        <CardFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 p-4 sm:p-6">
                            <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Guardando...
                                    </div>
                                ) : (
                                    'Guardar'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
