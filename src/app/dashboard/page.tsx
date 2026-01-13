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
  TopTenantsCard,
} from "./components";
import { getDashboardWidgets, getDashboardOverview } from '@/lib/api';
import type { DashboardWidgetsResponse, DashboardOverviewResponse } from '@/models/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import { HiOutlineDotsVertical } from "react-icons/hi";
export default function DashboardPage() {

  const [dashboardWidgetsData, setDashboardWidgetsData] = useState<DashboardWidgetsResponse | null>(null);
  const [dashboardOverviewData, setDashboardOverviewData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeProfileId, token, activeProfile } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !activeProfileId) return;
      try {
        const [widgetsResponse, overviewResponse] = await Promise.all([
          getDashboardWidgets(token, activeProfileId as string, activeProfile as string),
          getDashboardOverview(token, activeProfileId as string, activeProfile as string)
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

  const isClient = activeProfile === 'client';

  const dashboardWidgets = [
    {
      title: isClient ? "Total Tenants" : "Total Clients",
      value: isClient ? dashboardWidgetsData?.totalTenants?.toLocaleString() : dashboardWidgetsData?.totalClients?.toLocaleString(),
      icon: Users,
      href: isClient ? "/dashboard" : "/dashboard/clients",
      bg: "bg-secondary",
      light_bg: "bg-lightsecondary",
    },
    {
      title: "Active Projects",
      value: dashboardWidgetsData?.activeProjects?.toLocaleString(),
      icon: Rocket,
      href: "/dashboard/projects",
      bg: "bg-primary",
      light_bg: "bg-lightprimary",
    },
    {
      title: "To Do Tasks",
      value: dashboardWidgetsData?.pendingTasks?.toLocaleString(),
      icon: CheckSquare,
      bg: "bg-warning",
      light_bg: "bg-lightwarning",
    },
    {
      title: isClient ? "Outstanding Payments" : "Outstanding Invoices",
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dashboardWidgetsData?.outstandingInvoices || 0),
      icon: LineChart,
      bg: "bg-error",
      light_bg: "bg-lighterror",
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
            <>
              <div className={`${widget.light_bg} rounded-3xl p-6 relative w-full break-words`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-14 h-10 rounded-full flex items-center justify-center text-white ${widget.bg}`}>
                      <Icon icon="solar:users-group-rounded-bold-duotone" height={24} />
                    </span>
                    <h5 className="text-base opacity-70">{widget.title}</h5>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-[24px] items-end mt-3">
                  <div className="col-span-12 flex items-center justify-between">
                    <h2 className="text-3xl mb-3">{widget.value}</h2>
                    {/* <span className="font-semibold border rounded-full border-black/5 dark:border-white/10 py-0.5 px-[10px] leading-[normal] text-xs text-dark dark:text-darklink">
                      <span className="opacity-70">+23% last month</span>
                    </span> */}
                  </div>
                </div>
              </div>
            </>
          );

          return widget.href ? (
            <Link href={widget.href} key={widget.title}>
              {cardContent}
            </Link>
          ) : (
            <div key={widget.title}>{cardContent}</div>
          );
        })
        }
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {isClient ? <TopTenantsCard data={dashboardOverviewData?.topTenants} /> : <TopClientsCard data={dashboardOverviewData?.topClients} />}
        <TopProjectsCard data={dashboardOverviewData?.topProjects} />
        <LatestTasksCard data={dashboardOverviewData?.latestTasks} />
        <LatestDocumentsCard data={dashboardOverviewData?.latestDocuments} />
        <LatestInvoicesCard data={dashboardOverviewData?.latestInvoices} />
      </div>
    </div>
  );
}