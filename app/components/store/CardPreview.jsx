import { useState, useEffect } from 'react';
import DynamicCardRenderer from './DynamicCardRenderer';
import { FiInfo, FiRefreshCw } from 'react-icons/fi';

export default function CardPreview({ colors, uploadedDesign, uploadedLogo, cardInfo }) {
  const [backgroundStyle, setBackgroundStyle] = useState({});
  const [cardType, setCardType] = useState('standard');
  const [showFront, setShowFront] = useState(true);
  
  useEffect(() => {
    // Determine card type based on colors
    if (colors.background === '#d2b48c' || 
        colors.background === '#5c4033' || 
        colors.background === '#e4d4ab' || 
        colors.background === '#a14a37') {
      setCardType('eco');
    } else if (colors.background === '#c0c0c0' || 
        colors.background === '#36454f' || 
        colors.background === '#d4af37' || 
        colors.background === '#b76e79' ||
        colors.background === '#28282b') {
      setCardType('metal');
    } else {
      setCardType('standard');
    }
    
    // Handle background color or gradient
    if (colors.background && colors.background.includes('linear-gradient')) {
      setBackgroundStyle({ backgroundImage: colors.background });
    } else {
      setBackgroundStyle({ backgroundColor: colors.background });
    }
  }, [colors.background]);

  const toggleCardSide = () => {
    setShowFront(!showFront);
  };

  return (
    <div className="sticky top-6">
      <div className="border rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Live Preview</h3>
          <button 
            onClick={toggleCardSide}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <FiRefreshCw className="mr-1" />
            {showFront ? 'Show Back' : 'Show Front'}
          </button>
        </div>
        
        {/* Dynamic Card Preview */}
        <div 
          className="aspect-[1.75/1] relative rounded-lg shadow-lg overflow-hidden mb-6"
          style={backgroundStyle}
        >
          {uploadedDesign ? (
            <div className="absolute inset-0">
              {/* Background design */}
              <img
                src={uploadedDesign}
                alt="Card design"
                className="object-cover w-full h-full"
              />
              
              {/* Overlay content on top of the design */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                {uploadedLogo && showFront && (
                  <div className="flex justify-between items-start">
                    <div className="relative w-20 h-8">
                      <img
                        src={uploadedLogo}
                        alt="Logo"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                )}
                
                {showFront ? (
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
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="text-center" style={{ color: colors.text }}>
                      <div 
                        className="w-32 h-32 mx-auto mb-4 border rounded flex items-center justify-center"
                        style={{ borderColor: colors.accent }}
                      >
                        <span className="text-sm opacity-70">QR Code</span>
                      </div>
                      <p className="text-xs opacity-70">
                        Scan to view profile
                      </p>
                      
                      {cardInfo.company && (
                        <p className="mt-3 text-sm font-medium" style={{ color: colors.accent }}>
                          {cardInfo.company}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <DynamicCardRenderer
              cardType={cardType}
              colors={colors}
              cardInfo={cardInfo}
              uploadedLogo={uploadedLogo}
              side={showFront ? 'front' : 'back'}
              width={320}
              height={180}
            />
          )}
        </div>
        
        {/* Card Type Indicator */}
        <div className="mb-4 text-sm flex items-center justify-center">
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {cardType === 'eco' ? 'Eco Wood Card' : 
             cardType === 'metal' ? 'Premium Metal Card' : 
             'Standard PVC Card'}
          </span>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
          <FiInfo className="w-3 h-3" />
          Cards are NFC enabled with fallback QR code
        </div>
      </div>
    </div>
  );
}