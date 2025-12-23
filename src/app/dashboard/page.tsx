'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, LineChart, CheckSquare, Rocket } from "lucide-react";
import Link from "next/link";
import {
  TopClientsCard,
  TopProjectsCard,
  LatestTasksCard,
  LatestDocumentsCard,
  LatestInvoicesCard,
} from "./components";
import { getDashboardWidgets, getDashboardOverview } from '@/lib/api';
import type { DashboardWidgetsResponse, DashboardOverviewResponse } from '@/models/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {

  const [dashboardWidgetsData, setDashboardWidgetsData] = useState<DashboardWidgetsResponse | null>(null);
  const [dashboardOverviewData, setDashboardOverviewData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeProfileId, token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !activeProfileId) return;
      try {
        const [widgetsResponse, overviewResponse] = await Promise.all([
          getDashboardWidgets(token, activeProfileId as string),
          getDashboardOverview(token, activeProfileId as string)
        ]);

        if (widgetsResponse.success && widgetsResponse.data) {
          setDashboardWidgetsData(widgetsResponse.data);
        }

        if (overviewResponse.success && overviewResponse.data) {
          setDashboardOverviewData(overviewResponse.data);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [token, activeProfileId]);

  const dashboardWidgets = [
    {
      title: "Total Clients",
      value: dashboardWidgetsData?.totalClients?.toLocaleString(),
      icon: Users,
      href: "/dashboard/clients",
    },
    {
      title: "Active Projects",
      value: dashboardWidgetsData?.activeProjects?.toLocaleString(),
      icon: Rocket,
      href: "/dashboard/projects",
    },
    {
      title: "To Do Tasks",
      value: dashboardWidgetsData?.pendingTasks?.toLocaleString(),
      icon: CheckSquare,
    },
    {
      title: "Outstanding Invoices",
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dashboardWidgetsData?.outstandingInvoices || 0),
      icon: LineChart,
    }
  ];

  if (loading) {
    return (
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className='h-24' />
          <Skeleton className='h-24' />
          <Skeleton className='h-24' />
          <Skeleton className='h-24' />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Skeleton className='h-96' />
          <Skeleton className='h-96' />
          <Skeleton className='h-96' />
          <Skeleton className='h-96' />
          <Skeleton className='h-96' />
          <Skeleton className='h-96' />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardWidgets.map((widget) => {
          const Icon = widget.icon;
          const cardContent = (
            <Card className="group overflow-hidden card-shadow-hover transition-all h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {widget.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{widget.value}</div>
              </CardContent>
            </Card>
          );

          return widget.href ? (
            <Link href={widget.href} key={widget.title}>
              {cardContent}
            </Link>
          ) : (
            <div key={widget.title}>{cardContent}</div>
          );
        })}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <TopClientsCard data={dashboardOverviewData?.topClients} />
        <TopProjectsCard data={dashboardOverviewData?.topProjects} />
        <LatestTasksCard data={dashboardOverviewData?.latestTasks} />
        <LatestDocumentsCard data={dashboardOverviewData?.latestDocuments} />
        <LatestInvoicesCard data={dashboardOverviewData?.latestInvoices} />
      </div>
    </div>
  );
}