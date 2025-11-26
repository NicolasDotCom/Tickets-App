import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem, Ticket } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Ticket as TicketIcon, Clock, CheckCircle, Users } from 'lucide-react';
import TicketExportSelector from '@/components/ticket-export-selector';

// Tipos específicos para el dashboard
interface DashboardMetricas {
    tickets_abiertos: number;
    tickets_en_progreso: number;
    tickets_cerrados: number;
    total_tickets: number;
}

interface GraficaData {
    status: string;
    cantidad: number;
    fill: string;
}

interface UltimoTicket {
    numero_ticket: string;
    tecnico_asignado: string;
    estado: string;
    created_at: string;
}

interface DashboardPageProps extends PageProps {
    metricas: DashboardMetricas;
    graficaData: GraficaData[];
    ultimosTickets: UltimoTicket[];
    userRole: string | null;
    allTickets: Ticket[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Menú',
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
        case 'Abiertos':
            return 'text-blue-600 bg-blue-50';
        case 'In Progress':
        case 'En Progreso':
            return 'text-yellow-600 bg-yellow-50';
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
            return <TicketIcon className="h-6 w-6" />;
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

// Función para traducir estados al español
const getStatusLabel = (status: string) => {
    switch (status) {
        case 'Open':
            return 'Abierto';
        case 'In Progress':
            return 'En Progreso';
        case 'Closed':
            return 'Cerrado';
        default:
            return status;
    }
};

export default function Dashboard() {
    const { metricas, graficaData, ultimosTickets, userRole, allTickets } = usePage<DashboardPageProps>().props;

    // Datos de las métricas como array para mapear
    const metricasCards = [
        {
            titulo: 'Tickets Abiertos',
            valor: metricas?.tickets_abiertos || 0,
            status: 'Open',
            descripcion: 'Tickets pendientes'
        },
        {
            titulo: 'Tickets en Progreso',
            valor: metricas?.tickets_en_progreso || 0,
            status: 'In Progress',
            descripcion: 'En proceso de resolución'
        },
        {
            titulo: 'Tickets Cerrados',
            valor: metricas?.tickets_cerrados || 0,
            status: 'Closed',
            descripcion: 'Resueltos completamente'
        },
        {
            titulo: 'Total de Tickets',
            valor: metricas?.total_tickets || 0,
            status: 'Total',
            descripcion: 'Todos los tickets'
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menú" />
            
            {/* Sección de exportación (solo para admins) */}
            {userRole === 'admin' && allTickets && Array.isArray(allTickets) && allTickets.length > 0 && (
                <div className="mb-4 sm:mb-6 px-2 sm:px-0">
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-lg sm:text-xl">Exportar Tickets</CardTitle>
                            <CardDescription className="text-sm">
                                Selecciona y exporta tickets específicos a CSV
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                            <TicketExportSelector tickets={allTickets} />
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {/* Métricas superiores - 4 casillas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8 px-2 sm:px-0">
                {metricasCards.map((metrica, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                                {metrica.titulo}
                            </CardTitle>
                            <div className={`p-1.5 sm:p-2 rounded-lg ${getStatusColor(metrica.status)}`}>
                                <div className="scale-90 sm:scale-100">
                                    {getStatusIcon(metrica.status)}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                            <div className="text-2xl sm:text-3xl font-bold">{metrica.valor}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                {metrica.descripcion}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Sección inferior con gráfica y tabla */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 px-2 sm:px-0">
                {/* Gráfica de barras - Izquierda */}
                <Card>
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-base sm:text-xl">Resumen de Tickets</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Distribución de tickets por estado
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
                        <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={graficaData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="status" 
                                        tick={{ fontSize: 10 }}
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <ChartTooltip 
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar 
                                        dataKey="cantidad" 
                                        fill="#2662d9"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Tabla de últimos tickets - Derecha */}
                <Card>
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-base sm:text-xl">Últimos Tickets</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Resumen de los tickets más recientes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
                        <div className="space-y-3 sm:space-y-4 overflow-x-auto">
                            {/* Encabezados */}
                            <div className="hidden sm:grid grid-cols-4 gap-4 pb-2 border-b text-sm font-medium text-gray-600">
                                <div>N° Ticket</div>
                                <div>Técnico</div>
                                <div>Estado</div>
                                <div>Creado</div>
                            </div>
                            
                            {/* Filas de datos */}
                            {ultimosTickets && Array.isArray(ultimosTickets) && ultimosTickets.length > 0 ? (
                                ultimosTickets.map((ticket: UltimoTicket, index: number) => (
                                    <div key={index} className="hidden sm:grid grid-cols-4 gap-4 py-2 text-sm">
                                        <div className="font-medium text-blue-600">
                                            {ticket.numero_ticket}
                                        </div>
                                        <div className="text-gray-700 truncate">
                                            {ticket.tecnico_asignado}
                                        </div>
                                        <div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.estado)}`}>
                                                {getStatusLabel(ticket.estado)}
                                            </span>
                                        </div>
                                        <div className="text-gray-500">
                                            {ticket.created_at}
                                        </div>
                                    </div>
                                ))
                            ) : null}
                            
                            {/* Vista móvil - Cards */}
                            {ultimosTickets && Array.isArray(ultimosTickets) && ultimosTickets.length > 0 ? (
                                ultimosTickets.map((ticket: UltimoTicket, index: number) => (
                                    <div key={index} className="sm:hidden flex flex-col gap-2 p-3 border rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div className="font-medium text-blue-600">
                                                {ticket.numero_ticket}
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.estado)}`}>
                                                {getStatusLabel(ticket.estado)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <span className="font-medium">Técnico:</span> {ticket.tecnico_asignado}
                                        </div>
                                        <div className="text-xs text-gray-500">
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
