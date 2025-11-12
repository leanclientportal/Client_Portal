
import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface UpdatesTimelineProps {
  projectId: string;
}

const UpdatesTimeline: FC<UpdatesTimelineProps> = ({ projectId }) => {
  // Replace with actual data fetching and rendering
  const isLoading = false;
  const updates = [
    { id: 1, description: "Project created", date: "2024-07-20" },
    { id: 2, description: "Task 'Design landing page' added", date: "2024-07-21" },
    { id: 3, description: "Invoice #INV-001 generated", date: "2024-07-22" },
    { id: 4, description: "File 'logo.png' uploaded", date: "2024-07-22" },
    { id: 5, description: "Task 'Develop API endpoints' status changed to 'in-progress'", date: "2024-07-23" },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
          {updates.map((update, index) => (
            <div key={update.id} className="mb-8 flex items-center">
              <div className="absolute left-[-8px] transform translate-x-[-50%]">
                <div className="w-4 h-4 bg-primary rounded-full"></div>
              </div>
              <div className="pl-8">
                <p className="font-semibold">{update.description}</p>
                <p className="text-sm text-muted-foreground">{new Date(update.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpdatesTimeline;
