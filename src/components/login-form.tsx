"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const loginPromise = signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    toast.promise(loginPromise, {
      loading: "Sedang login...",
      success: (res) => {
        if (res?.error) {
          throw new Error("Email atau password salah");
        }

        router.push("/admin");
        return "Login berhasil";
      },
      error: (err) => err.message || "Terjadi kesalahan",
    });
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login Admin</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan email & password untuk masuk
        </p>
      </div>

      <div className="grid gap-4">
        {/* EMAIL */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </Button>
      </div>
    </form>
  );
}
