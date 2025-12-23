import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LatestDocument } from "@/models/dashboard";
import { Download } from 'lucide-react';

interface LatestDocumentsCardProps {
  data: LatestDocument[] | undefined;
}

export function LatestDocumentsCard({ data }: LatestDocumentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <ul>
            {data.map((doc) => (
              <li key={doc._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <p className="text-sm font-medium" title={doc.name}>
                  {doc.name.length > 20 ? `${doc.name.substring(0, 20)}...` : doc.name}
                </p>
                <p className="text-sm font-medium">{doc.uploadedBy}</p>
                <a href={doc.docUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-5 w-5 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No document data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
