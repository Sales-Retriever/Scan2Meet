export interface BusinessCardData {
  lastName: string;
  firstName: string;
  position: string;
  department: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  website: string;
}

export interface ResearchResultState {
  isLoading: boolean;
  data: { summary: string | undefined; sources: string | null } | null;
  error: string | null;
}
