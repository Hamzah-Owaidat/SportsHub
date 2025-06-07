import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UsersTable from "@/components/tables/UsersTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard |  Users",
  description:
    "This is Next.js Users Table",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Users Table" />
      <div className="space-y-6">
        <ComponentCard title="Users Table">
          <UsersTable />
        </ComponentCard>
      </div>
    </div>
  );
}
