'use client';

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TournamentsTable from "@/components/tables/TournamentsTable";
import { useUser } from "@/context/UserContext";
import { Tournament } from "@/types/Tournament";
import { useState } from "react";
import AddTournamentModal from "../modal/tournaments/AddTournamentModal";

export default function TournamentsDashboard() {
    const [isAddTournamentModalOpen, setIsAddTournamentModalOpen] = useState(false);
    const [tableData, setTableData] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const handleAddTournament = () => {
        setIsAddTournamentModalOpen(true);
    };
    return (
        <div>
            <PageBreadcrumb pageTitle="Tournaments Table" />
            <div className="space-y-6">
                <ComponentCard
                    title="Tournaments Table"
                    showAddButton={true}
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
    )
}