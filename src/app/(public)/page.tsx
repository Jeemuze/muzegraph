// This page is not used - middleware rewrites / to /id (default locale)
// Keeping this file to prevent Next.js from showing 404 if middleware is bypassed
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/id");
}
