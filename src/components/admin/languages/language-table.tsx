"use client";

import { useMemo, useState } from "react";
import {
    Search,
    Globe,
    CheckCircle2,
    XCircle,
    Star,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type Language = {
    id: string;
    code: string;
    name: string;
    nativeName: string;
    isDefault: boolean;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
};

type Props = {
    languages: Language[];
};

export function LanguageTable({ languages }: Props) {
    const [search, setSearch] = useState("");

    const filteredLanguages = useMemo(() => {
        if (!search.trim()) return languages;

        return languages.filter((lang) =>
            `${lang.code} ${lang.name} ${lang.nativeName}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [languages, search]);

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Languages</h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola bahasa yang tersedia di website.
                    </p>
                </div>
            </div>

            {/* SEARCH */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search languages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* TABLE */}
            <div className="rounded-2xl border bg-background shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Native Name</TableHead>
                            <TableHead className="text-center">Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Default</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredLanguages.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="py-10 text-center text-muted-foreground"
                                >
                                    No languages found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLanguages.map((lang) => (
                                <TableRow key={lang.id}>
                                    <TableCell>
                                        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                                            <Globe className="h-3.5 w-3.5" />
                                            {lang.code}
                                        </span>
                                    </TableCell>

                                    <TableCell className="font-medium">{lang.name}</TableCell>

                                    <TableCell>{lang.nativeName}</TableCell>

                                    <TableCell className="text-center">
                                        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                                            {lang.order}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        {lang.isActive ? (
                                            <span className="inline-flex items-center gap-1 text-sm text-green-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                <XCircle className="h-4 w-4" />
                                                Inactive
                                            </span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {lang.isDefault && (
                                            <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                                                <Star className="h-4 w-4 fill-amber-600" />
                                                Default
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
