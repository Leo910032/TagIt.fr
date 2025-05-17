// app/components/store/DynamicCardRenderer.jsx
import { memo, useMemo } from 'react';

// This component is specifically for rendering card designs with the chosen colors
const DynamicCardRenderer = memo(function DynamicCardRenderer({ 
  cardType = 'standard', // standard, eco, metal
  colors, 
  cardInfo,
  uploadedLogo = null,
  side = 'front', // front or back
  width = 300, 
  height = 170 
}) {
  // Generate an SVG representation of the card based on card type and colors
  const svgContent = useMemo(() => {
    // Extract colors with fallbacks
    const bgColor = colors.background || '#ffffff';
    const textColor = colors.text || '#000000';
    const accentColor = colors.accent || '#3b82f6';
    
    // Create gradient definitions based on card type
    let gradientDefs = '';
    let backgroundFill = bgColor;
    
    // For gradient backgrounds
    if (bgColor.includes('linear-gradient')) {
      const gradientMatch = bgColor.match(/linear-gradient\(([^,]+),\s*([^)]+)\s*,\s*([^)]+)\)/);
      if (gradientMatch && gradientMatch.length >= 4) {
        const angle = gradientMatch[1];
        const startColor = gradientMatch[2].trim();
        const endColor = gradientMatch[3].trim();
        
        gradientDefs = `
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${startColor}" />
            <stop offset="100%" stop-color="${endColor}" />
          </linearGradient>
        `;
        backgroundFill = "url(#cardGradient)";
      }
    }
    
    // Texture pattern for eco/wood cards
    if (cardType === 'eco') {
      gradientDefs += `
        <pattern id="woodPattern" patternUnits="userSpaceOnUse" width="100" height="50" patternTransform="rotate(30)">
          <rect width="100%" height="100%" fill="${bgColor}" />
          <line x1="0" y1="0" x2="100" y2="0" stroke="${bgColor === '#ffffff' ? '#f0e6d2' : '#735c3d'}" stroke-width="50" stroke-opacity="0.2" />
        </pattern>
      `;
      backgroundFill = "url(#woodPattern)";
    }
    
    // Texture pattern for metal cards
    if (cardType === 'metal') {
      gradientDefs += `
        <filter id="metalTexture">
          <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="2" seed="10" />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
        <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgColor === '#ffffff' ? '#e0e0e0' : bgColor}" />
          <stop offset="50%" stop-color="${bgColor === '#ffffff' ? '#f5f5f5' : bgColor}" />
          <stop offset="100%" stop-color="${bgColor === '#ffffff' ? '#e0e0e0' : bgColor}" />
        </linearGradient>
      `;
      backgroundFill = "url(#metalGradient)";
    }
    
    // Front of card
    if (side === 'front') {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 320 180">
          <defs>
            ${gradientDefs}
          </defs>
          
          <!-- Card Background -->
          <rect x="0" y="0" width="320" height="180" rx="10" ry="10" fill="${backgroundFill}" />
          
          <!-- Card Content -->
          <g fill="${textColor}">
            ${cardInfo.name ? `<text x="20" y="120" font-family="Arial" font-size="16" font-weight="bold">${cardInfo.name}</text>` : ''}
            ${cardInfo.title ? `<text x="20" y="140" font-family="Arial" font-size="12">${cardInfo.title}</text>` : ''}
            ${cardInfo.company ? `<text x="20" y="160" font-family="Arial" font-size="12" fill="${accentColor}">${cardInfo.company}</text>` : ''}
            
            <!-- Contact Info -->
            ${cardInfo.email ? `<text x="320" y="120" font-family="Arial" font-size="10" text-anchor="end">${cardInfo.email}</text>` : ''}
            ${cardInfo.phone ? `<text x="320" y="140" font-family="Arial" font-size="10" text-anchor="end">${cardInfo.phone}</text>` : ''}
            ${cardInfo.website ? `<text x="320" y="160" font-family="Arial" font-size="10" text-anchor="end">${cardInfo.website}</text>` : ''}
          </g>
          
          <!-- NFC Indicator -->
          <circle cx="280" cy="30" r="15" fill-opacity="0.2" fill="${textColor}" />
          <circle cx="280" cy="30" r="8" fill-opacity="0.6" fill="${textColor}" />
          
          <!-- Card Type Indicator -->
          ${cardType === 'eco' ? 
            `<path d="M30,30 L40,20 L50,30 L40,40 Z" fill="${accentColor}" opacity="0.7" />
             <path d="M35,35 L45,25 L55,35 L45,45 Z" fill="${accentColor}" opacity="0.5" />` 
            : ''}
          ${cardType === 'metal' ? 
            `<circle cx="40" cy="30" r="12" fill="none" stroke="${accentColor}" stroke-width="2" />
             <circle cx="40" cy="30" r="8" fill="none" stroke="${accentColor}" stroke-width="1.5" />
             <circle cx="40" cy="30" r="4" fill="${accentColor}" />` 
            : ''}
        </svg>
      `;
    }
    
    // Back of card with QR code
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 320 180">
        <defs>
          ${gradientDefs}
        </defs>
        
        <!-- Card Background -->
        <rect x="0" y="0" width="320" height="180" rx="10" ry="10" fill="${backgroundFill}" />
        
        <!-- QR Code placeholder -->
        <rect x="110" y="30" width="100" height="100" rx="5" ry="5" fill="none" stroke="${textColor}" stroke-width="2" />
        
        <!-- QR Code pattern -->
        <rect x="125" y="45" width="15" height="15" fill="${textColor}" />
        <rect x="145" y="45" width="15" height="15" fill="${textColor}" />
        <rect x="165" y="45" width="15" height="15" fill="${textColor}" />
        
        <rect x="125" y="65" width="15" height="15" fill="${textColor}" />
        <rect x="145" y="65" width="15" height="15" fill="${accentColor}" />
        <rect x="165" y="65" width="15" height="15" fill="${textColor}" />
        
        <rect x="125" y="85" width="15" height="15" fill="${textColor}" />
        <rect x="145" y="85" width="15" height="15" fill="${textColor}" />
        <rect x="165" y="85" width="15" height="15" fill="${textColor}" />
        
        <!-- Scan text -->
        <text x="160" y="150" font-family="Arial" font-size="12" text-anchor="middle" fill="${textColor}">Scan to view profile</text>
        
        ${cardInfo.company ? 
          `<text x="160" y="170" font-family="Arial" font-size="10" text-anchor="middle" font-weight="bold" fill="${accentColor}">${cardInfo.company}</text>` 
          : ''}
      </svg>
    `;
  }, [cardType, colors, cardInfo, side, width, height]);
  
      // Convert the SVG to a data URL
  const svgDataUrl = useMemo(() => {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  }, [svgContent]);
  
  return (
    <div className="relative w-full h-full">
      <img 
        src={svgDataUrl} 
        alt={`Card ${side} preview`} 
        className="w-full h-full object-contain rounded-lg"
      />
      
      {/* If there's an uploaded logo, display it on top */}
      {uploadedLogo && side === 'front' && (
        <div className="absolute top-4 left-4 w-16 h-8">
          <img 
            src={uploadedLogo} 
            alt="Company logo" 
            className="object-contain w-full h-full"
          />
        </div>
      )}
    </div>
  );
});

export default DynamicCardRenderer;