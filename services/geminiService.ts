
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const solveMonkeyBanana = async (state: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Solve the Monkey and Banana problem. 
    State: ${JSON.stringify(state)}. 
    Goal: The monkey needs to get the banana.
    Rules: 
    1. Monkey can only move to adjacent cells (up, down, left, right).
    2. Monkey can push a box if it is at the same position as the box and not on it.
    3. Monkey can climb onto a box if at the same position.
    4. Monkey can only grasp the banana if it is on a box and the box is directly under the banana.
    Return a sequence of steps.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING, description: "move | push | climb | grasp" },
                target: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } },
                boxId: { type: Type.STRING, nullable: true }
              },
              required: ["action"]
            }
          }
        },
        required: ["steps"]
      },
      thinkingConfig: { thinkingBudget: 1000 }
    }
  });

  return JSON.parse(response.text);
};

export const solveVacuumWorld = async (state: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Solve the Vacuum Cleaner World problem. 
    State: ${JSON.stringify(state)}. 
    Goal: Clean all dirty rooms.
    Rules:
    1. Vacuum can move to adjacent cells.
    2. Vacuum can 'suck' to clean a room.
    Return a sequence of steps.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING, description: "move | suck" },
                target: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } }
              },
              required: ["action"]
            }
          }
        },
        required: ["steps"]
      },
      thinkingConfig: { thinkingBudget: 1000 }
    }
  });

  return JSON.parse(response.text);
};
