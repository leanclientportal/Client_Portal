import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopProject } from "@/models/dashboard";

interface TopProjectsCardProps {
  data: TopProject[] | undefined;
}

export function TopProjectsCard({ data }: TopProjectsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Projects</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <ul>
            {data.map((project) => (
              <li key={project._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <p className="text-sm font-medium">{project.name}</p>
                <p className="text-sm text-muted-foreground">{project.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No project data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
