import type { Metadata } from "next";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "Equacast Content HQ",
  description: "Production command room, social analytics, and content planner for the Equacast co-hosts.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body>
        {user ? (
          <div className="app-container">
            <Sidebar user={user} />
            <main className="content-wrapper">{children}</main>
          </div>
        ) : (
          <>{children}</>
        )}
      </body>
    </html>
  );
}
