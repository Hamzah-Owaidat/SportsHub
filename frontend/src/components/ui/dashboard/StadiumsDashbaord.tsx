'use client';

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StadiumsTable from "@/components/tables/StadiumsTable";
import { Stadium } from "@/types/Stadium";
import { useState } from "react";
import AddStadiumModal from "../modal/stadiums/AddStadiumModal";

export default function StadiumsDashboard() {

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
    )
}