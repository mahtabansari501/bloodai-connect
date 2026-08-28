import Inventory from '../models/Inventory.js';
import SOSAlert from '../models/SOSAlert.js';
import User from '../models/User.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

export const getInventoryPrediction = async (req, res) => {
  let summary = {};
  try {
    const inventory = await Inventory.find();
    const activeSosAlerts = await SOSAlert.find({ status: 'active' });
    
    // Group inventory by name and calculate total quantity
    inventory.forEach(item => {
      const typeName = `${item.name} (${item.resourceType})`;
      if (!summary[typeName]) summary[typeName] = 0;
      summary[typeName] += item.quantity;
    });

    const inventoryText = Object.entries(summary)
      .map(([name, qty]) => `${name}: ${qty}`)
      .join(', ');

    const sosText = activeSosAlerts.length > 0 
      ? activeSosAlerts.map(alert => `- Need ${alert.resourceType}: ${alert.details} (Urgency: ${alert.urgency})`).join('\n')
      : 'No active SOS alerts. Demand is currently zero.';

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
      return res.json({ 
        status: "Warning",
        shortages: ["API Key missing"],
        recommendation: "Please add a valid GEMINI_API_KEY in the .env file for AI insights." 
      });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const prompt = `You are a medical AI analyst. 
    Analyze this hospital network's current SUPPLY (Inventory): 
    ${inventoryText || 'Empty'}

    Analyze the current DEMAND (Active SOS Emergency Alerts):
    ${sosText}

    Determine if there is a shortage. A shortage ONLY occurs if the demand for a specific item exceeds its supply, OR if the supply of a critical life-saving resource (like blood) is dangerously low (e.g. 0). If supply is sufficient to meet the demand, do not flag it as a shortage.
    
    Respond matching this exact JSON schema:
    {
      "status": "String (e.g. Critical, Stable, Warning)",
      "shortages": ["Array of items that are actually short based on supply vs demand"],
      "recommendation": "String (1-2 sentences of actionable advice)"
    }`;
    
    const result = await model.generateContent(prompt);
    const jsonResponse = JSON.parse(result.response.text());
    res.json(jsonResponse);
  } catch (error) {
    console.error("AI Error:", error.message);
    res.json({ 
      status: "Error",
      shortages: ["Unable to fetch AI prediction"],
      recommendation: error.message
    });
  }
};

export const matchSOSWithInventory = async (req, res) => {
  try {
    const { sosDetails, resourceType, urgency, bloodGroup } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
      return res.status(400).json({ error: 'Gemini API key is missing' });
    }

    // Get all inventory
    const inventory = await Inventory.find().populate('hospitalId', 'name address contactNumber');
    const availableInventory = inventory.filter(item => item.quantity > 0);
    
    const inventoryText = availableInventory.map(item => 
      `- ${item.quantity} ${item.unit} of ${item.name} (${item.resourceType}) at ${item.hospitalId?.name} (Contact: ${item.hospitalId?.contactNumber})`
    ).join('\n');

    // Get potential donors if blood is needed
    let donorsText = 'No matching donors found.';
    if (resourceType === 'blood' && bloodGroup) {
      const donors = await User.find({ role: 'donor', isAvailable: true, bloodGroup: bloodGroup });
      donorsText = donors.map(d => `- Donor: ${d.name} | Blood Group: ${d.bloodGroup} | Contact: ${d.contactNumber}`).join('\n');
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const prompt = `You are an emergency response AI. 
    An SOS alert has been generated:
    Resource Type: ${resourceType}
    Blood Group Needed: ${bloodGroup || 'N/A'}
    Details: ${sosDetails}
    Urgency: ${urgency}

    Available Hospital Inventory:
    ${inventoryText || 'No inventory available.'}

    Available Live Donors:
    ${donorsText}

    Identify the best matches for this SOS alert from the inventory and donors.
    Respond matching this exact JSON schema:
    {
      "matchFound": boolean,
      "bestHospitals": [
        {
          "hospitalName": "String (or Donor Name)",
          "contact": "String",
          "availableResource": "String (e.g. '2 Units Blood' or 'Donor Available')"
        }
      ],
      "aiAdvice": "String (Short instructions for the requester)"
    }`;

    const result = await model.generateContent(prompt);
    const jsonResponse = JSON.parse(result.response.text());
    res.json(jsonResponse);
  } catch (error) {
    console.error("Match Error:", error);
    res.status(500).json({ error: 'Failed to process matching' });
  }
};
