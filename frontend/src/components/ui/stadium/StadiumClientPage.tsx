'use client';
import React, { useEffect, useState } from 'react';
import StadiumCard from './StadiumCard';
import { Stadium } from '@/types/Stadium';
import { getAllStadiums } from '@/lib/api/stadium';

const StadiumClientPage = () => {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStadiums = async () => {
    try {
      setLoading(true);
      const stadiumList = await getAllStadiums();
      setStadiums(stadiumList);
    } catch (error) {
      console.error("Failed to fetch stadiums:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStadiums();
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-stone-300">
        Explore Stadiums
      </h1>

      {/* Optional: Manual refresh button for testing */}
      <div className="text-center mt-4">
        <button
          onClick={fetchStadiums}
          className="px-4 py-2 bg-[#1a7b9b] hover:bg-[#1a7b9b]/80 text-white rounded-md text-sm"
        >
          Refresh Stadiums
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 mt-5">Loading stadiums...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center mt-5">
          {stadiums.map((stadium) => (
            <StadiumCard
              key={stadium._id}
              id={stadium._id}
              image={stadium.photos?.[0]}
              name={stadium.name}
              pricePerMatch={stadium.pricePerMatch}
              location={stadium.location}
              workingHours={stadium.workingHours}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default StadiumClientPage;
