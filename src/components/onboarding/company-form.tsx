"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type TypeZodOnboardingMutationSchema,
  ZodOnboardingMutationSchema,
} from "@/trpc/routers/onboarding-router/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiArrowRightLine } from "@remixicon/react";
import { useForm } from "react-hook-form";

import { dayjsExt } from "@/common/dayjs";
import { uploadFile } from "@/common/uploads";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import countries from "@/lib/countries";
import { cn, isFileExists, validateFile } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AutoComplete } from "../autocomplete";
import Loading from "../common/loading";

const formSchema = ZodOnboardingMutationSchema;

type CompanyFormProps =
  | {
      type: "edit";
      data: RouterOutputs["company"]["getCompany"];
    }
  | {
      type: "create";
      data?: never;
    }
  | {
      type: "onboarding";
      data?: never;
    };

export const CompanyForm = ({ type, data }: CompanyFormProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { update, data: user } = useSession();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>(data?.company.logo ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TypeZodOnboardingMutationSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: {
        email: user?.user.email ?? "",
        name: user?.user.name ?? "",
        title: data?.title ?? "",
      },
      company: {
        city: data?.company.city ?? "",
        incorporationCountry: data?.company.incorporationCountry ?? "",
        incorporationDate: data?.company.incorporationDate
          ? dayjsExt(data.company.incorporationDate).format("YYYY-MM-DD")
          : "",
        incorporationState: data?.company.incorporationState ?? "",
        incorporationType: data?.company.incorporationType ?? "",
        name: data?.company.name ?? "",
        website: data?.company.website ?? "",
        state: data?.company.state ?? "",
        streetAddress: data?.company.streetAddress ?? "",
        zipcode: data?.company.zipcode ?? "",
        country: data?.company.country ?? "",
      },
    },
  });

  const onBoardingMutation = api.onboarding.onboard.useMutation({
    onSuccess: async ({ publicId }) => {
      await update();

      router.push(`/${publicId}`);
    },
  });

  const companySettingMutation = api.company.updateCompany.useMutation({
    onSuccess: async ({ success }) => {
      await update();

      if (success) {
        toast.success("🎉 Successfully updated");
      } else {
        toast.error("Uh oh! Something went wrong.");
      }

      router.refresh();
    },
  });

  async function handleLogoUpload(file: File): Promise<{ imageUrl: string }> {
    if (user?.user.id) {
      const { fileUrl } = await uploadFile(
        file,
        {
          expiresIn: 3600,
          keyPrefix: "company-logos",
          identifier: user.user.id,
        },
        "publicBucket",
      );
      setImageUrl(fileUrl);

      return { imageUrl: fileUrl };
    }

    return { imageUrl: "" };
  }

  const handleLogoChangeAndUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { file } = isFileExists(event);

    if (!file) return;

    const { isValid, title, errorMessage } = validateFile(file);

    if (isValid) {
      try {
        setLoading(true);
        const { imageUrl } = await handleLogoUpload(file);

        if (!imageUrl) {
          return toast.error("Failed uploading the logo.");
        }

        const currentValues = form.getValues();

        companySettingMutation.mutate({
          user: {
            name: currentValues.user.name,
            email: currentValues.user.email,
            title: currentValues.user.title,
          },
          company: {
            ...currentValues.company,
            logo: imageUrl,
          },
        });
      } catch (error) {
        console.error("Something went wrong", error);
        toast.error("Failed uploading logo.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error(errorMessage);
    }
  };

  const handleLogoChange = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  async function onSubmit(values: TypeZodOnboardingMutationSchema) {
    try {
      if (type === "create" || type === "onboarding") {
        await onBoardingMutation.mutateAsync(values);
      } else if (type === "edit") {
        await companySettingMutation.mutateAsync(values);
      }
    } catch (error) {
      console.error("Something went wrong", error);
      toast.error("Failed submitting the form.");
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  const isDirty = form.formState.isDirty;

  const countriesAutocomplete = countries.map((c) => ({
    label: c.name,
    value: c.code,
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="col-span-full space-y-2 flex flex-col sm:flex-row items-center gap-x-3 sm:gap-x-8">
          <Avatar className="h-20 w-20 rounded">
            <AvatarImage src={imageUrl || "/placeholders/company.svg"} />
          </Avatar>

          <div className="flex items-start space-x-3">
            <div>
              <Button
                onClick={handleLogoChange}
                size="sm"
                variant={"outline"}
                type="button"
              >
                Change company logo
              </Button>
              <Input
                className="hidden"
                type="file"
                onChange={handleLogoChangeAndUpload}
                ref={fileInputRef}
              />
              <p className="mt-2 text-xs text-gray-700">
                JPG, GIF or PNG. 1MB max.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="grid gap-5">
            {type === "onboarding" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="user.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your full name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage className="text-xs font-light" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="user.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your work email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs font-light" />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="company.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />

              {/* {(type === "onboarding" || type === "create") && ( */}
              <FormField
                control={form.control}
                name="user.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your job title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />
              {/* )} */}
            </div>

            <hr />

            <h2 className="text-xl">Company address</h2>
            <p className="-mt-5 text-sm text-muted-foreground">
              Please provide your company{`'`}s address.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company.streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="company.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company.zipcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map(
                          (country: { code: string; name: string }) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />
            </div>

            <hr />

            <h2 className="text-xl">Company incorporation details</h2>
            <p className="-mt-5 text-sm text-muted-foreground">
              Please provide your company{`'`}s incorporation details. Your
              certificate of incorporation will come in handy here.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company.incorporationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incorporation type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="llc">
                          LLC - Limited Liability Company
                        </SelectItem>
                        <SelectItem value="c-corp">
                          C-Corp - C Corporation
                        </SelectItem>
                        <SelectItem value="s-corp">
                          S-Corp - S Corporation
                        </SelectItem>
                        <SelectItem value="other">
                          Others or International
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company.incorporationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incorporation date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company.incorporationCountry"
                render={() => (
                  <FormItem>
                    <FormLabel>Incorporation country</FormLabel>
                    <FormControl>
                      <AutoComplete
                        options={countriesAutocomplete}
                        placeholder="Select country"
                        emptyMessage="No country found."
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company.incorporationState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incorporation state</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              disabled={!isDirty}
              loading={isSubmitting}
              loadingText="Submitting..."
              type="submit"
              className={cn(
                type === "onboarding" || type === "create" ? "w-full" : "",
              )}
            >
              {type === "onboarding" || type === "create" ? (
                <>
                  Complete Setup
                  <RiArrowRightLine className="ml-2 inline-block h-5 w-5" />
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </form>

      {loading && <Loading />}
    </Form>
  );
};
