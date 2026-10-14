import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    permissions: string[];
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      permissions: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    role: string;
    permissions: string[];
  }
}
