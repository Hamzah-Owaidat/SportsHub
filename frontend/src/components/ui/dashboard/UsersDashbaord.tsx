'use client';
import ComponentCard from "@/components/common/ComponentCard";
import UsersTable from "@/components/tables/UsersTable";
import AddUserModal from "../modal/users/AddUserModal";
import { User } from "@/types/User";
import { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";


export default function UsersDashboard() {
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
    )
}