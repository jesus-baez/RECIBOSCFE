import React, { useState, useCallback } from 'react';
import { UploadCloudIcon, FileIcon, XIcon } from './Icons';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, disabled = false }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const allFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(allFiles);
      onFilesSelected(allFiles);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const newFiles = Array.from(event.dataTransfer.files);
      const allFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(allFiles);
      onFilesSelected(allFiles);
      event.dataTransfer.clearData();
    }
  }, [selectedFiles, onFilesSelected, disabled]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const removeFile = (fileName: string) => {
    const updatedFiles = selectedFiles.filter(file => file.name !== fileName);
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-colors duration-300 ${
            disabled 
              ? 'border-slate-300 bg-slate-100 cursor-not-allowed' 
              : isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer'
        }`}
      >
        <UploadCloudIcon className={`w-12 h-12 mb-4 ${disabled ? 'text-slate-500' : 'text-slate-400'}`} />
        <p className={`text-lg ${disabled ? 'text-slate-500' : 'text-slate-600'}`}>
          <span className={`font-semibold ${disabled ? '' : 'text-blue-600'}`}>Haz clic para subir</span> o arrastra y suelta
        </p>
        <p className="text-sm text-slate-500">JPG, PNG o PDF</p>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-slate-700">Archivos seleccionados:</h3>
          <ul className="mt-2 space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-slate-100 p-2 rounded-md">
                <div className="flex items-center gap-2">
                  <FileIcon className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-800">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="p-1 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};