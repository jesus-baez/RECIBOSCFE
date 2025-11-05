import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultCard } from './components/ResultCard';
import { extractBillingTable } from './services/geminiService';
import type { ExtractedTable } from './types';
import { LogoIcon } from './components/Icons';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedTable[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<string, string>>({});

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setExtractedData([]);
    setErrorStates({});
    setLoadingStates({});
  };

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0) return;

    setExtractedData([]);
    setErrorStates({});
    const newLoadingStates: Record<string, boolean> = {};
    files.forEach(file => {
      newLoadingStates[file.name] = true;
    });
    setLoadingStates(newLoadingStates);

    const results: ExtractedTable[] = [];
    const errors: Record<string, string> = {};

    await Promise.all(
      files.map(async (file) => {
        try {
          const tableData = await extractBillingTable(file);
          if (tableData.length > 0) {
            results.push({ fileName: file.name, data: tableData });
          } else {
            errors[file.name] = 'No se encontró una tabla con el formato esperado en el archivo.';
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          errors[file.name] = `Error al procesar el archivo. ${error instanceof Error ? error.message : 'Error desconocido.'}`;
        }
      })
    );
    
    // Sort results to maintain a consistent order
    results.sort((a, b) => a.fileName.localeCompare(b.fileName));
    
    setExtractedData(results);
    setErrorStates(errors);
    setLoadingStates({});
  }, [files]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <LogoIcon className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Extractor de Tablas CFE
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sube tus facturas en formato JPG, PNG o PDF para extraer la tabla de facturación automáticamente.
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border border-slate-200">
          <FileUpload onFilesSelected={handleFilesSelected} />
          <div className="mt-6 text-center">
            <button
              onClick={handleAnalyze}
              disabled={files.length === 0 || Object.values(loadingStates).some(Boolean)}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {Object.values(loadingStates).some(Boolean) ? 'Analizando...' : 'Analizar Archivos'}
            </button>
          </div>
        </div>

        <div className="mt-12">
          {Object.keys(loadingStates).length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {files.map(file => (
                <div key={file.name}>
                  {loadingStates[file.name] && <ResultCard isLoading={true} fileName={file.name} />}
                  {errorStates[file.name] && <ResultCard error={errorStates[file.name]} fileName={file.name} />}
                </div>
              ))}
            </div>
          )}
          
          {extractedData.length > 0 && (
            <div className="grid grid-cols-1 gap-8">
                {extractedData.map((table) => (
                    <ResultCard
                        key={table.fileName}
                        fileName={table.fileName}
                        tableData={table.data}
                        isLoading={false}
                    />
                ))}
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
};

export default App;
