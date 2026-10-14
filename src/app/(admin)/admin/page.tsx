import { requirePermissionPage } from "@/lib/guards/auth";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Users, Shield, Activity, ArrowUpRight, MessageSquare, Inbox, Newspaper, Briefcase, Image as ImageIcon, Star } from "lucide-react";

export default async function AdminDashboard() {
  await requirePermissionPage("manage_users");

  const session = await auth();

  const [
    totalUsers, totalRoles, totalPermissions,
    totalPosts, totalServices, totalTestimonials,
    totalComments, pendingComments,
    totalContacts, unreadContacts,
    totalMedia,
    currentUser,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.role.count(),
    prisma.permission.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.service.count({ where: { isActive: true } }),
    prisma.testimonial.count({ where: { isActive: true } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    prisma.media.count(),
    prisma.user.findUnique({ where: { id: session?.user?.id }, include: { role: true } }),
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Website company profil modern, scalable, powerful, dan secure
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ================= LEFT ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* 🔥 USER INFO + IMAGE */}
          <Card className="bg-gradient-to-r from-primary/5 to-muted overflow-visible relative">
            <div className="flex items-center justify-between gap-4">
              {/* TEXT */}
              <div className="p-6 space-y-2">
                <CardTitle className="text-base">
                  👋 Halo, {currentUser?.name}
                </CardTitle>


                <p className="text-sm text-muted-foreground">
                  Last login:{" "}
                  {currentUser?.updatedAt
                    ? new Date(currentUser.updatedAt).toLocaleString()
                    : "-"}
                </p>
              </div>

              {/* IMAGE */}
              <div className="hidden md:block absolute right-1">
                <div className="w-[360px] h-[260px] relative">
                  <Image
                src="/assets/admin/dashboard/dashboard-ilustrator.png"
                alt="Dashboard"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
                </div>
              </div>
            </div>
          </Card>

          {/* STATS */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Users</CardTitle>
                  <CardDescription>Total user</CardDescription>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Blog Posts</CardTitle>
                  <CardDescription>Published</CardDescription>
                </div>
                <Newspaper className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalPosts}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Services</CardTitle>
                  <CardDescription>Active</CardDescription>
                </div>
                <Briefcase className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalServices}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Comments</CardTitle>
                  <CardDescription>
                    {pendingComments > 0 && <Badge variant="destructive" className="text-[10px]">{pendingComments} pending</Badge>}
                  </CardDescription>
                </div>
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalComments}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Contacts</CardTitle>
                  <CardDescription>
                    {unreadContacts > 0 && <Badge variant="destructive" className="text-[10px]">{unreadContacts} unread</Badge>}
                  </CardDescription>
                </div>
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalContacts}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Testimonials</CardTitle>
                  <CardDescription>Active</CardDescription>
                </div>
                <Star className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalTestimonials}</p>
              </CardContent>
            </Card>
          </div>


        </div>

        {/* ================= RIGHT CTA ================= */}
        <div className="flex flex-col justify-start">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              🚀 Website Company Profile Siap Pakai
            </h2>

            <p className="text-sm text-muted-foreground">
              Solusi website profesional untuk bisnis Anda tanpa perlu mulai
              dari nol. Cocok untuk UMKM, startup, maupun jasa.
            </p>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✔️ Desain modern & responsif</p>
              <p>✔️ Tech Stack Modern</p>
              <p>✔️ Mudah dikustom</p>
              <p>✔️ Siap digunakan</p>
            </div>

            <Button asChild className="w-full gap-2">
              <a
                href="https://mulaidigital.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Lihat Website Lainnya
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>

            <p className="text-[11px] text-muted-foreground text-center pt-2">
              by <span className="font-medium text-foreground">mulaidigital.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
