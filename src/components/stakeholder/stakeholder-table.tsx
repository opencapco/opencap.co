"use client";

import { pushModal } from "@/components/modals";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { SortButton } from "@/components/ui/data-table/data-table-buttons";
import { DataTableContent } from "@/components/ui/data-table/data-table-content";
import { DataTableHeader } from "@/components/ui/data-table/data-table-header";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import type { RouterOutputs } from "@/trpc/shared";
import { RiUserSettingsLine } from "@remixicon/react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { StakeholderTableToolbar } from "./stakeholder-table-toolbar";

type Stakeholder = RouterOutputs["stakeholder"]["getStakeholders"];

type StakeholderTableType = {
  stakeholders: Stakeholder;
};

const getStakeholderType = (type: string) => {
  switch (type) {
    case "INDIVIDUAL":
      return "Individual";
    case "INSTITUTION":
      return "Institution";
  }
};

const getCurrentRelationship = (relationship: string) => {
  switch (relationship) {
    case "ADVISOR":
      return "Advisor";
    case "BOARD_MEMBER":
      return "Board member";
    case "CONSULTANT":
      return "Consultant";
    case "EMPLOYEE":
      return "Employee";
    case "EX_ADVISOR":
      return "Ex Advisor";
    case "EX_CONSULTANT":
      return "Ex Consultant";
    case "EX_EMPLOYEE":
      return "Ex Employee";
    case "EXECUTIVE":
      return "Executive";
    case "FOUNDER":
      return "Founder";
    case "INVESTOR":
      return "Investor";
    case "NON_US_EMPLOYEE":
      return "Non us employee";
    case "OFFICER":
      return "Officer";
    case "OTHER":
      return "Other";
  }
};

export const columns: ColumnDef<Stakeholder[number]>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "name",
    header: ({ column }) => {
      return (
        <SortButton
          label="Name"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      );
    },
    accessorFn: (row) => row.name,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <SortButton
          label="Email"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      );
    },
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "Institution name",
    header: ({ column }) => {
      return (
        <SortButton
          label="Institute name"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      );
    },
    cell: ({ row }) => <div>{row.original.institutionName ?? ""}</div>,
  },
  {
    accessorKey: "Type",
    header: ({ column }) => {
      return (
        <SortButton
          label="Type"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      );
    },
    cell: ({ row }) => {
      const type = row.original.stakeholderType as string;
      return (
        <Badge variant={type === "INDIVIDUAL" ? "info" : "success"}>
          {getStakeholderType(type)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "Association",
    header: ({ column }) => {
      return (
        <SortButton
          label="Association"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      );
    },
    cell: ({ row }) => {
      return (
        <div>{getCurrentRelationship(row.original.currentRelationship)}</div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const singleStakeholder = row.original;
      return (
        <RiUserSettingsLine
          className="h-4 w-4 cursor-pointer"
          onClick={() => {
            console.log(row.original);
            pushModal("UpdateSingleStakeholderModal", {
              title: "Update stakeholder",
              subtitle: "Edit the stakeholder details",
              stakeholder: singleStakeholder,
            });
          }}
        />
      );
    },
  },
];

const StakeholderTable = ({ stakeholders }: StakeholderTableType) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: stakeholders,
    columns: columns,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full p-6">
      <DataTable table={table}>
        <StakeholderTableToolbar />
        <DataTableContent>
          <DataTableHeader />
          <DataTableBody />
        </DataTableContent>
        <DataTablePagination />
      </DataTable>
    </div>
  );
};

export default StakeholderTable;
