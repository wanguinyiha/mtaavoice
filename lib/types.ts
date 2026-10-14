import type { IssuePriority, IssueStatus, UserRole } from "./status";

export type Profile = {
  _id: string;
  fullName: string | null;
  email: string | null;
  role: UserRole;
  phone: string | null;
  departmentId: string | null;
  createdAt: number;
};

export type Category = {
  _id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export type Department = {
  _id: string;
  name: string;
};

export type IssueImage = {
  _id: string;
  storageId: string;
  url?: string;
};

export type IssueUpdate = {
  _id: string;
  fromStatus: IssueStatus | null;
  toStatus: IssueStatus;
  note: string | null;
  authorName: string | null;
  createdAt: number;
};

/** Client-facing shape of an issue as returned by Convex queries. */
export type Issue = {
  _id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  duplicateOf: string | null;
  createdAt: number;
  updatedAt: number;
  categoryName?: string;
  imageUrls?: string[];
};
