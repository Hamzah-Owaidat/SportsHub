'use client'
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UsersTable from "@/components/tables/UsersTable";
import AddUserModal from "@/components/ui/modal/users/AddUserModal";
import { User } from "@/types/User";

// Note: Remove this if you're using 'use client' directive
// export const metadata: Metadata = {
//   title: "Dashboard | Users",
//   description: "This is Next.js Users Table",
// };

export default function UsersPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [tableData, setTableData] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Users Table" />
      <div className="space-y-6">
        <ComponentCard
          title="Users Table"
          showAddButton={true}
          addButtonText="Add User"
          onAddClick={handleAddUser}
        >
          <UsersTable
            tableData={tableData}
            setTableData={setTableData}
            loading={loading}
            setLoading={setLoading}
          />
        </ComponentCard>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        setTableData={setTableData}
      />
    </div>
  );
}