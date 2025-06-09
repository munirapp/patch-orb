import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/settings-context";
import type React from "react";
import { ConditionalLayout } from "@/components/conditional-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ORB Admin Dashboard",
  description: "A modern & responsive dashboard",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body className={inter.className} style={{ backgroundColor: "#F1F5F9" }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
        >
          <SettingsProvider>
            <TooltipProvider delayDuration={0}>
              <ConditionalLayout>{children}</ConditionalLayout>
            </TooltipProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
