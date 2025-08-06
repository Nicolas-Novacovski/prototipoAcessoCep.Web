import React, { useState, useRef, useCallback } from 'react';
import { IconFileText, IconUploadCloud, IconX, IconAlertTriangle } from '../../constants';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  requiredDocuments?: string[];
  acceptedFileTypes?: string;
  maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
    onFilesSelect, 
    requiredDocuments = [],
    acceptedFileTypes = "application/pdf",
    maxSizeMB = 10 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    const acceptedTypes = acceptedFileTypes.split(',').map(t => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      return `Arquivo "${file.name}" tem tipo inválido. Apenas PDFs são permitidos.`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Arquivo "${file.name}" excede o tamanho máximo de ${maxSizeMB}MB.`;
    }
    return null;
  }, [acceptedFileTypes, maxSizeMB]);

  const handleFiles = useCallback((files: File[]) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
            validFiles.push(file);
        }
      }
    });
    
    setErrors(newErrors);

    if (validFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedFiles);
      onFilesSelect(updatedFiles);
    }
  }, [selectedFiles, onFilesSelect, validateFile]);

  const removeFile = (fileToRemove: File) => {
    const updatedFiles = selectedFiles.filter(file => file !== fileToRemove);
    setSelectedFiles(updatedFiles);
    onFilesSelect(updatedFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
    // Reset the input value to allow selecting the same file again after removing it
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="space-y-4">
      {requiredDocuments.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-cep-text dark:text-white">Documentos Necessários</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2">
                {requiredDocuments.map(doc => <li key={doc}>{doc}</li>)}
            </ul>
          </div>
      )}
      <div 
        className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragging ? 'border-cep-primary bg-cep-primary/10' : 'border-gray-300 dark:border-gray-600 hover:border-cep-primary'}`}
        onClick={triggerFileSelect}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept={acceptedFileTypes}
        />
        <div className="flex flex-col items-center justify-center">
            <IconUploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-cep-primary">Clique para enviar</span> ou arraste e solte
            </p>
            <p className="text-xs text-gray-500 mt-1">PDF (MAX. {maxSizeMB}MB)</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center text-sm text-red-600 p-2 bg-red-50 rounded-md">
              <IconAlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div>
          <h5 className="font-medium text-sm dark:text-white">Arquivos selecionados:</h5>
          <ul className="mt-2 space-y-2 text-sm">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center text-cep-text dark:text-slate-200 bg-gray-50 dark:bg-slate-700 p-2 rounded-md border dark:border-slate-600">
                <IconFileText className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="flex-1 truncate" title={file.name}>{file.name}</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <button 
                  type="button"
                  onClick={() => removeFile(file)} 
                  className="ml-4 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                  aria-label={`Remover ${file.name}`}
                >
                  <IconX className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;