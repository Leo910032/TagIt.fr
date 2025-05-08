import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDocs
} from 'firebase/firestore';

/**
 * A custom hook that uses Firebase real-time listeners instead of polling
 * to efficiently get analytics data updates
 */
export default function useRealTimeAnalytics(fireApp, currentUser, dateRange) {
  const [totalClicks, setTotalClicks] = useState(0);
  const [linkPerformance, setLinkPerformance] = useState([]);
  const [dailyClicks, setDailyClicks] = useState([]);
  const [deviceStats, setDeviceStats] = useState({});
  const [topReferrers, setTopReferrers] = useState([]);
  const [topThreeLinks, setTopThreeLinks] = useState([]);
  const [geoLocations, setGeoLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contactsCount, setContactsCount] = useState(0);

  // Process analytics data from snapshot
  const processAnalyticsData = useCallback((querySnapshot) => {
    const today = new Date();
    const startDate = new Date();
   
    if (dateRange === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (dateRange === 'month') {
      startDate.setDate(today.getDate() - 30);
    } else if (dateRange === 'year') {
      startDate.setDate(today.getDate() - 365);
    } else {
      // If 'all', set a very old date to include everything
      startDate.setFullYear(2000);
    }
   
    const clicksData = [];
    const linkStats = {};
    const deviceData = { Mobile: 0, Desktop: 0, Tablet: 0 };
    const referrerData = {};
    const dailyData = {};
    const geoData = [];
   
    // Setup date range for daily data
    const date = new Date(startDate);
    while (date <= today) {
      const dateKey = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      dailyData[dateKey] = 0;
      date.setDate(date.getDate() + 1);
    }
   
    // Process each analytics document
    querySnapshot.forEach((doc) => {
      const data = doc.data();
     
      // Strict equality check to ensure this data belongs to the current user
      if (data.userId === currentUser.uid || data.userIdStr === String(currentUser.uid)) {
        if (data.timestamp?.toDate) {
          const clickDate = data.timestamp.toDate();
          if (dateRange === 'all' || (clickDate >= startDate && clickDate <= today)) {
            // Only add map points that have valid geo coordinates
            const lat = data.latitude ?? data.geoLocation?.latitude;
            const lng = data.longitude ?? data.geoLocation?.longitude;
           
            if (typeof lat === 'number' && typeof lng === 'number') {
              geoData.push({
                lat,
                lng,
                analyticsId: doc.id,
                linkId: data.linkId,
                linkTitle: data.linkTitle,
                timestamp: data.timestamp,
                country: data.country || data.countryName || 'Unknown',
                city: data.city || 'Unknown',
                deviceType: data.deviceType,
                hasContactInfo: data.hasContactInfo || false,
                userId: data.userId // Ensure userId is available for filtering
              });
            }

            // Process other analytics data
            clicksData.push(data);
           
            // Link stats
            if (data.linkId) {
              if (!linkStats[data.linkId]) {
                linkStats[data.linkId] = {
                  clicks: 0,
                  title: data.linkTitle || 'Untitled Link'
                };
              }
              linkStats[data.linkId].clicks++;
            }
           
            // Device stats
            if (data.deviceType) {
              deviceData[data.deviceType] = (deviceData[data.deviceType] || 0) + 1;
            }
           
            // Referrer stats
            const referrer = data.referrer || 'Direct';
            referrerData[referrer] = (referrerData[referrer] || 0) + 1;
           
            // Daily clicks
            const clickDateStr = clickDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
            dailyData[clickDateStr] = (dailyData[clickDateStr] || 0) + 1;
          }
        }
      }
    });
   
    setGeoLocations(geoData);
    setTotalClicks(clicksData.length);
   
    // Link performance
    const links = Object.entries(linkStats).map(([id, stats]) => ({
      id,
      title: stats.title,
      clicks: stats.clicks,
      conversionRate: clicksData.length > 0 ? stats.clicks / clicksData.length : 0
    }));
    setLinkPerformance(links);
   
    // Daily clicks chart data
    const dayLabels = Object.keys(dailyData);
    const dailyClicksData = Object.values(dailyData);
    setDailyClicks({
      labels: dayLabels,
      datasets: [{
        label: 'Daily Clicks',
        data: dailyClicksData,
        borderColor: '#8129D9',
        backgroundColor: 'rgba(129, 41, 217, 0.1)',
        fill: true,
        tension: 0.4
      }]
    });
   
    // Device stats chart data
    const totalDevices = Object.values(deviceData).reduce((a, b) => a + b, 0);
    const devicePercentages = totalDevices > 0 ?
      Object.entries(deviceData).reduce((acc, [device, count]) => {
        acc[device] = Math.round((count / totalDevices) * 100);
        return acc;
      }, {}) : { Mobile: 0, Desktop: 0, Tablet: 0 };
   
    setDeviceStats({
      labels: Object.keys(devicePercentages),
      datasets: [{
        data: Object.values(devicePercentages),
        backgroundColor: [
          'rgba(129, 41, 217, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)'
        ],
        borderColor: [
          'rgba(129, 41, 217, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }]
    });
   
    // Top referrers
    const referrers = Object.entries(referrerData)
      .map(([source, visits]) => ({ source, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);
   
    setTopReferrers(referrers);
   
    // Top 3 links
    const topLinks = links
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 3);
   
    setTopThreeLinks({
      labels: topLinks.map(link => link.title),
      datasets: [{
        label: 'Clicks',
        data: topLinks.map(link => link.clicks),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }]
    });
   
    setIsLoading(false);
  }, [currentUser, dateRange]);

  // Setup real-time listeners for analytics and contacts
  useEffect(() => {
    if (!currentUser?.uid || !fireApp) {
      setIsLoading(false);
      return () => {};
    }
   
    setIsLoading(true);
    setError(null);
   
    try {
      console.log("Setting up real-time listeners for user:", currentUser.uid);
     
      // Create query for analytics data
      const analyticsRef = collection(fireApp, "analytics");
      const analyticsQuery = query(
        analyticsRef,
        where("userId", "==", currentUser.uid)
      );
     
      // Create query for contacts data
      const contactsRef = collection(fireApp, "contacts");
      const contactsQuery = query(
        contactsRef,
        where("userId", "==", currentUser.uid)
      );
     
      // Set up real-time listener for analytics data
      const unsubscribeAnalytics = onSnapshot(
        analyticsQuery,
        (querySnapshot) => {
          console.log(`Received analytics update with ${querySnapshot.size} documents`);
          processAnalyticsData(querySnapshot);
        },
        (error) => {
          console.error("Error in analytics snapshot listener:", error);
          setError("Failed to listen for analytics updates. Please try again.");
          setIsLoading(false);
        }
      );
     
      // Set up real-time listener for contacts count
      const unsubscribeContacts = onSnapshot(
        contactsQuery,
        (querySnapshot) => {
          console.log(`Received contacts update with ${querySnapshot.size} documents`);
          setContactsCount(querySnapshot.size);
        },
        (error) => {
          console.error("Error in contacts snapshot listener:", error);
          // Don't set error - the analytics data is more important
        }
      );
     
      // Clean up listeners when component unmounts or dependencies change
      return () => {
        console.log("Cleaning up Firebase listeners");
        unsubscribeAnalytics();
        unsubscribeContacts();
      };
    } catch (error) {
      console.error("Error setting up listeners:", error);
      setError("Failed to set up data listeners. Please try again later.");
      setIsLoading(false);
      return () => {};
    }
  }, [fireApp, currentUser, dateRange, processAnalyticsData]);

  // Function to handle contact being added
  const handleContactAdded = useCallback((analyticsId, contactId) => {
    // Update the geoLocations state to reflect the new contact
    setGeoLocations(prevLocations =>
      prevLocations.map(loc =>
        loc.analyticsId === analyticsId
          ? { ...loc, hasContactInfo: true }
          : loc
      )
    );
   
    // Note: We don't need to update the contact count here
    // since the onSnapshot listener will handle that automatically
  }, []);

  // Manual refresh function for when needed
  const refreshData = useCallback(() => {
    setIsLoading(true);
    // Actual refresh will happen through the listeners
  }, []);

  return {
    totalClicks,
    linkPerformance,
    dailyClicks,
    deviceStats,
    topReferrers,
    topThreeLinks,
    geoLocations,
    contactsCount,
    isLoading,
    error,
    refreshData,
    handleContactAdded
  };
}