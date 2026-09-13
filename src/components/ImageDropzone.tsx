'use client';

import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Search, Trash2 } from 'lucide-react';
import { PexelsImagePicker } from './PexelsImagePicker';

interface Props {
  name?: string;
  initialImageUrl?: string | null;
}

export function ImageDropzone({ name = "image", initialImageUrl }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [pexelsUrl, setPexelsUrl] = useState<string>('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImageUrl) {
      setPreview(initialImageUrl);
    }
  }, [initialImageUrl]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
      if (inputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(e.dataTransfer.files[0]);
        inputRef.current.files = dataTransfer.files;
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setPexelsUrl(''); // Reset pexels url if file is uploaded
  };

  const handlePexelsSelect = (url: string) => {
    setPreview(url);
    setPexelsUrl(url);
    // Clear file input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent clicking the dropzone
    setPreview(null);
    setPexelsUrl('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-colors cursor-pointer overflow-hidden ${dragActive ? 'border-[#e3372c] bg-red-50' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          ref={inputRef}
          type="file" 
          name={name}
          accept="image/*" 
          onChange={handleChange}
          className="hidden" 
        />
        
        {/* Hidden input for Pexels URL so it gets submitted with the form */}
        <input type="hidden" name="pexelsUrl" value={pexelsUrl} />

        {preview ? (
          <div className="w-full h-full relative group">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                type="button"
                onClick={handleClear}
                className="bg-white text-red-500 p-2 rounded-full hover:scale-110 active:scale-95 transition-transform"
                title="Görseli Kaldır"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-500 p-4 text-center">
            <UploadCloud className="w-6 h-6 mb-2 text-neutral-400" />
            <p className="text-xs font-medium mb-1">Görseli sürükleyin veya <span className="text-[#e3372c]">seçin</span></p>
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-[#e3372c] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
        >
          <Search className="w-4 h-4" />
          Pexels'te Ara
        </button>
      </div>

      <PexelsImagePicker 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onSelect={handlePexelsSelect} 
      />
    </div>
  );
}
