import { StaffMember, EEngineerRequest, EngineerInquiry, EngineerDailyAttendance } from '../types';

export const INITIAL_STAFF: StaffMember[] = [
  // Admin Sale
  { 
    id: 'adm-1', 
    name: 'พี่ก้อย', 
    team: 'Admin Sale', 
    role: 'หัวหน้าทีมธุรการขาย (Senior Sales Admin Lead)', 
    department: 'แผนกธุรการและประสานงานขาย (Admin Sales)', 
    phone: '081-234-5671', 
    email: 'koy.adm@lumencraft.co.th', 
    workStatus: 'active' 
  },
  { 
    id: 'adm-2', 
    name: 'ชมพู่', 
    team: 'Admin Sale', 
    role: 'เจ้าหน้าที่ประสานงานขาย (Sales Coordinator)', 
    department: 'แผนกธุรการและประสานงานขาย (Admin Sales)', 
    phone: '081-234-5672', 
    email: 'chompoo.adm@lumencraft.co.th', 
    workStatus: 'active' 
  },
  { 
    id: 'adm-3', 
    name: 'เพชร', 
    team: 'Admin Sale', 
    role: 'เจ้าหน้าที่ธุรการเอกสารและระบบ (Sales Admin Officer)', 
    department: 'แผนกธุรการและประสานงานขาย (Admin Sales)', 
    phone: '081-234-5673', 
    email: 'petch.adm@lumencraft.co.th', 
    workStatus: 'active' 
  },
  
  // Engineers (พัด, โชค, วิน, วัฒน์)
  { 
    id: 'eng-1', 
    name: 'พัด', 
    team: 'Engineer', 
    role: 'วิศวกรควบคุมระบบแสงสว่าง (Lighting Control Engineer)', 
    department: 'แผนกวิศวกรรมและบริการเทคนิค (Engineering)', 
    phone: '089-111-2233', 
    email: 'pat.eng@lumencraft.co.th', 
    workStatus: 'busy', // กำลังทำงาน (แดง)
    currentTask: 'SO-690812 โครงการ One Bangkok Tower B (ขอเข้า Service ระบบ DALI)',
    currentLocation: {
      lat: 13.7288,
      lng: 100.5475,
      siteName: 'One Bangkok, ถนนพระราม 4 แขวงลุมพินี เขตปทุมวัน กทม.',
      updatedAt: '2026-08-16 10:30'
    }
  },
  { 
    id: 'eng-2', 
    name: 'โชค', 
    team: 'Engineer', 
    role: 'วิศวกรระบบ DALI และ Automation (Systems Engineer)', 
    department: 'แผนกวิศวกรรมและบริการเทคนิค (Engineering)', 
    phone: '089-222-3344', 
    email: 'choke.eng@lumencraft.co.th', 
    workStatus: 'active', // ว่าง (เขียว)
    currentTask: 'พร้อมรับงานใหม่ (รอเรียกงานจากฝ่ายขาย)',
    currentLocation: {
      lat: 13.7380,
      lng: 100.6080,
      siteName: 'สำนักงานใหญ่ LUMENCRAFT ถ.พัฒนาการ 13 สวนหลวง กทม.',
      updatedAt: '2026-08-16 10:15'
    }
  },
  { 
    id: 'eng-3', 
    name: 'วิน', 
    team: 'Engineer', 
    role: 'วิศวกรสนามและทดสอบอุปกรณ์ (Field Test Engineer)', 
    department: 'แผนกวิศวกรรมและบริการเทคนิค (Engineering)', 
    phone: '089-333-4455', 
    email: 'win.eng@lumencraft.co.th', 
    workStatus: 'waiting', // รองาน (เหลือง)
    currentTask: 'รอยืนยันแบบหน้างาน โครงการ Dusit Central Park',
    currentLocation: {
      lat: 13.7295,
      lng: 100.5365,
      siteName: 'Dusit Central Park, สีลม กทม.',
      updatedAt: '2026-08-16 09:45'
    }
  },
  { 
    id: 'eng-4', 
    name: 'วัฒน์', 
    team: 'Engineer', 
    role: 'วิศวกรงานติดตั้งและ Mock up (Installation & Mockup Engineer)', 
    department: 'แผนกวิศวกรรมและบริการเทคนิค (Engineering)', 
    phone: '089-444-5566', 
    email: 'wat.eng@lumencraft.co.th', 
    workStatus: 'busy', // กำลังทำงาน (แดง)
    currentTask: 'SO-690815 โครงการ The Forestias (Mock up ไฟ Façade)',
    currentLocation: {
      lat: 13.6558,
      lng: 100.6690,
      siteName: 'The Forestias, ถนนบางนา-ตราด กม.7 สมุทรปราการ',
      updatedAt: '2026-08-16 10:00'
    }
  },

  // SALE
  { 
    id: 'sale-1', 
    name: 'คุณกุ้ง', 
    team: 'SALE', 
    role: 'เจ้าหน้าที่บริหารงานขายโครงการอาวุโส (Senior Project Sales)', 
    department: 'แผนกงานขายโครงการ (Sales Department)', 
    phone: '082-101-0001', 
    email: 'kung.sale@lumencraft.co.th', 
    workStatus: 'active' 
  },
  { 
    id: 'sale-2', 
    name: 'คุณปุ๋ม', 
    team: 'SALE', 
    role: 'เจ้าหน้าที่บริหารงานขายโครงการ (Project Sales Executive)', 
    department: 'แผนกงานขายโครงการ (Sales Department)', 
    phone: '082-101-0002', 
    email: 'poum.sale@lumencraft.co.th', 
    workStatus: 'active' 
  },
  { 
    id: 'sale-3', 
    name: 'คุณเก่ง', 
    team: 'SALE', 
    role: 'เจ้าหน้าที่บริหารงานขายโครงการ (Project Sales Executive)', 
    department: 'แผนกงานขายโครงการ (Sales Department)', 
    phone: '082-101-0003', 
    email: 'keng.sale@lumencraft.co.th', 
    workStatus: 'active' 
  },
  { 
    id: 'sale-4', 
    name: 'คุณป่าน', 
    team: 'SALE', 
    role: 'เจ้าหน้าที่งานขายผลิตภัณฑ์ส่องสว่าง (Lighting Sales Specialist)', 
    department: 'แผนกงานขายโครงการ (Sales Department)', 
    phone: '082-101-0004', 
    email: 'parn.sale@lumencraft.co.th', 
    workStatus: 'active' 
  },
  { 
    id: 'sale-5', 
    name: 'คุณเบลล่า', 
    team: 'SALE', 
    role: 'เจ้าหน้าที่พัฒนาธุรกิจงานขาย (Business Development Sales)', 
    department: 'แผนกงานขายโครงการ (Sales Department)', 
    phone: '082-101-0005', 
    email: 'bella.sale@lumencraft.co.th', 
    workStatus: 'active' 
  },
  { 
    id: 'sale-6', 
    name: 'คุณพอพอ', 
    team: 'SALE', 
    role: 'เจ้าหน้าที่งานขาย (Sales Executive)', 
    department: 'แผนกงานขายโครงการ (Sales Department)', 
    phone: '082-101-0006', 
    email: 'pawpaw.sale@lumencraft.co.th', 
    workStatus: 'active' 
  },
  { 
    id: 'sale-7', 
    name: 'คุณมิ้น', 
    team: 'SALE', 
    role: 'เจ้าหน้าที่งานขาย (Sales Executive)', 
    department: 'แผนกงานขายโครงการ (Sales Department)', 
    phone: '082-101-0007', 
    email: 'mint.sale@lumencraft.co.th', 
    workStatus: 'active' 
  },
  { 
    id: 'sale-8', 
    name: 'คุณปุ๊', 
    team: 'SALE', 
    role: 'เจ้าหน้าที่งานขาย (Sales Executive)', 
    department: 'แผนกงานขายโครงการ (Sales Department)', 
    phone: '082-101-0008', 
    email: 'pu.sale@lumencraft.co.th', 
    workStatus: 'active' 
  },
  { 
    id: 'sale-9', 
    name: 'คุณแพม', 
    team: 'SALE', 
    role: 'เจ้าหน้าที่งานขาย (Sales Executive)', 
    department: 'แผนกงานขายโครงการ (Sales Department)', 
    phone: '082-101-0009', 
    email: 'pam.sale@lumencraft.co.th', 
    workStatus: 'active' 
  },

  // SALE MANAGER
  { 
    id: 'mgr-1', 
    name: 'คุณอ้อม', 
    team: 'SALE MANAGER', 
    role: 'ผู้จัดการฝ่ายขายและพัฒนาโครงการ (Sales & Project Manager)', 
    department: 'แผนกบริหารการขาย (Sales Management)', 
    phone: '080-999-8888', 
    email: 'aom.mgr@lumencraft.co.th', 
    workStatus: 'active' 
  }
];

export const INITIAL_REQUESTS: EEngineerRequest[] = [
  // 1. Pending Sale Sign (กล่องแดงฝ่ายขาย)
  {
    id: 'req-001',
    docNumber: 'E-20260816-001',
    soNumber: 'SO-690820',
    requestDate: '2026-08-16',
    targetDate: '2026-08-17',
    deadlineDate: '2026-08-18',
    customerName: 'บริษัท แมกโนเลีย ควอลิตี้ ดีเวล็อปเม้นต์ จำกัด',
    projectName: 'The Forestias Signature Series',
    siteContactName: 'คุณสมศักดิ์ วิศวกรโครงการ',
    siteContactPhone: '089-988-7766',
    siteContactEmail: 'somsak@mqdc.com',
    salesOwner: 'คุณกุ้ง',
    adminRequester: 'พี่ก้อย',
    categories: {
      service: true,
      serviceNote: 'ตรวจสอบระบบ Dimming โคมไฟ Linear LED ชั้น 15-20 ไม่ตอบสนองคำสั่ง DMX',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_emergency', // 24 ชม.
    workDetails: 'ต้องการให้วิศวกรเข้าตรวจสอบ Driver DALI/DMX หน้างานด่วนเนื่องจากมีงานตรวจรับมอบห้องตัวอย่างในวันพรุ่งนี้',
    needReport: true,
    customerReportEmail: 'somsak.report@mqdc.com',
    serverShareDriveLink: 'https://share.lumencraft.internal/projects/forestias-690820',
    attachments: [
      {
        id: 'att-1',
        name: 'SLD-Lighting-FL15-20.pdf',
        size: 2450000,
        type: 'drawing',
        url: '#',
        uploadedAt: '2026-08-16 08:30'
      }
    ],
    status: 'pending_sale_sign',
    adminSignature: {
      signerName: 'พี่ก้อย (Admin Sale)',
      role: 'Admin Sale',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,25 Q30,5 50,25 T90,20" stroke="%230f766e" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-16 08:35'
    },
    history: [
      {
        id: 'h-1',
        timestamp: '2026-08-16 08:35',
        action: 'ออกใบคำขอ E-Request',
        actor: 'พี่ก้อย',
        role: 'Admin Sale',
        details: 'สร้างใบคำขอ E-20260816-001 (SO-690820) ความสำคัญ: ด่วนที่สุด (24 ชม.)'
      }
    ],
    createdAt: '2026-08-16 08:35',
    updatedAt: '2026-08-16 08:35'
  },

  // 2. Pending Engineer Accept (กล่องแดงวิศวกรกระพริบ)
  {
    id: 'req-002',
    docNumber: 'E-20260815-004',
    soNumber: 'SO-690818',
    requestDate: '2026-08-15',
    targetDate: '2026-08-17',
    deadlineDate: '2026-08-19',
    customerName: 'บริษัท อนันดา ดีเวลลอปเม้นท์ จํากัด (มหาชน)',
    projectName: 'Ideo Rama 9 Asoke',
    siteContactName: 'คุณธวัชชัย',
    siteContactPhone: '081-555-4433',
    siteContactEmail: 'thawatchai@ananda.co.th',
    salesOwner: 'คุณปุ๋ม',
    adminRequester: 'ชมพู่',
    categories: {
      service: false,
      serviceNote: '',
      countingDrawing: true,
      countingDrawingNote: 'นับแบบ Lighting Layout โซน Sky Lounge ชั้น Rooftop',
      meetingOrMockup: true,
      meetingOrMockupNote: 'เข้าร่วมประชุมหน้างานกับ Interior Designer',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_urgent', // 2-3 วัน
    workDetails: 'ขอวิศวกรช่วยนับแบบและตรวจสอบ fixture schedule พร้อมเข้าประชุมร่วมเสนอเทคนิคการติดตั้ง',
    needReport: false,
    attachments: [],
    status: 'pending_engineer_accept',
    adminSignature: {
      signerName: 'ชมพู่ (Admin Sale)',
      role: 'Admin Sale',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,20 Q30,35 60,15 T90,25" stroke="%230f766e" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-15 14:00'
    },
    salesSignature: {
      signerName: 'คุณปุ๋ม (SALE)',
      role: 'SALE',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M15,30 Q45,5 75,30 T95,10" stroke="%232563eb" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-15 14:45'
    },
    history: [
      {
        id: 'h-2a',
        timestamp: '2026-08-15 14:00',
        action: 'ออกใบคำขอ E-Request',
        actor: 'ชมพู่',
        role: 'Admin Sale',
        details: 'ส่งเรื่องไปยังฝ่ายขาย คุณปุ๋ม'
      },
      {
        id: 'h-2b',
        timestamp: '2026-08-15 14:45',
        action: 'ฝ่ายขายลงนามส่งต่อวิศวกร',
        actor: 'คุณปุ๋ม',
        role: 'SALE',
        details: 'อนุมัติส่งมอบงานต่อให้ทีมวิศวกร'
      }
    ],
    createdAt: '2026-08-15 14:00',
    updatedAt: '2026-08-15 14:45'
  },

  // 3. Engineer Rejected (กล่องแดงฝ่ายขาย: งานถูกปฏิเสธ)
  {
    id: 'req-003',
    docNumber: 'E-20260814-002',
    soNumber: 'SO-690812',
    requestDate: '2026-08-14',
    targetDate: '2026-08-15',
    deadlineDate: '2026-08-16',
    customerName: 'บริษัท ทีซีซี แอสเซ็ทส์ (ประเทศไทย) จำกัด',
    projectName: 'One Bangkok Tower 4',
    siteContactName: 'คุณประพันธ์ วิศวกรไฟฟ้า',
    siteContactPhone: '085-443-3221',
    siteContactEmail: 'prapan@onebangkok.com',
    salesOwner: 'คุณเก่ง',
    adminRequester: 'เพชร',
    categories: {
      service: false,
      serviceNote: '',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: true,
      claimProductNote: 'โคมไฟสปอตไลท์ 50W ชำรุด 8 ชุด มีเสียงจี่และไฟกระพริบ'
    },
    priority: 'alert_emergency',
    workDetails: 'เคลมสินค้าโคมสปอตไลท์ ขอให้ช่างไปถอดเปลี่ยนและทดสอบระบบไฟฟ้าใหม่',
    needReport: true,
    customerReportEmail: 'prapan.eng@onebangkok.com',
    assignedEngineer: 'วัฒน์',
    engineerRejectReason: 'หน้างานยังไม่มีนั่งร้านสำหรับความสูง 6 เมตร และยังไม่มีของเคลมในสต๊อกช่าง รบกวนประสานงานสต๊อกและเตรียมนั่งร้านก่อนครับ',
    status: 'engineer_rejected',
    adminSignature: {
      signerName: 'เพชร (Admin Sale)',
      role: 'Admin Sale',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,15 Q40,30 70,10 T90,30" stroke="%230f766e" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-14 11:00'
    },
    salesSignature: {
      signerName: 'คุณเก่ง (SALE)',
      role: 'SALE',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,25 Q50,5 85,25" stroke="%232563eb" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-14 11:30'
    },
    engineerSignature: {
      signerName: 'วัฒน์ (Engineer)',
      role: 'Engineer',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,30 Q30,10 60,30 T95,15" stroke="%23dc2626" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-14 13:00',
      remark: 'ปฏิเสธงานเนื่องจากความปลอดภัยหน้างานยังไม่พร้อม'
    },
    attachments: [],
    workPhotos: [
      {
        id: 'wp-7a',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
        name: 'before_dimming_hyatt_ballroom.jpg',
        size: 245000,
        stage: 'before',
        description: 'ก่อนแก้ไข: ระบบไฟแชนเดอเลียร์ห้องบอลรูมกระพริบเมื่อหรี่ต่ำกว่า 30% และ Scene Gala Dinner ไม่ตอบสนอง',
        uploadedAt: '2026-08-15 13:30',
        uploadedBy: 'ช่างวิน (Engineer)'
      },
      {
        id: 'wp-7b',
        url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&auto=format&fit=crop&q=80',
        name: 'after_dimming_hyatt_ballroom.jpg',
        size: 310000,
        stage: 'after',
        description: 'หลังแก้ไข: ทำการ Re-program DALI Curve ปรับ Smooth Fade 3.5s แสงนิ่งสม่ำเสมอทุกแชนเดอเลียร์ ทดสอบผ่าน 100%',
        uploadedAt: '2026-08-15 17:15',
        uploadedBy: 'ช่างวิน (Engineer)'
      }
    ],
    history: [
      {
        id: 'h-3a',
        timestamp: '2026-08-14 11:00',
        action: 'ออกใบคำขอ E-Request',
        actor: 'เพชร',
        role: 'Admin Sale',
        details: 'ส่งเรื่องไปฝ่ายขาย'
      },
      {
        id: 'h-3b',
        timestamp: '2026-08-14 11:30',
        action: 'ฝ่ายขายลงนาม',
        actor: 'คุณเก่ง',
        role: 'SALE',
        details: 'ส่งเรื่องให้วิศวกร'
      },
      {
        id: 'h-3c',
        timestamp: '2026-08-14 13:00',
        action: 'วิศวกรปฏิเสธงาน',
        actor: 'วัฒน์',
        role: 'Engineer',
        details: 'ระบุเหตุผล: หน้างานยังไม่มีนั่งร้านและยังไม่มีของเคลมในสต๊อก'
      }
    ],
    createdAt: '2026-08-14 11:00',
    updatedAt: '2026-08-14 13:00'
  },

  // 4. Engineer Rescheduled (กล่องฟ้าฝ่ายขาย: วิศวกรขอเลื่อนวัน)
  {
    id: 'req-004',
    docNumber: 'E-20260814-001',
    soNumber: 'SO-690809',
    requestDate: '2026-08-14',
    targetDate: '2026-08-16',
    deadlineDate: '2026-08-17',
    customerName: 'บริษัท สยามพิวรรธน์ จำกัด',
    projectName: 'Siam Paragon Renovation G Floor',
    siteContactName: 'คุณกิตติศักดิ์',
    siteContactPhone: '086-123-9988',
    siteContactEmail: 'kittisak@siampiwat.com',
    salesOwner: 'คุณป่าน',
    adminRequester: 'พี่ก้อย',
    categories: {
      service: false,
      serviceNote: '',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: true,
      meetingOrMockupNote: 'ทดสอบ Mock up โคมไฟ Track Light ปรับองศา 15-45 องศา',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_urgent',
    workDetails: 'นัด Mock up ไฟใน Shop แบรนด์เนม ต้องเข้าหลังห้างปิด 22:00 น.',
    needReport: true,
    customerReportEmail: 'kittisak@siampiwat.com',
    assignedEngineer: 'พัด',
    engineerRescheduleDate: '2026-08-18',
    engineerRescheduleReason: 'ติดภารกิจหน้างาน One Bangkok ถึงช่วงดึก จึงขอเลื่อนเป็นคืนวันที่ 18 ส.ค. แทนครับ',
    engineerSitePreparation: 'ขอให้ประสานงานฝ่ายอาคารพารากอนเปิดระบบไฟราง Track และเตรียมบัตร Work Permit ช่าง 2 ท่าน',
    status: 'engineer_rescheduled',
    adminSignature: {
      signerName: 'พี่ก้อย (Admin Sale)',
      role: 'Admin Sale',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,25 Q30,5 50,25 T90,20" stroke="%230f766e" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-14 09:00'
    },
    salesSignature: {
      signerName: 'คุณป่าน (SALE)',
      role: 'SALE',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,30 Q40,10 70,30 T95,20" stroke="%232563eb" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-14 09:30'
    },
    attachments: [],
    workPhotos: [
      {
        id: 'wp-8a',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80',
        name: 'before_fix_transformer_hum.jpg',
        size: 198000,
        stage: 'before',
        description: 'ก่อนแก้ไข: หม้อแปลง 24V ใต้อ่างล้างหน้าเกิดเสียงฮัมดังรบกวน และสายต่อจุด Strip LED หลวม',
        uploadedAt: '2026-08-14 10:30',
        uploadedBy: 'ช่างโชค (Engineer)'
      },
      {
        id: 'wp-8b',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
        name: 'after_fix_transformer_silent.jpg',
        size: 275000,
        stage: 'after',
        description: 'หลังแก้ไข: เปลี่ยนหม้อแปลง Meanwell 24V เกรดไร้เสียง เชื่อมต่อขั้วสายกันน้ำและตรวจวัดแรงดัน 24.1V นิ่งสนิท',
        uploadedAt: '2026-08-14 14:45',
        uploadedBy: 'ช่างโชค (Engineer)'
      }
    ],
    history: [
      {
        id: 'h-4a',
        timestamp: '2026-08-14 09:00',
        action: 'ออกใบคำขอ E-Request',
        actor: 'พี่ก้อย',
        role: 'Admin Sale',
        details: 'ส่งให้คุณป่าน'
      },
      {
        id: 'h-4b',
        timestamp: '2026-08-14 09:30',
        action: 'ฝ่ายขายลงนาม',
        actor: 'คุณป่าน',
        role: 'SALE',
        details: 'ส่งให้ช่างพัด'
      },
      {
        id: 'h-4c',
        timestamp: '2026-08-15 11:00',
        action: 'วิศวกรขอเลื่อนนัด',
        actor: 'พัด',
        role: 'Engineer',
        details: 'ขอเลื่อนเป็นวันที่ 2026-08-18 ระบุสิ่งหน้างานต้องเตรียม: Work Permit พารากอน'
      }
    ],
    createdAt: '2026-08-14 09:00',
    updatedAt: '2026-08-15 11:00'
  },

  // 5. Ready for Site (กล่องเหลืองฝ่ายขาย: รอวิศวกรลงพื้นที่ & เตือน 1 วันก่อน)
  {
    id: 'req-005',
    docNumber: 'E-20260813-005',
    soNumber: 'SO-690805',
    requestDate: '2026-08-13',
    targetDate: '2026-08-17', // พรุ่งนี้ (จะขึ้นแจ้งเตือน 1 วันล่วงหน้า)
    deadlineDate: '2026-08-17',
    customerName: 'บริษัท เซ็นทรัลพัฒนา จำกัด (มหาชน)',
    projectName: 'Central Embassy Penthouse Suite',
    siteContactName: 'คุณวรวุฒิ',
    siteContactPhone: '087-444-1122',
    siteContactEmail: 'worawut@centralpattana.co.th',
    salesOwner: 'คุณเบลล่า',
    adminRequester: 'ชมพู่',
    categories: {
      service: true,
      serviceNote: 'Commissioning ระบบ Smart Control Wireless Zigbee & CASAMBI',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_normal', // ปกติ
    workDetails: 'ตั้งค่า Scene แสงสว่าง 8 โซน และสอนการใช้งานแอปพลิเคชันให้ทีมงานของลูกค้า',
    needReport: true,
    customerReportEmail: 'worawut.pm@centralpattana.co.th',
    assignedEngineer: 'โชค',
    status: 'ready_for_site',
    adminSignature: {
      signerName: 'ชมพู่ (Admin Sale)',
      role: 'Admin Sale',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,20 Q30,35 60,15 T90,25" stroke="%230f766e" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-13 10:00'
    },
    salesSignature: {
      signerName: 'คุณเบลล่า (SALE)',
      role: 'SALE',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M15,25 Q40,10 70,25 T95,15" stroke="%232563eb" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-13 10:30'
    },
    engineerSignature: {
      signerName: 'โชค (Engineer)',
      role: 'Engineer',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,25 Q40,40 70,10 T95,20" stroke="%2316a34a" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-13 13:00'
    },
    attachments: [],
    history: [
      {
        id: 'h-5a',
        timestamp: '2026-08-13 10:00',
        action: 'ออกใบคำขอ E-Request',
        actor: 'ชมพู่',
        role: 'Admin Sale',
        details: 'ส่งให้คุณเบลล่า'
      },
      {
        id: 'h-5b',
        timestamp: '2026-08-13 10:30',
        action: 'ฝ่ายขายลงนาม',
        actor: 'คุณเบลล่า',
        role: 'SALE',
        details: 'ส่งต่อให้ช่างโชค'
      },
      {
        id: 'h-5c',
        timestamp: '2026-08-13 13:00',
        action: 'วิศวกรตกลงรับงาน',
        actor: 'โชค',
        role: 'Engineer',
        details: 'รับงานและยืนยันนัดหมายวันที่ 2026-08-17'
      }
    ],
    createdAt: '2026-08-13 10:00',
    updatedAt: '2026-08-13 13:00'
  },

  // 6. In-Progress (วิศวกรเช็คอินแล้ว & กำลังทำงานหน้างาน)
  {
    id: 'req-006',
    docNumber: 'E-20260812-003',
    soNumber: 'SO-690801',
    requestDate: '2026-08-12',
    targetDate: '2026-08-16',
    deadlineDate: '2026-08-16',
    customerName: 'บริษัท ทีซีซี แอสเซ็ทส์ (ประเทศไทย) จำกัด',
    projectName: 'One Bangkok Tower B',
    siteContactName: 'คุณประสิทธิ์',
    siteContactPhone: '081-999-1234',
    siteContactEmail: 'prasit@onebangkok.com',
    salesOwner: 'คุณพอพอ',
    adminRequester: 'พี่ก้อย',
    categories: {
      service: true,
      serviceNote: 'บริการตรวจสอบระบบไฟ DALI Main Entrance และเชื่อมต่อ Gateway BACnet',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_emergency',
    workDetails: 'ระบบ DALI หลุดการเชื่อมต่อกับระบบควบคุมอาคาร BAS ของ One Bangkok ต้องการด่วน',
    needReport: true,
    customerReportEmail: 'prasit@onebangkok.com',
    assignedEngineer: 'พัด',
    checkInData: {
      latitude: 13.7288,
      longitude: 100.5475,
      address: 'One Bangkok, ถนนพระราม 4 แขวงลุมพินี เขตปทุมวัน กทม.',
      checkInTime: '2026-08-16 09:15',
      engineerName: 'พัด',
      photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80'
    },
    status: 'in_progress',
    adminSignature: {
      signerName: 'พี่ก้อย (Admin Sale)',
      role: 'Admin Sale',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,25 Q30,5 50,25 T90,20" stroke="%230f766e" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-12 11:00'
    },
    salesSignature: {
      signerName: 'คุณพอพอ (SALE)',
      role: 'SALE',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,20 Q50,40 90,15" stroke="%232563eb" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-12 11:30'
    },
    engineerSignature: {
      signerName: 'พัด (Engineer)',
      role: 'Engineer',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,25 Q40,5 80,30 T95,10" stroke="%2316a34a" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-12 13:00'
    },
    attachments: [],
    history: [
      {
        id: 'h-6a',
        timestamp: '2026-08-12 11:00',
        action: 'ออกใบคำขอ E-Request',
        actor: 'พี่ก้อย',
        role: 'Admin Sale',
        details: 'ส่งเรื่องไปฝ่ายขาย'
      },
      {
        id: 'h-6b',
        timestamp: '2026-08-12 11:30',
        action: 'ฝ่ายขายลงนาม',
        actor: 'คุณพอพอ',
        role: 'SALE',
        details: 'มอบหมายช่างพัด'
      },
      {
        id: 'h-6c',
        timestamp: '2026-08-12 13:00',
        action: 'วิศวกรตกลงรับงาน',
        actor: 'พัด',
        role: 'Engineer',
        details: 'ยืนยันนัดหมาย 2026-08-16'
      },
      {
        id: 'h-6d',
        timestamp: '2026-08-16 09:15',
        action: 'Check-in หน้างาน (GPS Verified)',
        actor: 'พัด',
        role: 'Engineer',
        details: 'เช็คอินพิกัด GPS 13.7288, 100.5475 ถ.พระราม 4'
      }
    ],
    createdAt: '2026-08-12 11:00',
    updatedAt: '2026-08-16 09:15'
  },

  // 7. Completed by Engineer (รอประเมินลูกค้า Customer Portal)
  {
    id: 'req-007',
    docNumber: 'E-20260811-002',
    soNumber: 'SO-690795',
    requestDate: '2026-08-11',
    targetDate: '2026-08-15',
    deadlineDate: '2026-08-15',
    customerName: 'โรงแรม แกรนด์ ไฮแอท เอราวัณ กรุงเทพฯ',
    projectName: 'Grand Hyatt Erawan Grand Ballroom',
    siteContactName: 'คุณมนัส ผู้จัดการฝ่ายวิศวกรรม',
    siteContactPhone: '083-221-4455',
    siteContactEmail: 'manas@hyatt.com',
    salesOwner: 'คุณมิ้น',
    adminRequester: 'เพชร',
    categories: {
      service: true,
      serviceNote: 'ปรับตั้งค่า Scene ไฟ Chandeliers และไฟ Indirect LED สำหรับงาน Gala Dinner',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_emergency',
    workDetails: 'ปรับแต่งความสว่างและ Smooth Fade Curve ของไฟแชนเดอเลียร์ในห้องบอลรูม',
    needReport: true,
    customerReportEmail: 'manas.eng@hyatt.com',
    assignedEngineer: 'วิน',
    checkInData: {
      latitude: 13.7436,
      longitude: 100.5408,
      address: 'Grand Hyatt Erawan, ถนนราชดำริ แขวงลุมพินี เขตปทุมวัน กทม.',
      checkInTime: '2026-08-15 13:00',
      engineerName: 'วิน',
      photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80'
    },
    status: 'completed_by_engineer',
    adminSignature: {
      signerName: 'เพชร (Admin Sale)',
      role: 'Admin Sale',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,15 Q40,30 70,10 T90,30" stroke="%230f766e" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-11 14:00'
    },
    salesSignature: {
      signerName: 'คุณมิ้น (SALE)',
      role: 'SALE',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,25 Q35,5 65,35 T95,15" stroke="%232563eb" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-11 14:30'
    },
    engineerSignature: {
      signerName: 'วิน (Engineer)',
      role: 'Engineer',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,20 Q40,5 70,30 T95,20" stroke="%2316a34a" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-15 17:30',
      remark: 'ดำเนินการโปรแกรม Scene ไฟและทดสอบระบบเรียบร้อย 100%'
    },
    attachments: [],
    workPhotos: [
      {
        id: 'wp-7a',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
        name: 'before_dimming_hyatt_ballroom.jpg',
        size: 245000,
        stage: 'before',
        description: 'ก่อนแก้ไข: ระบบไฟแชนเดอเลียร์ห้องบอลรูมกระพริบเมื่อหรี่ต่ำกว่า 30% และ Scene Gala Dinner ไม่ตอบสนอง',
        uploadedAt: '2026-08-15 13:30',
        uploadedBy: 'ช่างวิน (Engineer)'
      },
      {
        id: 'wp-7b',
        url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&auto=format&fit=crop&q=80',
        name: 'after_dimming_hyatt_ballroom.jpg',
        size: 310000,
        stage: 'after',
        description: 'หลังแก้ไข: ทำการ Re-program DALI Curve ปรับ Smooth Fade 3.5s แสงนิ่งสม่ำเสมอทุกแชนเดอเลียร์ ทดสอบผ่าน 100%',
        uploadedAt: '2026-08-15 17:15',
        uploadedBy: 'ช่างวิน (Engineer)'
      }
    ],
    history: [
      {
        id: 'h-7a',
        timestamp: '2026-08-11 14:00',
        action: 'ออกใบคำขอ E-Request',
        actor: 'เพชร',
        role: 'Admin Sale',
        details: 'ส่งเรื่องไปฝ่ายขาย'
      },
      {
        id: 'h-7b',
        timestamp: '2026-08-11 14:30',
        action: 'ฝ่ายขายลงนาม',
        actor: 'คุณมิ้น',
        role: 'SALE',
        details: 'มอบหมายช่างวิน'
      },
      {
        id: 'h-7c',
        timestamp: '2026-08-15 13:00',
        action: 'Check-in หน้างาน',
        actor: 'วิน',
        role: 'Engineer',
        details: 'เช็คอิน Grand Hyatt Erawan'
      },
      {
        id: 'h-7d',
        timestamp: '2026-08-15 17:30',
        action: 'ส่งมอบงานสำเร็จ (Complete)',
        actor: 'วิน',
        role: 'Engineer',
        details: 'เสร็จสิ้นงาน ส่งต่อระบบประเมินลูกค้า'
      }
    ],
    createdAt: '2026-08-11 14:00',
    updatedAt: '2026-08-15 17:30'
  },

  // 8. Completed by Customer (กล่องเขียวฝ่ายขาย: รอฝ่ายขายประเมิน 5 มิติ & ปิดงาน)
  {
    id: 'req-008',
    docNumber: 'E-20260810-001',
    soNumber: 'SO-690788',
    requestDate: '2026-08-10',
    targetDate: '2026-08-14',
    deadlineDate: '2026-08-14',
    customerName: 'บริษัท เอสซี แอสเสท คอร์ปอเรชั่น จำกัด (มหาชน)',
    projectName: '28 Chidlom (Luxury Condominium)',
    siteContactName: 'คุณชาญชัย',
    siteContactPhone: '081-333-7788',
    siteContactEmail: 'chanchai@scasset.com',
    salesOwner: 'คุณแพม',
    adminRequester: 'พี่ก้อย',
    categories: {
      service: true,
      serviceNote: 'Service แก้ไขจุดต่อไฟ Strip LED ใต้อ่างล้างหน้าและตู้เสื้อผ้า Walk-in closet',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_urgent',
    workDetails: 'แก้ไขจุดเชื่อมต่อและเปลี่ยนหม้อแปลงไฟ 24V DC ที่มีเสียงฮัม',
    needReport: true,
    customerReportEmail: 'chanchai.sc@scasset.com',
    assignedEngineer: 'โชค',
    checkInData: {
      latitude: 13.7445,
      longitude: 100.5435,
      address: '28 Chidlom, ซอยชิดลม แขวงลุมพินี เขตปทุมวัน กทม.',
      checkInTime: '2026-08-14 10:00',
      engineerName: 'โชค',
      photoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'
    },
    status: 'completed_by_customer',
    adminSignature: {
      signerName: 'พี่ก้อย (Admin Sale)',
      role: 'Admin Sale',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,25 Q30,5 50,25 T90,20" stroke="%230f766e" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-10 09:00'
    },
    salesSignature: {
      signerName: 'คุณแพม (SALE)',
      role: 'SALE',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,20 Q40,5 80,30" stroke="%232563eb" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-10 09:30'
    },
    engineerSignature: {
      signerName: 'โชค (Engineer)',
      role: 'Engineer',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,25 Q40,40 70,10 T95,20" stroke="%2316a34a" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-14 15:00',
      remark: 'เปลี่ยนหม้อแปลงและตรวจเช็คแรงดันไฟเรียบร้อย เสียงฮัมหายเป็นปกติ'
    },
    customerSignature: {
      signerName: 'คุณชาญชัย (SC Asset)',
      role: 'Customer',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,20 Q30,5 60,30 T95,15" stroke="%237c3aed" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-14 15:30'
    },
    customerEvaluation: {
      grooming: 5,
      knowledge: 5,
      problemSolving: 5,
      manner: 5,
      responsiveness: 5,
      feedback: 'ช่างโชคทำงานสุภาพ เรียบร้อยมาก แต่งกายอุปกรณ์เซฟตี้ครบถ้วน และแก้ไขปัญหาได้ตรงจุด รวดเร็วครับ',
      submittedAt: '2026-08-14 15:30'
    },
    attachments: [],
    workPhotos: [
      {
        id: 'wp-8a',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80',
        name: 'before_fix_transformer_hum.jpg',
        size: 198000,
        stage: 'before',
        description: 'ก่อนแก้ไข: หม้อแปลง 24V ใต้อ่างล้างหน้าเกิดเสียงฮัมดังรบกวน และสายต่อจุด Strip LED หลวม',
        uploadedAt: '2026-08-14 10:30',
        uploadedBy: 'ช่างโชค (Engineer)'
      },
      {
        id: 'wp-8b',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
        name: 'after_fix_transformer_silent.jpg',
        size: 275000,
        stage: 'after',
        description: 'หลังแก้ไข: เปลี่ยนหม้อแปลง Meanwell 24V เกรดไร้เสียง เชื่อมต่อขั้วสายกันน้ำและตรวจวัดแรงดัน 24.1V นิ่งสนิท',
        uploadedAt: '2026-08-14 14:45',
        uploadedBy: 'ช่างโชค (Engineer)'
      }
    ],
    history: [
      {
        id: 'h-8a',
        timestamp: '2026-08-10 09:00',
        action: 'ออกใบคำขอ E-Request',
        actor: 'พี่ก้อย',
        role: 'Admin Sale',
        details: 'ส่งเรื่องไปฝ่ายขาย'
      },
      {
        id: 'h-8b',
        timestamp: '2026-08-10 09:30',
        action: 'ฝ่ายขายลงนาม',
        actor: 'คุณแพม',
        role: 'SALE',
        details: 'มอบหมายช่างโชค'
      },
      {
        id: 'h-8c',
        timestamp: '2026-08-14 10:00',
        action: 'Check-in หน้างาน',
        actor: 'โชค',
        role: 'Engineer',
        details: 'เช็คอิน 28 Chidlom'
      },
      {
        id: 'h-8d',
        timestamp: '2026-08-14 15:00',
        action: 'ส่งมอบงานสำเร็จ',
        actor: 'โชค',
        role: 'Engineer',
        details: 'งานเสร็จเรียบร้อย'
      },
      {
        id: 'h-8e',
        timestamp: '2026-08-14 15:30',
        action: 'ลูกค้าประเมิน 5 มิติ (5/5 ดาว)',
        actor: 'คุณชาญชัย',
        role: 'Customer',
        details: 'ประเมินความพึงพอใจ 5 มิติเต็ม 5 ดาวและลงนามดิจิทัล'
      }
    ],
    createdAt: '2026-08-10 09:00',
    updatedAt: '2026-08-14 15:30'
  },

  // 9. Overdue (กล่องแดงฝ่ายขาย: แจ้งเตือนเลยกำหนด Overdue เกินมาแล้ว X วัน)
  {
    id: 'req-009',
    docNumber: 'E-20260808-001',
    soNumber: 'SO-690770',
    requestDate: '2026-08-08',
    targetDate: '2026-08-12', // เลยกำหนดมาแล้ว 4 วัน
    deadlineDate: '2026-08-12',
    customerName: 'บริษัท แสนสิริ จำกัด (มหาชน)',
    projectName: 'KHUN by YOO (Thonglor)',
    siteContactName: 'คุณอรรถพล',
    siteContactPhone: '081-776-5544',
    siteContactEmail: 'attapol@sansiri.com',
    salesOwner: 'คุณปุ๊',
    adminRequester: 'ชมพู่',
    categories: {
      service: false,
      serviceNote: '',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: true,
      claimProductNote: 'โคมไฟสเต็ปไลท์บันไดชั้น 3 ไฟดับ 4 จุด'
    },
    priority: 'alert_urgent',
    workDetails: 'เปลี่ยนไฟบันไดและตรวจสอบหม้อแปลงระบบควบคุม',
    needReport: false,
    assignedEngineer: 'วัฒน์',
    status: 'ready_for_site',
    adminSignature: {
      signerName: 'ชมพู่ (Admin Sale)',
      role: 'Admin Sale',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,20 Q30,35 60,15 T90,25" stroke="%230f766e" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-08 10:00'
    },
    salesSignature: {
      signerName: 'คุณปุ๊ (SALE)',
      role: 'SALE',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,20 Q40,30 80,10" stroke="%232563eb" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-08 10:30'
    },
    engineerSignature: {
      signerName: 'วัฒน์ (Engineer)',
      role: 'Engineer',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,25 Q35,5 75,30" stroke="%2316a34a" fill="none" stroke-width="2"/></svg>',
      signedAt: '2026-08-08 13:00'
    },
    attachments: [],
    history: [
      {
        id: 'h-9a',
        timestamp: '2026-08-08 10:00',
        action: 'ออกใบคำขอ E-Request',
        actor: 'ชมพู่',
        role: 'Admin Sale',
        details: 'ส่งเรื่องไปฝ่ายขาย'
      },
      {
        id: 'h-9b',
        timestamp: '2026-08-08 10:30',
        action: 'ฝ่ายขายลงนาม',
        actor: 'คุณปุ๊',
        role: 'SALE',
        details: 'มอบหมายช่างวัฒน์'
      },
      {
        id: 'h-9c',
        timestamp: '2026-08-08 13:00',
        action: 'วิศวกรตกลงรับงาน',
        actor: 'วัฒน์',
        role: 'Engineer',
        details: 'ยืนยันวันเข้าหน้างาน 2026-08-12 (ปัจจุบันเลยกำหนด)'
      }
    ],
    createdAt: '2026-08-08 10:00',
    updatedAt: '2026-08-08 13:00'
  },

  // 10. Closed Request (2026-08) - ช่างพัด (คะแนนประเมินลูกค้าและเซลล์ครบถ้วน)
  {
    id: 'req-010',
    docNumber: 'E-20260805-001',
    soNumber: 'SO-690750',
    requestDate: '2026-08-05',
    targetDate: '2026-08-07',
    deadlineDate: '2026-08-07',
    customerName: 'บริษัท แมกโนเลีย ควอลิตี้ ดีเวล็อปเม้นต์ คอร์ปอเรชั่น จำกัด',
    projectName: 'Whizdom The Forestias Mytopia',
    siteContactName: 'คุณกิตติศักดิ์',
    siteContactPhone: '081-888-9900',
    siteContactEmail: 'kittisak@mqdc.com',
    salesOwner: 'คุณกุ้ง',
    adminRequester: 'พี่ก้อย',
    categories: {
      service: true,
      serviceNote: 'Commissioning ระบบควบคุมไฟ DALI Gateway & Mood Scene โซน Main Lobby',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_urgent',
    workDetails: 'ตั้งค่า DALI Scene 6 สเต็ป และทดสอบการสั่งการผ่านเซนเซอร์วัดแสง Daylighting',
    needReport: true,
    customerReportEmail: 'kittisak.whizdom@mqdc.com',
    assignedEngineer: 'พัด',
    status: 'closed',
    customerEvaluation: {
      grooming: 5,
      knowledge: 5,
      problemSolving: 5,
      manner: 5,
      responsiveness: 5,
      feedback: 'ช่างพัดมีความเชี่ยวชาญด้าน DALI สูงมาก แก้ไขปัญหาเซนเซอร์ได้รวดเร็วและให้คำแนะนำอย่างดีเยี่ยมครับ',
      submittedAt: '2026-08-07 16:30'
    },
    salesEvaluation: {
      communication: 5,
      punctuality: 5,
      quality: 5,
      problemSolving: 5,
      overall: 5,
      description: 'ประสานงานกับเซลล์และรายงานสถานะหน้างานต่อเนื่อง ลูกค้าชมเชยมาก',
      evaluatedAt: '2026-08-07 17:00'
    },
    attachments: [],
    history: [
      { id: 'h-10-1', action: 'create', actor: 'พี่ก้อย', role: 'admin', timestamp: '2026-08-05 09:00', details: 'สร้างคำขอบริการ Commissioning DALI' },
      { id: 'h-10-2', action: 'accept', actor: 'พัด', role: 'engineer', timestamp: '2026-08-05 10:00', details: 'รับงานเรียบร้อย' },
      { id: 'h-10-3', action: 'close', actor: 'คุณกุ้ง', role: 'sales', timestamp: '2026-08-07 17:00', details: 'ลูกค้าและเซลล์ประเมินปิดงาน' }
    ],
    createdAt: '2026-08-05 09:00',
    updatedAt: '2026-08-07 17:00'
  },

  // 11. Closed Request (2026-08) - ช่างวัฒน์
  {
    id: 'req-011',
    docNumber: 'E-20260803-002',
    soNumber: 'SO-690740',
    requestDate: '2026-08-03',
    targetDate: '2026-08-05',
    deadlineDate: '2026-08-05',
    customerName: 'บริษัท สยามพิวรรธน์ จำกัด',
    projectName: 'Siam Paragon Crystal Court Floor 1',
    siteContactName: 'คุณภานุเดช',
    siteContactPhone: '086-555-1122',
    siteContactEmail: 'phanudet@siamparagon.co.th',
    salesOwner: 'คุณเก่ง',
    adminRequester: 'เพชร',
    categories: {
      service: true,
      serviceNote: 'ตรวจเช็คไดรเวอร์ไฟ RGBW Façade และเปลี่ยนจุดต่อสายสัญญาณ DMX',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: true,
      meetingOrMockupNote: 'สาธิต Scene แสงสีงาน Event',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_emergency',
    workDetails: 'ระบบไฟ Façade กระพริบช่วงทดสอบระบบ ช่างวัฒน์เข้าแก้ไขและทดสอบเสร็จสมบูรณ์',
    needReport: true,
    customerReportEmail: 'phanudet@siamparagon.co.th',
    assignedEngineer: 'วัฒน์',
    status: 'closed',
    customerEvaluation: {
      grooming: 5,
      knowledge: 4,
      problemSolving: 5,
      manner: 5,
      responsiveness: 5,
      feedback: 'ทำงานรวดเร็ว มาถึงตรงเวลา แก้ปัญหาหน้างานเฉพาะหน้าได้ดีมาก',
      submittedAt: '2026-08-05 18:00'
    },
    salesEvaluation: {
      communication: 4,
      punctuality: 5,
      quality: 5,
      problemSolving: 5,
      overall: 5,
      description: 'งานเสร็จทันเวลาเปิดตัว Event พอดี เซลล์ปิดงานได้ราบรื่น',
      evaluatedAt: '2026-08-05 18:30'
    },
    attachments: [],
    history: [
      { id: 'h-11-1', action: 'create', actor: 'เพชร', role: 'admin', timestamp: '2026-08-03 10:00', details: 'สร้างคำขอด่วนไฟ Façade' },
      { id: 'h-11-2', action: 'accept', actor: 'วัฒน์', role: 'engineer', timestamp: '2026-08-03 10:30', details: 'รับงานด่วน' },
      { id: 'h-11-3', action: 'close', actor: 'คุณเก่ง', role: 'sales', timestamp: '2026-08-05 18:30', details: 'ประเมินและปิดงาน' }
    ],
    createdAt: '2026-08-03 10:00',
    updatedAt: '2026-08-05 18:30'
  },

  // 12. Closed Request (2026-07) - ช่างโชค
  {
    id: 'req-012',
    docNumber: 'E-20260720-001',
    soNumber: 'SO-690680',
    requestDate: '2026-07-20',
    targetDate: '2026-07-22',
    deadlineDate: '2026-07-22',
    customerName: 'บริษัท ออริจิ้น พร็อพเพอร์ตี้ จำกัด (มหาชน)',
    projectName: 'Park Origin Thonglor',
    siteContactName: 'คุณธวัช',
    siteContactPhone: '089-223-3445',
    siteContactEmail: 'thawatchai@origin.co.th',
    salesOwner: 'คุณป่าน',
    adminRequester: 'ชมพู่',
    categories: {
      service: true,
      serviceNote: 'ตรวจเช็คระบบไฟส่องสว่าง Landscape สวนชั้น 39',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_normal',
    workDetails: 'ติดตั้งกล่องกันน้ำ IP68 และตรวจวัดฉนวนสายไฟหน้างานสวน',
    needReport: true,
    customerReportEmail: 'thawatchai@origin.co.th',
    assignedEngineer: 'โชค',
    status: 'closed',
    customerEvaluation: {
      grooming: 5,
      knowledge: 5,
      problemSolving: 5,
      manner: 5,
      responsiveness: 4,
      feedback: 'เรียบร้อยมาก ช่างมีมาตรฐานความปลอดภัยสูง ติดตั้งท่อร้อยสายสวยงาม',
      submittedAt: '2026-07-22 16:00'
    },
    salesEvaluation: {
      communication: 5,
      punctuality: 5,
      quality: 5,
      problemSolving: 5,
      overall: 5,
      description: 'ช่างโชคฝีมือประณีต รายงานเซลล์ชัดเจน ไม่มีงานแก้ย้อนหลัง',
      evaluatedAt: '2026-07-22 16:45'
    },
    attachments: [],
    history: [
      { id: 'h-12-1', action: 'create', actor: 'ชมพู่', role: 'admin', timestamp: '2026-07-20 11:00', details: 'สร้างคำขอตรวจเช็คไฟสวน' },
      { id: 'h-12-2', action: 'close', actor: 'คุณป่าน', role: 'sales', timestamp: '2026-07-22 16:45', details: 'ปิดงาน' }
    ],
    createdAt: '2026-07-20 11:00',
    updatedAt: '2026-07-22 16:45'
  },

  // 13. Closed Request (2026-07) - ช่างวิน
  {
    id: 'req-013',
    docNumber: 'E-20260715-003',
    soNumber: 'SO-690650',
    requestDate: '2026-07-15',
    targetDate: '2026-07-18',
    deadlineDate: '2026-07-18',
    customerName: 'โรงแรม คิมป์ตัน มาลัย กรุงเทพฯ',
    projectName: 'Kimpton Maa-Lai Bangkok (Bar.Yard Rooftop)',
    siteContactName: 'คุณวราภรณ์',
    siteContactPhone: '081-444-9988',
    siteContactEmail: 'varaporn@kimptonmaalaibangkok.com',
    salesOwner: 'คุณเบลล่า',
    adminRequester: 'พี่ก้อย',
    categories: {
      service: true,
      serviceNote: 'ปรับแก้ระบบ Dimming 0-10V โซนเคาน์เตอร์บาร์',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_urgent',
    workDetails: 'ปรับ Smooth fade ให้เข้ากับเพลงและบรรยากาศยามค่ำคืน',
    needReport: true,
    customerReportEmail: 'varaporn@kimptonmaalaibangkok.com',
    assignedEngineer: 'วิน',
    status: 'closed',
    customerEvaluation: {
      grooming: 5,
      knowledge: 5,
      problemSolving: 5,
      manner: 5,
      responsiveness: 5,
      feedback: 'ช่างวินเข้าใจโจทย์แสงสว่างโรงแรมอย่างดี ปรับแสงได้ถูกใจผู้จัดการร้านมาก',
      submittedAt: '2026-07-18 17:30'
    },
    salesEvaluation: {
      communication: 5,
      punctuality: 5,
      quality: 5,
      problemSolving: 5,
      overall: 5,
      description: 'ลูกค้าประทับใจมาก เซลล์ได้รับคำชมและมีโอกาสได้งานเฟสถัดไป',
      evaluatedAt: '2026-07-18 18:00'
    },
    attachments: [],
    history: [
      { id: 'h-13-1', action: 'create', actor: 'พี่ก้อย', role: 'admin', timestamp: '2026-07-15 09:30', details: 'สร้างคำขอปรับแก้ Dimming' },
      { id: 'h-13-2', action: 'close', actor: 'คุณเบลล่า', role: 'sales', timestamp: '2026-07-18 18:00', details: 'ปิดงาน' }
    ],
    createdAt: '2026-07-15 09:30',
    updatedAt: '2026-07-18 18:00'
  },

  // 14. Closed Request (2026-06) - ช่างพัด
  {
    id: 'req-014',
    docNumber: 'E-20260625-001',
    soNumber: 'SO-690550',
    requestDate: '2026-06-25',
    targetDate: '2026-06-27',
    deadlineDate: '2026-06-27',
    customerName: 'บริษัท เซ็นทรัลพัฒนา จำกัด (มหาชน)',
    projectName: 'Central Westville Cineplex',
    siteContactName: 'คุณชัยพร',
    siteContactPhone: '085-667-7889',
    siteContactEmail: 'chaiporn@cpn.co.th',
    salesOwner: 'คุณพอพอ',
    adminRequester: 'เพชร',
    categories: {
      service: true,
      serviceNote: 'Commissioning ระบบไฟ DALI ทางเดินและโถงโรงภาพยนตร์',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_urgent',
    workDetails: 'ตั้งค่าระบบ Dimming เชื่อมต่อกับระบบฉายหนังอัตโนมัติ',
    needReport: true,
    customerReportEmail: 'chaiporn@cpn.co.th',
    assignedEngineer: 'พัด',
    status: 'closed',
    customerEvaluation: {
      grooming: 5,
      knowledge: 5,
      problemSolving: 4,
      manner: 5,
      responsiveness: 5,
      feedback: 'ทำงานได้ตามมาตรฐาน ส่งมอบงานตรงเวลาและทดสอบระบบเรียบร้อยดี',
      submittedAt: '2026-06-27 15:00'
    },
    salesEvaluation: {
      communication: 4,
      punctuality: 5,
      quality: 5,
      problemSolving: 4,
      overall: 4.5,
      description: 'ส่งมอบงานได้ตามกำหนดและไม่มีข้อร้องเรียน',
      evaluatedAt: '2026-06-27 15:45'
    },
    attachments: [],
    history: [
      { id: 'h-14-1', action: 'create', actor: 'เพชร', role: 'admin', timestamp: '2026-06-25 10:00', details: 'สร้างคำขอ DALI Cineplex' },
      { id: 'h-14-2', action: 'close', actor: 'คุณพอพอ', role: 'sales', timestamp: '2026-06-27 15:45', details: 'ปิดงาน' }
    ],
    createdAt: '2026-06-25 10:00',
    updatedAt: '2026-06-27 15:45'
  },

  // 15. Closed Request (2026-06) - ช่างวัฒน์
  {
    id: 'req-015',
    docNumber: 'E-20260610-002',
    soNumber: 'SO-690510',
    requestDate: '2026-06-10',
    targetDate: '2026-06-12',
    deadlineDate: '2026-06-12',
    customerName: 'บริษัท สิงห์ เอสเตท จำกัด (มหาชน)',
    projectName: 'Singha Complex Asoke',
    siteContactName: 'คุณอนุชา',
    siteContactPhone: '083-998-1122',
    siteContactEmail: 'anucha@singhaestate.co.th',
    salesOwner: 'คุณปุ๊',
    adminRequester: 'ชมพู่',
    categories: {
      service: false,
      serviceNote: '',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: true,
      claimProductNote: 'เปลี่ยนโคม Track Light LED 30W จำนวน 12 ชุด'
    },
    priority: 'alert_urgent',
    workDetails: 'เคลมสินค้าและปรับมุมกระจายแสงให้ส่องตรงป้ายร้านค้า',
    needReport: true,
    customerReportEmail: 'anucha@singhaestate.co.th',
    assignedEngineer: 'วัฒน์',
    status: 'closed',
    customerEvaluation: {
      grooming: 4,
      knowledge: 4,
      problemSolving: 5,
      manner: 5,
      responsiveness: 4,
      feedback: 'เปลี่ยนของรวดเร็ว ปรับองศาไฟได้ตามที่ขอครับ',
      submittedAt: '2026-06-12 17:00'
    },
    salesEvaluation: {
      communication: 4,
      punctuality: 4,
      quality: 5,
      problemSolving: 5,
      overall: 4.5,
      description: 'งานเคลมจบเร็ว ลูกค้าพึงพอใจ',
      evaluatedAt: '2026-06-12 17:30'
    },
    attachments: [],
    history: [
      { id: 'h-15-1', action: 'create', actor: 'ชมพู่', role: 'admin', timestamp: '2026-06-10 09:00', details: 'สร้างคำขอเคลมสินค้า Track Light' },
      { id: 'h-15-2', action: 'close', actor: 'คุณปุ๊', role: 'sales', timestamp: '2026-06-12 17:30', details: 'ปิดงานเคลม' }
    ],
    createdAt: '2026-06-10 09:00',
    updatedAt: '2026-06-12 17:30'
  },

  // 16. Closed Request (2026-05) - ช่างโชค
  {
    id: 'req-016',
    docNumber: 'E-20260520-001',
    soNumber: 'SO-690420',
    requestDate: '2026-05-20',
    targetDate: '2026-05-23',
    deadlineDate: '2026-05-23',
    customerName: 'บริษัท แลนด์ แอนด์ เฮ้าส์ จำกัด (มหาชน)',
    projectName: 'Nanathorn Bangna Club House',
    siteContactName: 'คุณวีระชัย',
    siteContactPhone: '081-333-8877',
    siteContactEmail: 'veerachai@lh.co.th',
    salesOwner: 'คุณแพม',
    adminRequester: 'พี่ก้อย',
    categories: {
      service: true,
      serviceNote: 'Service ระบบไฟสระว่ายน้ำ Fiber Optic & LED Underwater',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_normal',
    workDetails: 'ตรวจเช็คและเปลี่ยนเครื่องกำเนิดแสง Fiber Optic พร้อมต่อสายกราวด์ความปลอดภัย',
    needReport: true,
    customerReportEmail: 'veerachai@lh.co.th',
    assignedEngineer: 'โชค',
    status: 'closed',
    customerEvaluation: {
      grooming: 5,
      knowledge: 5,
      problemSolving: 5,
      manner: 5,
      responsiveness: 5,
      feedback: 'ยอดเยี่ยมมาก ทำงานในพื้นที่สระว่ายน้ำด้วยความระมัดระวังสูงสุด',
      submittedAt: '2026-05-23 16:30'
    },
    salesEvaluation: {
      communication: 5,
      punctuality: 5,
      quality: 5,
      problemSolving: 5,
      overall: 5,
      description: 'งานเรียบร้อย ปลอดภัย ช่างโชคไว้ใจได้เสมอ',
      evaluatedAt: '2026-05-23 17:00'
    },
    attachments: [],
    history: [
      { id: 'h-16-1', action: 'create', actor: 'พี่ก้อย', role: 'admin', timestamp: '2026-05-20 10:00', details: 'สร้างคำขอบริการไฟสระว่ายน้ำ' },
      { id: 'h-16-2', action: 'close', actor: 'คุณแพม', role: 'sales', timestamp: '2026-05-23 17:00', details: 'ปิดงาน' }
    ],
    createdAt: '2026-05-20 10:00',
    updatedAt: '2026-05-23 17:00'
  },

  // 17. Closed Request (2026-05) - ช่างวิน
  {
    id: 'req-017',
    docNumber: 'E-20260512-003',
    soNumber: 'SO-690380',
    requestDate: '2026-05-12',
    targetDate: '2026-05-15',
    deadlineDate: '2026-05-15',
    customerName: 'บริษัท ดิ เอราวัณ กรุ๊ป จำกัด (มหาชน)',
    projectName: 'JW Marriott Hotel Bangkok',
    siteContactName: 'คุณประดิษฐ์',
    siteContactPhone: '086-777-6655',
    siteContactEmail: 'pradit@erawan.com',
    salesOwner: 'คุณมิ้น',
    adminRequester: 'เพชร',
    categories: {
      service: true,
      serviceNote: 'ปรับตั้งค่า Scene อาหารค่ำและ Dimming Curve ห้องอาหาร Nami Teppanyaki',
      countingDrawing: false,
      countingDrawingNote: '',
      meetingOrMockup: false,
      meetingOrMockupNote: '',
      claimProduct: false,
      claimProductNote: ''
    },
    priority: 'alert_urgent',
    workDetails: 'ปรับแสงสว่างแบบ Accent Lighting ส่องเฉพาะจานอาหาร',
    needReport: true,
    customerReportEmail: 'pradit@erawan.com',
    assignedEngineer: 'วิน',
    status: 'closed',
    customerEvaluation: {
      grooming: 5,
      knowledge: 5,
      problemSolving: 4,
      manner: 5,
      responsiveness: 5,
      feedback: 'ปรับแสงได้ตามสเปกโรงแรม 5 ดาว นุ่มนวล ไม่แสบตาลูกค้า',
      submittedAt: '2026-05-15 17:00'
    },
    salesEvaluation: {
      communication: 5,
      punctuality: 4,
      quality: 5,
      problemSolving: 4,
      overall: 4.5,
      description: 'งานสำเร็จลุล่วง เซลล์และโรงแรมพึงพอใจมาก',
      evaluatedAt: '2026-05-15 17:30'
    },
    attachments: [],
    history: [
      { id: 'h-17-1', action: 'create', actor: 'เพชร', role: 'admin', timestamp: '2026-05-12 11:00', details: 'สร้างคำขอปรับแสง JW Marriott' },
      { id: 'h-17-2', action: 'close', actor: 'คุณมิ้น', role: 'sales', timestamp: '2026-05-15 17:30', details: 'ปิดงาน' }
    ],
    createdAt: '2026-05-12 11:00',
    updatedAt: '2026-05-15 17:30'
  }
];

export const INITIAL_INQUIRIES: EngineerInquiry[] = [
  {
    id: 'inq-1',
    requestId: 'req-006',
    soNumber: 'SO-690801',
    projectName: 'One Bangkok Tower B',
    engineerName: 'พัด',
    salesName: 'คุณพอพอ',
    message: 'ช่างพัดครับ อยากสอบถามว่าสาย DALI ของ Tower B วันนี้ช่างเช็คอินแล้ว เป็นอย่างไรบ้าง ทางลูกค้ากำลังรออัปเดตครับ',
    createdAt: '2026-08-16 09:30',
    replyMessage: 'ตอนนี้ตรวจเช็คแล้วพบว่า Terminal Gateway หลวมครับ กำลังย้ำหัวสายใหม่ คาดว่าเสร็จไม่เกิน 11:30 น. ครับผม',
    replySignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,25 Q40,5 80,30" stroke="%2316a34a" fill="none" stroke-width="2"/></svg>',
    repliedAt: '2026-08-16 09:45',
    status: 'replied'
  },
  {
    id: 'inq-2',
    requestId: 'req-002',
    soNumber: 'SO-690818',
    projectName: 'Ideo Rama 9 Asoke',
    engineerName: 'โชค',
    salesName: 'คุณปุ๋ม',
    message: 'ช่างโชคคะ สำหรับงานนับแบบ Sky Lounge ไฟล์แคดที่ส่งให้เปิดได้ครบไหมคะ ติดปัญหาตรงไหนไหม',
    createdAt: '2026-08-16 10:00',
    status: 'pending'
  }
];

export const INITIAL_ATTENDANCE: EngineerDailyAttendance[] = [
  {
    id: 'att-eng-1',
    engineerId: 'eng-1',
    engineerName: 'พัด',
    date: '2026-08-16',
    checkInTime: '08:25 น.',
    checkOutTime: '17:35 น.',
    checkInLocation: 'One Bangkok, พระราม 4',
    checkOutLocation: 'One Bangkok, พระราม 4',
    totalHours: '8 ชม. 10 นาที',
    status: 'completed',
    notes: 'Service ระบบไฟ DALI ประสบความสำเร็จ',
    sessions: [
      {
        sessionNumber: 1,
        checkInTime: '08:25 น.',
        checkInLocation: 'One Bangkok, พระราม 4',
        checkOutTime: '12:00 น.',
        checkOutLocation: 'One Bangkok, พระราม 4',
        duration: '3 ชม. 35 นาที',
        status: 'completed',
        notes: 'ช่วงเช้า: ตรวจเช็คสายสัญญาณและ Driver ไฟ DALI'
      },
      {
        sessionNumber: 2,
        checkInTime: '13:00 น.',
        checkInLocation: 'One Bangkok, พระราม 4',
        checkOutTime: '17:35 น.',
        checkOutLocation: 'One Bangkok, พระราม 4',
        duration: '4 ชม. 35 นาที',
        status: 'completed',
        notes: 'ช่วงบ่าย: Commissioning ระบบ Scene Control และส่งมอบ'
      }
    ]
  },
  {
    id: 'att-eng-2',
    engineerId: 'eng-2',
    engineerName: 'โชค',
    date: '2026-08-16',
    checkInTime: '08:30 น.',
    checkOutTime: '17:30 น.',
    checkInLocation: 'สำนักงานใหญ่ LUMENCRAFT',
    checkOutLocation: 'สำนักงานใหญ่ LUMENCRAFT',
    totalHours: '8 ชม. 00 นาที',
    status: 'completed',
    notes: 'Standby เตรียมของและอุปกรณ์ตรวจวัด',
    sessions: [
      {
        sessionNumber: 1,
        checkInTime: '08:30 น.',
        checkInLocation: 'สำนักงานใหญ่ LUMENCRAFT พัฒนาการ',
        checkOutTime: '12:00 น.',
        checkOutLocation: 'สำนักงานใหญ่ LUMENCRAFT พัฒนาการ',
        duration: '3 ชม. 30 นาที',
        status: 'completed',
        notes: 'เตรียมโคมไฟ Mock-up และทดสอบสเปก'
      },
      {
        sessionNumber: 2,
        checkInTime: '13:00 น.',
        checkInLocation: 'สำนักงานใหญ่ LUMENCRAFT พัฒนาการ',
        checkOutTime: '17:30 น.',
        checkOutLocation: 'สำนักงานใหญ่ LUMENCRAFT พัฒนาการ',
        duration: '4 ชม. 30 นาที',
        status: 'completed',
        notes: 'ถอดแบบและคำนวณกำลังไฟโคม'
      }
    ]
  },
  {
    id: 'att-eng-3',
    engineerId: 'eng-3',
    engineerName: 'วิน',
    date: '2026-08-16',
    checkInTime: '08:40 น.',
    checkOutTime: '17:45 น.',
    checkInLocation: 'Dusit Central Park',
    checkOutLocation: 'Dusit Central Park',
    totalHours: '8 ชม. 05 นาที',
    status: 'completed',
    notes: 'เข้าร่วมประชุมแบบและหน้างาน',
    sessions: [
      {
        sessionNumber: 1,
        checkInTime: '08:40 น.',
        checkInLocation: 'Dusit Central Park',
        checkOutTime: '12:15 น.',
        checkOutLocation: 'Dusit Central Park',
        duration: '3 ชม. 35 นาที',
        status: 'completed',
        notes: 'เข้าประชุมประสานงานกับผู้รับเหมาหลัก'
      },
      {
        sessionNumber: 2,
        checkInTime: '13:15 น.',
        checkInLocation: 'Dusit Central Park',
        checkOutTime: '17:45 น.',
        checkOutLocation: 'Dusit Central Park',
        duration: '4 ชม. 30 นาที',
        status: 'completed',
        notes: 'ตรวจสอบจุดติดตั้งรางไฟหน้างาน'
      }
    ]
  },
  {
    id: 'att-eng-4',
    engineerId: 'eng-4',
    engineerName: 'วัฒน์',
    date: '2026-08-16',
    checkInTime: '08:15 น.',
    checkOutTime: '18:00 น.',
    checkInLocation: 'The Forestias บางนา',
    checkOutLocation: 'The Forestias บางนา',
    totalHours: '8 ชม. 45 นาที',
    status: 'completed',
    notes: 'Mock up ไฟ Façade และทดสอบ Dimming',
    sessions: [
      {
        sessionNumber: 1,
        checkInTime: '08:15 น.',
        checkInLocation: 'The Forestias บางนา',
        checkOutTime: '12:00 น.',
        checkOutLocation: 'The Forestias บางนา',
        duration: '3 ชม. 45 นาที',
        status: 'completed',
        notes: 'ติดตั้งชุดทดสอบไฟ Façade'
      },
      {
        sessionNumber: 2,
        checkInTime: '13:00 น.',
        checkInLocation: 'The Forestias บางนา',
        checkOutTime: '18:00 น.',
        checkOutLocation: 'The Forestias บางนา',
        duration: '5 ชม. 00 นาที',
        status: 'completed',
        notes: 'ทดสอบการหรี่แสงไฟและเอฟเฟกต์ยามค่ำคืน'
      }
    ]
  }
];

