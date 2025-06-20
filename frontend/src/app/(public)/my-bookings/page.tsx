import React from 'react';
import BookingsTable from '@/components/tables/BookingsTable';

export default function MyBookingsPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold dark:text-white">My Bookings</h1>
            </div>
            <BookingsTable />
        </div>
    );
}
