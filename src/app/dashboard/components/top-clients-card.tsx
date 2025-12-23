import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopClient } from "@/models/dashboard";

interface TopClientsCardProps {
  data: TopClient[] | undefined;
}

export function TopClientsCard({ data }: TopClientsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Clients</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <ul>
            {data.map((client) => (
              <li key={client._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center">
                  <div className="ml-4">
                    <p className="text-sm font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{client.phone}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No client data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
