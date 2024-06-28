"use client";

import { Button } from "@/components/ui/button";
import { parseStrakeholdersCSV } from "@/lib/stakeholders-csv-parser";
import { api } from "@/trpc/react";
import type { TypeStakeholderArray } from "@/trpc/routers/stakeholder-router/schema";
import { RiUploadLine } from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { popModal } from "../modals";

const StakeholderUploader = () => {
  const [csvFile, setCSVFile] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const { mutateAsync, isLoading } =
    api.stakeholder.addStakeholders.useMutation({
      onSuccess: ({ success, message }) => {
        if (success) {
          toast.success("🎉 Successfully created!");
          router.refresh();
        } else {
          toast.error(`🔥 Error - ${message}`);
        }
      },
    });

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files ?? []);
    setCSVFile(files);
  };

  const onImport = async () => {
    try {
      if (!csvFile[0]) {
        return;
      }

      const parsedData = await parseStrakeholdersCSV(csvFile[0]);
      await mutateAsync(parsedData as TypeStakeholderArray);
      popModal("MultipleStakeholdersModal");
    } catch (error) {
      toast.error(`🔥 Error - ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm leading-6 text-neutral-600">
        Please download the{" "}
        <Link
          download
          href="/sample/csv/captable-stakeholders-template.csv"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-gray-300/70 px-2 py-1 text-xs font-medium hover:bg-gray-400/50"
        >
          <span className="mr-1">sample csv file</span>
          <span aria-hidden="true"> &darr;</span>
        </Link>
        , complete and upload it to import your existing or new stakeholders.
      </div>

      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <> */}
      <div
        className="flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-gray-300"
        onClick={() => fileInputRef.current?.click()}
      >
        <RiUploadLine className="h-7 w-7 text-neutral-500" />
        <span className="text-sm text-neutral-500">
          {csvFile.length !== 0 ? csvFile[0]?.name : "Click here to import"}
        </span>
        <input
          onChange={onFileInputChange}
          type="file"
          ref={fileInputRef}
          accept=".csv"
          hidden
        />
      </div>

      <div className="text-xs">
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={""}
          className="text-teal-700 underline"
        >
          Learn more
        </Link>{" "}
        about the sample csv format
      </div>

      <Button onClick={onImport} className="ml-auto block">
        {isLoading ? "Importing..." : "Import"}
      </Button>
    </div>
  );
};

export default StakeholderUploader;
