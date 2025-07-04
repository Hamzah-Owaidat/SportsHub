import React from 'react';
import { Metadata } from 'next';
import { Calendar, TrendingUp } from 'lucide-react';
import EnhancedBookingsTable from '@/components/tables/EnhancedBookingsTable';

export const metadata: Metadata = {
  title: 'SportsHub | My Bookings',
  description: 'All my bookings',
};

export default function MyBookingsPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-stone-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-600 rounded-xl">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                My Bookings
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage and track all your stadium bookings
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>Real-time booking status updates</span>
                    </div>
                </div>

                <EnhancedBookingsTable />
            </div>
        </div>
    );
}
