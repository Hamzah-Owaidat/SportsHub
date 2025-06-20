'use client';

import Navbar from "@/components/common/Navbar";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { useUser } from "@/context/UserContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  const baseLinks = [
    { text: "Home", path: "/home" },
    { text: "Stadiums", path: "/stadiums" },
    { text: "Tournaments", path: "/tournaments" },
    { text: "Academies", path: "/academies" },
    { text: "My Bookings", path: "/my-bookings" },
  ];

  const roleBasedLinks = user?.role !== "user"
    ? [{ text: "Dashboard", path: "/dashboard" }]
    : [];

  const navLinks = [...baseLinks, ...roleBasedLinks];

  return (
    <>
      <Navbar navLinks={navLinks} />
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeTogglerTwo />
      </div>
      <main className="pt-16">{children}</main>
    </>
  );
}
