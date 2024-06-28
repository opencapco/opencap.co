"use client";

import Modal from "@/components/common/modal";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type React from "react";
import type { SetStateAction } from "react";
import { useFormContext } from "react-hook-form";

type OptionalMessageModalProps = {
  callback: (canSubmit: boolean) => void;
  title: string;
  subtitle: string;
  dialogProps: {
    open: boolean;
    onOpenChange: React.Dispatch<SetStateAction<boolean>>;
  };
};

export const OptionalMessageModal = ({
  title,
  subtitle,
  dialogProps,
  callback,
}: OptionalMessageModalProps) => {
  const form = useFormContext();
  const isSubmitting = form.formState.isSubmitting;

  const onSendSignature = () => callback(true);

  return (
    <Modal
      size="lg"
      trigger={<p />}
      title={title}
      subtitle={subtitle}
      dialogProps={dialogProps}
    >
      <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Message
              <span className="text-xs text-gray-400"> (Optional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add a message to your recipients (optional)"
                disabled={isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs font-light" />
          </FormItem>
        )}
      />
      <div className="flex w-full items-center justify-center">
        <Button
          onClick={onSendSignature}
          loading={isSubmitting}
          className="mx-auto mt-5"
        >
          Send for signatures
        </Button>
      </div>
      <p className="py-1 text-center text-xs text-gray-500">
        We{`'`}ll send your recipients an email with a link to complete and sign
        the document.
      </p>
    </Modal>
  );
};
