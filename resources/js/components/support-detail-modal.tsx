import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Support } from '@/types';

interface SupportDetailModalProps {
    support: Support | null;
    isOpen: boolean;
    onClose: () => void;
}

export function SupportDetailModal({ support, isOpen, onClose }: SupportDetailModalProps) {
    if (!support) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{support.name}</DialogTitle>
                    <DialogDescription>
                        Información completa del soporte técnico
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">ID</label>
                        <p className="text-sm mt-1">#{support.id}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Nombre</label>
                        <p className="text-sm mt-1">{support.name}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm mt-1">{support.email}</p>
                    </div>

                    {support.phone && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Teléfono</label>
                            <p className="text-sm mt-1">{support.phone}</p>
                        </div>
                    )}

                    {support.tickets_count !== undefined && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Tickets Asignados</label>
                            <p className="text-sm mt-1">{support.tickets_count} ticket(s)</p>
                        </div>
                    )}

                    {support.created_at && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
                            <p className="text-sm mt-1">{new Date(support.created_at).toLocaleDateString('es-ES')}</p>
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
