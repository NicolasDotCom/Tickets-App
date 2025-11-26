import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Customer } from '@/types';

interface CustomerDetailModalProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
}

export function CustomerDetailModal({ customer, isOpen, onClose }: CustomerDetailModalProps) {
    if (!customer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{customer.name}</DialogTitle>
                    <DialogDescription>
                        Información completa del usuario
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">ID</label>
                        <p className="text-sm mt-1">#{customer.id}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Nombre</label>
                        <p className="text-sm mt-1">{customer.name}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Nombre de Usuario</label>
                        <p className="text-sm mt-1">{customer.name_user}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm mt-1">{customer.email}</p>
                    </div>

                    {customer.phone && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Teléfono</label>
                            <p className="text-sm mt-1">{customer.phone}</p>
                        </div>
                    )}

                    {customer.tickets_count !== undefined && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Total de Tickets</label>
                            <p className="text-sm mt-1">{customer.tickets_count} ticket(s)</p>
                        </div>
                    )}

                    {customer.created_at && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
                            <p className="text-sm mt-1">{new Date(customer.created_at).toLocaleDateString('es-ES')}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="w-full">
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
