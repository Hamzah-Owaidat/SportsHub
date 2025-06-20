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
import { getAllUsers, deleteUser } from '@/lib/api/dashboard/dashboard';
import { Badge } from "lebify-ui"
import { User } from "@/types/User";
import { toast } from "react-toastify";




interface UsersTableProps {
  tableData: User[];
  setTableData: React.Dispatch<React.SetStateAction<User[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}


export default function UsersTable({
  tableData,
  setTableData,
  loading,
  setLoading,
}: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setTableData(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);


  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      setTableData(prev => prev.filter(user => user._id !== id));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Calculate pagination using the fetched data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };


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
                  Profile Image
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Username
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Phone Number
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
                  Verified
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
              ) : currentUsers.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-4 text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                currentUsers.map((user, index) => (
                  <TableRow key={user._id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
                        {user && user.profilePhoto && user.profilePhoto !== "null" ? (
                          <Image
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                            loading="lazy"
                            src={
                              user.profilePhoto.startsWith('http')
                                ? user.profilePhoto
                                : `http://localhost:8080${user.profilePhoto}`
                            }
                            alt={user.username}
                          />
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {user ? user.username.substring(0, 2).toUpperCase() : 'NA'}
                          </span>
                        )}

                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {user.username}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {user.role?.name || 'No role assigned'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.email}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.phoneNumber}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.isActive ? (
                        <Badge variant="light" propColor="#33FF57" isBordered={false}>Active</Badge>
                      ) : (
                        <Badge variant="light" color="error">Inactive</Badge>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.isVerified ? (
                        <Badge variant="light" propColor="#33FF57" isBordered={false}>Yes</Badge>
                      ) : (
                        <Badge variant="light" color="error">No</Badge>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Actions
                        onEdit={() => console.log('Edit clicked', user._id)}
                        onView={() => console.log('View clicked', user._id)}
                        onDelete={() => handleDelete(user._id)}
                        isLastRow={index === currentUsers.length - 1}
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