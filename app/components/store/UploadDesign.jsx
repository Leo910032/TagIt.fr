import { useRef } from 'react';
import Image from 'next/image';
import { FiUpload, FiX } from 'react-icons/fi';

export default function UploadDesign({ uploadedLogo, uploadedDesign, onUpload }) {
  const logoUploadRef = useRef(null);
  const designUploadRef = useRef(null);

  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(type, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Upload Logo</h3>
        <div
          onClick={() => logoUploadRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          {uploadedLogo ? (
            <div className="relative inline-block">
              <Image
                src={uploadedLogo}
                alt="Uploaded logo"
                width={120}
                height={120}
                className="object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpload('logo', null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600">Click to upload your logo</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
            </div>
          )}
        </div>
        <input
          ref={logoUploadRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'logo')}
          className="hidden"
        />
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-3">Upload Full Design</h3>
        <div
          onClick={() => designUploadRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          {uploadedDesign ? (
            <div className="relative inline-block">
              <Image
                src={uploadedDesign}
                alt="Uploaded design"
                width={300}
                height={180}
                className="object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpload('design', null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600">Upload your complete design</p>
              <p className="text-xs text-gray-400 mt-1">AI, PSD, PNG, JPG up to 10MB</p>
            </div>
          )}
        </div>
        <input
          ref={designUploadRef}
          type="file"
          accept="image/*,.ai,.psd"
          onChange={(e) => handleImageUpload(e, 'design')}
          className="hidden"
        />
      </div>
    </div>
  );
}