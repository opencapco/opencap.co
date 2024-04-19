"use client";

import EmptyState from "@/components/common/empty-state";
import Loading from "@/components/common/loading";
import DataRoomFileExplorer from "@/components/documents/data-room/explorer";
import { Button } from "@/components/ui/button";
import { DropdownButton } from "@/components/ui/dropdown-button";
import { api } from "@/trpc/react";
import { type DataRoomRecipientType } from "@/types/documents/data-room";
import type { Bucket, DataRoom } from "@prisma/client";

import {
  RiFolder3Fill as FolderIcon,
  RiAddFill,
  RiArrowDownSLine,
  RiUploadCloudLine,
} from "@remixicon/react";
import Link from "next/link";
import { Fragment, useState } from "react";
import DataRoomUploader from "./data-room-uploader";

interface DataRoomType extends DataRoom {
  documents: {
    id: string;
    name: string;
    url: string;
    createdAt: Date;
  }[];
}

type DataRoomFilesProps = {
  dataRoom: DataRoom;
  documents: Bucket[];
  companyPublicId: string;
  recipients: DataRoomRecipientType[];
};

const DataRoomFiles = ({
  dataRoom,
  documents,
  recipients,
  companyPublicId,
}: DataRoomFilesProps) => {
  const { mutateAsync } = api.dataRoom.save.useMutation();
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-y-8">
      <form className="container mx-auto flex items-center justify-between gap-y-2 px-4">
        <div className="gap-y-3">
          <div className="flex w-full font-medium">
            <FolderIcon
              className="mr-3 h-6 w-6 text-primary/60"
              aria-hidden="true"
            />
            <Link
              href={`/${companyPublicId}/documents/data-rooms`}
              className="h4 text-primary/70 hover:underline"
            >
              Data room
            </Link>
            <span className="h4 ml-2 text-primary/70">/</span>
            <input
              name="title"
              required
              type="text"
              className="h4 min-w-[300px] bg-transparent px-2 text-gray-800 outline-none focus:ring-0	focus:ring-offset-0"
              placeholder={`Data room's folder name`}
              defaultValue={dataRoom.name}
              onChange={async (e) => {
                // TODO - debounce this

                const name = e.target.value;
                await mutateAsync({
                  name,
                  publicId: dataRoom.publicId,
                });
              }}
            />
          </div>
        </div>

        {documents.length > 0 && (
          <div>
            <DropdownButton
              buttonSlot={
                <Fragment>
                  <span className="sr-only">Save and continue</span>
                  Actions
                  <RiArrowDownSLine className="ml-1 h-5 w-5" />
                </Fragment>
              }
            >
              <ul>
                <li className="w-full">
                  <Button variant="ghost" size="sm" type="submit">
                    Share data room
                  </Button>
                </li>

                <li>
                  <DataRoomUploader
                    dataRoom={dataRoom}
                    companyPublicId={companyPublicId}
                    trigger={
                      <Button variant="ghost" size="sm">
                        Upload more documents
                      </Button>
                    }
                  />
                </li>
              </ul>
            </DropdownButton>
          </div>
        )}
      </form>

      <hr />

      <div>
        {documents.length > 0 ? (
          <DataRoomFileExplorer
            documents={documents}
            companyPublicId={companyPublicId}
            dataRoomPublicId={dataRoom.publicId}
          />
        ) : (
          <EmptyState
            icon={<RiUploadCloudLine />}
            title="Data room is empty!"
            subtitle="Upload one or many documents to get started."
          >
            <DataRoomUploader
              dataRoom={dataRoom}
              companyPublicId={companyPublicId}
              trigger={
                <Button size="lg">
                  <RiAddFill className="mr-2 h-5 w-5" />
                  Upload documents
                </Button>
              }
            />
          </EmptyState>
        )}
      </div>

      {loading && <Loading />}
    </div>
  );
};

export default DataRoomFiles;