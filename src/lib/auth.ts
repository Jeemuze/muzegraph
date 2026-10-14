import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod/v4";
import { rateLimit } from "@/lib/rate-limit";
import { logAuthEvent } from "@/lib/audit-log";

// Input validation schema
const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(1).max(128),
});

const authConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        // 1. Input validation
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          logAuthEvent("LOGIN_FAILED", { reason: "invalid_input" });
          return null;
        }

        const { email, password } = parsed.data;

        // 2. Rate limiting (5 attempts per 15 minutes per email)
        const rl = rateLimit(`login:${email}`, { maxAttempts: 5, windowMs: 15 * 60 * 1000 });
        if (!rl.success) {
          logAuthEvent("LOGIN_BLOCKED", { email, reason: "rate_limit" });
          throw new Error("Terlalu banyak percobaan login. Coba lagi nanti.");
        }

        // 3. Find user
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        if (!user) {
          logAuthEvent("LOGIN_FAILED", { email, reason: "user_not_found" });
          return null;
        }

        // 4. Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          logAuthEvent("LOGIN_FAILED", { email, reason: "invalid_password" });
          return null;
        }

        // 5. Success
        const permissions =
          user.role?.permissions?.map((rp) => rp.permission.name) ?? [];

        logAuthEvent("LOGIN_SUCCESS", { email, userId: user.id });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
          permissions,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt" as const,
    maxAge: 8 * 60 * 60, // 8 jam
  },

  jwt: {
    maxAge: 8 * 60 * 60, // 8 jam
  },

  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions || [];
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
