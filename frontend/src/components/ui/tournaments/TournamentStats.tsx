'use client';
import { Trophy, Calendar, Users, Banknote } from "lucide-react";
import { useMemo } from "react";
import { formatCurrency, getTournamentStatus } from '@/lib/utils/utils';


const TournamentStats = ({ tournaments }) => {
  const stats = useMemo(() => {
    const total = tournaments.length;
    const upcoming = tournaments.filter(t => getTournamentStatus(t.startDate, t.endDate) === 'upcoming').length;
    const ongoing = tournaments.filter(t => getTournamentStatus(t.startDate, t.endDate) === 'ongoing').length;
    const totalPrizePool = tournaments.reduce((sum, t) => sum + t.rewardPrize, 0);

    return { total, upcoming, ongoing, totalPrizePool };
  }, [tournaments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-200 dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tournaments</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <Trophy className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div className="bg-gray-200 dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
            <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
          </div>
          <Calendar className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div className="bg-gray-200 dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Live Now</p>
            <p className="text-2xl font-bold text-green-600">{stats.ongoing}</p>
          </div>
          <Users className="w-8 h-8 text-green-500" />
        </div>
      </div>
      <div className="bg-gray-200 dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Prize Pool</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.totalPrizePool)}</p>
          </div>
          <Banknote className="w-8 h-8 text-yellow-500" />
        </div>
      </div>
    </div>
  );
};

export default TournamentStats;
