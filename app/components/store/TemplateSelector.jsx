import Image from 'next/image';

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
  }
];

export default function TemplateSelector({ selectedTemplate, onSelectTemplate }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Choose a Template</h3>
      <div className="grid grid-cols-2 gap-4">
        {PRESET_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`border rounded-lg overflow-hidden transition-all ${
              selectedTemplate.id === template.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-[1.75/1] relative">
              <Image
                src={template.preview}
                alt={template.name}
                fill
                className="object-cover"
              />
            </div>
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