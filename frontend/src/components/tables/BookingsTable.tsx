'use client'
import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

import Pagination from "./Pagination";
import { cancelBooking, getMyBookings } from "@/lib/api/stadium";
import { Badge, Button } from 'lebify-ui';



export default function BookingsTable() {

    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filterOption, setFilterOption] = useState("all");

    const itemsPerPage = 5;

    // {booking.refereeId && (
    //           <p><strong>Referee:</strong> {booking.refereeId.username}</p>
    //         )}

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await getMyBookings();
                setTableData(data);
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handleCancelBooking = async (bookingId: string) => {
        const confirmed = window.confirm("Are you sure you want to cancel this booking?");
        if (!confirmed) return;

        try {
            const result = await cancelBooking(bookingId);
            if (result) {
                // Optimistically update the status in tableData
                setTableData((prevData) =>
                    prevData.map((booking) =>
                        booking._id === bookingId
                            ? { ...booking, status: "cancelled", penaltyApplied: result.penaltyApplied }
                            : booking
                    )
                );
            }
        } catch (error) {
            console.error("Cancellation failed:", error);
        }
    };



    // Calculate pagination using the fetched data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredData = tableData.filter((b) => {
        const matchDate = new Date(b.matchDate);
        matchDate.setHours(0, 0, 0, 0);

        if (filterOption === "all") return true;
        if (["approved", "cancelled", "completed"].includes(filterOption)) {
            return b.status === filterOption;
        }
        if (filterOption === "today") return matchDate.getTime() === today.getTime();
        if (filterOption === "tomorrow") {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return matchDate.getTime() === tomorrow.getTime();
        }
        if (filterOption === "upcoming") return matchDate > today;
        if (filterOption === "past") return matchDate < today;

        return true;
    });


    const currentBookings = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Handle page change
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // In your render method, update the table to match the new data structure
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex justify-end px-4 py-2">
                <select
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value)}
                    className="border border-transparent px-3 py-1 rounded text-sm bg-[#1a7b9b] outline-none text-white"
                >
                    <optgroup label="Status">
                        <option value="all">All</option>
                        <option value="approved">Approved</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                    </optgroup>
                    <optgroup label="Date">
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                    </optgroup>
                </select>
            </div>

            {/* Table headers remain the same */}
            <div className="w-full overflow-x-auto">
                <div>
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Stadium
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Date
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Time
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Status
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Penalty Amount
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading ? (
                                <TableRow>
                                    <TableCell className="px-5 py-4 text-center">
                                        Loading data...
                                    </TableCell>
                                </TableRow>
                            ) : currentBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-5 py-4 text-center">
                                        No bookings found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentBookings.map((booking, index) => (
                                    <TableRow key={booking._id}>

                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {booking.stadiumId?.name}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {new Date(booking.matchDate).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {booking.timeSlot}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-start">
                                            {booking.status === "approved" && (
                                                <Badge variant="light" propColor="#33FF57">Approved</Badge>
                                            )}
                                            {booking.status === "cancelled" && (
                                                <Badge variant="light" propColor="#FF5733">Cancelled</Badge>
                                            )}
                                            {booking.status === "completed" && (
                                                <Badge variant="light" propColor="#4361ee">Completed</Badge>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-start">
                                            {booking.penaltyApplied && booking.penaltyAmount > 0 ? (
                                                <Badge variant="light" propColor="#eab308" className="ml-2">
                                                    Penalty: {booking.penaltyAmount} LBP
                                                </Badge>
                                            ) : <Badge variant="light" propColor="#eab308" className="ml-2">
                                                Penalty: {booking.penaltyAmount} LBP
                                            </Badge>
                                            }
                                        </TableCell>


                                        <TableCell className="px-4 py-3 text-theme-sm text-start">
                                            <Button
                                                variant="sea"
                                                disabled={["cancelled", "completed"].includes(booking.status)}
                                                onClick={() => handleCancelBooking(booking._id)}>
                                                Cancel
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            {!loading && tableData.length > 0 && (
                <div className="flex justify-center py-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

        </div>
    );
}