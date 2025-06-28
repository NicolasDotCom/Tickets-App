import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Loader2, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { equipmentCategories } from '@/constants/equipment-categories';

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
    { value: 'open', label: 'Abierto' },
    { value: 'in progress', label: 'En Progreso' },
    { value: 'closed', label: 'Cerrado' },
];

export default function Create() {
    const { customers, supports } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        support_id: '',
        attachment: null as File | null,
        equipment_category: '',
        equipment_name: '',
        equipment_serial: '',
        equipment_area: '',
        description: '',
        status: 'open',
    });

    const [customerOpen, setCustomerOpen] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.customer_id || !data.description) {
            alert('Cliente y descripción son requeridos.');
            return;
        }
        post(route('tickets.store'));
    };

    const handleCancel = () => {
        if (data.customer_id || data.support_id || data.description || data.status !== 'open' || 
            data.attachment || data.equipment_category || data.equipment_name || data.equipment_serial || data.equipment_area) {
            if (!confirm('¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.')) {
                return;
            }
        }
        router.visit(route('tickets.index'));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('attachment', file);
        }
    };
    const customersList = customers as { id: number; name: string }[];
    const supportsList = supports as { id: number; name: string }[];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Ticket" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Crear Ticket</h1>
                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader>Información del Ticket</CardHeader>
                        <CardContent className="flex flex-col gap-4">

                            {/* Adjuntar archivo */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="attachment">Adjuntar Archivo (Opcional)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.avi,.mov"
                                        onChange={handleFileChange}
                                        disabled={processing}
                                        className="hidden"
                                        id="attachment"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={processing}
                                        className="w-full justify-start"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {data.attachment ? data.attachment.name : 'Seleccionar archivo...'}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Formatos aceptados: JPG, PNG, PDF, DOC, DOCX, MP4, AVI, MOV
                                </p>
                                {errors.attachment && <p className="text-sm text-red-500">{errors.attachment}</p>}
                            </div>

                            {/* Customer */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="customer_id">Cliente *</Label>
                                <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={customerOpen}
                                            className="w-full justify-between"
                                            disabled={processing}
                                        >
                                            {data.customer_id
                                                ? customersList.find((c) => c.id === Number(data.customer_id))?.name
                                                : 'Seleccionar cliente...'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar cliente..." />
                                            <CommandList>
                                                <CommandEmpty>No se encontró cliente.</CommandEmpty>
                                                <CommandGroup>
                                                    {customersList.map((customer) => (
                                                        <CommandItem
                                                            key={customer.id}
                                                            value={customer.name}
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
                                                            {customer.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id}</p>}
                            </div>

                            {/* Technical Support */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="support_id">Soporte Técnico (Opcional)</Label>
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

                            {/* Categoría de Equipo */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="equipment_category">Categoría del Equipo</Label>
                                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={categoryOpen}
                                            className="w-full justify-between"
                                            disabled={processing}
                                        >
                                            {data.equipment_category
                                                ? equipmentCategories.find((c) => c.value === data.equipment_category)?.label
                                                : 'Seleccionar categoría...'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar categoría..." />
                                            <CommandList>
                                                <CommandEmpty>No se encontró categoría.</CommandEmpty>
                                                <CommandGroup>
                                                    {equipmentCategories.map((category) => (
                                                        <CommandItem
                                                            key={category.value}
                                                            value={category.value}
                                                            onSelect={(currentValue) => {
                                                                setData('equipment_category', currentValue);
                                                                setCategoryOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    data.equipment_category === category.value
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0'
                                                                )}
                                                            />
                                                            {category.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.equipment_category && <p className="text-sm text-red-500">{errors.equipment_category}</p>}
                            </div>

                            {/* Datos del Equipo - Grid de 3 columnas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="equipment_name">Nombre/Referencia del Equipo</Label>
                                    <Input
                                        id="equipment_name"
                                        value={data.equipment_name}
                                        onChange={(e) => setData('equipment_name', e.target.value)}
                                        disabled={processing}
                                        placeholder="Ej: HP LaserJet Pro 400"
                                    />
                                    {errors.equipment_name && <p className="text-sm text-red-500">{errors.equipment_name}</p>}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="equipment_serial">Serial del Equipo</Label>
                                    <Input
                                        id="equipment_serial"
                                        value={data.equipment_serial}
                                        onChange={(e) => setData('equipment_serial', e.target.value)}
                                        disabled={processing}
                                        placeholder="Ej: ABC123DEF456"
                                    />
                                    {errors.equipment_serial && <p className="text-sm text-red-500">{errors.equipment_serial}</p>}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="equipment_area">Área</Label>
                                    <Input
                                        id="equipment_area"
                                        value={data.equipment_area}
                                        onChange={(e) => setData('equipment_area', e.target.value)}
                                        disabled={processing}
                                        placeholder="Ej: Contabilidad, Recursos Humanos"
                                    />
                                    {errors.equipment_area && <p className="text-sm text-red-500">{errors.equipment_area}</p>}
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="description">Descripción del Problema *</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    disabled={processing}
                                    rows={4}
                                    placeholder="Describe detalladamente el problema que está experimentando..."
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Status */}
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

                        </CardContent>

                        <CardFooter className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
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
