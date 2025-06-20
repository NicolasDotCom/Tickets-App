import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tickets',
        href: '/tickets',
    },
    {
        title: 'Create',
        href: '',
    },
];

const statuses = [
    { value: 'open', label: 'Open' },
    { value: 'in progress', label: 'In Progress' },
    { value: 'closed', label: 'Closed' },
];

export default function Create() {
    const { customers, supports } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        support_id: '',
        description: '',
        status: 'open',
    });

    const [customerOpen, setCustomerOpen] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.customer_id || !data.description) {
            alert('Customer and description are required.');
            return;
        }
        post(route('tickets.store'));
    };

    const handleCancel = () => {
        if (data.customer_id || data.support_id || data.description || data.status !== 'open') {
            if (!confirm('Are you sure you want to leave? Unsaved changes will be lost.')) {
                return;
            }
        }
        router.visit(route('tickets.index'));
    };
    const customersList = customers as { id: number; name: string }[];
    const supportsList = supports as { id: number; name: string }[];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Tickets" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Create Ticket</h1>
                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader></CardHeader>
                        <CardContent className="flex flex-col gap-4">

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="customer_id">Customer</Label>
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
                                                : 'Select customer...'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search customer..." />
                                            <CommandList>
                                                <CommandEmpty>No customer found.</CommandEmpty>
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
