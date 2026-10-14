"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle } from "lucide-react";

type Props = { locale: string };

export default function ContactForm({ locale }: Props) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const t = locale === "en"
    ? { name: "Full Name", email: "Email Address", subject: "Subject", message: "Your Message", submit: "Send Message", submitting: "Sending...", success: "Your message has been sent successfully! We'll get back to you soon.", error: "Something went wrong. Please try again." }
    : { name: "Nama Lengkap", email: "Alamat Email", subject: "Subjek", message: "Pesan Anda", submit: "Kirim Pesan", submitting: "Mengirim...", success: "Pesan Anda berhasil dikirim! Kami akan segera menghubungi Anda.", error: "Terjadi kesalahan. Silakan coba lagi." };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        setError(data.error || t.error);
      }
    } catch {
      setError(t.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-background p-12 text-center">
        <CheckCircle className="size-12 text-green-500 mb-4" />
        <p className="text-sm text-muted-foreground">{t.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">{t.name}</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">{t.email}</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">{t.subject}</label>
        <input
          type="text"
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">{t.message}</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={submitting} className="h-11 rounded-full px-8 gap-2">
        <Send className="size-4" />
        {submitting ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
