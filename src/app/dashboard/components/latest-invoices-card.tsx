
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LatestInvoice } from "@/models/dashboard";
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

interface LatestInvoicesCardProps {
  data: LatestInvoice[] | undefined;
}

export function LatestInvoicesCard({ data }: LatestInvoicesCardProps) {
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
            <h5 className="card-title">Latest Invoice </h5>
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
                  <TableHead className="p-6">Invoice Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((invoice, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap ps-6">
                      <div className="truncate line-clamp-2 max-w-56">
                          <a href={`/dashboard/projects/${invoice.projectId}/view`}>
                            {invoice.title}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{invoice.amount}</Badge>
                      </TableCell>

                      <TableCell>
                        <Badge>{invoice.status}</Badge>
                      </TableCell>

                      {/* <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                              <HiOutlineDotsVertical size={22} />
                            </span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {tableActionData.map((items, index) => (
                              <DropdownMenuItem key={index} className="flex gap-3">
                                <Icon icon={items.icon} height={18} />
                                <span>{items.listtitle}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell> */}
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
