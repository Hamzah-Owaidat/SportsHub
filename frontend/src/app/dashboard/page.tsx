'use client';
// import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyRegisterUserChart from "@/components/ecommerce/MonthlyRegisterUserChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import { useUser } from "@/context/UserContext";

// export const metadata: Metadata = {
//   title: "Dashboard | Stats",
//   description: "This is Next.js Home for TailAdmin Dashboard Template",
// };

export default function Ecommerce() {

  const { user } = useUser()
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6">
        <EcommerceMetrics />

        {
          user?.role === "admin" ? <MonthlyRegisterUserChart /> : <StatisticsChart />
        }
      </div>
    </div>
  );
}
