
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopTenant } from "@/models/dashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image, { StaticImageData } from "next/image";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import SimpleBar from "simplebar-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Label } from "@/components/ui/label";

interface TopTenantsCardProps {
  data: TopTenant[] | undefined;
}

export function TopTenantsCard({ data }: TopTenantsCardProps) {

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
      <div className="rounded-3xl dark:shadow-dark-md shadow-md bg-background py-6 px-0 relative w-full break-words">
        <div className="px-6">
          <h5 className="card-title">Top Tenants </h5>
        </div>

        <SimpleBar className="max-h-[450px]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-6">Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead></TableHead>
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
                                src={ `https://ui-avatars.com/api/?name=${(client.name || '').replace(/\s/g, '+')}&background=random`}
                                alt={client.name || 'Profile'}
                              />
                              <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                            </Avatar>
                          </>
                          <div className="truncate line-clamp-2 max-w-56">
                            <h6>{client.name}</h6>
                            <h6 className="font-light">{client.email}</h6>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge>{client.phone}</Badge>
                      </TableCell>

                      <TableCell>
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
