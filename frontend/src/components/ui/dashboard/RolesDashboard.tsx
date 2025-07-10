'use client';
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RolesTable from "@/components/tables/RolesTable";
import AddRoleModal from "@/components/ui/modal/roles/AddRoleModal";
import { Role } from "@/types/Role";
import React, { useState } from "react";


export default function RolesDashboard() {
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [tableData, setTableData] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  const handleAddRole = () => {
    setIsAddRoleModalOpen(true);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Roles Table" />
      <div className="space-y-6">
        <ComponentCard
          title="Roles Table"
          showAddButton={true}
          addButtonText="Add Role"
          onAddClick={handleAddRole}
        >
          <RolesTable
            tableData={tableData}
            setTableData={setTableData}
            loading={loading}
            setLoading={setLoading}
          />
        </ComponentCard>
      </div>

      {/* Add User Modal */}
      <AddRoleModal
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        setTableData={setTableData}
      />
    </div>
  );
}
