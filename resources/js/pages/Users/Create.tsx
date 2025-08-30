import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Role } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' },
    { title: 'Create', href: '' },
];

export default function Create() {
    const { roles } = usePage<{ roles: Role[] }>().props;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        phone: '',
        speciality: '',
        name_user: '',
    });

    // Función para traducir nombres de roles al español
    const translateRole = (roleName: string) => {
        const translations: { [key: string]: string } = {
            'admin': 'Administrador',
            'customer': 'Cliente',
            'support': 'Soporte Técnico'
        };
        return translations[roleName] || roleName;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('users.store'));
    };

    const handleRoleChange = (value: string) => {
        setData('role', value);
        // Si el rol no es support, limpiar la especialidad
        if (value !== 'support') {
            setData('speciality', '');
        }
        // Si el rol no es customer, limpiar el name_user
        if (value !== 'customer') {
            setData('name_user', '');
        }
    };

    const handleCancel = () => {
        if (data.name || data.email || data.phone || data.password || data.role || data.name_user) {
            if (!confirm('Are you sure you want to leave? Unsaved changes will be lost.')) return;
        }
        router.visit(route('users.index'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Create User</h1>
                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader>User Information</CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                    autoFocus
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            {data.role === 'customer' && (
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="name_user">Nombre de Usuario</Label>
                                    <Input
                                        id="name_user"
                                        value={data.name_user}
                                        onChange={(e) => setData('name_user', e.target.value)}
                                        disabled={processing}
                                        placeholder="Ingrese el nombre de usuario"
                                    />
                                    {errors.name_user && <p className="text-sm text-red-500">{errors.name_user}</p>}
                                </div>
                            )}

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    disabled={processing}
                                    placeholder="Ej: +573001234567"
                                />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    disabled={processing}
                                />
                                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    disabled={processing}
                                />
                                {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="role">Rol</Label>
                                <Select value={data.role} onValueChange={handleRoleChange} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                {translateRole(role.name)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                            </div>

                            {data.role === 'support' && (
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="speciality">Especialidad</Label>
                                    <Select value={data.speciality} onValueChange={(value) => setData('speciality', value)} disabled={processing}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar especialidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Impresoras">Impresoras</SelectItem>
                                            <SelectItem value="Sistemas">Sistemas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.speciality && <p className="text-sm text-red-500">{errors.speciality}</p>}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                    </>
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
