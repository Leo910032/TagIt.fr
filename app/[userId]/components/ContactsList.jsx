"use client";

import { useState, useEffect, useCallback } from 'react';
import { fireApp } from '@important/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import ContactEditForm from './ContactEditForm';
import ContactDetailPopup from './ContactDetailPopup';

export default function ContactsList({ userId, dateRange = 'all', initialSearchTerm = '' }) {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContactIds, setEditedContactIds] = useState(new Set());
  
  // Set search term when initialSearchTerm changes
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);
  
  // Scroll to contact list if there's an initial search term
  useEffect(() => {
    if (initialSearchTerm && !isLoading) {
      // Wait for component to render before scrolling
      setTimeout(() => {
        // Try to find the first matching contact and scroll to it
        const firstMatchingContact = document.querySelector('tr[data-matches-search="true"]');
        if (firstMatchingContact) {
          firstMatchingContact.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Add a temporary highlight effect
          firstMatchingContact.classList.add('bg-yellow-100');
          setTimeout(() => {
            firstMatchingContact.classList.remove('bg-yellow-100');
            firstMatchingContact.classList.add('bg-yellow-50');
            setTimeout(() => {
              firstMatchingContact.classList.remove('bg-yellow-50');
            }, 1500);
          }, 1000);
        }
      }, 500);
    }
  }, [initialSearchTerm, isLoading]);
  
  // Fetch contacts when userId or dateRange changes
  const fetchContacts = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    console.log("Fetching contacts with date range:", dateRange);
    
    try {
      const contactsRef = collection(fireApp, "contacts");
      // Fix for Firebase index issue - only filter by userId without ordering
      const q = query(
        contactsRef,
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const contactsData = [];
      
      // Calculate date range
      const today = new Date();
      const startDate = new Date();
      
      if (dateRange === 'week') {
        startDate.setDate(today.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setDate(today.getDate() - 30);
      } else if (dateRange === 'year') {
        startDate.setDate(today.getDate() - 365);
      } else {
        // If 'all' or any other value, set to a very old date
        startDate.setFullYear(2000);
      }
      
      console.log("Date filter:", {
        startDate: startDate.toISOString(),
        today: today.toISOString(),
        mode: dateRange
      });
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const contactDate = data.dateAdded?.toDate();
        
        // Only include contacts within the selected date range or if "all" is selected
        if (dateRange === 'all' || !contactDate || contactDate >= startDate) {
          contactsData.push({
            id: doc.id,
            ...data,
            // Convert timestamps to dates for easier handling
            dateAdded: contactDate,
            dateUpdated: data.dateUpdated?.toDate()
          });
        }
      });
      
      // Sort contacts by dateAdded in JavaScript instead of using orderBy in Firestore
      contactsData.sort((a, b) => {
        if (!a.dateAdded) return 1;
        if (!b.dateAdded) return -1;
        return b.dateAdded - a.dateAdded; // Descending order (newest first)
      });
      
      console.log(`Found ${contactsData.length} contacts in the selected date range (${dateRange})`);
      setContacts(contactsData);
      
      // Clear the edited contacts set after fetching
      setEditedContactIds(new Set());
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, dateRange]);
  
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);
  
  // Fetch a single contact by ID to get the latest data
  const fetchSingleContact = useCallback(async (contactId) => {
    if (!contactId) return null;
    
    try {
      const contactRef = doc(fireApp, "contacts", contactId);
      const contactDoc = await getDoc(contactRef);
      
      if (contactDoc.exists()) {
        const data = contactDoc.data();
        return {
          id: contactDoc.id,
          ...data,
          dateAdded: data.dateAdded?.toDate(),
          dateUpdated: data.dateUpdated?.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching single contact:", error);
      return null;
    }
  }, []);
  
  // Filter contacts based on status and search term
  const filteredContacts = contacts.filter(contact => {
    const matchesFilter = filter === 'all' || contact.status === filter;
    const matchesSearch = searchTerm === '' || 
      (contact.name && contact.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.notes && contact.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });
  
  // Helper to check if a contact matches the current search
  const doesMatchSearch = (contact) => {
    if (!searchTerm) return false;
    
    return (contact.name && contact.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.notes && contact.notes.toLowerCase().includes(searchTerm.toLowerCase()));
  };
  
  // Handle row click to view contact details or edit in edit mode
  const handleRowClick = async (contact) => {
    if (isEditMode) {
      setSelectedContact(contact);
      setIsEditFormOpen(true);
    } else {
      // If this contact was edited, fetch the latest data before showing details
      if (editedContactIds.has(contact.id)) {
        const updatedContact = await fetchSingleContact(contact.id);
        if (updatedContact) {
          setSelectedContact(updatedContact);
        } else {
          setSelectedContact(contact);
        }
      } else {
        setSelectedContact(contact);
      }
      setIsDetailPopupOpen(true);
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = async () => {
    // If we're turning off edit mode, refresh all edited contacts
    if (isEditMode && editedContactIds.size > 0) {
      // Full refresh is simplest - we refresh all contacts when exiting edit mode
      await fetchContacts();
    }
    
    setIsEditMode(!isEditMode);
  };
  
  // Handle contact update success
  const handleContactUpdated = (contactId) => {
    // Mark this contact as edited
    const newEditedContactIds = new Set(editedContactIds);
    newEditedContactIds.add(contactId);
    setEditedContactIds(newEditedContactIds);
    
    // Close the edit form
    setIsEditFormOpen(false);
  };
  
  // Handle closing the detail popup - refresh data if needed
  const handleDetailClose = async () => {
    setIsDetailPopupOpen(false);
    // We don't need to do anything special here since we're already refreshing
    // when toggling out of edit mode, and fetching fresh data when viewing contacts
  };
  
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-themeGreen"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-4 px-6 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  // Function to get period text for display
  const getPeriodText = () => {
    switch (dateRange) {
      case 'week': return 'the past week';
      case 'month': return 'the past month';
      case 'year': return 'the past year';
      default: return 'all time';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full max-w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Contacts</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing contacts from {getPeriodText()}
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeGreen focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2 w-full lg:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 lg:min-w-[180px] px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeGreen focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Contacts</option>
            <option value="lead">Leads</option>
            <option value="prospect">Prospects</option>
            <option value="customer">Customers</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button
            onClick={toggleEditMode}
            className={`px-4 py-2.5 rounded-lg transition-all ${
              isEditMode 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-themeGreen text-white hover:bg-opacity-90'
            }`}
          >
            {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
          </button>
        </div>
      </div>
      
      {/* Edit mode notification */}
      {isEditMode && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          <div>
            <span>Click on any contact to edit their information</span>
            {editedContactIds.size > 0 && (
              <p className="text-xs mt-1">
                {editedContactIds.size} contact{editedContactIds.size !== 1 ? 's' : ''} modified. Changes will be refreshed when you exit Edit Mode.
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* View mode notification */}
      {!isEditMode && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <span>Click on any contact to view detailed information</span>
        </div>
      )}
      
      {/* Display hint if we have an initial search term */}
      {initialSearchTerm && filteredContacts.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <span>Showing results for &quot;{initialSearchTerm}&quot;</span>
        </div>
      )}

      {/* Contacts Table - WIDER VERSION */}
      {filteredContacts.length === 0 ? (
        <div className="py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-700">
            {searchTerm || filter !== 'all' 
              ? "No matching contacts found" 
              : `No contacts for ${getPeriodText()}`}
          </h3>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
<thead className="bg-gray-50">
  <tr>
    <th scope="col" className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
      NAME
    </th>
    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
      EMAIL
    </th>
    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
      PHONE
    </th>
    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
      LOCATION
    </th>
    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
      STATUS
    </th>
    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
      DATE ADDED
    </th>
  </tr>
</thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr 
                key={contact.id} 
                className={`transition-colors cursor-pointer ${
                  editedContactIds.has(contact.id) ? 'bg-green-50 hover:bg-green-100' : 
                  isEditMode ? 'hover:bg-blue-50' : 'hover:bg-gray-50'
                } ${
                  doesMatchSearch(contact) ? 'transition-all duration-500' : ''
                }`}
                onClick={() => handleRowClick(contact)}
                data-matches-search={doesMatchSearch(contact) ? "true" : "false"}
              >
                  <td className="px-4 py-4 whitespace-normal">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-themeGreen/20 flex items-center justify-center text-themeGreen font-medium">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {contact.name}
                          {editedContactIds.has(contact.id) && (
                            <span className="ml-2 text-xs text-green-600">(edited)</span>
                          )}
                        </div>
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contact.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                            {contact.tags.length > 2 && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                +{contact.tags.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-[250px]">{contact.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{contact.phone || "-"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      contact.status === 'lead' ? 'bg-blue-100 text-blue-800' :
                      contact.status === 'prospect' ? 'bg-yellow-100 text-yellow-800' :
                      contact.status === 'customer' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-3 w-[12%]">
                    {contact.dateAdded ? (
                      <div className="flex flex-col items-start space-y-0.5">
                        <div className="text-sm text-gray-500">
                          {contact.dateAdded.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }).replace(/ /g, ' ')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">-</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
        <div className="text-sm text-gray-500">
          {contact.location ? 
            `${contact.location.city || ''}${contact.location.city && contact.location.country ? ', ' : ''}${contact.location.country || ''}` 
            : "-"
          }
        </div>
      </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Form Modal */}
      <ContactEditForm 
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        contact={selectedContact}
        onSuccess={handleContactUpdated}
      />
      
      {/* Contact Detail Popup */}
      <ContactDetailPopup
        isOpen={isDetailPopupOpen}
        onClose={handleDetailClose}
        contact={selectedContact}
      />
    </div>
  );
}