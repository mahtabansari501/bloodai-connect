import Inventory from '../models/Inventory.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

export const handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
      return res.status(400).json({ error: 'Gemini API key is missing. Please configure it in .env' });
    }

    // Fetch real-time inventory to give context to the chatbot
    const inventory = await Inventory.find();
    const inventorySummary = inventory.map(item => `${item.name} (${item.resourceType}): ${item.quantity} ${item.unit}`).join(', ');

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const formattedHistory = history ? history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) : [];

    const systemPrompt = `You are an AI assistant named 'BloodAI Helper'. You help users navigate the BloodAI Connect platform. You answer questions about blood donation, medical emergencies, finding blood camps, and how to use this platform. Keep your answers concise, empathetic, and strictly related to medical, health, and blood donation domains. 
    IMPORTANT CONTEXT: The current hospital inventory is: ${inventorySummary || 'Empty/No data'}. Use this data if the user asks about stock, shortages, or current resources.`;

    const chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am BloodAI Helper. I have the current inventory data and will assist users concisely." }]
        },
        ...formattedHistory
      ]
    });

    const result = await chatSession.sendMessage(message);
    const response = result.response;
    
    res.json({ reply: response.text() });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
};
