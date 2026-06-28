"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/lib/actions";

interface SidebarProps {
  user: {
    username: string;
    display_name: string;
    role: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Command Center", path: "/" },
    { name: "Topic Inbox", path: "/topics" },
    { name: "Recording Plan", path: "/recording-plan" },
    { name: "Clip Tracker", path: "/clip-tracker" },
    { name: "Analytics", path: "/analytics" },
    { name: "Weekly Review", path: "/weekly-review" },
    { name: "Format Library", path: "/formats" },
    { name: "Set & Brand", path: "/set-brand" },
    { name: "Settings", path: "/settings" },
  ];

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <header className="mobile-header">
        <div className="brand-logo" style={{ fontSize: "1.2rem" }}>
          EQUACAST<span>HQ</span>
        </div>
        <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
      </header>

      {/* Main Left Sidebar */}
      <aside className={`main-sidebar ${isOpen ? "open" : ""}`}>
        <div className="brand-section">
          <div>
            <div className="brand-logo">
              EQUACAST<span>HQ</span>
            </div>
            <div className="brand-sub">Content Command</div>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="user-profile-section">
          <div className="user-info">
            <div className="user-avatar">
              {user.display_name.charAt(0)}
            </div>
            <div className="user-details">
              <span className="user-name">{user.display_name}</span>
              <span className="user-role">
                {user.role === "admin" ? "Host + Admin" : "Co-Host"}
              </span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Click outside to close drawer for mobile */}
      {isOpen && (
        <div
          className="modal-overlay"
          style={{ opacity: 0, zIndex: 90 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
