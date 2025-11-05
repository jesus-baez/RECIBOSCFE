import type { BillingDataRow } from '../types';

const fileToDataForBackend = async (file: File): Promise<{ data: string, mimeType: string }> => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        resolve(window.btoa(binary));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return { data: await base64EncodedDataPromise, mimeType: file.type };
};

export const extractBillingTable = async (file: File): Promise<BillingDataRow[]> => {
  const fileData = await fileToDataForBackend(file);

  const response = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileData }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido al procesar la respuesta del servidor.' }));
    throw new Error(errorData.error || `La solicitud falló con el estado ${response.status}`);
  }

  const parsedData = await response.json();
  return parsedData as BillingDataRow[];
};
