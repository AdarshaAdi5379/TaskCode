import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { TaskProvider } from "@/lib/task-context"
import { ProjectProvider } from "@/lib/project-context"
import { UserProvider } from "@/lib/user-context"
import { NotificationProvider } from "@/lib/notification-context"
import { ConnectionProvider, ConnectionStatus } from "@/lib/connection-context"
import { AccentThemeProvider } from "@/lib/accent-theme"
import { ToastProvider } from "@/lib/toast-context"
import { BillingProvider } from "@/lib/billing-context"
import { FeatureFlagsProvider } from "@/lib/feature-flags-context"

export const metadata: Metadata = {
  title: "TaskZen - Project Management",
  description: "TaskZen: Collaborative task management for teams",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserProvider>
            <BillingProvider>
              <FeatureFlagsProvider>
                <ConnectionProvider>
                  <ToastProvider>
                    <AccentThemeProvider>
                      <NotificationProvider>
                        <ProjectProvider>
                          <TaskProvider>
                            {children}
                            <Analytics />
                            <ConnectionStatus />
                          </TaskProvider>
                        </ProjectProvider>
                      </NotificationProvider>
                    </AccentThemeProvider>
                  </ToastProvider>
                </ConnectionProvider>
              </FeatureFlagsProvider>
            </BillingProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
