import type { BusinessCardData } from "../types";

const PARAM_NAMES = {
  lastName: import.meta.env.VITE_QUERY_PARAM_LAST_NAME || "lastName",
  firstName: import.meta.env.VITE_QUERY_PARAM_FIRST_NAME || "firstName",
  fullName: import.meta.env.VITE_QUERY_PARAM_FULL_NAME || "fullName",
  department: import.meta.env.VITE_QUERY_PARAM_DEPARTMENT || "department",
  company: import.meta.env.VITE_QUERY_PARAM_COMPANY || "company",
  email: import.meta.env.VITE_QUERY_PARAM_EMAIL || "email",
  phone: import.meta.env.VITE_QUERY_PARAM_PHONE || "phone",
} as const;

export function buildSchedulingUrl(
  baseUrl: string,
  data: BusinessCardData,
  fullName: string
): string {
  const params = new URLSearchParams();

  if (data.lastName) params.append(PARAM_NAMES.lastName, data.lastName);
  if (data.firstName) params.append(PARAM_NAMES.firstName, data.firstName);
  if (fullName) params.append(PARAM_NAMES.fullName, fullName);
  if (data.department) params.append(PARAM_NAMES.department, data.department);
  if (data.company) params.append(PARAM_NAMES.company, data.company);
  if (data.email) params.append(PARAM_NAMES.email, data.email);
  if (data.phone) params.append(PARAM_NAMES.phone, data.phone);

  return params.toString()
    ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${params.toString()}`
    : baseUrl;
}
