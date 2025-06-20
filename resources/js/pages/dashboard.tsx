import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

//Charts
import { Pie, PieChart, BarChart, CartesianGrid, XAxis, Bar } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const colors = ['#2662d9', '#2EB88A', '#E23670', '#F5A623', '#AF57DB', '#36BFFA', '#E88C30'];

const chartConfig = {
    tickets: {
        label: 'Tickets',
        color: colors[0]
    }
} satisfies ChartConfig;

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const totalCustemers = props.totalCustomers;
    const totalTickets = props.totalTickets;
    const totalSupports =  props.totalSupports;
    const technicalSupportSpeciality = props.technicalSupportSpeciality;
    const ticketByStatus = props.ticketByStatus;

    const barChartData = Object.entries(ticketByStatus).map(([status, count], index) => ({
        status,
        count,
        fill: colors[index % colors.length],
    }));
    console.log(barChartData);

    const pieChartData = Object.entries(technicalSupportSpeciality).map(([speciality, count], index) => ({
        speciality,
        count,
        fill: colors[index % colors.length],
    }));


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <Card className="flex flex-col items-center p-6 shadow-md">
                            <CardHeader className="justify-center pb-2">
                                <CardTitle className="text-xl font-semibold">Customers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h2 className="text-7xl text-violet-500">{totalCustemers}</h2>
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <div className="text-muted-foreground leading-none">Total registered Clients.</div>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                         <Card className="flex flex-col items-center p-6 shadow-md">
                            <CardHeader className="justify-center pb-2">
                                <CardTitle className="text-xl font-semibold">Support Technicals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h2 className="text-7xl text-sky-500">{totalSupports}</h2>
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <div className="text-muted-foreground leading-none">Total technicals support.</div>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <Card className="flex flex-col items-center p-6 shadow-md">
                            <CardHeader className="justify-center pb-2">
                                <CardTitle className="text-xl font-semibold">Tickets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h2 className="text-7xl text-fuchsia-500">{totalTickets}</h2>
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <div className="text-muted-foreground leading-none">Total registered Tickets.</div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex min-h-[600px] flex-col gap-4 overflow-hidden rounded-xl border md:min-h-[400px] md:flex-row">

                    <div className="w-full md:w-1/2">
                        <Card className="flex h-full flex-col">
                            <CardHeader className="items-center pb-0">
                                <CardTitle>Technical Support by Specialty</CardTitle>
                                <CardDescription>Year 2025</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 pb-0">
                                <ChartContainer config={{}} className="mx-auto max-h-[300px] w-full md:max-h-[370px]">
                                    <PieChart>
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                        <Pie
                                            data={pieChartData}
                                            dataKey="count"
                                            nameKey="speciality"
                                            outerRadius={160}
                                            labelLine={false}
                                        />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2 leading-none font-medium">
                                    Technical support grouped by specialty <TrendingUp className="h-4 w-4" />
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="w-full md:w-1/2">
                        <Card className="flex h-full flex-col">
                            <CardHeader className="items-center pb-0">
                                <CardTitle>Tickets by State</CardTitle>
                                <CardDescription>Year 2025</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 pb-0">
                                <ChartContainer config={chartConfig} className="mx-auto max-h-[300px] w-full md:max-h-[370px]">
                                    <BarChart accessibilityLayer data={barChartData}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="status" tickLine={false} tickMargin={10} axisLine={false} />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" radius={8} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2 leading-none font-medium">
                                    Ticket distribution by state <TrendingUp className="h-4 w-4" />
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
