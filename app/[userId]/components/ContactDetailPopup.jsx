"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ContactDetailPopup({ 
  isOpen, 
  onClose, 
  contact
}) {
  const [activeTab, setActiveTab] = useState('info');
  const [copySuccess, setCopySuccess] = useState('');
  
  // Reset copy success message after a delay
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);
  
  if (!isOpen || !contact) return null;
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Not available';
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Copy text to clipboard
  const copyToClipboard = (text, type = 'info') => {
    navigator.clipboard.writeText(text)
      .then(() => setCopySuccess(`${type} copied!`))
      .catch(err => setCopySuccess('Failed to copy'));
  };
  
  // Copy all contact info as vCard or text
  const copyAllInfo = () => {
    const info = `
Name: ${contact.name || 'N/A'}
Email: ${contact.email || 'N/A'}
Phone: ${contact.phone || 'N/A'}
Status: ${contact.status || 'N/A'}
Tags: ${contact.tags?.join(', ') || 'N/A'}
Date Added: ${contact.dateAdded ? formatDate(contact.dateAdded) : 'N/A'}
Source: ${contact.source || 'N/A'}
Location: ${contact.location?.city || 'Unknown'}, ${contact.location?.country || 'Unknown'}
Notes: ${contact.notes || 'N/A'}
    `.trim();
    
    copyToClipboard(info, 'Contact card');
  };
  
  // Handle email click
  const handleEmailClick = () => {
    if (contact.email) {
      window.open(`mailto:${contact.email}?subject=Hello ${contact.name}`);
    }
  };
  
  // Handle phone click
  const handlePhoneClick = () => {
    if (contact.phone) {
      window.open(`tel:${contact.phone}`);
    }
  };

  return (
<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
<div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-xl mt-10">
        {/* Header with name and close button */}
        <div className="relative h-48 bg-gradient-to-r from-themeGreen to-blue-500 rounded-t-xl">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-20 text-white rounded-full p-2 hover:bg-opacity-40 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="absolute -bottom-16 left-8">
            <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center text-themeGreen text-5xl font-bold shadow-lg border-4 border-white">
              {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
        </div>
        
        {/* Contact name and actions */}
        <div className="pt-20 px-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{contact.name}</h2>
              <p className="text-gray-500">{contact.email}</p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-2">
              {contact.email && (
                <button 
                  onClick={handleEmailClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </button>
              )}
              
              {contact.phone && (
                <button 
                  onClick={handlePhoneClick}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call
                </button>
              )}
              
              <button 
                onClick={copyAllInfo}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
          </div>
          
          {/* Status and tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {contact.status && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                contact.status === 'lead' ? 'bg-blue-100 text-blue-800' :
                contact.status === 'prospect' ? 'bg-yellow-100 text-yellow-800' :
                contact.status === 'customer' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
              </span>
            )}
            
            {contact.tags && contact.tags.map(tag => (
              <span 
                key={tag} 
                className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Success message for copying */}
          {copySuccess && (
            <div className="mt-2 text-sm text-green-600 font-medium animate-fade-in">
              {copySuccess}
            </div>
          )}
        </div>
        
        {/* Tabs navigation */}
        <div className="px-8 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 text-sm font-medium border-b-2 ${
                activeTab === 'info' 
                  ? 'border-themeGreen text-themeGreen' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contact Info
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 text-sm font-medium border-b-2 ${
                activeTab === 'activity' 
                  ? 'border-themeGreen text-themeGreen' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-4 text-sm font-medium border-b-2 ${
                activeTab === 'notes' 
                  ? 'border-themeGreen text-themeGreen' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notes
            </button>
          </div>
        </div>
        
        {/* Tab content */}
        <div className="p-8">
          {/* Contact Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Basic info section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <div className="mt-1 flex items-center">
                        <p className="text-sm text-gray-900">{contact.email || 'Not provided'}</p>
                        {contact.email && (
                          <button 
                            onClick={() => copyToClipboard(contact.email, 'Email')}
                            className="ml-2 text-gray-400 hover:text-gray-500"
                            aria-label="Copy email"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                      <div className="mt-1 flex items-center">
                        <p className="text-sm text-gray-900">{contact.phone || 'Not provided'}</p>
                        {contact.phone && (
                          <button 
                            onClick={() => copyToClipboard(contact.phone, 'Phone')}
                            className="ml-2 text-gray-400 hover:text-gray-500"
                            aria-label="Copy phone"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-500">Location</h4>
                      <div className="mt-1">
                        <p className="text-sm text-gray-900">
                          {contact.location ? `${contact.location.city || 'Unknown'}, ${contact.location.country || 'Unknown'}` : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-yellow-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-500">Source</h4>
                      <div className="mt-1">
                        <p className="text-sm text-gray-900">{contact.source || 'Not available'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Original analytics data section */}
              {contact.originalAnalytics && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Click Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Link</h4>
                        <p className="mt-1 text-sm text-gray-900">{contact.originalAnalytics.linkTitle || contact.linkTitle || 'Unknown link'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Device</h4>
                        <p className="mt-1 text-sm text-gray-900">{contact.originalAnalytics.deviceType || contact.deviceType || 'Unknown device'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Dates section */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Added</h4>
                    <p className="mt-1 text-sm text-gray-900">{contact.dateAdded ? formatDate(contact.dateAdded) : 'Not available'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                    <p className="mt-1 text-sm text-gray-900">{contact.dateUpdated ? formatDate(contact.dateUpdated) : 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h3>
              
              {/* Timeline */}
              <div className="flow-root">
                <ul className="-mb-8">
                  {/* Contact creation event */}
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">Contact created</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {contact.dateAdded ? formatDate(contact.dateAdded) : 'Unknown date'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  
                  {/* Last update event */}
                  {contact.dateUpdated && contact.dateUpdated.getTime() !== contact.dateAdded?.getTime() && (
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">Contact information updated</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {formatDate(contact.dateUpdated)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
          
          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              
              {contact.notes ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm">No notes available for this contact</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}