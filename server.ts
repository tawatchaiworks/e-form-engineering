import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Lazy initialize Gemini AI client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  // AI FAQ Search & Answer Endpoint
  app.post('/api/ai-search-faq', async (req, res) => {
    try {
      const { query, internalFaqsContext } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'กรุณาระบุคำค้นหาหรือคำถาม (query is required)' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        // Graceful fallback if no API key is provided
        res.json({
          success: true,
          isFallback: true,
          answer: `การค้นหา "${query}": ขออภัย ระบบ AI ยังไม่ได้รับ API Key กรุณาตรวจสอบการตั้งค่า หรือดูผลการค้นหาจากฐานข้อมูลภายในด้านล่าง`,
          summary: `ผลการค้นหาสำหรับ: "${query}"`,
          steps: [
            'ตรวจสอบเอกสารคู่มือมาตรฐาน LUMENCRAFT ภายในระบบ',
            'ปรึกษาวิศวกรผู้เชี่ยวชาญผ่านระบบส่งคำถาม',
          ],
          precautions: 'ตรวจสอบแรงดันไฟและความปลอดภัยทางไฟฟ้าก่อนปฏิบัติงานเสมอ',
          sources: ['ฐานข้อมูลภายในบริษัท LUMENCRAFT'],
        });
        return;
      }

      // Format internal knowledge base context if provided
      let internalContextText = '';
      if (Array.isArray(internalFaqsContext) && internalFaqsContext.length > 0) {
        internalContextText = `\n\n[ฐานข้อมูลความรู้และคำถาม-คำตอบภายในบริษัท LUMENCRAFT ที่มีอยู่]:\n` + 
          internalFaqsContext.slice(0, 10).map((f: any, idx: number) => 
            `${idx + 1}. [หมวด: ${f.category || 'ทั่วไป'}] คำถาม: ${f.question}\nสรุปคำตอบ: ${f.summary}\nขั้นตอน: ${(f.steps || []).join('; ')}\nข้อควรระวัง: ${f.technicalTips || '-'}`
          ).join('\n\n');
      }

      const prompt = `คุณคือ "LUMEN-AI Technical Assistant" ผู้เชี่ยวชาญด้านวิศวกรรมไฟฟ้าและระบบแสงสว่าง (Lighting Specialist & Electrical Engineer) ประจำบริษัท LUMENCRAFT จำกัด

ผู้ใช้กำลังค้นหาข้อมูลจากภายนอก (Google & Web Knowledge) ในหัวข้อ:
"${query}"

${internalContextText}

โปรดค้นหาข้อมูลจาก Google และหลักวิศวกรรมไฟฟ้าสากล (IEC, วสท., สเปกอุปกรณ์, มาตรฐาน IP68/IP67, Derating 80%, Voltage drop 24VDC, DALI-2) เพื่อตอบคำถามนี้อย่างละเอียด แม่นยำ และเป็นประโยชน์สูงสุดสำหรับช่าง/ฝ่ายขาย

ตอบกลับเป็นโครงสร้าง JSON ดังนี้ (อย่าใส่ markdown quote ครอบถ้าทำได้ หรือใส่ JSON ที่ถูกต้อง):
{
  "summary": "สรุปคำตอบและแนวทางแก้ไขตรงประเด็นใน 2-4 ประโยค พร้อมอ้างอิงข้อมูลจาก Google / มาตรฐานสากล",
  "category": "หมวดหมู่ที่เหมาะสมที่สุด เลือกจาก: switching_power | dimming_driver | cable_sizing | strip_neonflex | underwater | garden_landscape | dali_control | troubleshooting | general",
  "categoryLabel": "ชื่อภาษาไทยของหมวดหมู่ เช่น การเลือกหม้อแปลง Switching",
  "steps": [
    "ขั้นตอนที่ 1 หรือสูตรคำนวณจากมาตรฐาน",
    "ขั้นตอนที่ 2",
    "ขั้นตอนที่ 3"
  ],
  "technicalTips": "ข้อควรระวังสำคัญ หรือเคล็ดลับหน้างานจากมาตรฐานวิศวกรรม",
  "commonCauses": [
    "สาเหตุที่พบบ่อยตามหลักวิชาการ"
  ],
  "tags": ["แท็กคำค้น1", "แท็กคำค้น2", "แท็กคำค้น3"],
  "externalWebSources": [
    {
      "title": "ชื่อหัวข้อมาตรฐานหรือเว็บไซต์ เช่น มาตรฐานการติดตั้งไฟฟ้า วสท. / IEC 60364",
      "url": "URL เว็บไซต์ หรือ ลิงก์อ้างอิง",
      "description": "คำอธิบายเนื้อหาสั้นๆ"
    }
  ]
}`;

      // Call Gemini 3.7 Flash with Google Search Grounding
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const responseText = response.text || '';
      
      // Extract Google Grounding Metadata
      const groundingMeta = response.candidates?.[0]?.groundingMetadata;
      const googleGroundingChunks: Array<{ title: string; url: string }> = [];
      const googleQueries: string[] = groundingMeta?.webSearchQueries || [];

      if (groundingMeta?.groundingChunks && Array.isArray(groundingMeta.groundingChunks)) {
        for (const chunk of groundingMeta.groundingChunks) {
          if (chunk.web?.uri) {
            googleGroundingChunks.push({
              title: chunk.web.title || chunk.web.uri,
              url: chunk.web.uri,
            });
          }
        }
      }

      let parsedData: any = {};
      try {
        // Remove markdown code block if present
        let cleanedJson = responseText.trim();
        if (cleanedJson.startsWith('```json')) {
          cleanedJson = cleanedJson.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleanedJson.startsWith('```')) {
          cleanedJson = cleanedJson.replace(/^```/, '').replace(/```$/, '').trim();
        }
        parsedData = JSON.parse(cleanedJson);
      } catch (e) {
        parsedData = {
          summary: responseText,
          category: 'general',
          categoryLabel: 'เทคนิคทั่วไป',
          steps: ['โปรดปฏิบัติตามคำแนะนำของวิศวกรผู้เชี่ยวชาญ'],
          technicalTips: 'ตัดกระแสไฟฟ้าก่อนการติดตั้งหรือตรวจเช็คทุกครั้ง',
          tags: ['Google Search', 'FAQ', 'วิศวกรรมไฟฟ้า'],
          externalWebSources: [],
        };
      }

      // Combine Google grounding links with parsed web sources
      const allWebLinks: Array<{ title: string; url: string; description?: string }> = [];
      
      // Add Grounding chunks from Google
      for (const chunk of googleGroundingChunks) {
        if (!allWebLinks.some(l => l.url === chunk.url)) {
          allWebLinks.push({
            title: chunk.title,
            url: chunk.url,
            description: 'แหล่งข้อมูลเว็บไซต์ที่ผ่านการค้นหาและยืนยันโดย Google Search',
          });
        }
      }

      // Add sources from model JSON
      if (Array.isArray(parsedData.externalWebSources)) {
        for (const src of parsedData.externalWebSources) {
          if (src.url && !allWebLinks.some(l => l.url === src.url)) {
            allWebLinks.push(src);
          }
        }
      }

      // Ensure direct Google query links are generated
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' มาตรฐานวิศวกรรมไฟฟ้า')}`;
      const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query + ' wiring diagram')}`;
      const googleScholarUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' technical datasheet pdf')}`;

      parsedData.googleLinks = {
        mainSearchUrl: googleSearchUrl,
        diagramSearchUrl: googleImagesUrl,
        datasheetSearchUrl: googleScholarUrl,
        searchedQueries: googleQueries.length > 0 ? googleQueries : [query],
        webSources: allWebLinks,
      };

      res.json({
        success: true,
        data: parsedData,
        rawText: responseText,
      });
    } catch (err: any) {
      console.error('Error generating AI FAQ response:', err);
      res.status(500).json({
        error: 'เกิดข้อผิดพลาดในการประมวลผลคำตอบจาก AI',
        details: err?.message || String(err),
      });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static file serving in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LUMENCRAFT Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
