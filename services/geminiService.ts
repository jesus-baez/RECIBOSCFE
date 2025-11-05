import { GoogleGenAI, Type } from "@google/genai";
import type { BillingDataRow } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        // Fallback for ArrayBuffer
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        resolve(window.btoa(binary));
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const extractBillingTable = async (file: File): Promise<BillingDataRow[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = await fileToGenerativePart(file);

  const prompt = `Analiza la imagen o documento y extrae la información de la tabla de facturación. La tabla debe contener las siguientes 6 columnas: "Periodo", "Demanda", "Consumo Total", "Factor de potencia", "Factor de Carga" y "Precio Medio". Ignora cualquier otra tabla o texto. Si la tabla no se encuentra, devuelve un arreglo vacío. Asegúrate de que los valores sean cadenas de texto. No incluyas unidades en los valores numéricos, solo el número.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: prompt },
        imagePart
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            'Periodo': { type: Type.STRING },
            'Demanda': { type: Type.STRING },
            'Consumo Total': { type: Type.STRING },
            'Factor de potencia': { type: Type.STRING },
            'Factor de Carga': { type: Type.STRING },
            'Precio Medio': { type: Type.STRING },
          },
          required: ['Periodo', 'Demanda', 'Consumo Total', 'Factor de potencia', 'Factor de Carga', 'Precio Medio'],
        },
      },
    }
  });

  try {
    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    return parsedData as BillingDataRow[];
  } catch (e) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("La respuesta del modelo no es un JSON válido.");
  }
};
