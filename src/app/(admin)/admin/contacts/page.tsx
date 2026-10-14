import { prisma } from "@/lib/prisma";
import ContactTable from "@/components/admin/contacts/contact-table";

export default async function AdminContactsPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
        <p className="text-sm text-muted-foreground">Manage incoming contact form submissions</p>
      </div>
      <ContactTable messages={messages.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        message: m.message,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
      }))} />
    </div>
  );
}
