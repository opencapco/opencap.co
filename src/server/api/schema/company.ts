import { z } from "zod";

export const ApiCompanySchema = z.object({
  id: z.string().cuid().openapi({
    description: "Company ID",
    example: "clxwbok580000i7nge8nm1ry0",
  }),

  name: z.string().openapi({
    description: "Company name",
    example: "Acme Inc.",
  }),

  logo: z.string().optional().openapi({
    description: "Company logo",
    example: "https://example.com/logo.png",
  }),

  website: z.string().optional().openapi({
    description: "Company website",
    example: "https://example.com",
  }),

  incorporationType: z.string().optional().openapi({
    description: "Company incorporation type",
    example: "LLC",
  }),

  incorporationDate: z.string().optional().openapi({
    description: "Company incorporation date",
    example: "2024-01-01",
  }),

  incorporationState: z.string().optional().openapi({
    description: "Company incorporation state",
    example: "CA",
  }),

  incorporationCountry: z.string().optional().openapi({
    description: "Company incorporation country",
    example: "USA",
  }),

  streetAddress: z.string().optional().openapi({
    description: "Company street address",
    example: "123 Main St.",
  }),

  city: z.string().optional().openapi({
    description: "Company city",
    example: "San Francisco",
  }),

  state: z.string().optional().openapi({
    description: "Company state",
    example: "CA",
  }),

  country: z.string().optional().openapi({
    description: "Company country",
    example: "USA",
  }),

  zipcode: z.string().optional().openapi({
    description: "Company zipcode",
    example: "94105",
  }),

  createdAt: z.string().openapi({
    description: "Company creation date",
    example: "2024-01-01T00:00:00Z",
  }),

  updatedAt: z.string().openapi({
    description: "Company last updated date",
    example: "2024-01-01T00:00:00Z",
  }),
});

export type ApiCompanyType = z.infer<typeof ApiCompanySchema>;
