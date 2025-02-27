import { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from '@/providers/auth-provider';
import StreamVideoProvider from '@/providers/StreamClientProvider';
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vidmeet",
  description: "Video calling App",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark-2`}>
      <AuthProvider>
  <StreamVideoProvider>
    {children}
  </StreamVideoProvider>
</AuthProvider>
      </body>
    </html>
  );
}