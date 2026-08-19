/**
 * Utility functions to link search queries, engineering formulas, and technical questions
 * directly to ChatGPT (OpenAI) with high-context engineering prompts.
 */

export interface ChatGptPromptOptions {
  role?: 'engineer' | 'lighting_specialist' | 'estimator' | 'installer';
  includeIecStandards?: boolean;
  contextData?: string;
}

/**
 * Generates an optimized engineering prompt for ChatGPT
 */
export function buildChatGptPrompt(
  rawQuery: string,
  options?: ChatGptPromptOptions
): string {
  const roleTitle = options?.role === 'estimator'
    ? 'วิศวกรประเมินราคาและวิเคราะห์ความคุ้มค่าพลังงาน (Lighting Energy & Cost Estimator)'
    : options?.role === 'installer'
    ? 'วิศวกรควบคุมงานติดตั้งไฟฟ้าและระบบแสงสว่าง (Electrical & Lighting Site Engineer)'
    : 'วิศวกรผู้เชี่ยวชาญด้านระบบไฟฟ้าและแสงสว่างสถาปัตยกรรม (Architectural Lighting Specialist & Electrical Engineer)';

  let prompt = `ในฐานะ${roleTitle} ประจำบริษัท LUMENCRAFT:\n\n`;
  prompt += `คำถาม/หัวข้อที่ต้องการปรึกษา:\n"${rawQuery.trim()}"\n\n`;

  if (options?.contextData) {
    prompt += `[ข้อมูลและพารามิเตอร์ประกอบ]:\n${options.contextData}\n\n`;
  }

  prompt += `ขอความกรุณาช่วยตอบและวิเคราะห์ตามหลักการต่อไปนี้:
1. คำอธิบายสรุปตรงประเด็นและเข้าใจง่าย
2. สูตรคำนวณหรือขั้นตอนทางวิศวกรรม (ถ้ามี)
3. ข้อควรระวังและวิธีป้องกันปัญหาหน้างาน (เช่น ไฟตก, อุณหภูมิสะสม, มาตรฐาน IP68/IP65, การ Derate 80%)
4. มาตรฐานวิศวกรรมไฟฟ้าที่เกี่ยวข้อง (เช่น วสท., IEC, DALI-2, CIE)`;

  return prompt;
}

/**
 * Opens ChatGPT in a new browser tab with the given query / prompt
 */
export function openChatGPT(queryOrPrompt: string, isFullPrompt: boolean = false): void {
  if (!queryOrPrompt || !queryOrPrompt.trim()) return;

  const finalPrompt = isFullPrompt ? queryOrPrompt : buildChatGptPrompt(queryOrPrompt);
  const targetUrl = `https://chatgpt.com/?q=${encodeURIComponent(finalPrompt)}`;

  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Opens ChatGPT with a simple direct keyword search query
 */
export function openChatGPTDirect(rawQuery: string): void {
  if (!rawQuery || !rawQuery.trim()) return;
  const targetUrl = `https://chatgpt.com/?q=${encodeURIComponent(rawQuery.trim())}`;
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Builds a prompt for Lighting / Lux / Spacing calculation review
 */
export function openChatGptLightingReview(params: {
  roomWidth: number;
  roomLength: number;
  roomHeight: number;
  workplaneHeight: number;
  targetLux: number;
  luminaireName: string;
  fixtureWatts: number;
  fixtureLumens: number;
  totalFixtures: number;
  calcLux: number;
  spacingWidth: number;
  spacingLength: number;
}): void {
  const context = `
- ขนาดห้อง: กว้าง ${params.roomWidth}m x ยาว ${params.roomLength}m x สูง ${params.roomHeight}m (พื้นที่ ${(params.roomWidth * params.roomLength).toFixed(1)} ตร.ม.)
- ระดับพื้นระนาบทำงาน: ${params.workplaneHeight}m (ความสูงติดตั้งเหนือระนาบ ${(params.roomHeight - params.workplaneHeight).toFixed(2)}m)
- ค่าความสว่างเป้าหมาย: ${params.targetLux} Lux
- ชนิดโคมไฟ: ${params.luminaireName} (${params.fixtureWatts}W, ${params.fixtureLumens} Lumens/โคม)
- จำนวนโคมที่จัดวาง: ${params.totalFixtures} โคม (ระยะห่างด้านกว้าง ${params.spacingWidth.toFixed(2)}m, ด้านยาว ${params.spacingLength.toFixed(2)}m)
- ความสว่างเฉลี่ยที่คำนวณได้: ${params.calcLux.toFixed(0)} Lux`;

  const prompt = buildChatGptPrompt(
    `ช่วยตรวจสอบการออกแบบและจัดวางโคมไฟ ${params.luminaireName} ในห้องขนาด ${params.roomWidth}x${params.roomLength}m ความสว่าง ${params.targetLux} Lux`,
    {
      role: 'lighting_specialist',
      contextData: context,
    }
  );

  openChatGPT(prompt, true);
}

/**
 * Builds a prompt for Voltage Drop analysis
 */
export function openChatGptVoltageDropReview(params: {
  voltage: number;
  loadWatts: number;
  loadAmp: number;
  cableLength: number;
  cableSize: number;
  vDropVolts: number;
  vDropPercent: number;
}): void {
  const context = `
- แรงดันระบบ: ${params.voltage}V DC
- โหลดรวม: ${params.loadWatts}W (${params.loadAmp.toFixed(2)}A)
- ระยะทางสายไฟ: ${params.cableLength} เมตร (ไป-กลับ)
- ขนาดสายไฟ: ${params.cableSize} sq.mm. (ทองแดง)
- แรงดันตกที่คำนวณได้: ${params.vDropVolts.toFixed(2)}V (${params.vDropPercent.toFixed(2)}%)
- แรงดันคงเหลือปลายทาง: ${(params.voltage - params.vDropVolts).toFixed(2)}V`;

  const prompt = buildChatGptPrompt(
    `ตรวจสอบปัญหาแรงดันตก (Voltage Drop) ในระบบไฟ DC ${params.voltage}V โหลด ${params.loadWatts}W ระยะสาย ${params.cableLength}m`,
    {
      role: 'engineer',
      contextData: context,
    }
  );

  openChatGPT(prompt, true);
}

/**
 * Builds a prompt for LED Payback & Energy ROI
 */
export function openChatGptRoiReview(params: {
  scenarioName: string;
  qty: number;
  oldLampName: string;
  oldWatts: number;
  newLampName: string;
  newWatts: number;
  hoursPerDay: number;
  daysPerYear: number;
  electricityRate: number;
  totalInvestmentThb: number;
  annualSavingsThb: number;
  paybackMonths: number;
  roiPercent: number;
  annualCo2Kg: number;
}): void {
  const context = `
- โครงการ: ${params.scenarioName} (จำนวน ${params.qty} โคม/จุด)
- หลอดเดิม: ${params.oldLampName} (${params.oldWatts}W)
- หลอด LED ใหม่: ${params.newLampName} (${params.newWatts}W)
- ชั่วโมงเปิดไฟ: ${params.hoursPerDay} ชม./วัน, ${params.daysPerYear} วัน/ปี
- อัตราค่าไฟฟ้า: ${params.electricityRate.toFixed(2)} บาท/หน่วย
- เงินลงทุนรวม: ${params.totalInvestmentThb.toLocaleString()} บาท
- ผลประหยัดพลังงานและบำรุงรักษาต่อปี: ${params.annualSavingsThb.toLocaleString()} บาท/ปี
- ระยะเวลาคืนทุน: ${params.paybackMonths.toFixed(1)} เดือน (${(params.paybackMonths / 12).toFixed(2)} ปี)
- ROI ต่อปี: ${params.roiPercent.toFixed(1)}% ต่อปี
- ลด CO2: ${params.annualCo2Kg.toFixed(0)} kg CO2e/ปี`;

  const prompt = buildChatGptPrompt(
    `ช่วยเขียนสรุปข้อเสนอแนะเชิงธุรกิจและความคุ้มค่า (Executive Summary Proposal) สำหรับการเปลี่ยนหลอดไฟเป็น LED จำนวน ${params.qty} โคม คืนทุน ${params.paybackMonths.toFixed(1)} เดือน`,
    {
      role: 'estimator',
      contextData: context,
    }
  );

  openChatGPT(prompt, true);
}
