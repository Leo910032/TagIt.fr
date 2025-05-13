import { useState } from 'react';
import { FiX } from 'react-icons/fi';

export function SimpleColorPicker({ color, onChange, label, onClose }) {
  const [customColor, setCustomColor] = useState(color);
  
  const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#3b82f6', '#1e40af',
    '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#ec4899'
  ];

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 shadow-xl max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Choose {label} color</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        {/* Color Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Color (Hex)
          </label>
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="#000000"
          />
        </div>
        
        {/* Preset Colors */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preset Colors
          </label>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                onClick={() => setCustomColor(presetColor)}
                className={`w-8 h-8 rounded border-2 ${
                  customColor.toLowerCase() === presetColor.toLowerCase()
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200'
                }`}
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
        </div>
        
        {/* Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div
            className="w-full h-10 rounded border"
            style={{ backgroundColor: customColor }}
          />
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onChange(customColor);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}