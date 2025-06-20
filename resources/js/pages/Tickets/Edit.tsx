import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { PageProps, Ticket, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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
    { value: 'open', label: 'Open' },
    { value: 'in progress', label: 'In Progress' },
    { value: 'closed', label: 'Closed' },
];

export default function Edit() {
    const {ticket, supports } = usePage<PageProps & {ticket: Ticket}>().props;

    const { data, setData, put, processing, errors } = useForm({
        support_id: ticket.support_id ? String(ticket.support_id) : '',
        description: ticket.description,
        status: ticket.status.toLowerCase(),
    });

    const [supportOpen, setSupportOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.description) {
            alert('Description are required.');
            return;
        }
        put(route('tickets.update', ticket.id));
    };

    const handleCancel = () => {
        if (
            data.support_id !== (ticket.support_id ? String(ticket.support_id) : '') ||
            data.description !== ticket.description ||
            data.status !== ticket.status.toLowerCase()
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
            </div>
        </AppLayout>
    );
}
