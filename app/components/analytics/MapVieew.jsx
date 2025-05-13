"use client";

import { useState, useCallback } from 'react';
import {
    APIProvider,
    Map,
    HeatmapLayer,
    Marker
  } from '@vis.gl/react-google-maps';
// Fix the import path to correctly reference the Mapmarker component
import CustomMapMarker from '../Mapmarker.jsx'; // One level up from /analytics

export default function MapView({
  googleMapsApiKey,
  geoLocations,
  isLoading,
  currentUser,
  dateRange,
  totalClicks,
  contactsCount,
  handleContactAdded,
  setActiveTab,
  setSearchTerm,
  fetchAnalyticsData
}) {
  const [updatedMarkers, setUpdatedMarkers] = useState({});
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Function to find the most recent location with contact info
  const getMostRecentLocation = useCallback(() => {
    const userLocations = geoLocations.filter(loc => loc.userId === currentUser?.uid);
   
    if (userLocations.length > 0) {
      // Sort by timestamp descending (newest first)
      userLocations.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
     
      return {
        lat: userLocations[0].lat,
        lng: userLocations[0].lng,
        isContact: userLocations[0].hasContactInfo || 
                  (updatedMarkers[userLocations[0].analyticsId] && 
                   updatedMarkers[userLocations[0].analyticsId].hasContactInfo)
      };
    }
   
    return null;
  }, [geoLocations, currentUser, updatedMarkers]);

  // Determine which marker should be initially opened
  const shouldOpenInfoWindow = useCallback((location, index, allLocations) => {
    if (allLocations.length === 0) return false;
    
    // Check if we have an updated status for this marker
    const hasUpdatedStatus = updatedMarkers[location.analyticsId];
    
    // Use the updated hasContactInfo value if available
    const hasContactInfo = hasUpdatedStatus 
      ? updatedMarkers[location.analyticsId].hasContactInfo 
      : location.hasContactInfo;
    
    // Check if there are any new markers (without contact info)
    const hasNewMarkers = allLocations.some(loc => {
      const updatedStatus = updatedMarkers[loc.analyticsId];
      return updatedStatus ? !updatedStatus.hasContactInfo : !loc.hasContactInfo;
    });
    
    // Most recent marker is the first in sorted array
    const mostRecentMarker = allLocations[0];
    
    // If this is the marker we just updated, always open it
    if (hasUpdatedStatus && updatedMarkers[location.analyticsId].justUpdated) {
      return true;
    }
    
    if (hasNewMarkers) {
      return !hasContactInfo && (allLocations.filter(l => !l.hasContactInfo).length === 1 || index === 0);
    } else {
      return location === mostRecentMarker;
    }
  }, [updatedMarkers]);

  // Enhanced contact added handler
  const handleMarkerContactAdded = useCallback((analyticsId, contactId, updatedClickData) => {
    setUpdatedMarkers(prev => ({
      ...prev,
      [analyticsId]: {
        hasContactInfo: true,
        contactId,
        justUpdated: true,
        ...updatedClickData
      }
    }));
    
    setTimeout(() => {
      setUpdatedMarkers(prev => ({
        ...prev,
        [analyticsId]: {
          ...prev[analyticsId],
          justUpdated: false
        }
      }));
    }, 3000);
    
    if (handleContactAdded) {
      handleContactAdded(analyticsId, contactId);
    }
  }, [handleContactAdded]);

  if (isLoading) {
    return (
      <div className="flex-1 py-2 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-themeGreen"></div>
        <p className="mt-4 text-gray-500">Loading analytics data...</p>
      </div>
    );
  }
  
  if (geoLocations.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-gray-500 bg-white rounded-lg">
        <p>No location data available for the selected period ({dateRange})</p>
        <button
          onClick={() => fetchAnalyticsData()}
          className="mt-4 px-4 py-2 bg-themeGreen text-white rounded-md hover:bg-opacity-90"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  // Prepare heatmap data
  const heatmapData = geoLocations
    .filter(loc => loc.userId === currentUser.uid)
    .map(loc => ({
      lat: loc.lat,
      lng: loc.lng,
      weight: 1
    }));

  return (
    <div className="w-full bg-white rounded-lg shadow mb-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Visitor Locations</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <span className="text-sm">Click</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span className="text-sm">Contact Added</span>
          </div>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1 text-sm rounded-md ${
              showHeatmap 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
          </button>
        </div>
      </div>
     
      <div className="h-[600px] relative rounded-lg overflow-hidden">
        <APIProvider apiKey={googleMapsApiKey}>
          <Map
            mapId="visitorLocationsMap"
            style={{ height: '100%', width: '100%' }}
            defaultCenter={getMostRecentLocation() || { lat: 0, lng: 0 }}
            defaultZoom={8}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
          >
            {/* Heatmap Layer */}
            {showHeatmap && (
              <HeatmapLayer 
                points={geoLocations
                  .filter(loc => loc.userId === currentUser.uid)
                  .map(loc => ({
                    lat: loc.lat,
                    lng: loc.lng,
                    weight: 1
                  }))}
                options={{
                  radius: 20,
                  opacity: 0.6,
                  gradient: [
                    'rgba(102, 255, 0, 0)',
                    'rgba(102, 255, 0, 1)',
                    'rgba(147, 255, 0, 1)',
                    'rgba(193, 255, 0, 1)',
                    'rgba(238, 255, 0, 1)',
                    'rgba(244, 227, 0, 1)',
                    'rgba(249, 198, 0, 1)',
                    'rgba(255, 170, 0, 1)',
                    'rgba(255, 113, 0, 1)',
                    'rgba(255, 57, 0, 1)',
                    'rgba(255, 0, 0, 1)'
                  ]
                }}
              />
            )}

            {/* Regular Markers */}
            {!showHeatmap && geoLocations
              .filter(loc => loc.userId === currentUser.uid)
              .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
              .map((loc, index) => {
                const hasUpdatedStatus = updatedMarkers[loc.analyticsId];
                const mergedData = hasUpdatedStatus
                  ? { ...loc, ...updatedMarkers[loc.analyticsId] }
                  : loc;

                return (
                  <CustomMapMarker
                    key={`${loc.analyticsId}-${index}`}
                    position={{ lat: loc.lat, lng: loc.lng }}
                    clickData={mergedData}
                    userId={currentUser.uid}
                    onContactAdded={handleMarkerContactAdded}
                    setActiveTab={setActiveTab}
                    setSearchTerm={setSearchTerm}
                    initialOpen={shouldOpenInfoWindow(loc, index, geoLocations)}
                    isNewestMarker={index === 0}
                    allMarkers={geoLocations}
                  />
                );
              })}
          </Map>
        </APIProvider>
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="text-gray-600">
          {`Showing ${geoLocations.filter(loc => loc.userId === currentUser.uid).length} visitor locations`}
        </div>
        <div className="text-gray-600">
          {contactsCount} contacts collected ({totalClicks > 0 ? Math.round((contactsCount / totalClicks) * 100) : 0}% conversion rate)
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 my-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-600"></div>
          <span>Link Click</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-600"></div>
          <span>Contact Added</span>
        </div>
        {showHeatmap && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ background: 'linear-gradient(to right, #66ff00, #ff0000)' }}></div>
            <span>Heatmap Intensity</span>
          </div>
        )}
      </div>
     
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">How to collect contact information:</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Click on any marker on the map to see visitor details</li>
          <li>Click Add Contact Info to open the contact form</li>
          <li>Fill in the contact details and click Save Contac</li>
          <li>View all collected contacts in the Contacts tab</li>
        </ol>
      </div>
    </div>
  );
}