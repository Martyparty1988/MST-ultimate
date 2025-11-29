
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { db } from '../db';

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'createTimeRecord',
        description: 'Vytvoří časový záznam pro pracovníka.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                projectName: { type: Type.STRING, description: 'Název projektu.' },
                workerName: { type: Type.STRING, description: 'Jméno pracovníka.' },
                minutes: { type: Type.NUMBER, description: 'Počet odpracovaných minut.' },
                note: { type: Type.STRING, description: 'Poznámka k práci.' },
                taskUnits: { type: Type.NUMBER, description: 'Počet kusů pro úkolovou práci.' },
                taskUnitPriceCZK: { type: Type.NUMBER, description: 'Cena za kus pro úkolovou práci.' },
            },
            required: ['projectName', 'workerName'],
        },
    },
    {
        name: 'createTask',
        description: 'Vytvoří nový úkol.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: 'Název úkolu.' },
                projectName: { type: Type.STRING, description: 'Název projektu, ke kterému úkol patří (nepovinné).' },
                assigneeNames: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Jména přiřazených pracovníků.' },
                due: { type: Type.STRING, description: 'Termín dokončení (např. "zítra", "v pátek", "2024-12-31").' },
            },
            required: ['title'],
        },
    },
];

export const processCommand = async (command: string) => {
    if (!API_KEY) throw new Error("API key not configured.");
    
    const projects = await db.projects.toArray();
    const workers = await db.workers.toArray();

    // Use gemini-3-pro-preview for complex reasoning tasks
    const model = 'gemini-3-pro-preview';
    const result = await ai.models.generateContent({
        model: model,
        contents: `Kontext: Projekty: ${projects.map(p => p.name).join(', ')}. Pracovníci: ${workers.map(w => w.name).join(', ')}. Příkaz uživatele: "${command}"`,
        config: {
            tools: [{ functionDeclarations }],
        }
    });

    return result.functionCalls;
};

export const queryInsights = async (query: string) => {
    if (!API_KEY) throw new Error("API key not configured.");

    const [workers, projects, timeRecords, solarTables, tasks] = await Promise.all([
        db.workers.toArray(),
        db.projects.toArray(),
        db.timeRecords.toArray(),
        db.solarTables.toArray(),
        db.tasks.toArray(),
    ]);

    // Limit context size if necessary, for now we send raw data
    const dataContext = JSON.stringify({ workers, projects, timeRecords, solarTables, tasks });
    
    // Use gemini-3-pro-preview for deep analysis
    const model = 'gemini-3-pro-preview';

    const response = await ai.models.generateContent({
        model: model,
        contents: `Odpověz na otázku na základě poskytnutých dat. Buď stručný a přesný. Otázka: "${query}" Data: ${dataContext}`,
        config: {
            systemInstruction: "Jsi datový analytik pro firmu instalující solární panely. Odpovídej česky.",
        }
    });

    return response.text ?? 'Omlouvám se, ale nemohu vygenerovat odpověď.';
};

export const processFileForImport = async (file: File) => {
  if (!API_KEY) throw new Error("API key not configured.");

  const fileBytesBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
  
  // CORRECTED: Use 'gemini-2.5-flash' for multimodal understanding (text/image analysis).
  // 'gemini-2.5-flash-image' is for image GENERATION only and does not support responseSchema.
  const model = 'gemini-2.5-flash'; 
  
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { text: `Extrahuj data z tohoto dokumentu. Očekávám seznam pracovníků, projektů nebo solárních stolů. Vrať data v JSON formátu s klíči 'workers', 'projects', nebo 'solarTables'. Pro solarTables očekávám pole objektů s klíči 'baseNumber', 'type', 'x', 'y'. Normalizuj data. Například typ stolu může být 'small', 'medium', 'large' nebo 'unknown'.` },
        {
          inlineData: {
            mimeType: file.type,
            data: fileBytesBase64,
          },
        },
      ],
    },
     config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                workers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, rateHourlyCZK: {type: Type.NUMBER}, active: {type: Type.BOOLEAN} }}},
                projects: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, status: {type: Type.STRING}, site: {type: Type.STRING} }}},
                solarTables: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { baseNumber: {type: Type.NUMBER}, type: {type: Type.STRING}, x: {type: Type.NUMBER}, y: {type: Type.NUMBER} }}},
            }
        }
    }
  });

  const text = response.text ?? '';
  const cleanedJson = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanedJson || '{}');
};
