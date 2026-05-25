import type { Metadata } from "next";
import { Orbitron, Space_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/contexts/settings-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "sonner";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Jade Compass: Relic Expedition",
  description: "A treasure hunting adventure game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${orbitron.variable} ${spaceMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <SettingsProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "var(--card)",
                  color: "var(--card-foreground)",
                  border: "2px solid var(--border)",
                  fontFamily: "var(--font-space-mono), monospace",
                  fontSize: "1rem",
                },
              }}
            />
          </SettingsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
