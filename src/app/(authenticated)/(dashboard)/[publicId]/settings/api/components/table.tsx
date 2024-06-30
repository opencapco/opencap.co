"use client";

import { dayjsExt } from "@/common/dayjs";
import Tldr from "@/components/common/tldr";
import { Card } from "@/components/ui/card";
import { RiMore2Fill } from "@remixicon/react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ApiKey {
  keyId: string;
  createdAt: Date;
  lastUsed: Date | null;
}

const ApiKeysTable = ({ keys }: { keys: ApiKey[] }) => {
  const router = useRouter();

  return (
    <Card className="mx-auto mt-3 w-[28rem] sm:w-[38rem] md:w-full">
      <div className="mx-3">
        <Tldr
          message="
          For security reasons, we have no ways to retrieve your complete API keys. If you lose your API key, you will need to create or rotate and replace with a new one.
        "
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last used</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.keyId}>
              <TableCell className="flex cursor-pointer items-center">
                <code className="text-xs">
                  {`${key.keyId.slice(0, 3)}...${key.keyId.slice(-3)}:****`}
                </code>
              </TableCell>
              <TableCell suppressHydrationWarning>
                {dayjsExt().to(key.createdAt)}
              </TableCell>
              <TableCell suppressHydrationWarning>
                {key.lastUsed ? dayjsExt().to(key.lastUsed) : "Never"}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <RiMore2Fill className="cursor-pointer text-muted-foreground hover:text-primary/80" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => {}}>
                        Rotate key
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-rose-600"
                        onClick={() => {}}
                      >
                        Delete key
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ApiKeysTable;
