"use client";

import { ACTIONS, SUBJECTS, type TActions } from "@/constants/rbac";

import { api } from "@/trpc/react";
import {
  type TypeZodCreateRoleMutationSchema,
  ZodCreateRoleMutationSchema,
} from "@/trpc/routers/rbac-router/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Modal from "../common/modal";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const formSchema = ZodCreateRoleMutationSchema;
type TFormSchema = TypeZodCreateRoleMutationSchema;

export const defaultInputPermissionInputs = SUBJECTS.reduce<
  TFormSchema["permissions"]
>((prev, curr) => {
  const actions = ACTIONS.reduce<Partial<Record<TActions, boolean>>>(
    (prev, curr) => {
      prev[curr] = false;

      return prev;
    },
    {},
  );

  prev[curr] = actions;

  return prev;
}, {});

export function CreateRbacModal() {
  const router = useRouter();
  const { mutateAsync: createRole } = api.rbac.createRole.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      permissions: defaultInputPermissionInputs,
    },
  });

  const onSubmit = async (data: TFormSchema) => {
    await createRole(data);
  };
  return (
    <Modal
      size="4xl"
      title="create roles"
      trigger={<Button>Create Role</Button>}
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-y-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permissions</TableHead>
                  {ACTIONS.map((item) => (
                    <TableHead key={item}>{item}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {SUBJECTS.map((subject) => (
                  <TableRow key={subject}>
                    <TableCell className="font-medium">{subject}</TableCell>

                    {ACTIONS.map((action) => (
                      <TableCell key={action}>
                        <FormField
                          control={form.control}
                          name={`permissions.${subject}.${action}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="sr-only">
                                <FormLabel>{action}</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
