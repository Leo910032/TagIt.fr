"use client";

import { useState, useEffect } from 'react';
import { fireApp } from "@important/firebase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { testForActiveSession } from '@lib/authentication/testForActiveSession';

// Import refactored components
import {
  StatsOverview,
  TrafficOverTimeChart,
  TopLinksChart,
  LinkPerformanceTable,
  DeviceBreakdownChart,
  TopReferrersChart
} from "@components/analytics/DashboardComponents.jsx";
import MapView from '../../../../app/components/analytics/MapVieew.jsx';
import ExportSection from '../../../../app/components/analytics/ExportSection.jsx';
import ContactsList from '../../../../app/[userId]/components/ContactsList.jsx';

// Import custom hook with real-time listeners
import useRealTimeAnalytics from '../../../../app/hooks/useRealTimeAnlytics.js';

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const googleMapsApiKey = 'AIzaSyATAmD5lVb1jZe6pGoeZGF5OU-8-hrLeF4'; // Replace with your API key

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('week'); // Default to 'week'
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Check for authenticated user
  useEffect(() => {
    try {
      console.log("Checking for active session...");
      const userId = testForActiveSession();
      console.log("Session check result:", userId);
     
      if (userId) {
        console.log("User found from session:", userId);
        setCurrentUser({ uid: userId });
      } else {
        console.log("No user session found");
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setError("Authentication error. Please try logging in again.");
    }
  }, []);

  // Use the real-time analytics hook (with Firebase listeners instead of polling)
  const {
    totalClicks,
    linkPerformance,
    dailyClicks,
    deviceStats,
    topReferrers,
    topThreeLinks,
    geoLocations,
    contactsCount,
    isLoading,
    error: analyticsError,
    refreshData,
    handleContactAdded
  } = useRealTimeAnalytics(fireApp, currentUser, dateRange);

  // Set error from the hook if it exists
  useEffect(() => {
    if (analyticsError) {
      setError(analyticsError);
    }
  }, [analyticsError]);

  if (isLoading) {
    return (
      <div className="flex-1 py-2 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-themeGreen"></div>
        <p className="mt-4 text-gray-500">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 py-2 flex flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex-1 py-2 flex flex-col items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md">
          <p className="font-bold">Not Logged In</p>
          <p>You need to be logged in to view analytics data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-2 flex flex-col max-h-full overflow-y-auto px-4 md:px-8">
      <div className="mb-6">
        <h1 className="pt-6 text-2xl md:text-3xl font-bold mb-2">Analytics Dashboard</h1>
       
        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 mt-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'dashboard'
                ? 'text-themeGreen border-b-2 border-themeGreen'
                : 'text-gray-500 hover:text-themeGreen'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'map'
                ? 'text-themeGreen border-b-2 border-themeGreen'
                : 'text-gray-500 hover:text-themeGreen'
            }`}
            onClick={() => setActiveTab('map')}
          >
            Map View
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'contacts'
                ? 'text-themeGreen border-b-2 border-themeGreen'
                : 'text-gray-500 hover:text-themeGreen'
            }`}
            onClick={() => setActiveTab('contacts')}
          >
            Contacts
          </button>
        </div>
       
        {/* Date range selector - only show on Dashboard and Map tabs */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-md ${dateRange === 'week'
              ? 'bg-themeGreen text-white'
              : 'bg-gray-100 text-gray-700'}`}
          >
            Past Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-md ${dateRange === 'month'
              ? 'bg-themeGreen text-white'
              : 'bg-gray-100 text-gray-700'}`}
          >
            Past Month
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-4 py-2 rounded-md ${dateRange === 'year'
              ? 'bg-themeGreen text-white'
              : 'bg-gray-100 text-gray-700'}`}
          >
            Past Year
          </button>
        </div>
      </div>
     
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Overview stats */}
          <StatsOverview
            totalClicks={totalClicks}
            linkCount={linkPerformance.length}
            contactsCount={contactsCount}
            dateRange={dateRange}
          />
         
          {/* Traffic over time chart */}
          <TrafficOverTimeChart dailyClicks={dailyClicks} />
         
          {/* Top 3 Links Bar Chart */}
          <TopLinksChart topThreeLinks={topThreeLinks} />
         
          {/* Two column layout for desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Link performance */}
            <LinkPerformanceTable linkPerformance={linkPerformance} />
           
            {/* Device breakdown */}
            <DeviceBreakdownChart deviceStats={deviceStats} />
          </div>
         
          {/* Top referrers */}
          <TopReferrersChart topReferrers={topReferrers} />
        </>
      )}
     
      {/* Map View Tab */}
      {activeTab === 'map' && (
        <MapView
          googleMapsApiKey={googleMapsApiKey}
          geoLocations={geoLocations}
          isLoading={isLoading}
          currentUser={currentUser}
          dateRange={dateRange}
          totalClicks={totalClicks}
          contactsCount={contactsCount}
          handleContactAdded={handleContactAdded}
          setActiveTab={setActiveTab}
          setSearchTerm={setSearchTerm}
          fetchAnalyticsData={refreshData}
        />
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <ContactsList
          userId={currentUser.uid}
          dateRange={dateRange}
          initialSearchTerm={searchTerm}
        />
      )}

      {/* Export section - show on all tabs */}
      <ExportSection
        dateRange={dateRange}
        currentUser={currentUser}
        geoLocations={geoLocations}
        linkPerformance={linkPerformance}
        deviceStats={deviceStats}
        topReferrers={topReferrers}
        dailyClicks={dailyClicks}
        totalClicks={totalClicks}
        contactsCount={contactsCount}
      />
    </div>
  );
}