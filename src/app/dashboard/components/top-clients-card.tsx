import { TopClient } from "@/models/dashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import SimpleBar from "simplebar-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface TopClientsCardProps {
  data: TopClient[] | undefined;
}

export function TopClientsCard({ data }: TopClientsCardProps) {

  const tableActionData = [
    { icon: "solar:add-circle-outline", listtitle: "Add" },
    { icon: "solar:pen-new-square-broken", listtitle: "Edit" },
    { icon: "solar:trash-bin-minimalistic-outline", listtitle: "Delete" },
  ];
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  return (
    <>
      <div className="rounded-3xl dark:shadow-dark-md shadow-md bg-background py-3 px-0 relative w-full break-words">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0 p-6">
          {/* Left side: Search + Filter */}
          <div className="flex items-center gap-2">
            <h5 className="card-title">Top Clients </h5>
          </div>
          {/* Right side: Add Client */}
          <Link href="/dashboard/clients">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <SimpleBar className="max-h-[450px]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-6">Name</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((client, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap ps-6">
                        <div className="flex gap-3 items-center">
                          <>
                            <Avatar>
                              <AvatarImage
                                src={client.profileImageUrl || `https://ui-avatars.com/api/?name=${(client.name || '').replace(/\s/g, '+')}&background=random`}
                                alt={client.name || 'Profile'}
                              />
                              <AvatarFallback>{client.profileImageUrl ? getInitials(client.name) : ''}</AvatarFallback>
                            </Avatar>
                          </>
                          <div className="truncate line-clamp-2 max-w-56">
                            <h6>{client.name}</h6>
                            <h6 className="font-light">{client.email}</h6>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {client.phone}
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
