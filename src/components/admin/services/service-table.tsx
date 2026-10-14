"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getLucideIcon } from "@/lib/lucide-icon";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Pencil,
  CheckCircle2,
  XCircle,
  Languages,
  FileSearch,
  Hash,
  Images,
} from "lucide-react";

import { DeleteServiceModal } from "@/components/admin/services/delete-service-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type Service = {
  id: string;
  icon: string | null;
  isActive: boolean;
  order: number;
  translations: {
    id: string;
    language: {
      code: string;
      name: string;
    };
    title: string;
    slug: string;
  }[];
  images: {
    id: string;
    media: {
      url: string;
    };
  }[];
};

type Props = {
  services: Service[];
};

export function ServiceTable({ services }: Props) {
  const [search, setSearch] = useState("");

  const filteredServices = useMemo(() => {
    if (!search.trim()) return services;

    return services.filter((service) => {
      const primaryTranslation =
        service.translations.find(
          (t) => t.language.code === "id"
        ) || service.translations[0];

      if (!primaryTranslation) return false;

      return `${primaryTranslation.title} ${primaryTranslation.slug}`
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [services, search]);

  const [loading] = useState(false);

  const truncateText = (
    text?: string,
    max = 55
  ) => {
    if (!text) return "-";
    return text.length > max
      ? `${text.slice(0, max)}...`
      : text;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Services
          </h1>
          <p className="text-sm text-muted-foreground">
            Currently showing {services.length} services
            in the system.
          </p>
        </div>

        <Link href="/admin/service/create">
          <Button className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Create Service
          </Button>
        </Link>
      </div>

      {/* SEARCH */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="rounded-xl pl-9"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="w-[60px]">
                  No
                </TableHead>
                <TableHead className="min-w-[420px]">
                  Service
                </TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map(
                  (_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {index + 1}
                      </TableCell>

                      <TableCell className="w-[420px] max-w-[420px]">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 animate-pulse rounded-2xl bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-[70%] animate-pulse rounded bg-muted" />
                            <div className="h-3 w-[45%] animate-pulse rounded bg-muted" />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
                          <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-40 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileSearch className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          No services found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search or
                          create a new service.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map(
                  (service, index) => {
                    const primaryTranslation =
                      service.translations.find(
                        (t) =>
                          t.language.code === "id"
                      ) || service.translations[0];

                    const SafeIcon =
                      getLucideIcon(service.icon);

                    const imageList =
                      service.images.filter((img) =>
                        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(
                          img.media.url
                        )
                      );

                    return (
                      <TableRow
                        key={service.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <TableCell>
                          {index + 1}
                        </TableCell>

                        {/* SERVICE */}
                        <TableCell className="w-[420px] max-w-[420px]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 shadow-sm">
                              <SafeIcon className="h-5 w-5 text-foreground" />
                            </div>

                            <div className="min-w-0 flex-1 overflow-hidden">
                              <p
                                title={
                                  primaryTranslation?.title ||
                                  "-"
                                }
                                className="text-sm font-semibold leading-snug text-foreground"
                              >
                                {truncateText(
                                  primaryTranslation?.title,
                                  55
                                )}
                              </p>

                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {primaryTranslation?.slug ||
                                  "-"}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* META */}
                        <TableCell>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Languages className="h-4 w-4" />
                              {
                                service.translations
                                  .length
                              }{" "}
                              languages
                            </div>

                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Order #{service.order}
                            </div>

                            <div className="flex items-center gap-2">
                              <Images className="h-4 w-4" />
                              {imageList.length} media
                            </div>
                          </div>
                        </TableCell>
                        {/* STATUS */}
                          <TableCell>
                            <Badge
                              variant={service.isActive ? "default" : "destructive"}
                              className="gap-1.5 rounded-full px-3 py-1"
                            >
                              {service.isActive ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3.5 w-3.5" />
                                  Inactive
                                </>
                              )}
                            </Badge>
                          </TableCell>

                        {/* ACTIONS */}
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/service/${service.id}/edit`}
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-xl"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>

                            <DeleteServiceModal
                              serviceId={service.id}
                              serviceName={
                                primaryTranslation?.title ||
                                "Service"
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
