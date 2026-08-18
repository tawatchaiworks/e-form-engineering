import React, { useState } from 'react';
import { 
  HelpCircle, Search, BookOpen, Wrench, Zap, 
  CheckCircle2, ChevronDown, ChevronUp, AlertTriangle, 
  Lightbulb, Phone, Mail, Sparkles, Sliders,
  MessageSquare, Send, ThumbsUp, Tag, Scissors,
  Waves, Trees, Cable, Cpu
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'switching_power' | 'dimming_driver' | 'cable_sizing' | 'strip_neonflex' | 'underwater' | 'garden_landscape' | 'dali_control';
  categoryLabel: string;
  question: string;
  summary: string;
  steps?: string[];
  technicalTips?: string;
  commonCauses?: string[];
  specsTable?: { label: string; value: string }[];
  tags: string[];
}

const FAQ_DATA: FaqItem[] = [
  // 1. การเลือกหม้อแปลง Switching (12V / 24V Power Supply)
  {
    id: 'faq-psu-1',
    category: 'switching_power',
    categoryLabel: 'การเลือกหม้อแปลง Switching',
    question: 'การคำนวณเลือกขนาดวัตต์ (Wattage) ของหม้อแปลง Switching 12V/24V มีหลักการอย่างไร?',
    summary: 'การเลือกหม้อแปลงสวิตชิ่งต้องคำนวณโหลดรวมของไฟ LED และเผื่อค่า Safety Margin (Derating Factor 80% Rule) เสมอ:',
    steps: [
      '1. รวมกำลังวัตต์ทั้งหมด: (ความยาวไฟเส้นรวมเป็นเมตร) x (วัตต์ต่อเมตรของ LED Strip) เช่น 15 เมตร x 10W/m = 150 Watts',
      '2. คำนวณค่าเผื่อ Safety Margin 20-30%: นำวัตต์รวม ÷ 0.80 เช่น 150W ÷ 0.80 = 187.5 Watts',
      '3. เลือกขนาดหม้อแปลงมาตรฐานในท้องตลาดที่มีขนาดเท่ากับหรือมากกว่า เช่น เลือกหม้อแปลงขนาด 200W หรือ 240W 24VDC',
      '4. ตรวจสอบกระแสเอาต์พุต (Current): กระแสรวม (A) = กำลังวัตต์หม้อแปลง ÷ แรงดัน (24V) เช่น 200W / 24V = 8.33A'
    ],
    technicalTips: 'ห้ามโหลดหม้อแปลงเกิน 80% ต่อเนื่องเป็นเวลานาน เพราะความร้อนสะสมจะทำให้ชิ้นส่วน Capacitors เสื่อมสภาพเร็วและหม้อแปลงตัดการทำงาน (Over Temperature Protection)',
    tags: ['หม้อแปลง Switching', 'Power Supply', 'Derating 80%', 'คำนวณวัตต์', '24VDC', '12VDC']
  },
  {
    id: 'faq-psu-2',
    category: 'switching_power',
    categoryLabel: 'การเลือกหม้อแปลง Switching',
    question: 'ความแตกต่างระหว่างหม้อแปลง Indoor (IP20) และ Outdoor (IP67) และการเลือกใช้งาน?',
    summary: 'หม้อแปลงสวิตชิ่งแบ่งตามเกรดการป้องกันสภาพแวดล้อมและการระบายความร้อน:',
    steps: [
      '1. หม้อแปลง Indoor (IP20 แบบตะแกรงรังผึ้ง / Slim Aluminum): สำหรับติดตั้งในฝ้าเพดาน ตู้คอนโทรล หรือจุดแห้ง มีช่องระบายอากาศ ต้องมีพื้นที่ให้อากาศถ่ายเทสะดวก',
      '2. หม้อแปลง Outdoor (IP67 แบบหล่อซิลิโคน/อลูมิเนียมปิดผนึก): สำหรับงานภายนอกอาคาร สวน ป้ายไฟ ทนฝนและไอความชื้น ไม่ต้องกังวลเรื่องละอองน้ำหรือจิ้งจก/แมลงเข้าไปลัดวงจร',
      '3. ข้อควรระวังในการติดตั้งในฝ้า: แม้เป็นหม้อแปลง Indoor ควรเว้นระยะห่างรอบตัวอย่างน้อย 10-15 ซม. ห้ามนำฉนวนกันความร้อนมาทับตัวหม้อแปลงโดยเด็ดขาด'
    ],
    technicalTips: 'หากติดตั้งหม้อแปลง IP67 ภายนอกอาคาร ควรติดตั้งในที่ร่มหรือมีแผงกันแดดส่องตรง (Sunshade) เพื่อป้องกันความร้อนจากแสงแดดสะสม',
    tags: ['IP20', 'IP67', 'Indoor vs Outdoor', 'การระบายความร้อน', 'ฝ้าเพดาน']
  },
  {
    id: 'faq-psu-3',
    category: 'switching_power',
    categoryLabel: 'การเลือกหม้อแปลง Switching',
    question: 'กระแสกระชากขณะเปิด (Inrush Current) คืออะไร และทำไมเปิดไฟพร้อมกันแล้วเบรกเกอร์ทริป?',
    summary: 'ขณะเริ่มจ่ายไฟเข้าหม้อแปลง สวิตชิ่งจะดึงกระแสสูงกว่าปกติ 20-50 เท่าในช่วงเสี้ยววินาทีเพื่อประจุไฟเข้าตัวเก็บประจุ:',
    commonCauses: [
      'ติดตั้งหม้อแปลงสวิตชิ่งจำนวนหลายตัวบนวงจรเบรกเกอร์ MCB ลูกเดียวกัน',
      'ใช้เบรกเกอร์ Type B ซึ่งตัดไวเกินไปต่อกระแสกระชากชั่วขณะ',
      'ไม่ได้ใส่ Magnetic Contactor หรือ Inrush Current Limiter (ICL) ในตู้คอนโทรล'
    ],
    steps: [
      '1. เปลี่ยนเบรกเกอร์ MCB เป็น Type C หรือ Type D ซึ่งทนกระแส Inrush ได้ 5-10 เท่าของพิกัด',
      '2. กระจายหม้อแปลงออกเป็นหลายวงจรย่อย หรือติดตั้งอุปกรณ์ Soft-starter / NTC Inrush Limiter',
      '3. ตั้งเวลาเปิดไฟแบบหน่วงเวลา (Sequential Switching / Time Delay Relay) ให้เปิดทีละกลุ่ม'
    ],
    technicalTips: 'เบรกเกอร์ 16A Type C แนะนำให้คุมหม้อแปลงสวิตชิ่งขนาด 200W รวมกันไม่เกิน 4-5 ตัวต่อหนึ่งวงจร',
    tags: ['Inrush Current', 'เบรกเกอร์ทริป', 'MCB Type C', 'กระแสกระชาก', 'ตู้ไฟ']
  },

  // 2. การเลือกหม้อแปลงดิม (Dimmable Drivers)
  {
    id: 'faq-dim-1',
    category: 'dimming_driver',
    categoryLabel: 'การเลือกหม้อแปลงดิม (Dimming Drivers)',
    question: 'เปรียบเทียบระบบหม้อแปลงดิม (DALI-2, 0-10V, Triac Phase-Cut, Push-Dim) เลือกแบบไหนดี?',
    summary: 'การเลือกหม้อแปลงดิมขึ้นอยู่กับระบบควบคุมหลักของอาคารและพฤติกรรมการใช้งาน:',
    steps: [
      '1. DALI-2 (DT6 / DT8): เหมาะกับงานโครงการ อาคารสำนักงาน โรงแรมหรู ที่ต้องการระบบ Automation ตั้ง Scene จัดกลุ่มได้อิสระ รองรับการดิมที่นุ่มนวลระดับ 0.1% - 1% และปรับอุณหภูมิแสง Tunable White',
      '2. 0-10V / 1-10V (Analog): เหมาะกับระบบ Dimmer แบบหมุนทั่วไป หรือระบบ BMS ขนาดกลาง เดินสายสัญญาณ 2 เส้นแยกจากสายเมน',
      '3. Triac / Phase-Cut (AC Mains Dimming): เหมาะกับงานรีโนเวทที่ไม่ต้องการเดินสายสัญญาณเพิ่ม ใช้สายไฟ 220V เดิมต่อผ่านสวิตช์ดิมเมอร์ Triac (แนะนำ Trailing-edge/ELV)',
      '4. Push-Dim (Switch-Dim): ควบคุมด้วยสวิตช์กระดิ่งกดติด-ปล่อยดับ (Retractive Switch) สะดวกสำหรับห้องเดี่ยว กดสั้นเปิด/ปิด กดยาวหรี่/เพิ่มแสง'
    ],
    technicalTips: 'หากต้องการความนุ่มนวลสูงสุด ไม่กระตุก และหรี่ได้ลึกระดับ 0.1% แนะนำระบบ DALI-2 Driver แบบ Amplitude Dimming ผสม High-frequency PWM',
    tags: ['DALI-2', '0-10V', 'Triac Phase Cut', 'Push Dim', 'ระบบดิมไฟ']
  },
  {
    id: 'faq-dim-2',
    category: 'dimming_driver',
    categoryLabel: 'การเลือกหม้อแปลงดิม (Dimming Drivers)',
    question: 'PWM Dimming กับ Amplitude Modulation (CC Dimming) ต่างกันอย่างไร และแบบไหนไม่กะพริบเวลามองผ่านกล้อง?',
    summary: 'เทคนิคการหรี่แสงของ LED Driver ส่งผลโดยตรงต่อคุณภาพแสงและอาการ Flicker:',
    steps: [
      '1. PWM Dimming (Pulse Width Modulation): ดิมโดยการตัดต่อแรงดันไฟด้วยความถี่สูง หากความถี่ต่ำ (<1kHz) จะเห็นไฟกะพริบชัดเจนเมื่อถ่ายภาพ/วิดีโอด้วยสมาร์ตโฟน และอาจมีเสียงหวีด (Acoustic Noise)',
      '2. Amplitude Modulation (AM / Linear Reduction): ดิมโดยการลดขนาดกระแส/แรงดันลงโดยตรง แสงจะนิ่งสนิท 100% ไม่มีคลื่นกะพริบ (Flicker-Free) เหมาะกับสตูดิโอและบ้านพักอาศัยระดับพรีเมียม',
      '3. Hybrid Dimming: ใช้ AM ในช่วง 100% ลงมาถึง 10-20% แล้วสลับเป็น High-frequency PWM (>3kHz) ในช่วงแสงต่ำมากเพื่อความแม่นยำของสี'
    ],
    technicalTips: 'เลือกรุ่น Driver ที่ผ่านเกณฑ์ IEEE 1789 (Flicker-Free Standard) เพื่อความสบายตาและไม่เกิดอาการปวดหัวจากการจ้องแสงนานๆ',
    tags: ['PWM', 'Amplitude Dimming', 'Flicker Free', 'ถ่ายคลิปไฟกะพริบ', 'IEEE 1789']
  },

  // 3. การเลือกสายไฟ 24V และระยะสาย
  {
    id: 'faq-cable-1',
    category: 'cable_sizing',
    categoryLabel: 'การเลือกสายไฟ 24V และระยะสาย',
    question: 'การคำนวณแรงดันตก (Voltage Drop) และตารางเลือกขนาดสายไฟ 24VDC ตามระยะทาง?',
    summary: 'ระบบแรงดันต่ำ 24VDC ไวต่อแรงดันตกในสายมาก แรงดันปลายสายไม่ควรต่ำกว่า 22.0VDC (Drop < 8%):',
    steps: [
      '1. โหลด 50W (กระแส ~2.1A): ระยะ 0-10m ใช้สาย 1.5 sq.mm., ระยะ 10-25m ใช้สาย 2.5 sq.mm., ระยะ 25-40m ใช้สาย 4.0 sq.mm.',
      '2. โหลด 100W (กระแส ~4.2A): ระยะ 0-10m ใช้สาย 2.5 sq.mm., ระยะ 10-20m ใช้สาย 4.0 sq.mm., ระยะ 20-30m ใช้สาย 6.0 sq.mm.',
      '3. โหลด 150W-200W (กระแส ~6-8A): ระยะ 0-8m ใช้สาย 4.0 sq.mm., ระยะ >10m แนะนำแยกหม้อแปลงไปไว้ใกล้จุดโคมไฟแทนการเดินสาย 24V ไกลๆ',
      '4. สัญลักษณ์สีสายไฟ DC มาตรฐาน: สายบวก (+) สีแดง หรือ สีน้ำตาล, สายลบ (-) สีดำ หรือ สีน้ำเงิน'
    ],
    technicalTips: 'สูตรคิดแรงดันตก: V_drop = (2 x ความยาวสาย(เมตร) x กระแสไฟ(A) x 0.0175) / ขนาดสายไฟ(sq.mm.)',
    tags: ['24VDC Cable', 'Voltage Drop', 'ขนาดสายไฟ', 'ระยะสายไฟ', 'แรงดันตก']
  },
  {
    id: 'faq-cable-2',
    category: 'cable_sizing',
    categoryLabel: 'การเลือกสายไฟ 24V และระยะสาย',
    question: 'ควรวางหม้อแปลงรวมที่ตู้ไฟกลาง (Centralized) หรือกระจายไว้ใกล้หน้างาน (Distributed)?',
    summary: 'ข้อดี-ข้อเสียในการวางตำแหน่งหม้อแปลงสวิตชิ่ง 24V ในงานระบบแสงสว่าง:',
    steps: [
      '1. วางรวมที่ตู้ไฟ (Centralized): ดูแลรักษาง่าย เปลี่ยนหม้อแปลงสะดวก แต่มีข้อจำกัดเรื่องระยะสาย 24V ยิ่งไกลต้องใช้สายเมนเบอร์ใหญ่มาก (4-6 sq.mm.) เพื่อคุม Voltage drop',
      '2. กระจายตามฝ้าเพดาน (Distributed): เดินสายไฟ 220V ไปหาหม้อแปลงใกล้จุดติดตั้งไฟ (ระยะ 24V ไม่เกิน 3-5 เมตร) ช่วยประหยัดค่าสายไฟ แต่ต้องทำช่องเซอร์วิส (Service Access) ให้เปิดซ่อมได้',
      '3. กฎทอง: ระยะสาย 24VDC จากหม้อแปลงถึงจุดจ่ายไฟเส้นแรก ควรคุมให้อยู่ภายใน 5-10 เมตรเสมอ'
    ],
    technicalTips: 'หากจำเป็นต้องวางหม้อแปลงไกลกว่า 20 เมตร ให้ปรับแรงดันเอาต์พุตที่ปุ่มหมุน V.ADJ บนหม้อแปลงขึ้นเป็น 25.5V - 26V เพื่อชดเชยแรงดันตกปลายทาง',
    tags: ['Centralized vs Distributed', 'ตู้คอนโทรล', 'ช่องเซอร์วิส', 'V.ADJ']
  },

  // 4. การตัดต่อ LED Strip & Neon Flex
  {
    id: 'faq-strip-1',
    category: 'strip_neonflex',
    categoryLabel: 'การตัดต่อ LED Strip & Neon Flex',
    question: 'การตัดต่อไฟเส้น LED Strip ที่ถูกต้อง และการต่อไฟเลี้ยงป้องกันปลายสายแสงดรอป?',
    summary: 'ข้อปฏิบัติในการตัด ต่อ และจ่ายไฟให้ไฟเส้น LED Strip 24V:',
    steps: [
      '1. จุดตัด (Cut Marks): ต้องตัดเฉพาะตรงเส้นประที่มีสัญลักษณ์รูปกรรไกรหรือจุดบัดกรีทองแดง (Copper Pads) เท่านั้น ห้ามตัดกึ่งกลางเม็ด LED',
      '2. การเชื่อมต่อสาย: แนะนำการบัดกรีด้วยหัวแร้งความร้อนพอเหมาะ (300-350°C ไม่เกิน 3 วินาทีต่อจุด) และหุ้มท่อหดกาว จะแข็งแรงและนำกระแสได้ดีกว่าตัวหนีบคลิปพลาสติก',
      '3. การจ่ายไฟ (Power Feeding): ไฟเส้นยาวเกิน 5 เมตร ห้ามจ่ายไฟด้านเดียว ให้จ่ายไฟแบบหัว-ท้าย (Double-End Feed) หรือเดินสายเมนคู่ขนานจ่ายทุกๆ 5 เมตร',
      '4. รางระบายความร้อน: ไฟเส้นกำลังวัตต์ >9.6W/m ต้องแปะลงบนรางอลูมิเนียมโพรไฟล์ (Aluminum Profile) เสมอเพื่อระบายความร้อน ไม่ให้กาว 3M เสื่อมและ LED หมอง'
    ],
    technicalTips: 'ทำความสะอาดพื้นผิวรางอลูมิเนียมด้วยแอลกอฮอล์ไอโซโพรพิล (IPA) ให้ปราศจากฝุ่นและคราบน้ำมันก่อนลอกแถบกาว 3M แปะไฟเส้น',
    tags: ['LED Strip', 'การตัดต่อไฟเส้น', 'Double End Feed', 'รางอลูมิเนียม', 'การบัดกรี']
  },
  {
    id: 'faq-strip-2',
    category: 'strip_neonflex',
    categoryLabel: 'การตัดต่อ LED Strip & Neon Flex',
    question: 'การตัดต่อ Neon Flex ซิลิโคน การซีลหัว-ท้าย และข้อควรระวังเรื่องรัศมีการดัดโค้ง?',
    summary: 'LED Neon Flex ต้องระมัดระวังเรื่องการกันน้ำและทิศทางการดัดงอ:',
    steps: [
      '1. การตัด: สังเกตจุดตัดสีดำ (Black Mark) ใต้ตัว Neon Flex ตัดให้หน้าตัดเรียบตรง 90 องศาด้วยคัตเตอร์คมพิเศษ',
      '2. การซีลกันน้ำ IP67/IP68: ใส่ End Cap ซิลิโคนพร้อมหยอดกาวซิลิโคน RTV ชนิดไม่มีกรด (Neutral Cure Silicone) ให้มิดชิด ทิ้งไว้ให้แห้งสนิท 24 ชม. ก่อนโดนน้ำ',
      '3. ทิศทางการดัดงอ: ตรวจสอบว่าเป็นชนิด Side-Bend (ดัดด้านข้าง) หรือ Top-Bend (ดัดบน-ล่าง) ห้ามบิดงอผิดทิศทางเด็ดขาด',
      '4. รัศมีการดัดโค้งต่ำสุด (Minimum Bend Radius): โดยทั่วไปไม่น้อยกว่า 50-80 มม. ห้ามพับหักมุม 90 องศาแบบเฉียบพลันเพราะลายวงจร PCB ภายในจะขาด'
    ],
    technicalTips: 'ห้ามดึงหรือกระชากสายไฟที่ต่อออกจากหัว Neon Flex เพราะจะทำให้จุดบัดกรีภายในหลุดและซิลิโคนฉีกขาดสูญเสียคุณสมบัติกันน้ำ',
    tags: ['Neon Flex', 'การตัดต่อ', 'End Cap', 'กาวซิลิโคน', 'Bend Radius', 'Side Bend']
  },

  // 5. การติดตั้งโคมใต้น้ำ & การต่อสายไฟใต้น้ำ (IP68)
  {
    id: 'faq-underwater-1',
    category: 'underwater',
    categoryLabel: 'โคมใต้น้ำ & การต่อสายใต้น้ำ',
    question: 'มาตรฐานความปลอดภัยและการติดตั้งโคมไฟใต้น้ำ (Underwater Light IP68)?',
    summary: 'ข้อกำหนดทางวิศวกรรมสำหรับโคมไฟสระว่ายน้ำ น้ำพุ และบ่อปลา:',
    steps: [
      '1. ระบบแรงดันไฟฟ้าปลอดภัยพิเศษ (SELV): ต้องใช้ไฟแรงดันต่ำ 12VAC, 12VDC หรือ 24VDC เท่านั้น **ห้ามใช้ไฟ 220VAC ใต้น้ำเด็ดขาด**',
      '2. ตำแหน่งติดตั้งหม้อแปลง: ต้องอยู่นอกบ่อน้ำในจุดแห้ง ห่างจากขอบสระอย่างน้อย 2.0-3.5 เมตร และสูงกว่าระดับน้ำสูงสุด',
      '3. วัสดุตัวเรือน: สระว่ายน้ำระบบเกลือ/คลอรีน ต้องใช้สแตนเลสเกรด 316 / 316L เท่านั้น (ห้ามใช้ SS304 เพราะจะเกิดสนิมกัดกร่อน)',
      '4. กฎการระบายความร้อนด้วยน้ำ: โคมใต้น้ำถูกออกแบบให้ใช้น้ำระบายความร้อน **ห้ามเปิดทดสอบโคมแห้งบนบกเกิน 1 นาที** เพราะหน้าเลนส์และเม็ด LED จะไหม้ทันที'
    ],
    technicalTips: 'ควรเผื่อความยาวสายไฟม้วนซ่อนไว้หลังกระบอกโคม (Niche) ประมาณ 1.5 เมตร เพื่อให้สามารถดึงตัวโคมขึ้นมาเปลี่ยนบนขอบสระได้โดยไม่ต้องถ่ายน้ำออก',
    tags: ['โคมใต้น้ำ', 'Underwater Light', 'IP68', 'SELV 12V/24V', 'Stainless 316', 'สระว่ายน้ำ']
  },
  {
    id: 'faq-underwater-2',
    category: 'underwater',
    categoryLabel: 'โคมใต้น้ำ & การต่อสายใต้น้ำ',
    question: 'การต่อสายไฟใต้น้ำอย่างไรไม่ให้น้ำซึมเข้า และข้อห้ามสำคัญ?',
    summary: 'การต่อเชื่อมสายไฟใต้น้ำเป็นจุดเสี่ยงสูงสุด ต้องทำตามมาตรฐาน IP68 อย่างเคร่งครัด:',
    steps: [
      '1. แนวทางปฏิบัติที่ดีที่สุด: ดึงสายไฟเดิมของโคม (Submersible Cable H07RN-F) ตรงเข้าท่อขึ้นไปต่อใน Junction Box เหนือน้ำ โดยไม่มีจุดต่อใต้น้ำ',
      '2. หากจำเป็นต้องต่อสายใต้น้ำ (วิธี Resin Cast): ใช้กล่องต่อสายเรซิน (Resin Gel Joint Box IP68) เทน้ำยา Polyurethane Resin ผสม 2 ส่วน หล่อปิดทึบ 100%',
      '3. การใช้ท่อหดกาว + เทปละลาย: พันด้วยเทปละลายกันน้ำ (Self-Amalgamating Tape) ดึงยืด 50% ซ้อนทับ 3 ชั้น แล้วหุ้มด้วยท่อหดมีกาวร้อน (Adhesive Dual-Wall Heat Shrink) ทับอีก 2 ชั้น',
      '4. ข้อห้ามเด็ดขาด: ห้ามใช้เทปพันสายไฟธรรมดา หรือเทปพันเกลียวท่อประปาในการต่อสายไฟใต้น้ำเด็ดขาด เพราะน้ำจะซึมผ่านเส้นทองแดง (Capillary Effect) เข้าสู่ตัวโคม'
    ],
    technicalTips: 'ใช้สายเคเบิลเปลือกยางชนิดพิเศษสำหรับงานใต้น้ำ เช่น สาย H07RN-F หรือ Submersible Rubber Cable เพื่อป้องกันการเปื่อยยุ่ยจากคลอรีน',
    tags: ['ต่อสายไฟใต้น้ำ', 'Resin Box IP68', 'เทปละลาย', 'ท่อหดกาว', 'Capillary Action']
  },

  // 6. การติดตั้งโคมในสวน & ข้อจำกัดต่างๆ (Garden & Landscape)
  {
    id: 'faq-garden-1',
    category: 'garden_landscape',
    categoryLabel: 'การติดตั้งโคมในสวน & ข้อจำกัด',
    question: 'การติดตั้งโคมไฟฝังพื้นในสวน (Inground Up-Light IP67) และการทำชั้นระบายน้ำป้องกันน้ำท่วมขัง?',
    summary: 'โคมฝังพื้นมักชำรุดจากปัญหาน้ำขังใต้ดินและการเกิดฝ้าไอน้ำสะสม:',
    steps: [
      '1. การขุดหลุมและชั้นหินกรวด (Gravel Base): ใต้กระบอกฝังพื้น (Mounting Sleeve) ต้องขุดลึกเพิ่ม 20-30 ซม. แล้วเทหินกรวดเบอร์ 1-2 เพื่อเป็นโพรงให้น้ำระบายซึมลงดินได้อย่างรวดเร็ว',
      '2. ข้อห้าม: ห้ามเทคอนกรีตปิดก้นกระบอกโคม เพราะน้ำฝนจะขังอยู่ในกระบอกกลายเป็นบ่อแช่โคม',
      '3. จุดติดตั้ง: หลีกเลี่ยงการวางโคมฝังพื้นในจุดที่เป็นแอ่งรับน้ำต่ำสุดของสนามหญ้า หรือจุดที่มีสปริงเกลอร์รดน้ำฉีดอัดตรง',
      '4. การขันน็อตหน้ากระจก: ต้องขันสลับแบบกากบาท (Cross-Pattern) ด้วยแรงขันที่สม่ำเสมอ เพื่อให้ยางซิลิโคน O-Ring แนบสนิททุกมุม'
    ],
    technicalTips: 'หากเกิดฝ้าไอน้ำในโคมตอนเปิดใช้งาน ให้เปิดฝาหน้าโคมทิ้งไว้ 30 นาทีในวันที่อากาศแห้ง เพื่อไล่ความชื้นที่สะสมออกแล้วจึงปิดผนึกใหม่อีกครั้ง',
    tags: ['โคมฝังพื้น', 'Inground Light', 'IP67', 'ชั้นหินกรวดระบายน้ำ', 'ฝ้าไอน้ำ', 'O-Ring']
  },
  {
    id: 'faq-garden-2',
    category: 'garden_landscape',
    categoryLabel: 'การติดตั้งโคมในสวน & ข้อจำกัด',
    question: 'การเดินสายไฟฝังดินในสวน และการป้องกันหนู/แมลง/ความชื้นกัดแทะสาย?',
    summary: 'มาตรฐานการเดินท่อร้อยสายไฟใต้ดินในงาน Landscape:',
    steps: [
      '1. ชนิดท่อร้อยสาย: ต้องใช้ท่อร้อยสายไฟ HDPE (High-Density Polyethylene คาดส้ม) หรือท่อเหล็กชุบสังกะสีหนา (RSC / IMC) ห้ามใช้ท่อ PVC สีขาว/เหลืองแบบบางฝังดินโดยตรง',
      '2. ความลึกในการฝังท่อ: ฝังลึกใต้ระดับดินเดิมอย่างน้อย 30 - 50 ซม. และกลบด้วยชั้นทรายก่อนปิดด้วยดินเดิม',
      '3. กล่องพักสายในสวน (Junction Box): ต้องใช้กล่องกันน้ำ IP68 พร้อมใส่เคเบิ้ลแกลนด์ (Cable Gland) ขันบีบแน่นทุกช่องทางเข้าสาย และอุดซิลิโคนป้องกันมด/แมลงเข้าไปทำรัง',
      '4. สายไฟ: ใช้สายไฟชนิดฝังดินโดยเฉพาะ เช่น สาย NYY หรือสาย XLPE'
    ],
    technicalTips: 'ใส่เทปเตือนภัยใต้ดิน (Underground Warning Tape) เหนือแนวท่อประมาณ 15 ซม. เพื่อเตือนคนทำสวนเวลาขุดดินไม่ให้โดนท่อไฟฟ้า',
    tags: ['สายไฟฝังดิน', 'ท่อ HDPE', 'Cable Gland', 'สาย NYY', 'ไฟในสวน', 'จัดสวน']
  },

  // 7. ระบบ DALI & Automation
  {
    id: 'faq-dali-1',
    category: 'dali_control',
    categoryLabel: 'ระบบ DALI & Automation',
    question: 'DALI Short Address, Group และ Broadcast ต่างกันอย่างไร และใช้อย่างไร?',
    summary: 'DALI-2 รองรับการควบคุมได้ 3 รูปแบบหลักตามโครงสร้างการตั้งค่าของระบบแสงสว่าง:',
    steps: [
      '1. Short Address: ควบคุมทีละตัวเดี่ยวๆ (1 Loop สูงสุด 64 Address คือ 0-63) เหมาะกับการตั้งค่าเฉพาะโคม',
      '2. Group Address: ควบคุมเป็นกลุ่ม (1 Loop สูงสุด 16 Groups คือ Group 0-15) โดยโคม 1 ตัวอยู่ได้หลายกลุ่ม',
      '3. Broadcast: สั่งงานทุกโคมในลูปพร้อมกันโดยไม่จำเป็นต้อง Addressing เหมาะกับการทดสอบหน้างานเบื้องต้น'
    ],
    technicalTips: 'หากต้องการสั่งงานฉุกเฉิน เช่น ไฟติด 100% ทั้งหมดทันที ให้ส่งคำสั่งแบบ Broadcast Command',
    tags: ['DALI', 'Addressing', 'Group Control', 'Broadcast', 'Control System']
  },
  {
    id: 'faq-dali-2',
    category: 'dali_control',
    categoryLabel: 'ระบบ DALI & Automation',
    question: 'ข้อกำหนดสายสัญญาณ DALI (ระยะทาง, ขนาดสาย, และโครงสร้าง Topology)?',
    summary: 'สายสัญญาณ DALI Bus เป็นระบบ 2-Wire ที่มีความยืดหยุ่นสูง ไม่มีขั้ว (Polarity-Free):',
    steps: [
      '1. ขนาดสาย: แนะนำใช้สาย NYY หรือ VCT 2x1.5 sq.mm. หรืออย่างน้อย 2x1.0 sq.mm.',
      '2. ระยะทางสูงสุด: ไม่เกิน 300 เมตรต่อลูป (วัดจากจุดที่ไกลที่สุดถึง DALI Power Supply)',
      '3. แรงดันตก (Voltage Drop): แรงดันไฟ DALI Bus ต้องไม่ต่ำกว่า 9.5V ณ โคมปลายสายสุด (ปกติ 16VDC ±2V)',
      '4. Topology: สามารถเดินสายแบบ Daisy Chain (Bus), Tree (กิ่งก้าน), หรือ Star (ดาว) ได้อย่างอิสระ **ห้ามต่อเป็นวงปิด (Ring/Loop)**'
    ],
    technicalTips: 'สาย DALI สามารถเดินในรางร่วมกับสายไฟ 230VAC ได้ตามมาตรฐาน IEC 62386 เนื่องจากมีฉนวนระดับ Mains-rated Isolation',
    tags: ['DALI Bus', 'Wiring', 'Topology', 'Voltage Drop', 'IEC 62386']
  },
  {
    id: 'faq-dali-3',
    category: 'dali_control',
    categoryLabel: 'ระบบ DALI & Automation',
    question: 'DALI Power Supply จ่ายกระแสเท่าไร และคำนวณจำนวนโคมต่อลูปอย่างไร?',
    summary: 'มาตรฐาน DALI กำหนดกระแสไฟสูงสุดของระบบไม่เกิน 250mA:',
    steps: [
      '1. Driver DALI แต่ละตัวกินกระแสจาก Bus ประมาณ 2mA (64 Drivers = 128mA)',
      '2. DALI Sensor / Switch panel แต่ละตัวกินกระแสประมาณ 5 - 10mA',
      '3. รวมอุปกรณ์ทั้งหมดใน 1 Loop ต้องไม่เกินพิกัดของ DALI Power Supply (มาตรฐาน 240mA - 250mA)',
      '4. ห้ามต่อ DALI Power Supply 2 ตัวขนานกันในลูปเดียวกัน เว้นแต่เป็นรุ่นที่ออกแบบรองรับ Multi-PSU'
    ],
    technicalTips: 'ใช้ DALI Bus Tester หรือ Multimeter วัดแรงดัน DC ระหว่างเส้น DA-DA ต้องอ่านได้ระหว่าง 14.5V - 17.5VDC',
    tags: ['Power Supply', 'Current Limit', '250mA', 'Sensor', 'Bus Power']
  }
];

export const FaqKnowledgeHub: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-psu-1');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  // Question submission state
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategory, setNewCategory] = useState('switching_power');
  const [newDetail, setNewDetail] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories = [
    { id: 'all', label: 'คำถามทั้งหมด (All FAQ)', icon: BookOpen, count: FAQ_DATA.length },
    { id: 'switching_power', label: 'หม้อแปลง Switching', icon: Zap, count: FAQ_DATA.filter(f => f.category === 'switching_power').length },
    { id: 'dimming_driver', label: 'หม้อแปลงดิม (Dimmable)', icon: Sliders, count: FAQ_DATA.filter(f => f.category === 'dimming_driver').length },
    { id: 'cable_sizing', label: 'สายไฟ 24V & ระยะสาย', icon: Cable, count: FAQ_DATA.filter(f => f.category === 'cable_sizing').length },
    { id: 'strip_neonflex', label: 'ตัดต่อ Strip & Neon Flex', icon: Scissors, count: FAQ_DATA.filter(f => f.category === 'strip_neonflex').length },
    { id: 'underwater', label: 'โคมใต้น้ำ & สายใต้น้ำ', icon: Waves, count: FAQ_DATA.filter(f => f.category === 'underwater').length },
    { id: 'garden_landscape', label: 'โคมในสวน & ข้อจำกัด', icon: Trees, count: FAQ_DATA.filter(f => f.category === 'garden_landscape').length },
    { id: 'dali_control', label: 'ระบบ DALI & Control', icon: Cpu, count: FAQ_DATA.filter(f => f.category === 'dali_control').length },
  ];

  const filteredFaqs = FAQ_DATA.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchCat;

    const matchText = 
      item.question.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      (item.steps && item.steps.some(s => s.toLowerCase().includes(query))) ||
      (item.technicalTips && item.technicalTips.toLowerCase().includes(query)) ||
      (item.commonCauses && item.commonCauses.some(c => c.toLowerCase().includes(query))) ||
      item.tags.some(t => t.toLowerCase().includes(query));

    return matchCat && matchText;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleVoteHelpful = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHelpfulVotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowAskModal(false);
      setNewQuestion('');
      setNewDetail('');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] shadow-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Technical Engineering Knowledge
            </span>
            <span className="text-xs text-slate-300">
              คู่มือเทคนิคไฟฟ้าแสงสว่าง: หม้อแปลง, สายไฟ 24V, การตัดต่อไฟเส้น, งานใต้น้ำ, และสวน
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <HelpCircle className="w-7 h-7 text-amber-400" />
            8. FAQ Knowledge (ถามตอบและข้อมูลปัญหาด้านเทคนิค)
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            ศูนย์รวมองค์ความรู้ด้านวิศวกรรมแสงสว่าง LUMENCRAFT ครอบคลุมการเลือกหม้อแปลง Switching 12V/24V, หม้อแปลงดิม DALI/0-10V/Triac, 
            การคำนวณขนาดสายไฟและระยะสาย 24V (Voltage Drop), เทคนิคการตัดต่อ LED Strip & Neon Flex, การต่อสายและติดตั้งโคมใต้น้ำ IP68, 
            และการติดตั้งโคมในสวน/ฝังพื้นพร้อมข้อจำกัดทางสภาพแวดล้อม
          </p>

          {/* Quick Search Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหา: หม้อแปลง, สาย 24V, Voltage Drop, ตัดต่อ Neonflex, สายใต้น้ำ, โคมในสวน, DALI..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setShowAskModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              สอบถามปัญหาเทคนิคใหม่
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isSelected ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* FAQ Items Grid / Accordion */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">ไม่พบคำถามหรือหัวข้อที่ค้นหา "{searchQuery}"</h3>
            <p className="text-xs text-slate-500">
              ลองค้นหาด้วยคำค้นอื่น เช่น "DALI", "Flicker", "Check-in", "สายสัญญาณ", "Address" หรือกดปุ่มสอบถามปัญหาใหม่
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                ดูคำถามทั้งหมด
              </button>
              <button
                onClick={() => setShowAskModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                ส่งคำถามให้วิศวกร
              </button>
            </div>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isExpanded = expandedId === faq.id;
            const isVoted = helpfulVotes[faq.id];

            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                  isExpanded ? 'border-amber-400/80 shadow-md ring-1 ring-amber-400/30' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full text-left p-5 flex items-start justify-between gap-4 cursor-pointer focus:outline-hidden"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        {faq.categoryLabel}
                      </span>
                      {faq.tags.map(t => (
                        <span key={t} className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Tag className="w-2.5 h-2.5" />
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-amber-600 font-mono text-xs font-black">Q{index + 1}:</span>
                      {faq.question}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {faq.summary}
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 text-slate-500 shrink-0 mt-1 group-hover:bg-amber-50 group-hover:text-amber-800 transition">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-700 space-y-4 animate-fadeIn">
                    
                    <p className="font-medium text-slate-800 leading-relaxed">
                      {faq.summary}
                    </p>

                    {/* Common Causes if any */}
                    {faq.commonCauses && (
                      <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5 space-y-2">
                        <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          สาเหตุที่พบบ่อย (Common Root Causes):
                        </div>
                        <ul className="space-y-1 text-xs text-rose-800 pl-4 list-disc">
                          {faq.commonCauses.map((cause, ci) => (
                            <li key={ci}>{cause}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Step-by-Step Guidance */}
                    {faq.steps && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          แนวทางแก้ไขทีละขั้นตอน (Step-by-Step Action Plan):
                        </div>
                        <div className="space-y-2 text-xs text-slate-700">
                          {faq.steps.map((step, si) => (
                            <div key={si} className="p-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs leading-relaxed">
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical Tips */}
                    {faq.technicalTips && (
                      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-950">
                          <span className="font-bold">เคล็ดลับช่างเทคนิค LUMENCRAFT:</span> {faq.technicalTips}
                        </div>
                      </div>
                    )}

                    {/* Footer Feedback */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
                      <span className="text-[11px]">เอกสารทางการรับรองโดยฝ่ายวิศวกรรม LUMENCRAFT</span>
                      
                      <button
                        onClick={(e) => handleVoteHelpful(faq.id, e)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          isVoted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'text-emerald-700' : 'text-slate-500'}`} />
                        <span>{isVoted ? 'ขอบคุณสำหรับข้อมูล!' : 'บทความนี้มีประโยชน์'}</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Engineering Hotline & Emergency Support Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
              24/7 Technical Hotline
            </span>
            <span className="text-xs text-slate-400">
              สายด่วนช่วยเหลือกรณีฉุกเฉินหน้างาน
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">
            หากพบปัญหาหน้างานที่ไม่สามารถแก้ไขได้ตามคู่มือ
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            ติดต่อทีมวิศวกรผู้เชี่ยวชาญ DALI & Automation เพื่อขอคำปรึกษาทางโทรศัพท์ หรือเปิดใบคำขอ E-Request ฉุกเฉิน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs space-y-1">
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-bold text-white">089-111-2233 (คุณพัด - หัวหน้าวิศวกร)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>engineering@lumencraft.co.th</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ASK QUESTION / SUBMIT ISSUE MODAL ================= */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-900">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">ส่งคำถามหรือบันทึกปัญหาทางเทคนิคใหม่</h3>
                  <p className="text-xs text-slate-500">ทีมวิศวกรจะนำข้อมูลไปตอบและบรรจุในคู่มือ FAQ</p>
                </div>
              </div>
              <button
                onClick={() => setShowAskModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-900 text-sm">ส่งคำถามสำเร็จเรียบร้อย!</h4>
                <p className="text-xs text-slate-600">ทีมวิศวกร LUMENCRAFT ได้รับข้อมูลแล้ว และจะทำการอัปเดตคู่มือโดยเร็ว</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuestion} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    หมวดหมู่ของปัญหา <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="switching_power">การเลือกหม้อแปลง Switching 12V/24V</option>
                    <option value="dimming_driver">การเลือกหม้อแปลงดิม (DALI, 0-10V, Triac, Push-Dim)</option>
                    <option value="cable_sizing">การเลือกสายไฟ 24V และระยะสาย (Voltage Drop)</option>
                    <option value="strip_neonflex">การตัดต่อ LED Strip & Neon Flex</option>
                    <option value="underwater">โคมใต้น้ำ & การต่อสายไฟใต้น้ำ (IP68)</option>
                    <option value="garden_landscape">การติดตั้งโคมในสวน & ข้อจำกัด (IP67)</option>
                    <option value="dali_control">ระบบ DALI & Automation Control</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    หัวข้อคำถาม / สรุปอาการเสีย <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น โคมดาวน์ไลท์ DALI ในห้องประชุม Address หลุดบ่อย"
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    รายละเอียดเพิ่มเติม / สภาพแวดล้อมหน้างาน:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ระบุรุ่น Driver, โครงการ, ความยาวสาย, หรืออาการที่พบเพิ่มเติม..."
                    value={newDetail}
                    onChange={e => setNewDetail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    ส่งคำถามไปยังฐานความรู้
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
