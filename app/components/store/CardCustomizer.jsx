'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { FiArrowLeft, FiUpload, FiX, FiInfo, FiShoppingCart } from 'react-icons/fi';
import { SimpleColorPicker } from './SimpleColorPicker';

export default function CardCustomizer({ onBack, onSave, initialProduct }) {
  // State for customization
  const [colors, setColors] = useState({
    background: '#000000',
    text: '#ffffff',
    accent: '#60a5fa'
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState('');
  const [cardInfo, setCardInfo] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState('minimal-dark');
  
  // Refs for file uploads
  const logoInputRef = useRef(null);
  const designInputRef = useRef(null);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [uploadedDesign, setUploadedDesign] = useState(null);

  // Template options
  const TEMPLATES = [
    { id: 'minimal-light', name: 'Minimal Light' },
    { id: 'minimal-dark', name: 'Minimal Dark' },
    { id: 'blue-gradient', name: 'Blue Gradient' },
    { id: 'corporate', name: 'Corporate' },
  ];

  // Handle color picker
  const handleOpenColorPicker = (target) => {
    setColorPickerTarget(target);
    setShowColorPicker(true);
  };

  const handleColorChange = (color) => {
    setColors({
      ...colors,
      [colorPickerTarget]: color
    });
  };

  const handleCloseColorPicker = () => {
    setShowColorPicker(false);
  };

  // Handle template selection
  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    // Update colors based on template
    if (templateId === 'minimal-light') {
      setColors({
        background: '#ffffff',
        text: '#000000',
        accent: '#3b82f6'
      });
    } else if (templateId === 'minimal-dark') {
      setColors({
        background: '#000000',
        text: '#ffffff',
        accent: '#60a5fa'
      });
    } else if (templateId === 'blue-gradient') {
      setColors({
        background: '#1e3a8a',
        text: '#ffffff',
        accent: '#93c5fd'
      });
    } else if (templateId === 'corporate') {
      setColors({
        background: '#f8fafc',
        text: '#1e293b',
        accent: '#059669'
      });
    }
  };

  // Handle card info input
  const handleInfoChange = (field, value) => {
    setCardInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle image uploads
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDesignUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedDesign(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save action
  const handleSave = () => {
    if (typeof onSave === 'function') {
      onSave({
        colors,
        cardInfo,
        template: selectedTemplate,
        logo: uploadedLogo,
        design: uploadedDesign
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <FiArrowLeft className="mr-2" />
        Back to Products
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Customize Your Card</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column: Customization options (2/3 width on desktop) */}
        <div className="md:w-2/3 space-y-6">
          {/* Color Scheme */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">Color Scheme</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <button
                  onClick={() => handleOpenColorPicker('background')}
                  className="flex items-center gap-2 px-3 py-2 border rounded-md w-full"
                >
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: colors.background }}
                  ></div>
                  <span>{colors.background}</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <button
                  onClick={() => handleOpenColorPicker('text')}
                  className="flex items-center gap-2 px-3 py-2 border rounded-md w-full"
                >
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: colors.text }}
                  ></div>
                  <span>{colors.text}</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <button
                  onClick={() => handleOpenColorPicker('accent')}
                  className="flex items-center gap-2 px-3 py-2 border rounded-md w-full"
                >
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: colors.accent }}
                  ></div>
                  <span>{colors.accent}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">Choose a Template</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TEMPLATES.map(template => (
                <div 
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`border rounded-lg overflow-hidden cursor-pointer ${
                    selectedTemplate === template.id 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <span className="text-sm">{template.name}</span>
                  </div>
                  <div className="p-2 text-center">
                    <span className="text-xs font-medium">{template.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">Upload Logo</h3>
            
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              {uploadedLogo ? (
                <div className="relative">
                  <Image 
                    src={uploadedLogo}
                    alt="Uploaded logo"
                    width={120}
                    height={60}
                    className="object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedLogo(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <FiUpload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload your logo</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Upload Full Design */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">Upload Full Design</h3>
            
            <div 
              onClick={() => designInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              {uploadedDesign ? (
                <div className="relative">
                  <Image 
                    src={uploadedDesign}
                    alt="Uploaded design"
                    width={200}
                    height={120}
                    className="object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedDesign(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <FiUpload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Upload your complete design</p>
                  <p className="text-xs text-gray-400 mt-1">AI, PSD, PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
            <input
              ref={designInputRef}
              type="file"
              accept="image/*,.ai,.psd"
              onChange={handleDesignUpload}
              className="hidden"
            />
          </div>

          {/* Card Information */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">Card Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={cardInfo.name}
                  onChange={(e) => handleInfoChange('name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={cardInfo.title}
                  onChange={(e) => handleInfoChange('title', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={cardInfo.company}
                  onChange={(e) => handleInfoChange('company', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="TagIt.fr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={cardInfo.email}
                  onChange={(e) => handleInfoChange('email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="john@tagit.fr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={cardInfo.phone}
                  onChange={(e) => handleInfoChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={cardInfo.website}
                  onChange={(e) => handleInfoChange('website', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="https://tagit.fr/username"
                />
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
            >
              <FiShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <p className="text-center text-sm text-gray-500 mt-3">
              Your design will be saved automatically
            </p>
          </div>
        </div>

        {/* Right column: Live preview (1/3 width on desktop) */}
        <div className="md:w-1/3">
          <div className="sticky top-20">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">Live Preview</h3>
              
              {/* Front of Card Preview */}
              <div 
                className="aspect-[1.75/1] relative rounded-lg shadow-lg overflow-hidden mb-6"
                style={{ backgroundColor: colors.background }}
              >
                {uploadedDesign ? (
                  <Image
                    src={uploadedDesign}
                    alt="Card design"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    {/* Logo Area */}
                    <div className="flex justify-between items-start">
                      {uploadedLogo && (
                        <div className="relative w-20 h-8">
                          <Image
                            src={uploadedLogo}
                            alt="Logo"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Contact Info */}
                    <div style={{ color: colors.text }}>
                      {cardInfo.name && <h4 className="font-bold text-lg">{cardInfo.name}</h4>}
                      {cardInfo.title && <p className="text-sm opacity-90">{cardInfo.title}</p>}
                      {cardInfo.company && <p className="text-sm mt-1" style={{ color: colors.accent }}>{cardInfo.company}</p>}
                      
                      <div className="mt-3 text-xs space-y-0.5">
                        {cardInfo.email && <p>{cardInfo.email}</p>}
                        {cardInfo.phone && <p>{cardInfo.phone}</p>}
                        {cardInfo.website && <p>{cardInfo.website}</p>}
                      </div>
                    </div>
                    
                    {/* NFC Icon */}
                    <div className="absolute bottom-4 right-4">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-white/80 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Back of Card Preview */}
              <div 
                className="aspect-[1.75/1] relative rounded-lg shadow-lg overflow-hidden"
                style={{ backgroundColor: colors.background }}
              >
                <div 
                  className="absolute inset-0 p-6 flex items-center justify-center"
                  style={{ color: colors.text }}
                >
                  <div className="text-center">
                    <div 
                      className="w-32 h-32 mx-auto mb-4 border rounded"
                      style={{ borderColor: colors.accent }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm opacity-70">QR Code</span>
                      </div>
                    </div>
                    <p className="text-xs opacity-70">
                      Scan to view profile
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                <FiInfo className="w-3 h-3" />
                Cards are NFC enabled with fallback QR code
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <SimpleColorPicker
          color={colors[colorPickerTarget]}
          onChange={handleColorChange}
          label={colorPickerTarget}
          onClose={handleCloseColorPicker}
        />
      )}
    </div>
  );
}