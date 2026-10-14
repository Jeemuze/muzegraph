"use client";

import { useRef, useState } from "react";
import { Mail, MapPin, MousePointer2, Phone, Send, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";

type Props = {
  locale: string;
  settings: Record<string, string | null>;
  copy: { badge: string; heading: string; subtitle: string };
};

export default function ContactPageContent({ locale, settings, copy }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const t = locale === "en"
    ? { name: "Full Name", email: "Email Address", subject: "Subject", message: "Your Message", submit: "Send Message", submitting: "Sending...", success: "Message sent successfully!", successSub: "We'll get back to you soon.", error: "Something went wrong. Please try again.", another: "Send another message" }
    : { name: "Nama Lengkap", email: "Alamat Email", subject: "Subjek", message: "Pesan Anda", submit: "Kirim Pesan", submitting: "Mengirim...", success: "Pesan berhasil dikirim!", successSub: "Kami akan segera menghubungi Anda.", error: "Terjadi kesalahan. Silakan coba lagi.", another: "Kirim pesan lagi" };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--cx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--cy", `${event.clientY - rect.top}px`);
  };

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

  const filledCount = Object.values(form).filter((v) => v.trim()).length;

  return (
    <main>
      {/* Hero */}
      <section
        ref={heroRef}
        onPointerMove={handlePointerMove}
        className="group relative isolate overflow-hidden border-b bg-background py-16 sm:py-20 lg:py-24"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25 [mask-image:linear-gradient(to_bottom,#000,transparent_86%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(340px_circle_at_var(--cx,50%)_var(--cy,40%),var(--muted),transparent_72%)] md:group-hover:opacity-100" />

        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)] lg:items-end">
            <div>
              <p className="mb-6 inline-flex items-center gap-2 border-b pb-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="size-3.5" />
                {copy.badge}
              </p>
              <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-7xl lg:leading-[0.98]">
                {copy.heading}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {copy.subtitle}
              </p>
            </div>

            {/* Live status card */}
            <div className="relative overflow-hidden rounded-lg border bg-background p-5 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md border bg-background">
                    <Send className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {locale === "en" ? "Form progress" : "Progress form"}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {filledCount}/4 {locale === "en" ? "fields" : "kolom"}
                    </p>
                  </div>
                </div>
                <MousePointer2 className="size-4 text-muted-foreground transition-transform duration-300 group-hover:rotate-12" />
              </div>

              {/* Progress indicator */}
              <div className="space-y-3">
                {(["name", "email", "subject", "message"] as const).map((field) => (
                  <div key={field} className="flex items-center gap-3">
                    <div
                      className={`size-2 rounded-full transition-colors duration-300 ${
                        form[field].trim()
                          ? "bg-green-500"
                          : focusedField === field
                          ? "bg-foreground animate-pulse"
                          : "bg-border"
                      }`}
                    />
                    <span
                      className={`text-xs transition-colors ${
                        form[field].trim()
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {t[field]}
                    </span>
                    {form[field].trim() && (
                      <CheckCircle className="ml-auto size-3 text-green-500" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
                  style={{ width: `${(filledCount / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Form + Contact info */}
      <section className="py-14 lg:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
            {/* Form */}
            {success ? (
              <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-16 text-center">
                <div className="mb-6 flex size-16 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10">
                  <CheckCircle className="size-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">{t.success}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t.successSub}</p>
                <Button
                  variant="outline"
                  className="mt-8 h-11 rounded-md px-5"
                  onClick={() => setSuccess(false)}
                >
                  {t.another}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="group/field">
                    <label className="mb-2 block text-sm font-medium text-foreground">{t.name}</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="h-11 w-full rounded-md border bg-background px-4 text-sm text-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                  <div className="group/field">
                    <label className="mb-2 block text-sm font-medium text-foreground">{t.email}</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="h-11 w-full rounded-md border bg-background px-4 text-sm text-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">{t.subject}</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onFocus={() => setFocusedField("subject")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="h-11 w-full rounded-md border bg-background px-4 text-sm text-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">{t.message}</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full resize-none rounded-md border bg-background px-4 py-3 text-sm text-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 rounded-md px-6 gap-2"
                >
                  <Send className="size-4" />
                  {submitting ? t.submitting : t.submit}
                </Button>
              </form>
            )}

            {/* Sidebar contact info */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {locale === "en" ? "Contact info" : "Info kontak"}
              </p>
              <div className="mt-5 space-y-4">
                {settings.contact_email && (
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="group/item flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background transition-transform duration-300 group-hover/item:-translate-y-0.5">
                      <Mail className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Email</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{settings.contact_email}</p>
                    </div>
                  </a>
                )}
                {settings.contact_phone && (
                  <a
                    href={`tel:${settings.contact_phone}`}
                    className="group/item flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background transition-transform duration-300 group-hover/item:-translate-y-0.5">
                      <Phone className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {locale === "en" ? "Phone" : "Telepon"}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{settings.contact_phone}</p>
                    </div>
                  </a>
                )}
                {settings.address && (
                  <div className="group/item flex items-start gap-3 rounded-lg border p-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
                      <MapPin className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {locale === "en" ? "Address" : "Alamat"}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{settings.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
