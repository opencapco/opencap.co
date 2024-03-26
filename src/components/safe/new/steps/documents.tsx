"use client";

import Uploader from "@/components/ui/uploader";
import React from "react";
import { useFormContext } from "react-hook-form";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type Documents = {
  bucketId: string;
  name: string;
};

export const DocumentsFields = ["documents"];

export const Documents = () => {
  const form = useFormContext();
  //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const documents: [Documents] = form.watch("documents");
  // document=uploaders are happy format then///
  return (
    <>
      <Uploader
        multiple={false}
        identifier={"documenter"}
        keyPrefix="equity-doc"
        onSuccess={async (bucketData) => {
          form.setValue("documents", [
            {
              bucketId: bucketData.id,
              name: bucketData.name,
            },
          ]);
        }}
        accept={{
          "application/pdf": [".pdf"],
        }}
      />
      {documents?.length ? (
        <Alert className="mt-5 bg-teal-100" variant="default">
          <AlertTitle>Successfully uploaded the template.</AlertTitle>
          <AlertDescription>
            You can submit the form to proceed.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="mt-5">
          <AlertTitle>No template uploaded</AlertTitle>
          <AlertDescription>
            Please upload necessary template to continue.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
