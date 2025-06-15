import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RolesTable from "@/components/tables/RolesTable";
import UsersTable from "@/components/tables/UsersTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard |  Roles",
  description:
    "This is Next.js Roles Table",
  // other metadata
};

export default function RolesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Roles Table" />
      <div className="space-y-6">
        <ComponentCard title="Roles Table">
          <RolesTable />
        </ComponentCard>
      </div>
    </div>
  );
}
