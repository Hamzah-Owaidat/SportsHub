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

import { API_URL } from "../../../index";

// Update the User interface to match your API response
interface User {
  _id: string;
  username: string;
  isActive: boolean;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function UsersTable() {
  const [tableData, setTableData] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Fetch data from API
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/dashboard/users-table`)
      .then(response => response.json())
      .then(responseData => {
        // Extract users from the nested response structure
        if (responseData.status === "success" && responseData.data && responseData.data.users) {
          // Convert string dates to Date objects and ensure correct data types
          const formattedData = responseData.data.users.map((user: User) => ({
            ...user,
            isActive: user.isActive === true,

            role: user.role?.name,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }));
          setTableData(formattedData);
        } else {
          console.error("Unexpected API response format:", responseData);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  }, []);

  // Calculate pagination using the fetched data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = tableData.slice(indexOfFirstItem, indexOfLastItem);
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
                        {user.profileImage && user.profileImage !== "null" ? (
                          <Image
                            width={40}
                            height={40}
                            src={user.profileImage}
                            alt={user.username}
                          />
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {user.username.substring(0, 2).toUpperCase()}
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
                          {user.role || 'No role assigned'}
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
                      <Toggle 
                        checked={user.isActive} 
                        size="md" 
                        onChange={() => {console.log('Toggle clicked', user._id)}}
                      />
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user.createdAt.toLocaleDateString()}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Actions 
                        onEdit={() => console.log('Edit clicked', user._id)}
                        onView={() => console.log('View clicked', user._id)}
                        onDelete={() => console.log('Delete clicked', user._id)}
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