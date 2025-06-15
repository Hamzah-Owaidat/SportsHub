'use client'
import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

import Actions from "../ui/actions/Actions"
import Image from "next/image";
import Pagination from "./Pagination";
import Toggle from "../ui/button/Toggle";
import { getAllRoles } from '@/lib/api/dashboard/dashboard';
import { Badge } from "lebify-ui"
import { Role } from "@/types/Role";





export default function UsersTable() {
    const [tableData, setTableData] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const roles = await getAllRoles();
                setTableData(roles);
            } catch (error) {
                console.error('Failed to fetch roles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);



    const handleEdit = (id: string) => {
        setEditingRoleId(id);
        setIsModalOpen(true);
    };




    // Calculate pagination using the fetched data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRoles = tableData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(tableData.length / itemsPerPage);

    // Handle page change
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Handle status toggle - update to use active field instead of status
    // const handleStatusToggle = (id: string, isActive: boolean) => {
    //   setTableData(prevData => 
    //     prevData.map(item => 
    //       item._id === id 
    //         ? { ...item, active: isActive } 
    //         : item
    //     )
    //   );
    // };

    // In your render method, update the table to match the new data structure
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
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
                                    Role
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Created By
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Updated By
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Created At
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Updated At
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
                            ) : currentRoles.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-5 py-4 text-center">
                                        No roles found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentRoles.map((role, index) => (
                                    <TableRow key={role._id}>


                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {role.name}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {role.createdBy?.username || 'N/A'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {role.updatedBy?.username || 'N/A'}
                                        </TableCell>


                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            {new Date(role.createdAt).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            {new Date(role.updatedAt).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            <Actions
                                                onEdit={() => console.log('View clicked', role._id)}
                                                onView={() => console.log('View clicked', role._id)}
                                                onDelete={() => console.log('View clicked', role._id)}
                                                isLastRow={index === currentRoles.length - 1}
                                            />
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