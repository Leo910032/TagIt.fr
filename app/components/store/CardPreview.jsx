import Image from 'next/image';
import { FiInfo } from 'react-icons/fi';

export default function CardPreview({ colors, uploadedDesign, uploadedLogo, cardInfo }) {
  return (
    <div className="sticky top-6">
      <div className="border rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white">
        <h3 className="font-medium text-gray-900 mb-4">Live Preview</h3>
        
        {/* Front of Card */}
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
  );
}