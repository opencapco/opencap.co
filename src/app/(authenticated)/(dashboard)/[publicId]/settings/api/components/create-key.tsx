"use client";

import Modal from "@/components/common/modal";
import Tldr from "@/components/common/tldr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { RiAddLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

const CreateApiKey = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [_copied, copy] = useCopyToClipboard();

  const createMutation = api.apiKey.create.useMutation({
    onSuccess: ({ keyId, token }) => {
      const key = `${keyId}:${token}` as string;
      setApiKey(key);
      copy(key);
      toast.success("API key copied to clipboard!");
      setOpen(true);
    },

    onError: (error) => {
      console.error(error);
      toast.error("An error occurred while creating the API key.");
    },

    onSettled: () => {
      setLoading(false);
      router.refresh();
    },
  });

  return (
    <Fragment>
      <Button
        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          e.preventDefault();
          setLoading(true);
          createMutation.mutate();
        }}
        loading={loading}
      >
        <RiAddLine className="inline-block h-5 w-5" />
        Create an API Key
      </Button>

      <Modal
        title="API key created"
        subtitle={
          <Tldr
            message="
            You will not see this key again, so please make sure to copy and store it in a safe place.
          "
          />
        }
        dialogProps={{
          open,
          onOpenChange: (val) => {
            setOpen(val);
          },
        }}
      >
        <Fragment>
          <span className="font-semibold">Your API Key</span>
          <Card
            className="cursor-copy break-words p-3 mt-2"
            onClick={() => {
              copy(apiKey as string);
              toast.success("API key copied to clipboard!");
            }}
          >
            <code className="text-sm font-mono text-rose-600">{apiKey}</code>
          </Card>
          <span className="text-xs text-gray-700">
            Click the API key above to copy
          </span>
        </Fragment>
      </Modal>
    </Fragment>
  );
};

export default CreateApiKey;
