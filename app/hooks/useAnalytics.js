import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function useAnalytics(fireApp, currentUser, dateRange) {
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

  // Enhanced fetchAnalyticsData function with complete user isolation
  const fetchAnalyticsData = useCallback(async () => {
    if (!currentUser?.uid) {
      setIsLoading(false);
      return;
    }
   
    setIsLoading(true);
    try {
      console.log("Fetching analytics for user:", currentUser.uid);
      const analyticsRef = collection(fireApp, "analytics");
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
     
      // Log the date range for debugging
      console.log("Using date range:", {
        dateRange,
        startDate: startDate.toISOString(),
        today: today.toISOString()
      });
     
      // Clear existing data before fetching new data
      setGeoLocations([]);
      setTotalClicks(0);
      setContactsCount(0);
     
      // Query specifically for the current user's data only
      // This ensures we only fetch data belonging to this user
      const clicksQuery = query(
        analyticsRef,
        where("userId", "==", currentUser.uid)
      );
     
      const querySnapshot = await getDocs(clicksQuery);
      console.log("Query results:", querySnapshot.size, "documents");
     
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
     
      // Count contacts - fetch from contacts collection with strict userId
      let contactCount = 0;
      try {
        const contactsRef = collection(fireApp, "contacts");
        const contactsQuery = query(
          contactsRef,
          where("userId", "==", currentUser.uid)
        );
        const contactsSnapshot = await getDocs(contactsQuery);
        contactCount = contactsSnapshot.size;
      } catch (contactError) {
        console.error("Error fetching contact count:", contactError);
      }
     
      // Process each analytics document - only if it belongs to the current user
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
     
      console.log(`Processed ${geoData.length} map points belonging to user ${currentUser.uid}`);
      setGeoLocations(geoData);
      setTotalClicks(clicksData.length);
      setContactsCount(contactCount);
     
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
     
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, dateRange, fireApp]);

  useEffect(() => {
    if (currentUser) {
      console.log(`Fetching data for date range: ${dateRange}`);
      fetchAnalyticsData();
    } else {
      setIsLoading(false);
    }
  }, [fetchAnalyticsData, currentUser, dateRange]);

  // Function to handle the contact being added
  const handleContactAdded = (analyticsId, contactId) => {
    setGeoLocations(prevLocations =>
      prevLocations.map(loc =>
        loc.analyticsId === analyticsId
          ? { ...loc, hasContactInfo: true }
          : loc
      )
    );
   
    setContactsCount(prev => prev + 1);
  };

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
    fetchAnalyticsData,
    handleContactAdded
  };
}