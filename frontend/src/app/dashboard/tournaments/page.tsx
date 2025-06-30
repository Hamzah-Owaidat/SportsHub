'use client'
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TournamentsTable from "@/components/tables/TournamentsTable";
import AddTournamentModal from "@/components/ui/modal/tournaments/AddTournamentModal";
import { Tournament } from "@/types/Tournament";
import { useUser } from "@/context/UserContext";

// Note: Remove this if you're using 'use client' directive
// export const metadata: Metadata = {
//   title: "Dashboard | Users",
//   description: "This is Next.js Users Table",
// };

export default function TournamentsPage() {
  const [isAddTournamentModalOpen, setIsAddTournamentModalOpen] = useState(false);
  const [tableData, setTableData] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useUser();

  const handleAddTournament = () => {
    setIsAddTournamentModalOpen(true);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Tournaments Table" />
      <div className="space-y-6">
        <ComponentCard
          title="Tournaments Table"
          showAddButton={user?.role === "stadiumOwner" && true}
          addButtonText="Add Tournament"
          onAddClick={handleAddTournament}
        >
          <TournamentsTable
            tableData={tableData}
            setTableData={setTableData}
            loading={loading}
            setLoading={setLoading}
          />
        </ComponentCard>
      </div>


      <AddTournamentModal
        isOpen={isAddTournamentModalOpen}
        onClose={() => setIsAddTournamentModalOpen(false)}
        setTableData={setTableData}
      />
    </div>
  );
}