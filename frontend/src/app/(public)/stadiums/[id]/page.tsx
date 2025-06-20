'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MapPin, Clock, Banknote, Calendar, User, Users, AlertCircle } from 'lucide-react';
import { bookStadium, getStadiumById } from '@/lib/api/stadium';
import { Stadium } from '@/types/Stadium';
import { toast } from 'react-toastify';

export default function StadiumDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [stadium, setStadium] = useState<Stadium>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchStadium = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await getStadiumById(id);
        setStadium(response);
      } catch (err) {
        console.error("Error fetching stadium:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStadium();
  }, [id]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const getCalendarDataForDate = (date) => {
    if (!date || !stadium?.calendar) return null;

    const dateStr = formatDate(date);
    return stadium.calendar.find(cal => {
      const calDate = new Date(cal.date).toISOString().split('T')[0];
      return calDate === dateStr;
    });
  };

  const getDateStatus = (date) => {
    if (!date) return 'empty';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return 'past';

    const calendarData = getCalendarDataForDate(date);
    if (!calendarData) return 'no-data';

    const bookedSlots = calendarData.slots.filter(slot => slot.isBooked).length;
    const totalSlots = calendarData.slots.length;

    if (bookedSlots === 0) return 'available';
    if (bookedSlots === totalSlots) return 'fully-booked';
    return 'partially-booked';
  };

  const getAvailableSlots = (date) => {
    const calendarData = getCalendarDataForDate(date);
    if (!calendarData) return [];

    return calendarData.slots.filter(slot => !slot.isBooked);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleDateClick = (date) => {
    const status = getDateStatus(date);
    if (status === 'past' || status === 'fully-booked' || status === 'no-data') return;

    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) return;

    setBookingLoading(true);
    try {
      const matchDate = selectedDate.toISOString();
      const timeSlot = selectedSlot.startTime;

      const bookingResponse = await bookStadium(stadium._id, matchDate, timeSlot);
      if (!bookingResponse) {
        toast.error('Booking failed');
        return;
      }

      toast.success('Booking successful');

      // Refresh stadium to show updated calendar
      const response = await getStadiumById(id);
      setStadium(response);

      setSelectedDate(null);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };


  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const formatTime = (time) => {
    // Convert 24h format to 12h format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = getDaysInMonth(currentMonth);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><p className="text-lg">Loading...</p></div>;
  if (!stadium) return <div className="flex justify-center items-center min-h-screen"><p className="text-lg">Stadium not found.</p></div>;

  const imageUrl = stadium.photos?.[0]?.startsWith('http')
    ? stadium.photos[0]
    : `http://localhost:8080${stadium.photos?.[0]}`;

  return (
    <>
      {/* Header */}
      <div className="bg-white dark:bg-stone-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg bg-[#1a7b9b] hover:bg-[#1a7b9b]/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{stadium.name}</h1>
          </div>
          <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{stadium.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Owner: {stadium.ownerId.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Up to {stadium.maxPlayers} players</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stadium Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stadium Image */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={imageUrl}
                  alt={stadium.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-6">
                {/* Price and Hours */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Banknote className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Price per Match</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">{formatPrice(stadium.pricePerMatch)} LBP</p>
                    <p className="text-sm text-green-600">per 1.5-hour slot</p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Working Hours</span>
                    </div>
                    <p className="text-lg font-bold text-blue-700">
                      {formatTime(stadium.workingHours.start)} - {formatTime(stadium.workingHours.end)}
                    </p>
                    <p className="text-sm text-blue-600">Daily</p>
                  </div>
                </div>

                {/* Penalty Policy */}
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-800">Cancellation Policy</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Cancel at least {stadium.penaltyPolicy.hoursBefore} hours before your booking to avoid a {formatPrice(stadium.penaltyPolicy.penaltyAmount)} LBP penalty fee.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Book Your Slot</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-lg px-4">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-400 rounded" />
                    <span>Partially Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded" />
                    <span>Fully Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded" />
                    <span>Past/No Data</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-500 py-3">
                      {day}
                    </div>
                  ))}

                  {days.map((date, index) => {
                    if (!date) {
                      return <div key={index} className="h-12" />;
                    }

                    const status = getDateStatus(date);
                    const isSelected = selectedDate && formatDate(selectedDate) === formatDate(date);

                    let bgColor = '';
                    let isClickable = true;

                    switch (status) {
                      case 'available':
                        bgColor = 'bg-green-100 hover:bg-green-200 text-green-800';
                        break;
                      case 'partially-booked':
                        bgColor = 'bg-orange-100 hover:bg-orange-200 text-orange-800';
                        break;
                      case 'fully-booked':
                        bgColor = 'bg-red-100 text-red-600 cursor-not-allowed';
                        isClickable = false;
                        break;
                      case 'past':
                      case 'no-data':
                        bgColor = 'bg-gray-100 text-gray-400 cursor-not-allowed';
                        isClickable = false;
                        break;
                    }

                    if (isSelected) bgColor += ' ring-2 ring-[#1a7b9b]';

                    return (
                      <button
                        key={index}
                        onClick={() => isClickable && handleDateClick(date)}
                        disabled={!isClickable}
                        className={`h-12 rounded-lg text-sm font-medium transition-all ${bgColor}`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Available slots for {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      {getAvailableSlots(selectedDate).map((slot, index) => {
                        const isSelected = selectedSlot === slot;
                        const timeRange = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;

                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-4 rounded-lg text-sm font-medium transition-all border-2 ${isSelected
                              ? 'bg-[#1a7b9b] text-white border-[#1a7b9b]'
                              : 'bg-green-50 hover:bg-green-100 text-green-800 border-green-200 hover:border-green-300'
                              }`}
                          >
                            <div className="font-semibold">{timeRange}</div>
                            <div className="text-xs opacity-75 mt-1">1.5 hours</div>
                          </button>
                        );
                      })}
                    </div>

                    {getAvailableSlots(selectedDate).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No available slots for this date
                      </div>
                    )}

                    {/* Book Button */}
                    {selectedSlot && (
                      <div className="bg-blue-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">Booking Summary</h4>
                            <p className="text-gray-600">
                              {selectedDate.toLocaleDateString()} from {formatTime(selectedSlot.startTime)} to {formatTime(selectedSlot.endTime)}
                            </p>
                            <p className="font-semibold text-[#1a7b9b] mt-1">
                              {formatPrice(stadium.pricePerMatch)} LBP
                            </p>
                          </div>
                          <button
                            onClick={handleBooking}
                            disabled={bookingLoading}
                            className="bg-[#1a7b9b] hover:bg-[#1a7b9b]/80 text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                          >
                            {bookingLoading ? 'Booking...' : 'Book Now'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}