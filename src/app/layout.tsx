import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@fontsource-variable/plus-jakarta-sans";
import { AppProviders } from "@/components/app-providers";
import { Chrome } from "@/components/chrome";

export const metadata: Metadata = {
  title: "NourishLink — dietitians, tracking and healthy food",
  description:
    "Find a dietitian near you online, track your diet and health numbers, and order healthy food, all in one app.",
  applicationName: "NourishLink",
};

export const viewport: Viewport = {
  themeColor: "#F4F4F4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink antialiased">
        <AppProviders>
          <Chrome>{children}</Chrome>
        </AppProviders>
      </body>
    </html>
  );
}
