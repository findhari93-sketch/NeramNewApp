export type Role = "Visitor" | "Student" | "Admin";
export type User = {
  id: string;
  name?: string | null;
  role?: Role;
  avatarUrl?: string | null;
  plan?: "Free" | "Pro";
  storageFull?: boolean;
};

export type ProfileMenuProps = {
  user?: User | null;
  onSignOut?: () => Promise<void> | void;
};
