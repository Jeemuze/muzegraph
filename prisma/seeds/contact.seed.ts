import { PrismaClient } from "@prisma/client";

export async function seedContacts(prisma: PrismaClient) {
  const count = await prisma.contactMessage.count();
  if (count > 0) {
    console.log("⚠️ Contact messages already exist, skip");
    return;
  }

  const messages = [
    { name: "Andi Saputra", email: "andi@gmail.com", subject: "Konsultasi Website Company Profile", message: "Halo, saya tertarik untuk membuat website company profile untuk perusahaan saya. Bisa tolong info lebih lanjut mengenai paket dan harganya?", status: "READ" as const },
    { name: "Sarah Wijaya", email: "sarah@startup.id", subject: "Pembuatan Landing Page", message: "Kami butuh landing page untuk campaign produk baru. Apakah bisa selesai dalam 2 minggu? Budget kami sekitar 5-10 juta.", status: "READ" as const },
    { name: "Budi Hartono", email: "budi@mail.com", subject: "Maintenance Website", message: "Website kami sudah jadi tapi butuh maintenance bulanan. Apakah ada paket maintenance? Tolong kirim proposalnya.", status: "UNREAD" as const },
    { name: "Diana Putri", email: "diana@company.co.id", subject: "Redesign Website Lama", message: "Website kami sudah 3 tahun dan terlihat outdated. Kami ingin redesign total dengan tampilan modern. Bisa dijadwalkan meeting?", status: "UNREAD" as const },
    { name: "Reza Firmansyah", email: "reza@techstart.id", subject: "Integrasi Payment Gateway", message: "Kami punya toko online dan ingin menambahkan payment gateway Midtrans. Apakah bisa bantu integrasikan?", status: "UNREAD" as const },
  ];

  await prisma.contactMessage.createMany({ data: messages });
  console.log("✅ Contact messages seeded (5)");
}
