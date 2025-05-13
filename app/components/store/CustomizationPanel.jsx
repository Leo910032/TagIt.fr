'use client';
// app/components/store/CustomizationPanel.jsx
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiUpload, FiX, FiCheck, FiEdit2, FiInfo, FiLoader } from 'react-icons/fi';
import { saveCardCustomization, getUserCardCustomizations } from './firebase-utils';
import { getCookieValue } from '@utils/auth-utils';
import { toast } from 'react-hot-toast';

export default function CustomizationPanel({ productType, onCustomizationChange }) {
  // State for customization options
  const [customization, setCustomization] = useState({
    cardColor: '',
    textColor: 'white',
    logo: '',
    logoPosition: 'center',
    contactInfo: {
      name: '',
      title: '',
      email: '',
      phone: '',
      website: ''
    },
    design: '',
    designTemplate: 'minimal',
    additionalText: ''
  });
  
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [designPreview, setDesignPreview] = useState('');
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [showSavedDesigns, setShowSavedDesigns] = useState(false);
  const logoInputRef = useRef(null);
  const designInputRef = useRef(null);

  // Color options based on product type
  const colorOptions = {
    'pvc-standard': [
      { name: 'Classic Black', value: '#000000' },
      { name: 'Pure White', value: '#ffffff' },
      { name: 'Deep Blue', value: '#003366' },
      { name: 'Forest Green', value: '#2e8b57' },
      { name: 'Burgundy Red', value: '#800020' }
    ],
    'wood-eco': [
      { name: 'Natural Bamboo', value: '#d2b48c' },
      { name: 'Dark Walnut', value: '#5c4033' },
      { name: 'Maple', value: '#e4d4ab' },
      { name: 'Cherry', value: '#a14a37' }
    ],
    'metal-premium': [
      { name: 'Silver', value: '#c0c0c0' },
      { name: 'Charcoal Black', value: '#36454f' },
      { name: 'Gold', value: '#d4af37' },
      { name: 'Rose Gold', value: '#b76e79' },
      { name: 'Matte Black', value: '#28282b' }
    ]
  };

  // Design templates
  const designTemplates = [
    { id: 'minimal', name: 'Minimal' },
    { id: 'corporate', name: 'Corporate' },
    { id: 'creative', name: 'Creative' },
    { id: 'custom', name: 'Custom Design' }
  ];

  useEffect(() => {
    // Set default color based on product type
    if (productType && colorOptions[productType]?.length > 0) {
      setCustomization(prev => ({
        ...prev,
        cardColor: colorOptions[productType][0].value
      }));
    }
    
    // Load user's saved designs
    loadSavedDesigns();
  }, [productType]);

  useEffect(() => {
    // Notify parent component of changes if the callback exists
    if (typeof onCustomizationChange === 'function') {
      onCustomizationChange(customization);
    }
  }, [customization, onCustomizationChange]);

  // Load saved designs from Firebase
  const loadSavedDesigns = async () => {
    const userId = getCookieValue('adminLinker');
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const designs = await getUserCardCustomizations(userId);
      setSavedDesigns(designs);
    } catch (error) {
      console.error('Error loading saved designs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCustomization(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCustomization(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('File size must be less than 5MB');
      return;
    }
   

    const reader = new FileReader();
    reader.onload = (e) => {
      const logoUrl = e.target.result;
      setLogoPreview(logoUrl);
      setCustomization(prev => ({
        ...prev,
        logo: logoUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDesignUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const designUrl = e.target.result;
      setDesignPreview(designUrl);
      setCustomization(prev => ({
        ...prev,
        design: designUrl,
        designTemplate: 'custom'
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview('');
    setCustomization(prev => ({
      ...prev,
      logo: ''
    }));
  };

  const removeDesign = () => {
    setDesignPreview('');
    setCustomization(prev => ({
      ...prev,
      design: '',
      designTemplate: 'minimal'
    }));
  };

  const saveCustomization = async () => {
    const userId = getCookieValue('adminLinker');
    if (!userId) {
      toast.error('Please log in to save your customization');
      return;
    }

    setIsSaving(true);
    try {
      const customizationId = await saveCardCustomization(userId, customization);
      toast.success('Design saved successfully!');
      await loadSavedDesigns(); // Reload saved designs
    } catch (error) {
      console.error('Error saving customization:', error);
      toast.error('Failed to save your design. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedDesign = (design) => {
    setCustomization({
      ...design,
      // Handle timestamp conversion if needed
      createdAt: design.createdAt ? design.createdAt : null,
      lastUpdated: design.lastUpdated ? design.lastUpdated : null
    });
    
    // Handle logo and design previews
    if (design.logo) {
      setLogoPreview(design.logo);
    } else {
      setLogoPreview('');
    }
    
    if (design.design) {
      setDesignPreview(design.design);
    } else {
      setDesignPreview('');
    }
    
    setShowSavedDesigns(false);
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  const toggleSavedDesigns = () => {
    setShowSavedDesigns(!showSavedDesigns);
    if (!showSavedDesigns) {
      loadSavedDesigns();
    }
  };

  // Determine text color based on background color for better contrast
  const getTextColorForBackground = (bgColor) => {
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return black or white text based on brightness
    return brightness > 125 ? 'black' : 'white';
  };

  // Format timestamp from Firestore
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    // Handle Firebase Timestamp objects
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // Handle server timestamps that come as objects
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="border rounded-lg p-6">
      <div className="flex justify-between mb-6">
        <h3 className="text-xl font-medium">Card Design Options</h3>
        <div className="flex space-x-3">
          <button
            onClick={toggleSavedDesigns}
            className="text-blue-600 flex items-center"
          >
            {isLoading ? (
              <FiLoader className="animate-spin" />
            ) : (
              <>
                <FiCheck className="mr-1" /> My Saved Designs
              </>
            )}
          </button>
          <button
            onClick={togglePreviewMode}
            className="text-blue-600 flex items-center"
          >
            {previewMode ? (
              <>
                <FiEdit2 className="mr-1" /> Edit Design
              </>
            ) : (
              <>
                <FiCheck className="mr-1" /> Preview Card
              </>
            )}
          </button>
        </div>
      </div>

      {/* Saved Designs Modal */}
      {showSavedDesigns && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Saved Designs</h2>
              <button
                onClick={() => setShowSavedDesigns(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <FiLoader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : savedDesigns.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {savedDesigns.map((design) => (
                  <div 
                    key={design.id} 
                    className="border rounded-lg overflow-hidden hover:shadow-md cursor-pointer"
                    onClick={() => loadSavedDesign(design)}
                  >
                    <div 
                      className="h-32 flex items-center justify-center p-3"
                      style={{ 
                        backgroundColor: design.cardColor || '#ffffff',
                        color: getTextColorForBackground(design.cardColor || '#ffffff')
                      }}
                    >
                      {design.logo ? (
                        <div className="w-12 h-12 relative">
                          <Image 
                            src={design.logo} 
                            alt="Logo" 
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="text-center">
                          {design.contactInfo?.name && (
                            <p className="font-bold text-sm truncate">{design.contactInfo.name}</p>
                          )}
                          {design.contactInfo?.email && (
                            <p className="text-xs truncate">{design.contactInfo.email}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-gray-50">
                      <p className="text-xs text-gray-500">Created: {formatDate(design.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No saved designs found.</p>
                <p className="text-sm text-gray-400 mt-2">Create and save your first design!</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSavedDesigns(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {previewMode ? (
        // Preview Mode - Show card preview
        <div className="bg-gray-100 p-6 rounded-lg">
          <div 
            className="w-full aspect-[1.6/1] rounded-lg overflow-hidden shadow-lg flex items-center justify-center relative"
            style={{ 
              backgroundColor: customization.cardColor,
              color: getTextColorForBackground(customization.cardColor)
            }}
          >
            {/* Card Design Background (if custom) */}
            {customization.design && (
              <div className="absolute inset-0">
                <Image 
                  src={designPreview || customization.design} 
                  alt="Card background"
                  fill
                  className="object-cover opacity-25"
                />
              </div>
            )}
            
            <div className="relative z-10 p-6 w-full">
              {/* Logo */}
              {customization.logo && (
                <div className={`flex justify-${customization.logoPosition} mb-4`}>
                  <div className="w-16 h-16 relative">
                    <Image 
                      src={logoPreview || customization.logo} 
                      alt="Company logo" 
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              
              {/* Contact Information */}
              <div className="text-center">
                {customization.contactInfo.name && (
                  <h3 className="text-xl font-bold">{customization.contactInfo.name}</h3>
                )}
                {customization.contactInfo.title && (
                  <p className="text-sm font-medium mt-1">{customization.contactInfo.title}</p>
                )}
                <div className="mt-3 text-sm">
                  {customization.contactInfo.email && (
                    <p className="mb-1">{customization.contactInfo.email}</p>
                  )}
                  {customization.contactInfo.phone && (
                    <p className="mb-1">{customization.contactInfo.phone}</p>
                  )}
                  {customization.contactInfo.website && (
                    <p>{customization.contactInfo.website}</p>
                  )}
                </div>
                
                {/* Additional Text */}
                {customization.additionalText && (
                  <p className="mt-3 text-xs italic">{customization.additionalText}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={togglePreviewMode}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
            >
              Back to Editor
            </button>
            <button
              onClick={saveCustomization}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              {isSaving ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Design'
              )}
            </button>
          </div>
        </div>
      ) : (
        // Edit Mode - Show customization options
        <div className="space-y-6">
          {/* Card Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {productType && colorOptions[productType]?.map((color) => (
                <div 
                  key={color.value}
                  className={`w-full aspect-square rounded-md cursor-pointer border-2 ${
                    customization.cardColor === color.value 
                      ? 'border-blue-500' 
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setCustomization({
                    ...customization,
                    cardColor: color.value,
                    textColor: getTextColorForBackground(color.value)
                  })}
                  title={color.name}
                >
                  {customization.cardColor === color.value && (
                    <div className="flex items-center justify-center h-full">
                      <FiCheck 
                        className={`text-${getTextColorForBackground(color.value) === 'black' ? 'black' : 'white'}`} 
                        size={20} 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {productType === 'wood-eco' 
                ? 'Choose the wood tone for your eco-friendly card' 
                : productType === 'metal-premium'
                  ? 'Choose the metal finish for your premium card'
                  : 'Choose the base color for your card'}
            </p>
          </div>
          
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            {logoPreview || customization.logo ? (
              <div className="relative w-full h-32 bg-gray-100 rounded-md flex items-center justify-center mb-2">
                <Image 
                  src={logoPreview || customization.logo} 
                  alt="Uploaded logo" 
                  width={100}
                  height={100}
                  className="max-h-24 object-contain"
                />
                <button
                  onClick={removeLogo}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => logoInputRef.current.click()}
                className="w-full h-32 bg-gray-100 rounded-md flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400"
              >
                <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload logo</span>
              </div>
            )}
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              className="hidden"
              accept="image/*"
            />
            
            {(logoPreview || customization.logo) && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Position
                </label>
                <div className="flex gap-3">
                  <button
                    className={`px-3 py-1 rounded text-sm ${
                      customization.logoPosition === 'left' 
                        ? 'bg-blue-600 text-white' 
                        : 'border border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setCustomization({...customization, logoPosition: 'left'})}
                  >
                    Left
                  </button>
                  <button
                    className={`px-3 py-1 rounded text-sm ${
                      customization.logoPosition === 'center' 
                        ? 'bg-blue-600 text-white' 
                        : 'border border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setCustomization({...customization, logoPosition: 'center'})}
                  >
                    Center
                  </button>
                  <button
                    className={`px-3 py-1 rounded text-sm ${
                      customization.logoPosition === 'right' 
                        ? 'bg-blue-600 text-white' 
                        : 'border border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setCustomization({...customization, logoPosition: 'right'})}
                  >
                    Right
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Contact Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="contactInfo.name"
                  value={customization.contactInfo.name || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Title / Position
                </label>
                <input
                  type="text"
                  name="contactInfo.title"
                  value={customization.contactInfo.title || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Job Title"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="contactInfo.email"
                  value={customization.contactInfo.email || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="contactInfo.phone"
                  value={customization.contactInfo.phone || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  name="contactInfo.website"
                  value={customization.contactInfo.website || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="www.example.com"
                />
              </div>
            </div>
          </div>
          
          {/* Design Templates */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Design Template
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {designTemplates.map((template) => (
                <div 
                  key={template.id}
                  className={`border rounded-md p-3 cursor-pointer text-center ${
                    customization.designTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setCustomization({
                    ...customization,
                    designTemplate: template.id
                  })}
                >
                  <div className="h-16 flex items-center justify-center mb-2">
                    {template.id === 'custom' ? (
                      designPreview || customization.design ? (
                        <Image
                          src={designPreview || customization.design}
                          alt="Custom design"
                          width={60}
                          height={40}
                          className="max-h-full object-contain"
                        />
                      ) : (
                        <FiUpload className="text-gray-400" size={24} />
                      )
                    ) : (
                      // Placeholder for built-in templates
                      <div 
                        className="w-full h-full rounded bg-gray-200 flex items-center justify-center"
                      >
                        <span className="text-xs">{template.name}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm">
                    {template.name}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Custom Design Upload */}
            {customization.designTemplate === 'custom' && (
              <div className="mt-4">
                {designPreview || customization.design ? (
                  <div className="relative w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                    <Image 
                      src={designPreview || customization.design} 
                      alt="Uploaded design" 
                      width={180}
                      height={100}
                      className="max-h-28 object-contain"
                    />
                    <button
                      onClick={removeDesign}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => designInputRef.current.click()}
                    className="w-full h-32 bg-gray-100 rounded-md flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400"
                  >
                    <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload Custom Design</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={designInputRef}
                  onChange={handleDesignUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            )}
          </div>
          
          
          {/* Additional Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Text
            </label>
            <textarea
              name="additionalText"
              value={customization.additionalText || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Any additional text you'd like on your card"
              rows={3}
              maxLength={100}
            />
            <p className="mt-1 text-xs text-gray-500">
              {(customization.additionalText || '').length}/100 characters
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex justify-between pt-4">
            <div className="flex items-start text-xs text-gray-500 max-w-xs">
              <FiInfo className="mr-1 mt-0.5 flex-shrink-0" />
              <p>
              Click &quot;Preview Card&quot; to see how your card will look. You can save your design after 
              previewing.
              </p>
            </div>
            <button
              onClick={togglePreviewMode}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Preview Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}