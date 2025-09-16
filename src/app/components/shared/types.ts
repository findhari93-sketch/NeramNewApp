export type Role = "Visitor" | "Student" | "Admin";
export type AccountType = "Free" | "Paid" | "Admin";
export type User = {
  id: string;
  name?: string | null;
  role?: Role;
  accountType?: AccountType; // new: reflects payment/admin state
  avatarUrl?: string | null;
  plan?: "Free" | "Pro";
  storageFull?: boolean;
};

export type ProfileMenuProps = {
  user?: User | null;
  onSignOut?: () => Promise<void> | void;
};
