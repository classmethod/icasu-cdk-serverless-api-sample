export type Industry = "IT" | "Manufacturing" | "Finance" | "Medical" | "Other";

export interface Company {
  id: string;
  createdAt: number;
  name: string;
  industry?: Industry;
}
