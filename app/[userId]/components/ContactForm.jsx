"use client";

import { useState } from 'react';
import { fireApp } from '@important/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export default function ContactForm({ 
  isOpen, 
  onClose, 
  clickData, 
  userId,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    status: 'lead',
    tags: []
  });
  
  const [availableTags] = useState([
    'lead', 'customer', 'prospect', 'newsletter', 'marketing', 'sales'
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add a tag to the contact
  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput]
      }));
      setTagInput('');
    }
  };
  
  // Remove a tag from the contact
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Handle form submission with enhanced user data isolation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    if (!userId) {
      setError('User ID is missing. Please log in again.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (!clickData?.analyticsId) {
        throw new Error('Missing analytics reference');
      }
      
      // Create a new contact document
      const contactsCollection = collection(fireApp, "contacts");
      
      // Enhanced contact data with multiple userId formats for robust querying
      const contactData = {
        userId: userId,
        userIdStr: String(userId), // String version for equality checks
        userIdNum: Number(userId) || 0, // Numeric version if applicable
        linkId: clickData.linkId,
        analyticsId: clickData.analyticsId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
        source: "Map tracking",
        dateAdded: serverTimestamp(),
        dateUpdated: serverTimestamp(),
        status: formData.status,
        tags: formData.tags,
        location: {
          country: clickData.country || "Unknown",
          city: clickData.city || "Unknown",
          latitude: clickData.lat || clickData.latitude || 0,
          longitude: clickData.lng || clickData.longitude || 0
        },
        // Additional fields for better indexing and querying
        createdBy: userId,
        contactCreationDate: new Date().toISOString(),
        // Store the original analytics data for validation
        originalAnalytics: {
          userId: clickData.userId,
          linkId: clickData.linkId,
          linkTitle: clickData.linkTitle,
          deviceType: clickData.deviceType
        }
      };
      
      // Add the contact to Firestore
      const contactRef = await addDoc(contactsCollection, contactData);
      
      // Update the analytics document to indicate it has contact info
      const analyticsRef = doc(fireApp, "analytics", clickData.analyticsId);
      await updateDoc(analyticsRef, {
        hasContactInfo: true,
        contactId: contactRef.id,
        lastUpdatedBy: userId, // Track who last updated this
        lastUpdatedAt: serverTimestamp()
      });
      
      // Call success callback with the new contact ID and updated data
      if (onSuccess) {
        // Create an updated version of the clickData with hasContactInfo set to true
        const updatedClickData = {
          ...clickData,
          hasContactInfo: true,
          contactId: contactRef.id
        };
        
        onSuccess(contactRef.id, updatedClickData);
      }
      
      // Reset form data
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: '',
        status: 'lead',
        tags: []
      });
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error saving contact:", error);
      setError('Failed to save contact information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add Contact Information</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {clickData && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
              <p><strong>Location:</strong> {clickData.city}, {clickData.country}</p>
              <p><strong>Link clicked:</strong> {clickData.linkTitle}</p>
              <p><strong>Date:</strong> {new Date(clickData.timestamp.seconds * 1000).toLocaleString()}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeGreen"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeGreen"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeGreen"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeGreen"
              >
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="bg-themeGreen bg-opacity-20 text-themeGreen px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button 
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-themeGreen hover:text-red-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-themeGreen"
                  placeholder="Add a tag"
                  list="available-tags"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-themeGreen text-white px-4 py-2 rounded-r-md hover:bg-opacity-90"
                >
                  Add
                </button>
              </div>
              <datalist id="available-tags">
                {availableTags.map(tag => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeGreen"
                rows="3"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-themeGreen text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Contact'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}