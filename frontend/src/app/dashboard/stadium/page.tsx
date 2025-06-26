'use client'
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StadiumsTable from "@/components/tables/StadiumsTable";
import { Stadium } from "@/types/Stadium";
import AddStadiumModal from "@/components/ui/modal/AddStadiumModal";

// Note: Remove this if you're using 'use client' directive
// export const metadata: Metadata = {
//   title: "Dashboard | Users",
//   description: "This is Next.js Users Table",
// };

export default function StadiumsPage() {
  const [isAddStadiumModalOpen, setIsAddStadiumModalOpen] = useState(false);
  const [tableData, setTableData] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  

  const handleAddStadium = () => {
    setIsAddStadiumModalOpen(true);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Stadiums Table" />
      <div className="space-y-6">
        <ComponentCard
          title="Stadiums Table"
          showAddButton={true}
          addButtonText="Add Stadium"
          onAddClick={handleAddStadium}
        >
          <StadiumsTable
            tableData={tableData}
            setTableData={setTableData}
            loading={loading}
            setLoading={setLoading}
          />
        </ComponentCard>
      </div>

      {/* Add User Modal */}
      <AddStadiumModal
        isOpen={isAddStadiumModalOpen}
        onClose={() => setIsAddStadiumModalOpen(false)}
        setTableData={setTableData}
      />
    </div>
  );
}