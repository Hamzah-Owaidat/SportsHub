'use client'
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AddAcademyModal from "@/components/ui/modal/academies/AddAcademyModal";
import { Academy } from "@/types/Academy";
import AcademiesTable from "@/components/tables/AcademiesTable";

export default function AcademiesDashbaord() {
  const [isAddAcademyModalOpen, setIsAddAcademyModalOpen] = useState(false);
  const [tableData, setTableData] = useState<Academy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  

  const handleAddAcademy = () => {
    setIsAddAcademyModalOpen(true);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Academies Table" />
      <div className="space-y-6">
        <ComponentCard
          title="Academiess Table"
          showAddButton={true}
          addButtonText="Add Academy"
          onAddClick={handleAddAcademy}
        >
          <AcademiesTable
            tableData={tableData}
            setTableData={setTableData}
            loading={loading}
            setLoading={setLoading}
          />
        </ComponentCard>
      </div>

      {/* Add Academy Modal */}
      <AddAcademyModal
        isOpen={isAddAcademyModalOpen}
        onClose={() => setIsAddAcademyModalOpen(false)}
        setTableData={setTableData}
      />
    </div>
  );
}