import type { IssuePriority, IssueStatus } from "./status";

export type Profile = {
  _id: string;
  fullName: string | null;
  email: string | null;
  role: import("./status").UserRole;
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

/** Client-facing shape returned by issues.listMine / listAll / listAssigned. */
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
  rejectionReason: string | null;
  createdAt: number;
  updatedAt: number | null;
  categoryName: string | null;
  imageUrls: string[];
};

export type IssueUpdateEntry = {
  _id: string;
  fromStatus: IssueStatus | null;
  toStatus: IssueStatus;
  note: string | null;
  authorName: string | null;
  createdAt: number;
};

export type IssueAssignmentInfo = {
  _id: string;
  departmentId: string;
  departmentName: string | null;
  workerId: string | null;
  workerName: string | null;
  createdAt: number;
};

/** Client-facing shape returned by issues.get. */
export type IssueDetail = Issue & {
  duplicateOfTitle: string | null;
  resolvedAt: number | null;
  images: Array<{
    _id: string;
    storageId: string;
    url: string | null;
    isEvidence: boolean | null;
  }>;
  updates: IssueUpdateEntry[];
  activeAssignment: IssueAssignmentInfo | null;
};

export type NotificationItem = {
  _id: string;
  issueId: string | null;
  title: string;
  body: string;
  readAt: number | null;
  createdAt: number;
};
