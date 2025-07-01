'use client';
import { MapPin, Users, Banknote, Trophy, Calendar, Zap, Crown } from "lucide-react";
import { formatCurrency, formatDate, getTournamentStatus } from '@/lib/utils/utils'; // adjust path based on your structure

interface Tournament {
  _id: string;
  name?: string;
  description?: string;
  startDate: string;
  endDate: string;
  teams?: (string | { _id: string })[];
  maxTeams?: number;
  entryPricePerTeam?: number;
  rewardPrize?: number;
  createdBy?: {
    username?: string;
  };
  stadiumId?: {
    name?: string;
  };
}

interface TournamentCardProps {
  tournament: Tournament;
  onJoin?: (tournamentId: string) => void;
  userTeamId?: string;
}

const TournamentCard = ({ tournament, onJoin, userTeamId }: TournamentCardProps) => {

  // Add safety checks for tournament data
  if (!tournament || typeof tournament !== 'object') {
    return null;
  }

  const status = getTournamentStatus(tournament.startDate, tournament.endDate);
  const teamsCount = Array.isArray(tournament.teams) ? tournament.teams.length : 0;
  const spotsLeft = (tournament.maxTeams || 0) - teamsCount;

  const statusColors = {
    upcoming: 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600',
    ongoing: 'bg-gradient-to-r from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600',
    completed: 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-stone-700/30 dark:to-stone-600/30 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-stone-600'
  };

  const statusLabels = {
    upcoming: '🚀 Upcoming',
    ongoing: '🔥 Live Now',
    completed: '✅ Completed'
  };

  const handleClick = () => {
    if (status === 'upcoming' && spotsLeft > 0) {
      onJoin?.(tournament._id);
    }
  };

  const hasJoined = Array.isArray(tournament.teams)
    ? tournament.teams.some((team: string | { _id: string }) => {
      if (typeof team === 'string') return team === userTeamId;
      return team?._id === userTeamId;
    })
    : false;

  return (
    <div className="group relative bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200/50 dark:border-stone-700/50 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      

      <div className="relative p-6 space-y-5">
        {/* Enhanced Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tournament.name || 'Unnamed Tournament'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-stone-400 line-clamp-2 font-medium leading-relaxed">
              {tournament.description || 'No description available'}
            </p>
          </div>
          <div className="flex gap-2">
            <div className={`flex-shrink-0 px-3 py-1.5 rounded-2xl text-xs font-bold border ${statusColors[status]} shadow-sm`}>
              {statusLabels[status]}
            </div>
            {/* Premium tournament indicator */}
            {(tournament.rewardPrize || 0) > 100000 && (
              <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            )}
          </div>
          
        </div>

        {/* Enhanced Tournament Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="group/item flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 hover:shadow-md transition-all duration-300">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl group-hover/item:scale-110 transition-transform">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Stadium</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate" title={tournament.stadiumId?.name || 'Unknown Stadium'}>
                {tournament.stadiumId?.name || 'Unknown Stadium'}
              </p>
            </div>
          </div>
          
          <div className="group/item flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/50 hover:shadow-md transition-all duration-300">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl group-hover/item:scale-110 transition-transform">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Teams</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate font-mono">
                {teamsCount}/{tournament.maxTeams || 0}
              </p>
            </div>
          </div>
          
          <div className="group/item flex items-center gap-3 p-3 bg-green-50/50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/50 hover:shadow-md transition-all duration-300">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-xl group-hover/item:scale-110 transition-transform">
              <Banknote className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Entry</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate font-mono" title={formatCurrency(tournament.entryPricePerTeam || 0)}>
                {formatCurrency(tournament.entryPricePerTeam || 0)}
              </p>
            </div>
          </div>
          
          <div className="group/item flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50 hover:shadow-md transition-all duration-300">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl group-hover/item:scale-110 transition-transform">
              <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Prize</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate font-mono" title={formatCurrency(tournament.rewardPrize || 0)}>
                {formatCurrency(tournament.rewardPrize || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Date Section */}
        <div className="flex items-center gap-3 p-4 bg-gray-50/80 dark:bg-stone-700/50 rounded-2xl border border-gray-200/50 dark:border-stone-600/50">
          <div className="p-2 bg-gray-100 dark:bg-stone-600 rounded-xl">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-stone-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-500 dark:text-stone-400 uppercase tracking-wide mb-1">Tournament Dates</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {tournament.startDate ? formatDate(tournament.startDate) : 'TBD'}
              {tournament.startDate && tournament.endDate && tournament.startDate !== tournament.endDate &&
                ` - ${formatDate(tournament.endDate)}`}
            </p>
          </div>
        </div>

        {/* Enhanced Organizer */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {tournament.createdBy?.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Organized by</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              @{tournament.createdBy?.username || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Enhanced Action Section */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            {spotsLeft > 0 ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700 min-w-0">
                <Zap className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-xs font-bold text-green-700 dark:text-green-300 truncate font-mono">{spotsLeft} spots left</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-700">
                <span className="text-xs font-bold text-red-700 dark:text-red-300">Full</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleClick}
            className={`group/btn relative overflow-hidden px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${
              status === 'upcoming' && spotsLeft > 0 && !hasJoined
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                : hasJoined
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg cursor-default'
                : 'bg-gray-200 dark:bg-stone-700 text-gray-500 dark:text-stone-400 cursor-not-allowed'
            }`}
            disabled={status !== 'upcoming' || spotsLeft === 0 || hasJoined}
          >
            {/* Button shine effect */}
            {(status === 'upcoming' && spotsLeft > 0 && !hasJoined) && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
            )}
            
            <span className="relative flex items-center gap-2">
              {hasJoined ? (
                <>
                  <span className="text-lg">✓</span>
                  Joined
                </>
              ) : status === 'upcoming' && spotsLeft > 0 ? (
                <>
                  <span className="text-lg group-hover/btn:scale-110 transition-transform">🚀</span>
                  Join Tournament
                </>
              ) : status === 'ongoing' ? (
                <>
                  <span className="text-lg">👁️</span>
                  View Live
                </>
              ) : spotsLeft === 0 ? (
                'Full'
              ) : (
                'Ended'
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
