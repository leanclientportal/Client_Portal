import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LatestTask } from "@/models/dashboard";

interface LatestTasksCardProps {
  data: LatestTask[] | undefined;
}

export function LatestTasksCard({ data }: LatestTasksCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <ul>
            {data.map((task) => (
              <li key={task._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-sm text-muted-foreground">{task.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No task data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
