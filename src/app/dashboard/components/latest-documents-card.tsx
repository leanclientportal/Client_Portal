
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LatestDocument } from "@/models/dashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import SimpleBar from "simplebar-react";

interface LatestDocumentsCardProps {
  data: LatestDocument[] | undefined;
}

export function LatestDocumentsCard({ data }: LatestDocumentsCardProps) {
  const tableActionData = [
    { icon: "solar:add-circle-outline", listtitle: "Add" },
    { icon: "solar:pen-new-square-broken", listtitle: "Edit" },
    { icon: "solar:trash-bin-minimalistic-outline", listtitle: "Delete" },
  ];

  return (
    <>

      <div className="rounded-3xl dark:shadow-dark-md shadow-md bg-background py-3 px-0 relative w-full break-words">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0 p-6">
          {/* Left side: Search + Filter */}
          <div className="flex items-center gap-2">
            <h5 className="card-title">Latest Documents</h5>
          </div>
          {/* Right side: Add Client */}
          {/* <Link href="/dashboard/ptojects">
        <Button variant="outline" size="sm">
          View All
        </Button>
      </Link> */}
        </div>

        <SimpleBar className="max-h-[450px]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-6">Document Name</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((doc, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap ps-6">
                        <div className="truncate line-clamp-2 max-w-56">
                          <h6>{doc.name}</h6>
                        </div>
                      </TableCell>

                      <TableCell>
                        {doc.uploadedBy}
                      </TableCell>

                      <TableCell>
                        <a href={doc.docUrl} download target="_blank" rel="noopener noreferrer" className="flex gap-3">
                          <Icon icon="solar:download-minimalistic-bold" height={18} />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow> <TableCell>Data not found </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SimpleBar >
      </div>
    </>
  );
}
