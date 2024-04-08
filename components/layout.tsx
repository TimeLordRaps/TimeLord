import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "timelord",
  description: "timelord saves you time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-primary text-white py-4 px-6">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">timelord</h1>
            <nav>
              {/* Add navigation menu items */}
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-100 py-4 px-6 text-center">
          {/* Add footer content */}
        </footer>
      </body>
    </html>
  );
}