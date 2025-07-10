'use client';
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BookingsTable from "@/components/tables/BookingsTable";
import { Booking } from "@/types/Booking";
import { useState } from "react";
import { AddBookingModal } from "../modal/bookings/AddBookingModal";



export default function BookingsDashboard() {
    const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
    const [tableData, setTableData] = useState<Booking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const handleAddBooking = () => {
        setIsAddBookingModalOpen(true);
    };
    return (
        <div>
            <PageBreadcrumb pageTitle="Bookings Table" />
            <div className="space-y-6">
                <ComponentCard
                    title="Bookings Table"
                    showAddButton={true}
                    addButtonText="Add Book"
                    onAddClick={handleAddBooking}
                >
                    <BookingsTable
                        tableData={tableData}
                        setTableData={setTableData}
                        loading={loading}
                        setLoading={setLoading}
                    />
                </ComponentCard>
            </div>

            {/* Add User Modal */}
            <AddBookingModal
                isOpen={isAddBookingModalOpen}
                onClose={() => setIsAddBookingModalOpen(false)}
                setTableData={setTableData}
            />
        </div>
    );
}