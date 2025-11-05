import React, { useState } from 'react';
import type { BillingDataRow } from '../types';
import { CopyIcon, DownloadIcon, CheckIcon, AlertTriangleIcon, FileIcon } from './Icons';

interface ResultCardProps {
  fileName: string;
  tableData?: BillingDataRow[];
  isLoading?: boolean;
  error?: string;
}

const formatDataToCSV = (data: BillingDataRow[]): string => {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => `"${row[header as keyof BillingDataRow]}"`).join(',')
    )
  ];
  return csvRows.join('\n');
};

const TableComponent: React.FC<{ data: BillingDataRow[] }> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-slate-500">No hay datos para mostrar.</p>;
    }
    const headers = Object.keys(data[0]);
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                    <tr>
                        {headers.map(header => (
                            <th key={header} scope="col" className="px-4 py-3">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="bg-white border-b hover:bg-slate-50">
                            {headers.map(header => (
                                <td key={`${rowIndex}-${header}`} className="px-4 py-3 text-slate-800">
                                    {row[header as keyof BillingDataRow]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const ResultCard: React.FC<ResultCardProps> = ({ fileName, tableData, isLoading, error }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!tableData) return;
    const csvData = formatDataToCSV(tableData);
    navigator.clipboard.writeText(csvData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExport = () => {
    if (!tableData) return;
    const csvData = formatDataToCSV(tableData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-s¡-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const csvFileName = fileName.substring(0, fileName.lastIndexOf('.')) + '.csv';
    link.setAttribute('download', csvFileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Extrayendo datos...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center text-red-600 bg-red-50 rounded-lg p-4">
            <AlertTriangleIcon className="w-12 h-12 mb-2"/>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
        </div>
      );
    }
    if (tableData) {
      return (
        <>
            <div className="p-4 bg-white rounded-lg shadow-inner border border-slate-200">
                <TableComponent data={tableData} />
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 px-4">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
              >
                {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <CopyIcon className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <DownloadIcon className="w-4 h-4" />
                Exportar a CSV
              </button>
            </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-50 rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-4 bg-white border-b border-slate-200">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileIcon className="w-5 h-5 text-blue-600" />
                {fileName}
            </h3>
        </div>
        <div className="p-2 sm:p-4">
            {renderContent()}
        </div>
    </div>
  );
};
