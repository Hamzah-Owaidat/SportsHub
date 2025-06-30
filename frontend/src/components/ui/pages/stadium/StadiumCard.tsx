'use client';
import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface StadiumCardProps {
  id: string;
  image?: string;
  name?: string;
  pricePerMatch?: number;
  location?: string;
  workingHours?: {
    start: string;
    end: string;
  };
}

const StadiumCard = ({
  id,
  image,
  name = "Unnamed Stadium",
  pricePerMatch,
  location = "Unknown Location",
  workingHours = { start: "00:00", end: "00:00" }
}: StadiumCardProps) => {
  const price = pricePerMatch !== undefined ? pricePerMatch : "N/A";

  return (
    <div className="bg-gray-200 dark:bg-stone-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-md w-full">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image?.startsWith('http') ? image : `http://localhost:8080/${image}`}
          alt={name}
          width={400}
          height={250}
          loading="lazy"
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          Available
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 dark:text-stone-300 mb-3 truncate">
          {name}
        </h3>

        <div className="flex items-center text-green-600 mb-2">
          <span className="mr-1 text-lg font-bold">LBP</span>
          <span className="text-lg font-bold">{price}</span>
          <span className="text-xsm text-gray-500 dark:text-stone-400 ml-1">/per match</span>
        </div>

        <div className="flex items-center justify-between mb-3 text-gray-600 dark:text-stone-400">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-red-500" />
            <span className="text-sm">{location}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-sm">
              {workingHours?.start || "?"} - {workingHours?.end || "?"}
            </span>
          </div>
        </div>

        <Link href={`/stadiums/${id}`}>
          <button className="bg-[#1a7b9b] hover:bg-[#1a7b9b]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 w-full">
            Book Now
          </button>
        </Link>
      </div>
    </div>
  );
};

export default StadiumCard;
