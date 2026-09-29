import { z } from "zod";
import { CLIENT_TYPES, INQUIRY_STATUSES } from "./constants";

const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v.length ? v : null))
    .nullable()
    .optional();

const optionalYear = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : v),
  z.coerce.number().int().min(1900, "Enter a valid year").max(2100, "Enter a valid year").nullable(),
);

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v.length ? v : null))
  .nullable()
  .optional()
  .refine((v) => !v || /^https?:\/\//i.test(v), { message: "Must start with http:// or https://" });

export const ProductSchema = z.object({
  nameEn: z.string().trim().min(2, "Name is required").max(160),
  nameAr: optionalText(160),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and dashes only")
    .optional()
    .default(""),
  categoryId: optionalText(64),
  sizes: optionalText(160),
  standard: optionalText(160),
  material: optionalText(160),
  shortDescriptionEn: optionalText(300),
  shortDescriptionAr: optionalText(300),
  descriptionEn: optionalText(5000),
  descriptionAr: optionalText(5000),
  featured: z.boolean(),
  published: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const CategorySchema = z.object({
  nameEn: z.string().trim().min(2, "Name is required").max(120),
  nameAr: optionalText(120),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and dashes only")
    .optional()
    .default(""),
  descriptionEn: optionalText(500),
  descriptionAr: optionalText(500),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const ClientSchema = z.object({
  nameEn: z.string().trim().min(2, "Name is required").max(160),
  nameAr: optionalText(160),
  type: z.enum(CLIENT_TYPES),
  country: optionalText(80),
  websiteUrl: optionalUrl,
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean(),
});

export const FacilityPhotoSchema = z.object({
  titleEn: z.string().trim().min(2, "Title is required").max(160),
  titleAr: optionalText(160),
  captionEn: optionalText(300),
  captionAr: optionalText(300),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean(),
});

export const CertificationSchema = z.object({
  nameEn: z.string().trim().min(2, "Name is required").max(160),
  nameAr: optionalText(160),
  issuerEn: optionalText(200),
  issuerAr: optionalText(200),
  descriptionEn: optionalText(1000),
  descriptionAr: optionalText(1000),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean(),
});

export const SettingsSchema = z.object({
  companyNameEn: z.string().trim().min(2).max(120),
  companyNameAr: z.string().trim().min(2).max(120),
  taglineEn: optionalText(200),
  taglineAr: optionalText(200),
  phone1: optionalText(40),
  phone2: optionalText(40),
  mobile1: optionalText(40),
  mobile2: optionalText(40),
  fax: optionalText(40),
  email: z
    .string()
    .trim()
    .transform((v) => (v.length ? v : null))
    .nullable()
    .optional()
    .refine((v) => !v || z.email().safeParse(v).success, { message: "Invalid email address" }),
  whatsapp: optionalText(40),
  addressEn: optionalText(300),
  addressAr: optionalText(300),
  mapEmbedUrl: z
    .string()
    .trim()
    .transform((v) => (v.length ? v : null))
    .nullable()
    .optional()
    .refine((v) => !v || /^https:\/\/(www\.)?google\.[a-z.]+\/maps/i.test(v), {
      message: "Use a Google Maps embed URL (https://www.google.com/maps/embed?...)",
    }),
  foundedYear: optionalYear,
  unitsProduced: optionalText(40),
  unitsProducedYear: optionalYear,
  vatNumber: optionalText(40),
  standards: optionalText(2000),
  arabicEnabled: z.boolean(),
  facebookUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  notifyEmail: z
    .string()
    .trim()
    .transform((v) => (v.length ? v : null))
    .nullable()
    .optional()
    .refine((v) => !v || z.email().safeParse(v).success, { message: "Invalid email address" }),
});

export const InquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  company: optionalText(160),
  email: z.email("Please enter a valid email address").max(200),
  phone: optionalText(40),
  country: optionalText(80),
  subject: optionalText(200),
  message: z.string().trim().min(10, "Please write a few more words").max(4000),
  productSlug: optionalText(80),
  locale: z.enum(["en", "ar"]).default("en"),
  // Honeypot: real users never fill this field.
  website: z.string().max(0).optional(),
});

export const InquiryUpdateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES),
  notes: optionalText(4000),
});

export const LoginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

export const PasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(10, "Use at least 10 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* ---- FormData helpers ------------------------------------------------------ */

export function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export function bool(formData: FormData, key: string): boolean {
  const v = formData.get(key);
  return v === "on" || v === "true" || v === "1";
}

/** Plain string fields of a submission (files and passwords are never echoed back). */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !/password/i.test(key)) values[key] = value;
  }
  return values;
}

export function fieldErrors(error: z.ZodError): Record<string, string[] | undefined> {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}
