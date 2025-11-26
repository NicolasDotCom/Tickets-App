import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserWithRoles } from '@/types';
import { Pencil } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface UserDetailModalProps {
    user: UserWithRoles | null;
    isOpen: boolean;
    onClose: () => void;
    canEdit?: boolean;
}

const translateRole = (roleName: string) => {
    const translations: { [key: string]: string } = {
        'admin': 'Administrador',
        'customer': 'Cliente',
        'support': 'Soporte Técnico',
        'comercial': 'Comercial'
    };
    return translations[roleName] || roleName;
};

const getRoleBadgeColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
        'admin': 'bg-red-100 text-red-700',
        'customer': 'bg-blue-100 text-blue-700',
        'support': 'bg-green-100 text-green-700',
        'comercial': 'bg-purple-100 text-purple-700'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-700';
};

export function UserDetailModal({ user, isOpen, onClose, canEdit = true }: UserDetailModalProps) {
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{user.name}</DialogTitle>
                    <DialogDescription>
                        Información completa del usuario
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">ID</label>
                        <p className="text-sm mt-1">#{user.id}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Nombre</label>
                        <p className="text-sm mt-1">{user.name}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm mt-1">{user.email}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Roles Asignados</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {user.roles.map((role) => (
                                <span
                                    key={role.id}
                                    className={`text-xs font-medium px-3 py-1.5 rounded-full ${getRoleBadgeColor(role.name)}`}
                                >
                                    {translateRole(role.name)}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Estado del Email</label>
                        <div className="flex items-center gap-2 mt-1">
                            {user.email_verified_at ? (
                                <>
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-green-600">Verificado</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-orange-600">No verificado</span>
                                </>
                            )}
                        </div>
                    </div>

                    {user.created_at && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
                            <p className="text-sm mt-1">{new Date(user.created_at).toLocaleDateString('es-ES')}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Cerrar
                    </Button>
                    {canEdit && (
                        <Link href={route('users.edit', user.id)} className="w-full sm:w-auto">
                            <Button variant="default" className="w-full">
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar Usuario
                            </Button>
                        </Link>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
