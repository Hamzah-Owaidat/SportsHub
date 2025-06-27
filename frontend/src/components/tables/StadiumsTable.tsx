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
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import { getStadiumsByOwner, getAllStadiums } from "@/lib/api/dashboard/stadiums";
import { Stadium } from "@/types/Stadium";

interface StadiumsTableProps {
  tableData: Stadium[];
  setTableData: React.Dispatch<React.SetStateAction<Stadium[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function StadiumsTable({
  tableData,
  setTableData,
  loading,
  setLoading,
}: StadiumsTableProps) {
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStadiums = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  useEffect(() => {
    async function fetchStadiums() {
      setLoading(true);
      try {
        let stadiumsData = [];

        if (user?.role === 'admin') {
          stadiumsData = await getAllStadiums();
        } else if (user?.role === 'stadiumOwner') {
          stadiumsData = await getStadiumsByOwner(user.id);
        }

        setTableData(stadiumsData);
      } catch (error) {
        toast.error("Failed to load stadiums");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchStadiums();
  }, []);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Image</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Name</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Location</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Price/Match</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Max Players</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Working Hours</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Created At</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Action</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell className="px-5 py-4 text-center">Loading data...</TableCell>
              </TableRow>
            ) : currentStadiums.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-4 text-center">No stadiums found</TableCell>
              </TableRow>
            ) : (
              currentStadiums.map((stadium, index) => (
                <TableRow key={stadium._id}>
                  <TableCell className="px-5 py-4 sm:px-6">
                    <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
                      {stadium.photos && stadium.photos.length > 0 ? (
                        <Image
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          src={`http://localhost:8080${stadium.photos[0]}`}
                          alt={stadium.name}
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">N/A</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{stadium.name}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{stadium.location}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{stadium.pricePerMatch.toLocaleString()} LBP</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{stadium.maxPlayers}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {stadium.workingHours?.start} - {stadium.workingHours?.end}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {new Date(stadium.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    <Actions
                      onEdit={() => console.log("Edit stadium", stadium._id)}
                      onView={() => console.log("View stadium", stadium._id)}
                      onDelete={() => console.log("Delete stadium", stadium._id)}
                      isLastRow={index === currentStadiums.length - 1}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
