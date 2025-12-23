import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LatestInvoice } from "@/models/dashboard";

interface LatestInvoicesCardProps {
  data: LatestInvoice[] | undefined;
}

export function LatestInvoicesCard({ data }: LatestInvoicesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <ul>
            {data.map((invoice) => (
              <li key={invoice._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <p className="text-sm font-medium">{invoice.title}</p>
                <p className="text-sm text-muted-foreground">{invoice.status}</p>
                <p className="text-sm font-medium">{invoice.amount}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No invoice data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
