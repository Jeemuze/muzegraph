import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./(public)/globals.css";

export const metadata: Metadata = {
  title: "Muzegraph", 
  description: "Your Digital Branding Partner",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins", 
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      {}
      <body className={`${poppins.className} antialiased`}>
        {children}
        <Toaster
          richColors
          position="top-center"
          expand
          duration={3000}
        />
      </body>
    </html>
  );
}