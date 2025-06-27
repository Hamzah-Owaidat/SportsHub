'use client';
import { Search, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";

const TournamentFilters = ({ filters, onFiltersChange, onSearch }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="bg-gray-200 dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-4 mb-3">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search tournaments by name, description, or organizer..."
          className="w-full pl-10 pr-4 py-3 border border-stone-400 dark:border-stone-700 rounded-lg placeholder-gray-500 dark:text-white"
          value={filters.search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 hover:dark:text-white mb-4"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filters */}
      {isFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-5+00 dark:border-stone-700">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="w-full p-2 border border-stone-400 dark:border-stone-700 rounded-md dark:text-white/50 dark:bg-stone-800"
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Entry Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Max Entry Price</label>
            <select
              value={filters.maxEntryPrice}
              onChange={(e) => onFiltersChange({ ...filters, maxEntryPrice: e.target.value })}
              className="w-full p-2 border border-stone-400 dark:border-stone-700 rounded-md dark:text-white/50 dark:bg-stone-800"
            >
              <option value="">Any Price</option>
              <option value="1000000">Up to $1M</option>
              <option value="3000000">Up to $3M</option>
              <option value="5000000">Up to $5M</option>
              <option value="10000000">Up to $10M</option>
            </select>
          </div>

          {/* Team Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Max Teams</label>
            <select
              value={filters.maxTeams}
              onChange={(e) => onFiltersChange({ ...filters, maxTeams: e.target.value })}
              className="w-full p-2 border border-stone-400 dark:border-stone-700 rounded-md dark:text-white/50 dark:bg-stone-800"
            >
              <option value="">Any Size</option>
              <option value="8">Up to 8 teams</option>
              <option value="16">Up to 16 teams</option>
              <option value="32">Up to 32 teams</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
              className="w-full p-2 border border-stone-400 dark:border-stone-700 rounded-md dark:text-white/50 dark:bg-stone-800"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="startDate">Start Date</option>
              <option value="entryPrice">Entry Price</option>
              <option value="rewardPrize">Prize Pool</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentFilters;