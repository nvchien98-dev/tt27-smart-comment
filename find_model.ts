import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function findWorkingModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  const geminiModels = data.models.map((m: any) => m.name.replace('models/', '')).filter((n: string) => n.includes('gemini') && !n.includes('embedding') && !n.includes('audio') && !n.includes('robotics'));
  
  console.log("Testing models...");
  for (const model of geminiModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
      });
      
      if (res.ok) {
        console.log(`✅ SUCCESS: ${model}`);
        // We found a working model! Stop here.
        break;
      } else {
        const err = await res.json();
        console.log(`❌ FAILED: ${model} - ${err.error?.message?.substring(0, 50)}...`);
      }
    } catch(e: any) {
      console.log(`❌ ERROR: ${model} - ${e.message}`);
    }
  }
}
findWorkingModel();
