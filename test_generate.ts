import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGenerate() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No key found.");
    return;
  }
  
  const model = "gemini-2.5-pro";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{ text: "Hello, testing API limit." }]
    }]
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      console.log(`HTTP Error: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log("Raw Response Body:");
      console.log(text);
      return;
    }
    
    const data = await res.json();
    console.log("Successfully generated content:", data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch(e) {
    console.error("Fetch error:", e);
  }
}
testGenerate();
