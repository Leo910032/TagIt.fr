"use client";

import { useState, useEffect } from 'react';
import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import ContactForm from '../../app/[userId]/components/ContactForm.jsx';
import { fireApp } from '@important/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function CustomMapMarker({ 
  position,
  clickData,
  userId,
  onContactAdded,
  setActiveTab,
  setSearchTerm,
  initialOpen = false,
  isNewestMarker = false,
  allMarkers = []
}) {
  // Use the hasContactInfo property from clickData, which may be updated dynamically
  const [isContactInfo, setIsContactInfo] = useState(clickData.hasContactInfo || false);
  const [isInfoOpen, setIsInfoOpen] = useState(initialOpen);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  const router = useRouter();
  
  const belongsToCurrentUser = clickData.userId === userId;
  const hasContact = isContactInfo && belongsToCurrentUser;

  // Update local state if clickData's hasContactInfo changes
  useEffect(() => {
    if (clickData.hasContactInfo !== isContactInfo) {
      setIsContactInfo(clickData.hasContactInfo || false);
    }
  }, [clickData.hasContactInfo, isContactInfo]);

  // Set initial state for info window based on initialOpen prop
  useEffect(() => {
    if (initialOpen) {
      setIsInfoOpen(true);
    }
  }, [initialOpen]);

  // Fetch contact info when info window is opened for a marker with contact
  useEffect(() => {
    async function fetchContactInfo() {
      // Don't fetch if conditions aren't met
      if (!isInfoOpen || !hasContact || !clickData.analyticsId || !userId || !belongsToCurrentUser) {
        return;
      }
      
      setIsLoadingContact(true);
      try {
        const analyticsRef = doc(fireApp, "analytics", clickData.analyticsId);
        const analyticsDoc = await getDoc(analyticsRef);
        
        if (!analyticsDoc.exists() || analyticsDoc.data().userId !== userId) {
          console.warn("Attempted to access analytics that doesn't belong to current user");
          setIsLoadingContact(false);
          return;
        }
        
        if (analyticsDoc.data().contactId) {
          const contactId = analyticsDoc.data().contactId;
          const contactRef = doc(fireApp, "contacts", contactId);
          const contactDoc = await getDoc(contactRef);
          
          if (contactDoc.exists() && contactDoc.data().userId === userId) {
            setContactInfo(contactDoc.data());
            return;
          }
        }
        
        const contactsRef = collection(fireApp, "contacts");
        const q = query(
          contactsRef,
          where("analyticsId", "==", clickData.analyticsId),
          where("userId", "==", userId)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setContactInfo(querySnapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
      } finally {
        setIsLoadingContact(false);
      }
    }
    
    fetchContactInfo();
  }, [isInfoOpen, hasContact, clickData.analyticsId, userId, belongsToCurrentUser]);

  const handleViewInContacts = () => {
    if (!contactInfo || !contactInfo.name || !userId) return;
    
    if (contactInfo.userId !== userId) {
      return;
    }
    
    if (setActiveTab && setSearchTerm) {
      setSearchTerm(contactInfo.name);
      setActiveTab('contacts');
      setIsInfoOpen(false);
    } else {
      try {
        setIsInfoOpen(false);
        router.push(`/analytics?tab=contacts&search=${encodeURIComponent(contactInfo.name)}`);
      } catch (error) {
        console.error("Navigation error:", error);
      }
    }
  };

  // Handle contact form submission success
  const handleContactSuccess = (contactId, updatedClickData) => {
    // Update local state
    setIsContactInfo(true);
    
    // Auto-open the info window to show the newly created contact
    setIsInfoOpen(true);
    
    // Trigger the contact added callback with updated data
    if (onContactAdded) {
      onContactAdded(clickData.analyticsId, contactId, updatedClickData);
    }
  };

  // Skip rendering if the marker doesn't belong to current user
  if (!belongsToCurrentUser) {
    return null;
  }
  
  return (
    <>
      <AdvancedMarker
        position={position}
        title={`${clickData.city || ''}, ${clickData.country || ''}`}
        onClick={() => setIsInfoOpen(true)}
      >
        {/* Marker styling - different colors based on contact status */}
        <div className={`w-3 h-3 rounded-full ${hasContact ? 'bg-green-600' : 'bg-purple-600'}`}></div>
      </AdvancedMarker>
      
      {isInfoOpen && (
        <InfoWindow
          position={position}
          onCloseClick={() => setIsInfoOpen(false)}
          options={{
            pixelOffset: new window.google.maps.Size(0, -40),
            ariaLabel: "Visitor details"
          }}
        >
          <div className="p-4 min-w-[240px] bg-white rounded-lg shadow-md border border-gray-100">
            {/* Location Header */}
            <div className="flex items-center mb-3">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="font-semibold text-gray-800">
                {clickData.city || 'Unknown'}, {clickData.country || 'Unknown'}
              </h3>
            </div>

            {hasContact ? (
              isLoadingContact ? (
                <div className="py-4 flex justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-t-themeGreen border-gray-200 rounded-full"></div>
                </div>
              ) : contactInfo ? (
                <div className="space-y-3">
                  {/* Contact Card */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-center mb-2">
                      <span className="block w-2.5 h-2.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      <span className="text-sm font-semibold text-gray-700">Contact Information</span>
                    </div>
                    
                    <div className="pl-4 space-y-2">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-800">{contactInfo.name}</p>
                      </div>

                      {contactInfo.phone && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <p className="text-xs text-gray-600">{contactInfo.phone}</p>
                        </div>
                      )}

                      {contactInfo.email && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-600 truncate">{contactInfo.email}</p>
                        </div>
                      )}

                      {contactInfo.status && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            contactInfo.status === 'lead' ? 'bg-blue-100 text-blue-800' :
                            contactInfo.status === 'prospect' ? 'bg-yellow-100 text-yellow-800' :
                            contactInfo.status === 'customer' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {contactInfo.status.charAt(0).toUpperCase() + contactInfo.status.slice(1)}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={handleViewInContacts}
                        className="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs py-2 px-3 rounded-md transition-all flex items-center justify-center shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View in Contacts
                      </button>
                    </div>
                  </div>
                </div>
              ) : null
            ) : (
              <button
                onClick={() => {
                  setIsFormOpen(true);
                  setIsInfoOpen(false);
                }}
                className="w-full bg-gradient-to-r from-themeGreen to-green-500 hover:from-green-500 hover:to-green-600 text-white text-xs py-2 px-3 rounded-md transition-all flex items-center justify-center shadow-sm"
              >
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Contact Info
              </button>
            )}
          </div>
        </InfoWindow>
      )}
      
      <ContactForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        clickData={clickData}
        userId={userId}
        onSuccess={handleContactSuccess}
      />
    </>
  );
}