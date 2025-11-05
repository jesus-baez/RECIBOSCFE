import { GoogleGenAI, Type } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

// Define the structure of the incoming request body
interface RequestBody {
  fileData: {
    data: string; // base64 encoded string
    mimeType: string;
  };
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!process.env.API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "La variable de entorno API_KEY no está configurada." }) };
  }
  
  try {
    const body = JSON.parse(event.body || '{}') as RequestBody;
    const { fileData } = body;

    if (!fileData || !fileData.data || !fileData.mimeType) {
      return { statusCode: 400, body: JSON.stringify({ error: "Faltan datos del archivo en el cuerpo de la solicitud." }) };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = {
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType,
      },
    };

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

    const jsonText = response.text.trim();
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: jsonText,
    };

  } catch (error) {
    console.error("Error in Netlify function:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error al procesar el archivo. ${errorMessage}` }),
    };
  }
};

export { handler };
