'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getAllAcademies } from '@/lib/api/academy';
import { Academy } from '@/types/Academy';
import { toast } from 'react-toastify';

export default function AcademiesPage() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAcademies() {
      try {
        const data = await getAllAcademies();
        setAcademies(data);
      } catch (error) {
        toast.error('Failed to fetch academies');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchAcademies();
  }, []);

  if (loading) return <div className="p-4">Loading academies...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">All Football Academies</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {academies.map((academy) => (
          <div
            key={academy._id}
            className="bg-white dark:bg-white/[0.05] rounded-xl shadow hover:shadow-md transition duration-300 overflow-hidden border border-gray-200"
          >
            {academy.photos && academy.photos.length > 0 && (
              <Image
                src={`http://localhost:8080${academy.photos[0]}`}
                alt={academy.name}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{academy.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{academy.location}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{academy.phoneNumber}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{academy.email}</p>

              <p className="text-xs text-gray-500 mt-2">
                Created on: {new Date(academy.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
