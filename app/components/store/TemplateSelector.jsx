import { useState, useEffect } from 'react';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const PRESET_TEMPLATES = [
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    preview: '/api/placeholder/300/180',
    colors: {
      background: '#ffffff',
      text: '#000000',
      accent: '#3b82f6'
    }
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    preview: '/api/placeholder/300/180',
    colors: {
      background: '#000000',
      text: '#ffffff',
      accent: '#60a5fa'
    }
  },
  {
    id: 'gradient-blue',
    name: 'Blue Gradient',
    preview: '/api/placeholder/300/180',
    colors: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      text: '#ffffff',
      accent: '#93c5fd'
    }
  },
  {
    id: 'corporate',
    name: 'Corporate',
    preview: '/api/placeholder/300/180',
    colors: {
      background: '#f8fafc',
      text: '#1e293b',
      accent: '#059669'
    }
  },
  {
    id: 'eco-wood',
    name: 'Eco Wood',
    preview: '/api/placeholder/300/180',
    colors: {
      background: '#d2b48c',
      text: '#3e2723',
      accent: '#8b4513'
    }
  },
  {
    id: 'metal-silver',
    name: 'Metal Silver',
    preview: '/api/placeholder/300/180',
    colors: {
      background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
      text: '#212121',
      accent: '#1976d2'
    }
  }
];

export default function TemplateSelector({ selectedTemplate, onSelectTemplate }) {
  const [page, setPage] = useState(0);
  const templatesPerPage = 4;
  const totalPages = Math.ceil(PRESET_TEMPLATES.length / templatesPerPage);
  
  // Templates for current page
  const currentTemplates = PRESET_TEMPLATES.slice(
    page * templatesPerPage, 
    (page + 1) * templatesPerPage
  );
  
  // Create dynamic preview components for each template
  const renderTemplatePreview = (template) => {
    return (
      <div 
        className="aspect-[1.75/1] relative rounded-lg overflow-hidden"
        style={
          template.colors.background.includes('linear-gradient')
            ? { backgroundImage: template.colors.background }
            : { backgroundColor: template.colors.background }
        }
      >
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="w-10 h-4 bg-white/20 rounded"></div>
          </div>
          
          <div style={{ color: template.colors.text }}>
            <div className="w-16 h-4 rounded" style={{ backgroundColor: `${template.colors.text}30` }}></div>
            <div className="w-12 h-3 mt-1 rounded" style={{ backgroundColor: `${template.colors.text}20` }}></div>
            <div className="mt-1 text-xs" style={{ color: template.colors.accent }}>Sample Inc.</div>
            
            <div className="flex gap-1 mt-2 items-center">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: template.colors.accent }}></div>
              <div className="w-10 h-2 rounded" style={{ backgroundColor: `${template.colors.text}20` }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Choose a Template</h3>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className={`p-1 rounded ${
                page === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiChevronsLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className={`p-1 rounded ${
                page === totalPages - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {currentTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`border rounded-lg overflow-hidden transition-all ${
              selectedTemplate.id === template.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {renderTemplatePreview(template)}
            <div className="p-3 text-center">
              <span className="text-sm font-medium text-gray-900">
                {template.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}