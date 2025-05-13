"use client";

import { useState } from 'react';
import { convertToCSV, loadJSZip, fetchContactsData } from '../../../app/dashboard/(dashboard pages)/utils/analytics/exportUtilits.js';

export default function ExportSection({
  dateRange,
  currentUser,
  geoLocations,
  linkPerformance,
  deviceStats,
  topReferrers,
  dailyClicks,
  totalClicks,
  contactsCount
}) {
  const [isExporting, setIsExporting] = useState(false);

  // Main export function
  const exportToCSV = async () => {
    // Show loading state
    setIsExporting(true);
 
    try {
      // Load JSZip if needed
      await loadJSZip();
   
      // Prepare analytics data for export
      const analyticsData = geoLocations.map(loc => {
        // Format timestamp if available
        const timestamp = loc.timestamp
          ? new Date(loc.timestamp.seconds * 1000).toISOString()
          : 'Unknown';
     
        return {
          "Date": timestamp,
          "Link": loc.linkTitle || 'Unknown',
          "Link ID": loc.linkId || 'Unknown',
          "Device": loc.deviceType || 'Unknown',
          "Country": loc.country || 'Unknown',
          "City": loc.city || 'Unknown',
          "Has Contact": loc.hasContactInfo ? 'Yes' : 'No',
          "Latitude": loc.lat,
          "Longitude": loc.lng,
          "Analytics ID": loc.analyticsId || 'Unknown'
        };
      });
   
      // Add link performance data
      const linkData = linkPerformance.map(link => {
        return {
          "Link ID": link.id || 'Unknown',
          "Link Title": link.title || 'Unknown',
          "Clicks": link.clicks,
          "Conversion Rate": `${(link.conversionRate * 100).toFixed(1)}%`
        };
      });
   
      // Device data for export
      const deviceData = [];
      if (deviceStats.labels && deviceStats.datasets && deviceStats.datasets[0].data) {
        deviceStats.labels.forEach((device, index) => {
          deviceData.push({
            "Device Type": device,
            "Percentage": `${deviceStats.datasets[0].data[index]}%`
          });
        });
      }
   
      // Referrer data for export
      const referrerData = topReferrers.map(referrer => {
        return {
          "Source": referrer.source,
          "Visits": referrer.visits
        };
      });
   
      // Daily clicks data
      const dailyData = [];
      if (dailyClicks && dailyClicks.labels && dailyClicks.datasets && dailyClicks.datasets[0].data) {
        dailyClicks.labels.forEach((day, index) => {
          dailyData.push({
            "Date": day,
            "Clicks": dailyClicks.datasets[0].data[index]
          });
        });
      }
   
      // Fetch contacts data
      const contactsData = await fetchContactsData(window.fireApp, currentUser.uid);
      const formattedContactsData = contactsData.map(contact => {
        return {
          "Name": contact.name || '',
          "Email": contact.email || '',
          "Phone": contact.phone || '',
          "Status": contact.status || '',
          "Notes": contact.notes || '',
          "Tags": contact.tags ? contact.tags.join(', ') : '',
          "Source": contact.source || '',
          "Date Added": contact.dateAdded || '',
          "Date Updated": contact.dateUpdated || '',
          "Country": contact.location?.country || '',
          "City": contact.location?.city || '',
          "Link ID": contact.linkId || '',
          "Analytics ID": contact.analyticsId || ''
        };
      });
   
      // Create a CSV string for each dataset
      const csvStrings = {
        analytics: convertToCSV(analyticsData),
        links: convertToCSV(linkData),
        devices: convertToCSV(deviceData),
        referrers: convertToCSV(referrerData),
        dailyClicks: convertToCSV(dailyData),
        contacts: convertToCSV(formattedContactsData)
      };
   
      // Create a zip file containing all CSVs
      const zip = new window.JSZip();
   
      // Add files to the zip
      zip.file("analytics_clicks.csv", csvStrings.analytics);
      zip.file("link_performance.csv", csvStrings.links);
      zip.file("device_breakdown.csv", csvStrings.devices);
      zip.file("referrer_sources.csv", csvStrings.referrers);
      zip.file("daily_clicks.csv", csvStrings.dailyClicks);
      zip.file("contacts.csv", csvStrings.contacts);
   
      // Add summary README file
      const readme = `Analytics Export - ${new Date().toLocaleString()}
User ID: ${currentUser.uid}
Date Range: ${dateRange}
Total Clicks: ${totalClicks}
Total Contacts: ${contactsCount}
Conversion Rate: ${contactsCount > 0 ? Math.round((contactsCount / totalClicks) * 100) : 0}%

Files included:
- analytics_clicks.csv: All click data with location information
- link_performance.csv: Performance metrics for each link
- device_breakdown.csv: Breakdown of device types used
- referrer_sources.csv: Traffic sources data
- daily_clicks.csv: Daily click statistics
- contacts.csv: Contact information collected

Generated on: ${new Date().toLocaleString()}
`;
   
      zip.file("README.txt", readme);
   
      // Generate the zip file
      zip.generateAsync({ type: "blob" }).then(function(content) {
        // Create download link
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(content);
        downloadLink.download = `analytics_export_${new Date().toISOString().split('T')[0]}.zip`;
     
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
     
        // Reset state
        setIsExporting(false);
      });
    } catch (error) {
      console.error("Export error:", error);
   
      // Alert the user
      alert(`Export failed: ${error.message}`);
   
      // Reset state
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Export Data</h2>
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
        <button
          id="export-csv-button"
          className="px-6 py-3 bg-themeGreen text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center"
          onClick={exportToCSV}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <span className="inline-block animate-spin mr-2 h-4 w-4 border-t-2 border-white rounded-full"></span>
              Generating CSV...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export as CSV
            </>
          )}
        </button>
      
      </div>
     
      {/* Export details */}
      <div className="mt-4 text-sm text-gray-600">
        <p>The export will include:</p>
        <ul className="list-disc list-inside mt-1 ml-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
          <li>Click analytics data</li>
          <li>Link performance</li>
          <li>Device breakdown</li>
          <li>Daily click statistics</li>
          <li>Referrer sources</li>
          <li>Contact information</li>
        </ul>
        <p className="mt-2">Data is exported based on the selected date range: <span className="font-medium">{dateRange === 'week' ? 'Past Week' : dateRange === 'month' ? 'Past Month' : dateRange === 'year' ? 'Past Year' : 'All Time'}</span></p>
      </div>
    </div>
  );
}
