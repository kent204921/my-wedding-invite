
import { InvitationData } from "../types";

// JSONBin.io V3 API Base URL
const BASE_URL = "https://api.jsonbin.io/v3/b";

export const fetchInvitationData = async (binId: string): Promise<InvitationData | null> => {
  try {
    const response = await fetch(`${BASE_URL}/${binId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // If the bin is private, we might need a Read Access Key here.
        // For simplicity in this solution, we assume the user makes the bin Public for reading.
        // Or passes the key via URL if strictly private.
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const json = await response.json();
    // JSONBin v3 wraps data in a "record" property
    return json.record as InvitationData;
  } catch (error) {
    console.error("Error fetching invitation data:", error);
    return null;
  }
};

export const saveInvitationData = async (binId: string, apiKey: string, data: InvitationData): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey,
        // 'X-Bin-Versioning': 'false' // Optional: prevent creating history for every save
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to save data: ${err}`);
    }

    return true;
  } catch (error) {
    console.error("Error saving invitation data:", error);
    alert("保存失败 (Save Failed): " + (error as Error).message);
    return false;
  }
};
