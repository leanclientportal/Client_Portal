import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, DollarSign, LineChart, CheckSquare } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

const dashboardWidgets = [
  {
    title: "Total Clients",
    value: "1,250",
    change: "+15.2% from last month",
    icon: Users,
    imageId: "total-clients",
  },
  {
    title: "Revenue (This Month)",
    value: "$24,231.89",
    change: "+8.1% from last month",
    icon: DollarSign,
    imageId: "revenue",
  },
  {
    title: "New Leads",
    value: "78",
    change: "+32 since last week",
    icon: LineChart,
    imageId: "new-leads",
  },
  {
    title: "Pending Tasks",
    value: "14",
    change: "3 overdue",
    icon: CheckSquare,
    imageId: "pending-tasks",
  },
];

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {dashboardWidgets.map((widget) => {
        const Icon = widget.icon;
        const placeholder = PlaceHolderImages.find(p => p.id === widget.imageId);
        return (
          <Card key={widget.title} className="group overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {widget.title}
              </CardTitle>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{widget.value}</div>
              <p className="text-xs text-muted-foreground">{widget.change}</p>
              {placeholder && (
                <div className="relative mt-4 h-24 w-full opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                   <Image 
                     src={placeholder.imageUrl}
                     alt={placeholder.description}
                     fill
                     sizes="100vw"
                     style={{
                       objectFit: 'cover',
                     }}
                     data-ai-hint={placeholder.imageHint}
                   />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
