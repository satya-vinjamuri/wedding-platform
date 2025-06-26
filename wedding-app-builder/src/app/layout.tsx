import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wed Designer",
  description: "Created By Your Very Own Wed Designer Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          {/* ✅ Header placed inside body */}
          <ToastContainer position="bottom-right" autoClose={3000} />

          {/* Main content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-[#1A1A1A] text-gray-400 py-4 text-sm text-center border-t border-gray-700">
            <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
              <p>Beta Version – Feedback Welcome</p>
              <Link
                href="/contact-us"
                className="text-pink-400 hover:underline font-medium"
              >
                Contact Us / Provide Feedback
              </Link>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
