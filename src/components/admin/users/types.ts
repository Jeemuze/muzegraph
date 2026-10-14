export type Role = {
  id: string;
  name: string;
};

export type UserFormValues = {
  name: string;
  email: string;
  password: string;
  roleId: string;
};

export type UserType = {
  id: string;
  name: string | null;
  email: string;
  roleId?: string | null;
};

export type UserTableType = {
  id: string;
  name: string | null;
  email: string;
  roleId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  role?: {
    id?: string;
    name: string;
  } | null;
};
