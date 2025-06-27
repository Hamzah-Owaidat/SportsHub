'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, Loader2, AlertCircle } from 'lucide-react';
import { getAllTournaments, joinTournament } from '@/lib/api/tournaments';
import TournamentStats from '@/components/ui/tournaments/TournamentStats';
import TournamentFilters from '@/components/ui/tournaments/TournamentFilters';
import TournamentCard from '@/components/ui/tournaments/TournamentCard';
import { getTournamentStatus } from '@/lib/utils/utils';
import { useUser } from '@/context/UserContext';
import { toast } from 'react-toastify';


// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
  </div>
);

// Error Component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load tournaments</h3>
    <p className="text-gray-600 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);


// Main Tournaments Page Component
export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    maxEntryPrice: '',
    maxTeams: '',
    sortBy: 'newest'
  });

  const fetchTournaments = async () => {
    try {
      const response = await getAllTournaments();

      // Normalize tournament data
      const tournaments = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.tournaments || response.data?.results;

      if (!Array.isArray(tournaments)) {
        console.warn('Expected an array of tournaments but got:', tournaments);
        return [];
      }

      return tournaments;
    } catch (error) {
      console.error('Error fetching tournaments:', error);

      if (typeof error === 'object' && error !== null && 'response' in error) {
        // Server responded with a non-2xx status
        const err = error as { response: { status: number; data?: { message?: string } } };
        throw new Error(
          `Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`
        );
      } else if (typeof error === 'object' && error !== null && 'request' in error) {
        // Request made but no response
        throw new Error('Network error: No response received from server');
      } else {
        // Other unexpected errors
        throw new Error(`Unexpected error: ${(error as Error).message}`);
      }
    }
  };


  // Fetch tournaments on component mount
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTournaments();
        setTournaments(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch tournaments');
      } finally {
        setLoading(false);
      }
    };

    loadTournaments();
  }, []);

  // Retry function
  const handleRetry = () => {
    const loadTournaments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTournaments();
        setTournaments(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch tournaments');
      } finally {
        setLoading(false);
      }
    };

    loadTournaments();
  };

  // Filter and sort tournaments
  const filteredTournaments = useMemo(() => {
    // Ensure tournaments is an array before filtering
    if (!Array.isArray(tournaments)) {
      console.warn('Tournaments is not an array:', tournaments);
      return [];
    }

    let filtered = tournaments.filter(tournament => {
      // Ensure tournament object has required properties
      if (!tournament || typeof tournament !== 'object') {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          (tournament.name && tournament.name.toLowerCase().includes(searchLower)) ||
          (tournament.description && tournament.description.toLowerCase().includes(searchLower)) ||
          (tournament.createdBy?.username && tournament.createdBy.username.toLowerCase().includes(searchLower)) ||
          (tournament.stadiumId?.name && tournament.stadiumId.name.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status) {
        const status = getTournamentStatus(tournament.startDate, tournament.endDate);
        if (status !== filters.status) return false;
      }

      // Entry price filter
      if (filters.maxEntryPrice) {
        if (!tournament.entryPricePerTeam || tournament.entryPricePerTeam > parseInt(filters.maxEntryPrice)) return false;
      }

      // Max teams filter
      if (filters.maxTeams) {
        if (!tournament.maxTeams || tournament.maxTeams > parseInt(filters.maxTeams)) return false;
      }

      return true;
    });

    // Sort tournaments
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'startDate':
          return new Date(a.startDate || 0) - new Date(b.startDate || 0);
        case 'entryPrice':
          return (a.entryPricePerTeam || 0) - (b.entryPricePerTeam || 0);
        case 'rewardPrize':
          return (b.rewardPrize || 0) - (a.rewardPrize || 0);
        case 'newest':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return filtered;
  }, [tournaments, filters]);

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleJoinTournament = async (tournamentId) => {
    try {
      // Assume currentUserTeamId is available
      const teamId = user?.team;

      const response = await joinTournament({ tournamentId, teamId });

      // Optimistically update the tournament state
      setTournaments(prevTournaments =>
        prevTournaments.map(t => {
          if (t._id === tournamentId) {
            return {
              ...t,
              teams: [...(t.teams || []), { _id: teamId }] // Add team to teams array
            };
          }
          return t;
        })
      );

      toast.success(response.message);
    } catch (error) {
      toast.error('Failed to join tournament:', error.message);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Tournaments</h1>
        <p className="text-gray-600 dark:text-gray-400">Discover and join exciting tournaments in your area</p>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Error State */}
      {error && <ErrorMessage message={error} onRetry={handleRetry} />}

      {/* Content - Only show when not loading and no error */}
      {!loading && !error && (
        <>
          {/* Tournament Stats */}
          <TournamentStats tournaments={tournaments} />

          {/* Filters */}
          <TournamentFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
          />

          {/* Tournament Grid */}
          <div className="mb-6">
            <div className="flex justify-center items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tournament{filteredTournaments.length !== 1 ? 's' : ''} Found : {filteredTournaments.length}
              </h2>
            </div>

            {filteredTournaments.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">No tournaments found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTournaments.map(tournament => (
                  <TournamentCard
                    key={tournament._id}
                    tournament={tournament}
                    onJoin={handleJoinTournament}
                  />
                ))}

              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}