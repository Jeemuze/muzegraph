"use client";

import dynamic from "next/dynamic";

export const TiptapEditor = dynamic(
  () => import("./tiptap-editor"),
  { ssr: false }
);
