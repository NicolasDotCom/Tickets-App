import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TicketExportSelector from '@/components/ticket-export-selector';
import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Ticket, Clock, CheckCircle, Users, Download } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const chartConfig = {
    cantidad: {
        label: 'Cantidad',
        color: '#2662d9'
    }
} satisfies ChartConfig;

// Función para obtener el color según el estado
const getStatusColor = (status: string) => {
    switch (status) {
        case 'Open':
        case 'Abierto':
            return 'text-white bg-red-500 border-red-600';
        case 'In Progress':
        case 'En Progreso':
            return 'text-white bg-orange-500 border-orange-600';
        case 'Closed':
        case 'Cerrado':
            return 'text-white bg-green-500 border-green-600';
        default:
            return 'text-gray-600 bg-gray-100 border-gray-300';
    }
};

// Función para obtener la variante del Badge según el estado
const getBadgeVariant = (status: string): "open" | "progress" | "closed" | "default" => {
    switch (status) {
        case 'Open':
        case 'Abierto':
            return 'open';
        case 'In Progress':
        case 'En Progreso':
            return 'progress';
        case 'Closed':
        case 'Cerrado':
            return 'closed';
        default:
            return 'default';
    }
};

// Función para obtener el color de los iconos en las cards superiores
const getIconColor = (status: string) => {
    switch (status) {
        case 'Open':
        case 'Abiertos':
            return 'text-red-600 bg-red-50';
        case 'In Progress':
        case 'En Progreso':
            return 'text-orange-600 bg-orange-50';
        case 'Closed':
        case 'Cerrados':
            return 'text-green-600 bg-green-50';
        default:
            return 'text-gray-600 bg-gray-50';
    }
};

// Función para obtener el ícono según el estado
const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Open':
        case 'Abiertos':
            return <Ticket className="h-6 w-6" />;
        case 'In Progress':
        case 'En Progreso':
            return <Clock className="h-6 w-6" />;
        case 'Closed':
        case 'Cerrados':
            return <CheckCircle className="h-6 w-6" />;
        default:
            return <Users className="h-6 w-6" />;
    }
};

export default function Dashboard() {
    const { metricas, graficaData, ultimosTickets, userRole, allTickets } = usePage<PageProps>().props;
    const { isAdmin } = useAuth();

    // Datos de las métricas como array para mapear
    const metricasCards = [
        {
            titulo: 'Tickets Abiertos',
            valor: (metricas as any)?.tickets_abiertos || 0,
            status: 'Open',
            descripcion: 'Tickets pendientes'
        },
        {
            titulo: 'Tickets en Progreso',
            valor: (metricas as any)?.tickets_en_progreso || 0,
            status: 'In Progress',
            descripcion: 'En proceso de resolución'
        },
        {
            titulo: 'Tickets Cerrados',
            valor: (metricas as any)?.tickets_cerrados || 0,
            status: 'Closed',
            descripcion: 'Resueltos completamente'
        },
        {
            titulo: 'Total de Tickets',
            valor: (metricas as any)?.total_tickets || 0,
            status: 'Total',
            descripcion: 'Todos los tickets'
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            {/* Métricas superiores - 4 casillas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metricasCards.map((metrica, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {metrica.titulo}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${getIconColor(metrica.status)}`}>
                                {getStatusIcon(metrica.status)}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{metrica.valor}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                {metrica.descripcion}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Exportación de tickets para administradores */}
            {userRole === 'admin' && (
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Exportar Tickets a CSV
                            </CardTitle>
                            <CardDescription>
                                Exporta todos los tickets del sistema o selecciona tickets específicos para exportar a CSV
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TicketExportSelector tickets={allTickets || []} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Sección inferior con gráfica y tabla */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfica de barras - Izquierda */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de Tickets</CardTitle>
                        <CardDescription>
                            Distribución de tickets por estado
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={graficaData as any}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="status" 
                                        tick={{ fontSize: 12 }}
                                        interval={0}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <ChartTooltip 
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar 
                                        dataKey="cantidad" 
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {(graficaData as any)?.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Tabla de últimos tickets - Derecha */}
                <Card>
                    <CardHeader>
                        <CardTitle>Últimos Tickets</CardTitle>
                        <CardDescription>
                            Resumen de los tickets más recientes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Encabezados */}
                            <div className="grid grid-cols-4 gap-4 pb-2 border-b text-sm font-medium text-gray-600">
                                <div>N° Ticket</div>
                                <div>Técnico</div>
                                <div>Estado</div>
                                <div>Fecha</div>
                            </div>
                            
                            {/* Filas de datos */}
                            {ultimosTickets && Array.isArray(ultimosTickets) && ultimosTickets.length > 0 ? (
                                ultimosTickets.map((ticket: any, index: number) => (
                                    <div key={index} className="grid grid-cols-4 gap-4 py-2 text-sm">
                                        <div className="font-medium text-blue-600">
                                            {ticket.numero_ticket}
                                        </div>
                                        <div className="text-gray-700 truncate">
                                            {ticket.tecnico_asignado}
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                ticket.estado === 'Abierto' ? 'bg-red-500 text-white' :
                                                ticket.estado === 'En Progreso' ? 'bg-orange-500 text-white' :
                                                ticket.estado === 'Cerrado' ? 'bg-green-500 text-white' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {ticket.estado}
                                            </span>
                                        </div>
                                        <div className="text-gray-500">
                                            {ticket.created_at}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No hay tickets recientes
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
