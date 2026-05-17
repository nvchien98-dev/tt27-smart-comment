import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No key found.");
    return;
  }
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) {
      console.log(`HTTP Error: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log("Response:", text);
      return;
    }
    const data = await res.json();
    console.log("Successfully fetched models. Total models:", data.models?.length);
    const names = data.models.map((m: any) => m.name).filter((n: string) => n.includes("gemini"));
    console.log("Available Gemini models:", names.join(", "));
  } catch(e) {
    console.error("Fetch error:", e);
  }
}
testKey();
