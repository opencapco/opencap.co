import { Card } from "@/components/ui/card";
import FileIcon from "@/components/shared/file-icon";
import { RiExpandRightLine } from "@remixicon/react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type RouterOutputs } from "@/trpc/shared";

type DocumentType = RouterOutputs["document"]["getAll"];

type DocumentTableProps = {
  documents: DocumentType;
};

const DocumentsTable = ({ documents }: DocumentTableProps) => {
  return (
    <Card>
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell className="relative flex">
                <FileIcon
                  type={document.bucket.mimeType}
                  className="mr-2 inline-block h-5 w-5 text-muted-foreground"
                />
                <span className="inline-block">{document.name}</span>
              </TableCell>
              <TableCell>{document.bucket.mimeType}</TableCell>
              <TableCell>{document.createdAt.toDateString()}</TableCell>
              <TableCell>{document.uploader.user.name}</TableCell>
              <TableCell>
                <RiExpandRightLine className="cursor-pointer text-muted-foreground" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default DocumentsTable;
