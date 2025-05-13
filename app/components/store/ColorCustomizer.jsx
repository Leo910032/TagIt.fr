import { SimpleColorPicker } from './SimpleColorPicker';

export default function ColorCustomizer({ colors, showColorPicker, colorPickerTarget, onOpenColorPicker, onColorChange, onCloseColorPicker }) {
  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-900">Color Scheme</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Color
          </label>
          <button
            onClick={() => onOpenColorPicker('background')}
            className="flex items-center gap-2 px-3 py-2 border rounded-md"
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
            onClick={() => onOpenColorPicker('text')}
            className="flex items-center gap-2 px-3 py-2 border rounded-md"
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
            onClick={() => onOpenColorPicker('accent')}
            className="flex items-center gap-2 px-3 py-2 border rounded-md"
          >
            <div
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: colors.accent }}
            ></div>
            <span>{colors.accent}</span>
          </button>
        </div>
      </div>

      {showColorPicker && (
        <SimpleColorPicker
          color={colors[colorPickerTarget]}
          onChange={onColorChange}
          label={colorPickerTarget}
          onClose={onCloseColorPicker}
        />
      )}
    </div>
  );
}