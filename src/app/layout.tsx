import "./(public)/globals.css";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={poppins.className}>
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
