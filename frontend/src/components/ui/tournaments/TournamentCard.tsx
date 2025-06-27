'use client';
import { MapPin, Users, Banknote, Trophy, Calendar } from "lucide-react";
import { formatCurrency, formatDate, getTournamentStatus } from '@/lib/utils/utils'; // adjust path based on your structure


const TournamentCard = ({ tournament, onJoin }) => {
  // Add safety checks for tournament data
  if (!tournament || typeof tournament !== 'object') {
    return null;
  }

  const status = getTournamentStatus(tournament.startDate, tournament.endDate);
  const teamsCount = Array.isArray(tournament.teams) ? tournament.teams.length : 0;
  const spotsLeft = (tournament.maxTeams || 0) - teamsCount;

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  };

  const statusLabels = {
    upcoming: 'Upcoming',
    ongoing: 'Live',
    completed: 'Completed'
  };

  const handleClick = () => {
    if (status === 'upcoming' && spotsLeft > 0) {
      onJoin?.(tournament._id);
    }
  };

  return (
    <div className="bg-gray-200 dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{tournament.name || 'Unnamed Tournament'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{tournament.description || 'No description available'}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>

        {/* Tournament Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ">
            <MapPin className="w-4 h-4" />
            <span>{tournament.stadiumId?.name || 'Unknown Stadium'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ">
            <Users className="w-4 h-4" />
            <span>{teamsCount}/{tournament.maxTeams || 0} teams</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ">
            <Banknote className="w-4 h-4" />
            <span>{formatCurrency(tournament.entryPricePerTeam || 0)} entry</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ">
            <Trophy className="w-4 h-4" />
            <span>{formatCurrency(tournament.rewardPrize || 0)} prize</span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400  mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            {tournament.startDate ? formatDate(tournament.startDate) : 'TBD'}
            {tournament.startDate && tournament.endDate && tournament.startDate !== tournament.endDate &&
              ` - ${formatDate(tournament.endDate)}`}
          </span>
        </div>

        {/* Organizer */}
        <div className="text-xs text-gray-500 mb-4">
          Organized by <span className="font-medium">@{tournament.createdBy?.username || 'Unknown'}</span>
        </div>

        {/* Action Button */}
        <div className="flex justify-between items-center">
          <div className="text-sm">
            {spotsLeft > 0 ? (
              <span className="text-green-600 font-medium">{spotsLeft} spots left</span>
            ) : (
              <span className="text-red-600 font-medium">Tournament full</span>
            )}
          </div>
          <button
            onClick={handleClick}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${status === 'upcoming' && spotsLeft > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : status === 'ongoing'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            disabled={status === 'completed' || spotsLeft === 0}
          >
            {status === 'upcoming' && spotsLeft > 0 ? 'Join Tournament' :
              status === 'ongoing' ? 'View Live' :
                spotsLeft === 0 ? 'Full' : 'Ended'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
