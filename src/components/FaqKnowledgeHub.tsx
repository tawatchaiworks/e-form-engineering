import React, { useState } from 'react';
import { 
  HelpCircle, Search, BookOpen, Wrench, Zap, 
  CheckCircle2, ChevronDown, ChevronUp, AlertTriangle, 
  Lightbulb, Phone, Mail, Sparkles, Sliders,
  MessageSquare, Send, ThumbsUp, Tag, Scissors,
  Waves, Trees, Cable, Cpu, Plus, Edit3, Trash2,
  Calculator, Check, X, ArrowRight, Share2, Copy,
  UserCheck, Clock, ShieldCheck, Bot, Globe,
  Loader2, RefreshCw, BookmarkPlus, ExternalLink,
  Sun, Maximize2, LayoutGrid, Gauge, Layers, Info,
  Upload, FileCode, FolderUp, SlidersHorizontal, Settings2, ArrowDownUp, RefreshCcw
} from 'lucide-react';
import { FaqItem, FaqCategory, EngineerInquiry, StaffMember } from '../types';
import { INITIAL_FAQS } from '../utils/initialFaqs';
import { LightingRoom3DVisualizer } from './LightingRoom3DVisualizer';

interface FaqKnowledgeHubProps {
  faqs?: FaqItem[];
  inquiries?: EngineerInquiry[];
  staff?: StaffMember[];
  onAddFaq?: (faq: FaqItem) => void;
  onUpdateFaq?: (faq: FaqItem) => void;
  onDeleteFaq?: (faqId: string) => void;
  onSendInquiry?: (inquiry: Omit<EngineerInquiry, 'id' | 'createdAt' | 'status'>) => void;
  onReplyInquiry?: (inquiryId: string, replyMessage: string, signatureUrl: string) => void;
  onPromoteInquiryToFaq?: (inquiry: EngineerInquiry, faqPayload: Partial<FaqItem>) => void;
}

const CATEGORY_META: Record<FaqCategory, { label: string; icon: any }> = {
  switching_power: { label: 'การเลือกหม้อแปลง Switching', icon: Zap },
  dimming_driver: { label: 'การเลือกหม้อแปลงดิม (Dimmable)', icon: Sliders },
  cable_sizing: { label: 'สายไฟ 24V & ระยะสาย', icon: Cable },
  strip_neonflex: { label: 'ตัดต่อ Strip & Neon Flex', icon: Scissors },
  underwater: { label: 'โคมใต้น้ำ & สายใต้น้ำ', icon: Waves },
  garden_landscape: { label: 'โคมในสวน & ข้อจำกัด', icon: Trees },
  dali_control: { label: 'ระบบ DALI & Control', icon: Cpu },
  troubleshooting: { label: 'แก้ปัญหาและอาการเสียหน้างาน', icon: AlertTriangle },
  general: { label: 'ความรู้เทคนิคไฟฟ้าทั่วไป', icon: BookOpen },
};

interface ExternalWebLink {
  title: string;
  url: string;
  description?: string;
}

interface GoogleSearchLinks {
  mainSearchUrl: string;
  diagramSearchUrl: string;
  datasheetSearchUrl: string;
  searchedQueries: string[];
  webSources: ExternalWebLink[];
}

interface AiSearchAnswer {
  summary: string;
  category?: FaqCategory;
  categoryLabel?: string;
  steps?: string[];
  technicalTips?: string;
  commonCauses?: string[];
  tags?: string[];
  internalMatchFound?: boolean;
  sources?: string[];
  externalWebSources?: ExternalWebLink[];
  googleLinks?: GoogleSearchLinks;
}

export const FaqKnowledgeHub: React.FC<FaqKnowledgeHubProps> = ({
  faqs = [],
  inquiries = [],
  staff = [],
  onAddFaq,
  onUpdateFaq,
  onDeleteFaq,
  onSendInquiry,
  onReplyInquiry,
  onPromoteInquiryToFaq,
}) => {
  // Merge prop FAQs or fallback to INITIAL_FAQS
  const displayFaqs = faqs.length > 0 ? faqs : INITIAL_FAQS;

  const [activeTab, setActiveTab] = useState<'faqs' | 'candidates' | 'calculators'>('faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'all' | 'internal' | 'ai'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(displayFaqs[0]?.id || 'faq-psu-1');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Search & Answer States
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResult, setAiResult] = useState<AiSearchAnswer | null>(null);
  const [aiSearchedQuery, setAiSearchedQuery] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiCopied, setAiCopied] = useState(false);

  // Add / Edit FAQ Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqCategory, setFaqCategory] = useState<FaqCategory>('switching_power');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqSummary, setFaqSummary] = useState('');
  const [faqStepsText, setFaqStepsText] = useState('');
  const [faqTechnicalTips, setFaqTechnicalTips] = useState('');
  const [faqCommonCausesText, setFaqCommonCausesText] = useState('');
  const [faqTagsText, setFaqTagsText] = useState('');
  const [faqAuthorName, setFaqAuthorName] = useState('ฝ่ายวิศวกรรม LUMENCRAFT');

  // Ask Question Modal state
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategory, setNewCategory] = useState<FaqCategory>('switching_power');
  const [newDetail, setNewDetail] = useState('');
  const [newSoNumber, setNewSoNumber] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newSalesName, setNewSalesName] = useState('ฝ่ายขาย');
  const [newEngineerName, setNewEngineerName] = useState('พัด');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Promoting Inquiries state
  const [promotingInquiry, setPromotingInquiry] = useState<EngineerInquiry | null>(null);

  // Interactive Calculator States
  const [calcActiveSubTab, setCalcActiveSubTab] = useState<'all' | 'lumen_lux' | 'dc_current' | 'ac_current' | 'switching' | 'voltage_drop'>('all');

  // 1. Lumen, Lux & Fixture Spacing Calculator State
  const [roomWidth, setRoomWidth] = useState<number>(6); // meters
  const [roomLength, setRoomLength] = useState<number>(8); // meters
  const [roomHeight, setRoomHeight] = useState<number>(3.0); // meters
  const [workplaneHeight, setWorkplaneHeight] = useState<number>(0.75); // meters (standard table height)
  const [roomPreset, setRoomPreset] = useState<string>('office_500');
  const [targetLux, setTargetLux] = useState<number>(500); // Lux
  
  // Luminaire Type & IES File Integration State
  const [selectedLuminaireType, setSelectedLuminaireType] = useState<string>('panel_60x60');
  const [efficacyLmPerWatt, setEfficacyLmPerWatt] = useState<number>(110); // lm/W
  const [fixtureWatts, setFixtureWatts] = useState<number>(36); // Watts per fixture
  const [customFixtureLumen, setCustomFixtureLumen] = useState<number>(0); // 0 = auto calculate from watts * efficacy
  const [ufCoeff, setUfCoeff] = useState<number>(0.70); // Utilization factor
  const [mfCoeff, setMfCoeff] = useState<number>(0.80); // Maintenance factor

  // AUTO vs MANUAL fixture count mode
  const [fixtureCalcMode, setFixtureCalcMode] = useState<'auto' | 'manual'>('auto');
  const [manualFixtureRows, setManualFixtureRows] = useState<number>(3);
  const [manualFixtureCols, setManualFixtureCols] = useState<number>(2);

  // Parsed IES photometric file state
  const [parsedIesData, setParsedIesData] = useState<{
    fileName: string;
    luminaireName: string;
    manufacturer: string;
    lumens: number;
    watts: number;
    efficacy: number;
    beamAngle: string;
    candelaMax: number;
  } | null>(null);
  const [iesRawText, setIesRawText] = useState<string>('');
  const [iesUploadStatus, setIesUploadStatus] = useState<string>('');

  // 2. DC Current & Wattage Calculator State (with Multi-load Items breakdown)
  const [dcInputVoltage, setDcInputVoltage] = useState<number>(24);
  const [dcDeratingFactor, setDcDeratingFactor] = useState<number>(0.80);
  const [dcUseItemized, setDcUseItemized] = useState<boolean>(true);
  const [dcManualWatts, setDcManualWatts] = useState<number>(280);
  const [dcLoadItems, setDcLoadItems] = useState<Array<{ id: string; name: string; watts: number; qty: number }>>([
    { id: '1', name: 'ไฟเส้นหลืบฝ้า LED Strip 24V (15m x 14.4W)', watts: 216, qty: 1 },
    { id: '2', name: 'ไฟตู้โชว์ Neon Flex 24V (5m x 9.6W)', watts: 48, qty: 1 },
    { id: '3', name: 'ไฟส่องขั้นบันได Step Light 24V (6 จุด x 3W)', watts: 18, qty: 1 },
  ]);
  const [newDcItemName, setNewDcItemName] = useState<string>('');
  const [newDcItemWatts, setNewDcItemWatts] = useState<number>(50);
  const [newDcItemQty, setNewDcItemQty] = useState<number>(1);

  // 3. AC Current & Breaker/Cable Calculator State (including DC load conversion)
  const [acDirectWatts, setAcDirectWatts] = useState<number>(1200); // Direct AC lamps / fixtures
  const [acIncludeDcLoad, setAcIncludeDcLoad] = useState<boolean>(true); // Add DC driver power load
  const [acPhaseType, setAcPhaseType] = useState<'1_phase' | '3_phase'>('1_phase');
  const [acVoltage1P, setAcVoltage1P] = useState<number>(230);
  const [acVoltage3P, setAcVoltage3P] = useState<number>(400);
  const [acPowerFactor, setAcPowerFactor] = useState<number>(0.95);
  const [acEfficiency, setAcEfficiency] = useState<number>(0.92);

  // 4. Switching Wattage Calculator (LED Strip)
  const [calcStripLength, setCalcStripLength] = useState<number>(15);
  const [calcWattPerMeter, setCalcWattPerMeter] = useState<number>(14.4);
  const [calcSafetyFactor, setCalcSafetyFactor] = useState<number>(0.8);

  // 5. Voltage Drop Calculator (24VDC)
  const [calcLoadWatts, setCalcLoadWatts] = useState<number>(100);
  const [calcCableLength, setCalcCableLength] = useState<number>(15);
  const [calcCableSize, setCalcCableSize] = useState<number>(2.5);

  const categories = [
    { id: 'all', label: 'คำถามทั้งหมด (All FAQ)', icon: BookOpen, count: displayFaqs.length },
    { id: 'switching_power', label: 'หม้อแปลง Switching', icon: Zap, count: displayFaqs.filter(f => f.category === 'switching_power').length },
    { id: 'dimming_driver', label: 'หม้อแปลงดิม (Dimmable)', icon: Sliders, count: displayFaqs.filter(f => f.category === 'dimming_driver').length },
    { id: 'cable_sizing', label: 'สายไฟ 24V & ระยะสาย', icon: Cable, count: displayFaqs.filter(f => f.category === 'cable_sizing').length },
    { id: 'strip_neonflex', label: 'ตัดต่อ Strip & Neon Flex', icon: Scissors, count: displayFaqs.filter(f => f.category === 'strip_neonflex').length },
    { id: 'underwater', label: 'โคมใต้น้ำ & สายใต้น้ำ', icon: Waves, count: displayFaqs.filter(f => f.category === 'underwater').length },
    { id: 'garden_landscape', label: 'โคมในสวน & ข้อจำกัด', icon: Trees, count: displayFaqs.filter(f => f.category === 'garden_landscape').length },
    { id: 'dali_control', label: 'ระบบ DALI & Control', icon: Cpu, count: displayFaqs.filter(f => f.category === 'dali_control').length },
  ];

  const filteredFaqs = displayFaqs.filter(item => {
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

  const handleCopyFaq = (faq: FaqItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `📌 Q: ${faq.question}\n\n💡 สรุปคำตอบ: ${faq.summary}\n\n${faq.steps ? `📋 ขั้นตอน/วิธีปฏิบัติ:\n${faq.steps.join('\n')}\n\n` : ''}${faq.technicalTips ? `⚠️ ข้อควรระวัง: ${faq.technicalTips}\n\n` : ''}#LUMENCRAFT #TechnicalFAQ`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(faq.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // 🤖 Trigger Comprehensive Search & AI Answering
  const handlePerformSearch = async (forcedQuery?: string) => {
    const queryToSearch = (forcedQuery !== undefined ? forcedQuery : searchQuery).trim();
    if (!queryToSearch) {
      alert('กรุณากรอกคำค้นหาหรือคำถามทางเทคนิค');
      return;
    }

    // Set search query in state if forced
    if (forcedQuery !== undefined) {
      setSearchQuery(forcedQuery);
    }

    setActiveTab('faqs');
    setAiSearchedQuery(queryToSearch);
    setIsAiSearching(true);
    setAiError(null);
    setAiResult(null);

    try {
      // Package internal FAQs to provide context to Gemini
      const internalContext = displayFaqs.map(f => ({
        category: f.category,
        question: f.question,
        summary: f.summary,
        steps: f.steps,
        technicalTips: f.technicalTips,
        tags: f.tags,
      }));

      const res = await fetch('/api/ai-search-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToSearch,
          internalFaqsContext: internalContext,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setAiResult(json.data || {
          summary: json.answer || json.summary || 'ไม่พบข้อมูลสรุป',
          steps: json.steps || [],
          technicalTips: json.precautions || '',
          sources: json.sources || [],
        });
      } else {
        setAiError(json.error || 'ไม่สามารถติดต่อระบบ AI ได้ชั่วคราว');
      }
    } catch (err: any) {
      console.error('Error invoking AI FAQ search:', err);
      setAiError('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย โปรดลองอีกครั้ง');
    } finally {
      setIsAiSearching(false);
    }
  };

  // 📋 Copy AI Answer
  const handleCopyAiAnswer = () => {
    if (!aiResult) return;
    const textToCopy = `🤖 [LUMEN-AI Technical Assistant: ผลการค้นหา "${aiSearchedQuery}"]\n\n💡 สรุปคำตอบ:\n${aiResult.summary}\n\n${aiResult.steps && aiResult.steps.length > 0 ? `📋 ขั้นตอน/วิธีคำนวณ:\n${aiResult.steps.join('\n')}\n\n` : ''}${aiResult.technicalTips ? `⚠️ ข้อควรระวัง:\n${aiResult.technicalTips}\n\n` : ''}📚 แหล่งอ้างอิง: ${(aiResult.sources || ['LUMENCRAFT Technical Standard']).join(', ')}`;
    navigator.clipboard.writeText(textToCopy);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2500);
  };

  // ➕ Convert AI Answer to New FAQ with 1-Click
  const handleSaveAiAnswerAsFaq = () => {
    if (!aiResult) return;
    setEditingFaq(null);
    setFaqCategory(aiResult.category || 'switching_power');
    setFaqQuestion(aiSearchedQuery || 'คำถามเทคนิควิศวกรรมไฟฟ้า');
    setFaqSummary(aiResult.summary || '');
    setFaqStepsText(aiResult.steps ? aiResult.steps.join('\n') : '');
    setFaqTechnicalTips(aiResult.technicalTips || '');
    setFaqCommonCausesText(aiResult.commonCauses ? aiResult.commonCauses.join('\n') : '');
    setFaqTagsText(aiResult.tags ? aiResult.tags.join(', ') : 'AI Assistant, วิศวกรรมไฟฟ้า, LUMENCRAFT');
    setFaqAuthorName('LUMEN-AI & ฝ่ายวิศวกรรม');
    setIsEditModalOpen(true);
  };

  // Open modal to add new FAQ manually
  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setFaqCategory('switching_power');
    setFaqQuestion('');
    setFaqSummary('');
    setFaqStepsText('');
    setFaqTechnicalTips('');
    setFaqCommonCausesText('');
    setFaqTagsText('หม้อแปลง, Switching, เทคนิคหน้างาน');
    setFaqAuthorName('ฝ่ายวิศวกรรม LUMENCRAFT');
    setIsEditModalOpen(true);
  };

  // Open modal to edit existing FAQ
  const handleOpenEditModal = (faq: FaqItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFaq(faq);
    setFaqCategory(faq.category);
    setFaqQuestion(faq.question);
    setFaqSummary(faq.summary);
    setFaqStepsText(faq.steps ? faq.steps.join('\n') : '');
    setFaqTechnicalTips(faq.technicalTips || '');
    setFaqCommonCausesText(faq.commonCauses ? faq.commonCauses.join('\n') : '');
    setFaqTagsText(faq.tags ? faq.tags.join(', ') : '');
    setFaqAuthorName(faq.authorName || 'ฝ่ายวิศวกรรม LUMENCRAFT');
    setIsEditModalOpen(true);
  };

  // Save FAQ (Create or Update)
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqSummary.trim()) {
      alert('กรุณาระบุหัวข้อคำถามและคำตอบสรุป');
      return;
    }

    const steps = faqStepsText.split('\n').map(s => s.trim()).filter(Boolean);
    const commonCauses = faqCommonCausesText.split('\n').map(s => s.trim()).filter(Boolean);
    const tags = faqTagsText.split(',').map(t => t.trim()).filter(Boolean);

    const categoryLabel = CATEGORY_META[faqCategory]?.label || 'คู่มือเทคนิค';

    if (editingFaq) {
      const updated: FaqItem = {
        ...editingFaq,
        category: faqCategory,
        categoryLabel,
        question: faqQuestion.trim(),
        summary: faqSummary.trim(),
        steps: steps.length > 0 ? steps : undefined,
        technicalTips: faqTechnicalTips.trim() || undefined,
        commonCauses: commonCauses.length > 0 ? commonCauses : undefined,
        tags: tags.length > 0 ? tags : ['FAQ'],
        authorName: faqAuthorName.trim() || 'ฝ่ายวิศวกรรม LUMENCRAFT',
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      if (onUpdateFaq) {
        onUpdateFaq(updated);
      }
    } else {
      const newFaq: FaqItem = {
        id: `faq_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        category: faqCategory,
        categoryLabel,
        question: faqQuestion.trim(),
        summary: faqSummary.trim(),
        steps: steps.length > 0 ? steps : undefined,
        technicalTips: faqTechnicalTips.trim() || undefined,
        commonCauses: commonCauses.length > 0 ? commonCauses : undefined,
        tags: tags.length > 0 ? tags : ['FAQ'],
        authorName: faqAuthorName.trim() || 'ฝ่ายวิศวกรรม LUMENCRAFT',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      if (onAddFaq) {
        onAddFaq(newFaq);
      }
    }

    setIsEditModalOpen(false);
  };

  // Delete FAQ handler
  const handleDeleteFaqClick = (faq: FaqItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`คุณต้องการลบ FAQ หัวข้อ "${faq.question}" ใช่หรือไม่?`)) {
      if (onDeleteFaq) {
        onDeleteFaq(faq.id);
      }
    }
  };

  // Submit Question to Engineers (Ask Question flow)
  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    if (onSendInquiry) {
      onSendInquiry({
        soNumber: newSoNumber.trim() || 'SO-FAQ-INQ',
        projectName: newProjectName.trim() || 'คำถามเทคนิคทั่วไปเพื่อบรรจุใน FAQ',
        salesName: newSalesName.trim() || 'ฝ่ายขาย/ผู้ดูแลระบบ',
        engineerName: newEngineerName.trim() || 'พัด',
        message: newDetail.trim() 
          ? `[หมวด: ${CATEGORY_META[newCategory]?.label}] ${newQuestion.trim()} (รายละเอียด: ${newDetail.trim()})`
          : `[หมวด: ${CATEGORY_META[newCategory]?.label}] ${newQuestion.trim()}`,
        forFaq: true,
        category: newCategory,
      });
    }

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowAskModal(false);
      setNewQuestion('');
      setNewDetail('');
      setNewSoNumber('');
      setNewProjectName('');
    }, 2000);
  };

  // Calculations & Engineering Formulas
  // Luminaire Types Specification Table
  const LUMINAIRE_TYPES: Record<string, {
    name: string;
    category: string;
    defaultWatts: number;
    defaultLmPerW: number;
    beamAngle: string;
    uf: number;
    mf: number;
    icon: string;
    desc: string;
  }> = {
    'panel_60x60': {
      name: 'โคมฝังฝ้า Panel Light 60x60 / 30x120',
      category: 'สำนักงาน / ห้องเรียน / อาคารพาณิชย์',
      defaultWatts: 36,
      defaultLmPerW: 110,
      beamAngle: '110°–120° (มุมกว้าง แสงกระจายเนียนตา)',
      uf: 0.70,
      mf: 0.80,
      icon: '🔲',
      desc: 'กระจายแสงสม่ำเสมอ ลดแสงแยงตา UGR < 19 สบายตาตลอดวัน'
    },
    'downlight_recessed': {
      name: 'โคมดาวน์ไลท์ Recessed Downlight (COB/SMD 60°)',
      category: 'ที่พักอาศัย / โรงแรม / ร้านค้า',
      defaultWatts: 15,
      defaultLmPerW: 100,
      beamAngle: '60° (มุมปานกลาง แสงเน้นจุดสว่างนุ่มนวล)',
      uf: 0.60,
      mf: 0.80,
      icon: '🔘',
      desc: 'สำหรับฝังฝ้าเพดาน ให้แสงสว่างทั่วไปและเน้นความสวยงามสถาปัตยกรรม'
    },
    'spotlight_track': {
      name: 'โคมสปอตไลท์ / แทร็กไลท์ Track Spotlight (24°–36°)',
      category: 'โชว์รูม / ร้านค้า / แกลเลอรี',
      defaultWatts: 25,
      defaultLmPerW: 95,
      beamAngle: '24°–36° (มุมแคบ ส่องเน้นวัตถุสินค้า)',
      uf: 0.50,
      mf: 0.85,
      icon: '🎯',
      desc: 'เน้นขับสินค้า งานศิลปะ ให้มีมิติ มีค่าความส่องสว่างเฉพาะจุดสูง (High Lux Beam)'
    },
    'highbay_ufo': {
      name: 'โคมไฮเบย์ High Bay UFO Industrial (90°–120°)',
      category: 'คลังสินค้า / โรงงาน / โรงยิม (เพดานสูง >6m)',
      defaultWatts: 100,
      defaultLmPerW: 140,
      beamAngle: '90°–120° (กระจายแสงเพดานสูง)',
      uf: 0.75,
      mf: 0.75,
      icon: '🛸',
      desc: 'ประสิทธิภาพแสงสูงพิเศษ ลูเมนสูง ประหยัดไฟในพื้นที่อุตสาหกรรม'
    },
    'linear_batten': {
      name: 'โคมลีเนียร์ Linear Trunking / Batten 1.2m',
      category: 'ซูเปอร์มาร์เก็ต / ทางเดิน / คอนโด',
      defaultWatts: 28,
      defaultLmPerW: 120,
      beamAngle: '120° (แสงเส้นต่อเนื่อง)',
      uf: 0.65,
      mf: 0.80,
      icon: '📏',
      desc: 'ติดตั้งต่อสายเป็นแนวยาวต่อเนื่อง ให้แสงสว่างตามแนวทางเดินและชั้นวาง'
    },
    'wallwasher': {
      name: 'โคมส่องผนัง Wall Washer / Indirect Strip',
      category: 'แสงบรรยากาศ / โถงต้อนรับ / ผนังตกแต่ง',
      defaultWatts: 18,
      defaultLmPerW: 85,
      beamAngle: 'Asymmetric (ส่องล้างระนาบผนัง)',
      uf: 0.45,
      mf: 0.80,
      icon: '🧱',
      desc: 'ส่องสว่างบนพื้นผิวผนังเพื่อสร้างความรู้สึกกว้างขวางและลดความเปรียบต่างแสง'
    },
    'custom_ies': {
      name: '📁 นำเข้าไฟล์ IES Photometric (.ies)',
      category: 'ไฟล์โฟโตเมตริกมาตรฐานแล็บ (IESNA:LM-63)',
      defaultWatts: 36,
      defaultLmPerW: 110,
      beamAngle: 'Custom Photometric Curve',
      uf: 0.65,
      mf: 0.80,
      icon: '📄',
      desc: 'ดึงข้อมูลโฟโตเมตริก Luminous Flux, วัตต์ และเส้นโค้งการกระจายแสงจาก IES จริง'
    }
  };

  // IES File Upload Handler
  const handleIesFileUpload = (file: File) => {
    setIesUploadStatus('กำลังอ่านไฟล์ IES...');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = (e.target?.result as string) || '';
        setIesRawText(text);
        
        const lines = text.split(/\r?\n/).map(l => l.trim());
        let luminaireName = file.name.replace(/\.[^/.]+$/, "");
        let manufacturer = "LUMENCRAFT";
        
        for (const line of lines) {
          if (line.startsWith('[LUMCAT]') || line.startsWith('[LUMINAIRE]')) {
            const val = line.replace(/^\[.*?\]\s*/, '').trim();
            if (val) luminaireName = val;
          }
          if (line.startsWith('[MANUFAC]')) {
            const val = line.replace(/^\[.*?\]\s*/, '').trim();
            if (val) manufacturer = val;
          }
        }

        let tiltIndex = lines.findIndex(l => l.toUpperCase().startsWith('TILT='));
        if (tiltIndex === -1) tiltIndex = 0;
        
        const dataTokens: string[] = [];
        for (let i = tiltIndex + 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('[')) continue;
          const parts = line.split(/\s+/).filter(Boolean);
          dataTokens.push(...parts);
          if (dataTokens.length >= 15) break;
        }

        const numLamps = Number(dataTokens[0]) || 1;
        let lumensPerLamp = Number(dataTokens[1]) || 0;
        let inputWatts = Number(dataTokens[12]) || 0;

        if (inputWatts <= 0) inputWatts = 36;
        let totalLumens = (lumensPerLamp > 0) ? (numLamps * lumensPerLamp) : Math.round(inputWatts * 110);
        const eff = Math.round((totalLumens / inputWatts) * 10) / 10;

        const parsed = {
          fileName: file.name,
          luminaireName,
          manufacturer,
          lumens: totalLumens,
          watts: inputWatts,
          efficacy: eff,
          beamAngle: '110° Standard IES',
          candelaMax: Math.round(totalLumens * 0.32)
        };

        setParsedIesData(parsed);
        setSelectedLuminaireType('custom_ies');
        setFixtureWatts(inputWatts);
        setEfficacyLmPerWatt(eff);
        setCustomFixtureLumen(totalLumens);
        setIesUploadStatus(`✅ โหลด IES สำเร็จ: ${luminaireName} (${totalLumens} lm / ${inputWatts}W)`);
      } catch (err) {
        setIesUploadStatus('⚠️ รูปแบบไฟล์ IES ไม่ถูกต้อง โปรดตรวจสอบไฟล์');
      }
    };
    reader.onerror = () => setIesUploadStatus('❌ ไม่สามารถอ่านไฟล์ได้');
    reader.readAsText(file);
  };

  const loadSampleIes = (sampleType: 'panel_36w' | 'downlight_15w' | 'highbay_150w' | 'spotlight_25w') => {
    if (sampleType === 'panel_36w') {
      const parsed = {
        fileName: 'LUMENCRAFT_Panel_60x60_36W.ies',
        luminaireName: 'LUMENCRAFT LED Panel 60x60 Premium 36W',
        manufacturer: 'LUMENCRAFT Lighting Solutions',
        lumens: 3960,
        watts: 36,
        efficacy: 110,
        beamAngle: '110° Diffused',
        candelaMax: 1350
      };
      setParsedIesData(parsed);
      setSelectedLuminaireType('custom_ies');
      setFixtureWatts(36);
      setEfficacyLmPerWatt(110);
      setCustomFixtureLumen(3960);
      setUfCoeff(0.70);
      setIesUploadStatus('✅ โหลด Sample IES Panel 60x60 เรียบร้อย');
    } else if (sampleType === 'downlight_15w') {
      const parsed = {
        fileName: 'LUMENCRAFT_COB_Downlight_15W_60D.ies',
        luminaireName: 'LUMENCRAFT Architectural Downlight COB 15W 60°',
        manufacturer: 'LUMENCRAFT Lighting Solutions',
        lumens: 1575,
        watts: 15,
        efficacy: 105,
        beamAngle: '60° Medium Spot',
        candelaMax: 2200
      };
      setParsedIesData(parsed);
      setSelectedLuminaireType('custom_ies');
      setFixtureWatts(15);
      setEfficacyLmPerWatt(105);
      setCustomFixtureLumen(1575);
      setUfCoeff(0.60);
      setIesUploadStatus('✅ โหลด Sample IES Downlight 15W เรียบร้อย');
    } else if (sampleType === 'highbay_150w') {
      const parsed = {
        fileName: 'LUMENCRAFT_HighBay_UFO_150W_120D.ies',
        luminaireName: 'LUMENCRAFT Industrial Highbay UFO 150W 140lm/W',
        manufacturer: 'LUMENCRAFT Heavy Duty',
        lumens: 21000,
        watts: 150,
        efficacy: 140,
        beamAngle: '120° Wide Industrial',
        candelaMax: 7800
      };
      setParsedIesData(parsed);
      setSelectedLuminaireType('custom_ies');
      setFixtureWatts(150);
      setEfficacyLmPerWatt(140);
      setCustomFixtureLumen(21000);
      setUfCoeff(0.75);
      setIesUploadStatus('✅ โหลด Sample IES Highbay UFO 150W เรียบร้อย');
    } else if (sampleType === 'spotlight_25w') {
      const parsed = {
        fileName: 'LUMENCRAFT_Track_Spot_25W_24D.ies',
        luminaireName: 'LUMENCRAFT Retail Track Spot 25W 24° Narrow',
        manufacturer: 'LUMENCRAFT Display & Gallery',
        lumens: 2375,
        watts: 25,
        efficacy: 95,
        beamAngle: '24° Narrow Accent',
        candelaMax: 6500
      };
      setParsedIesData(parsed);
      setSelectedLuminaireType('custom_ies');
      setFixtureWatts(25);
      setEfficacyLmPerWatt(95);
      setCustomFixtureLumen(2375);
      setUfCoeff(0.50);
      setIesUploadStatus('✅ โหลด Sample IES Spotlight 25W เรียบร้อย');
    }
  };

  // Room Type Presets with CIE/TIS Lux recommendations
  const ROOM_LUX_PRESETS: Record<string, { label: string; lux: number; desc: string; icon: string }> = {
    'office_500': { label: 'สำนักงาน / ออฟฟิศทั่วไป (General Office)', lux: 500, desc: 'มาตรฐาน มอก. สำหรับการอ่าน เขียน พิมพ์คอมพิวเตอร์', icon: '💼' },
    'meeting_400': { label: 'ห้องประชุม / สัมมนา (Meeting & Conference)', lux: 400, desc: 'เน้นความสบายตา สื่อสารและนำเสนองาน', icon: '👥' },
    'corridor_150': { label: 'ทางเดิน / โถงบันได (Corridor & Hallway)', lux: 150, desc: 'สัญจรปลอดภัย มองเห็นสิ่งกีดขวางชัดเจน', icon: '🚶' },
    'warehouse_250': { label: 'คลังสินค้า / สโตร์ (Warehouse & Storage)', lux: 250, desc: 'อ่านฉลาก พาเลท และป้ายกำกับสินค้า', icon: '📦' },
    'retail_800': { label: 'ร้านค้า / โชว์รูมสินค้า (Retail & Showroom)', lux: 800, desc: 'เน้นสินค้าโดดเด่น สดใส ดึงดูดสายตาลูกค้า', icon: '🛍️' },
    'drawing_1000': { label: 'ห้องเขียนแบบ / งานละเอียด (Drafting & Fine Craft)', lux: 1000, desc: 'ความแม่นยำสูง แยกแยะเฉดสีและลายเส้น', icon: '📐' },
    'residential_living_200': { label: 'ห้องนั่งเล่น / ที่พักอาศัย (Living Room)', lux: 200, desc: 'บรรยากาศผ่อนคลาย อบอุ่น สบายตา', icon: '🛋️' },
    'residential_bed_150': { label: 'ห้องนอน (Bedroom / Rest Area)', lux: 150, desc: 'แสงนุ่มนวล ไม่แยงตา เหมาะแก่การพักผ่อน', icon: '🛏️' },
    'custom': { label: 'กำหนดค่า Lux เอง (Custom Target Lux)', lux: targetLux, desc: 'ระบุค่าความสว่างตามสเปกเฉพาะโครงการ', icon: '⚙️' },
  };

  // 1. Lumen, Lux & Fixture Spacing Calculations
  const fixtureLumens = customFixtureLumen > 0 ? customFixtureLumen : (fixtureWatts * efficacyLmPerWatt);
  const roomArea = Math.max(0.1, roomWidth * roomLength);
  const roomVolume = roomArea * roomHeight;
  const effectiveHeight = Math.max(0.4, roomHeight - workplaneHeight);
  const roomIndexK = (roomWidth * roomLength) / (effectiveHeight * Math.max(0.1, roomWidth + roomLength));
  
  // Total Lumens needed in room = (Target Lux * Area) / (UF * MF)
  const totalRequiredLumens = (targetLux * roomArea) / (Math.max(0.1, ufCoeff) * Math.max(0.1, mfCoeff));
  const exactFixtureCount = totalRequiredLumens / Math.max(1, fixtureLumens);
  const recommendedFixtureCount = Math.max(1, Math.round(exactFixtureCount));

  // Optimal Auto Fixture Grid Allocation (Cols x Rows matching Room Aspect Ratio Length / Width)
  const roomAspectRatio = Math.max(0.2, roomLength / Math.max(0.1, roomWidth));
  const autoCalcRows = Math.max(1, Math.round(Math.sqrt(recommendedFixtureCount * roomAspectRatio)));
  const autoCalcCols = Math.max(1, Math.round(recommendedFixtureCount / autoCalcRows));
  
  // Active effective Rows & Cols based on AUTO vs MANUAL mode
  const effectiveRows = fixtureCalcMode === 'auto' ? autoCalcRows : Math.max(1, manualFixtureRows);
  const effectiveCols = fixtureCalcMode === 'auto' ? autoCalcCols : Math.max(1, manualFixtureCols);
  const gridFixtureCount = effectiveRows * effectiveCols;

  const spacingLength = roomLength / effectiveRows; // distance between luminaires along length (m)
  const spacingWidth = roomWidth / effectiveCols;   // distance between luminaires along width (m)
  const wallSpacingLength = spacingLength / 2; // wall to first luminaire along length (m)
  const wallSpacingWidth = spacingWidth / 2;   // wall to first luminaire along width (m)
  
  const maxSpacing = Math.max(spacingLength, spacingWidth);
  const spacingToHeightRatio = maxSpacing / effectiveHeight; // Spacing to Height Ratio (SHR)
  const isSpacingUniform = spacingToHeightRatio <= 1.25;
  const isSpacingAcceptable = spacingToHeightRatio <= 1.50;

  // Actual Calculated Lux with chosen grid
  const actualCalculatedLux = (gridFixtureCount * fixtureLumens * ufCoeff * mfCoeff) / roomArea;
  const luxDifferencePercent = ((actualCalculatedLux - targetLux) / targetLux) * 100;

  // Total Lighting Watts and Power Density
  const totalLightingWatts = gridFixtureCount * fixtureWatts;
  const lightingPowerDensity = totalLightingWatts / roomArea; // W/m^2
  const isLpdCompliant = lightingPowerDensity <= 12; // Energy code <= 12 W/m^2

  // 2. DC Current & Wattage Calculations (Multi-loads / Direct)
  const totalDcItemsWatts = dcLoadItems.reduce((sum, it) => sum + (it.watts * it.qty), 0);
  const effectiveDcWatts = dcUseItemized ? totalDcItemsWatts : dcManualWatts;
  const dcCurrentAmp = effectiveDcWatts / Math.max(1, dcInputVoltage);
  const dcRatedAmpSafety = dcCurrentAmp / Math.max(0.5, dcDeratingFactor);
  const dcRecommendedPsuWatts = Math.ceil(effectiveDcWatts / Math.max(0.5, dcDeratingFactor));
  let dcRecommendedCable = '1.5 sq.mm.';
  if (dcCurrentAmp <= 4) dcRecommendedCable = '1.0 sq.mm.';
  else if (dcCurrentAmp <= 8) dcRecommendedCable = '1.5 sq.mm.';
  else if (dcCurrentAmp <= 14) dcRecommendedCable = '2.5 sq.mm.';
  else if (dcCurrentAmp <= 22) dcRecommendedCable = '4.0 sq.mm.';
  else if (dcCurrentAmp <= 32) dcRecommendedCable = '6.0 sq.mm.';
  else dcRecommendedCable = '10.0 sq.mm. หรือแยก 2 วงจรย่อย';

  // 3. AC Current & Breaker Calculations (with DC conversion to AC)
  const dcInputWattsFromAc = acIncludeDcLoad ? (effectiveDcWatts / Math.max(0.5, acEfficiency)) : 0;
  const totalAcCombinedWatts = acDirectWatts + dcInputWattsFromAc;

  let acCurrentAmp = 0;
  const acVoltageActive = acPhaseType === '1_phase' ? acVoltage1P : acVoltage3P;
  if (acPhaseType === '1_phase') {
    acCurrentAmp = totalAcCombinedWatts / (acVoltage1P * Math.max(0.5, acPowerFactor));
  } else {
    acCurrentAmp = totalAcCombinedWatts / (Math.sqrt(3) * acVoltage3P * Math.max(0.5, acPowerFactor));
  }
  const acApparentPowerVA = totalAcCombinedWatts / Math.max(0.5, acPowerFactor);
  const acContinuousLoadAmp = acCurrentAmp * 1.25; // 125% continuous load rule
  
  // Standard MCB Breaker table: 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125
  const standardMCBs = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
  const recommendedMCB = standardMCBs.find(mcb => mcb >= acContinuousLoadAmp) || 125;
  
  let acRecommendedCable = '2.5 sq.mm.';
  if (recommendedMCB <= 10) acRecommendedCable = '1.5 sq.mm. (IEC 01 THW / VAF)';
  else if (recommendedMCB <= 16) acRecommendedCable = '2.5 sq.mm. (IEC 01 THW)';
  else if (recommendedMCB <= 20) acRecommendedCable = '4.0 sq.mm. (IEC 01 THW)';
  else if (recommendedMCB <= 32) acRecommendedCable = '6.0 sq.mm. (IEC 01 THW)';
  else if (recommendedMCB <= 40) acRecommendedCable = '10.0 sq.mm. (IEC 01 THW)';
  else if (recommendedMCB <= 55) acRecommendedCable = '16.0 sq.mm. (IEC 01 THW)';
  else acRecommendedCable = '25.0 sq.mm. (IEC 01 THW)';

  // 4. Switching Wattage (LED Strip)
  const totalStripWatts = calcStripLength * calcWattPerMeter;
  const recommendedPsuWatts = totalStripWatts / (calcSafetyFactor || 0.8);
  const currentAmp24V = recommendedPsuWatts / 24;

  // 5. Voltage Drop (24VDC)
  const loadAmp = calcLoadWatts / 24;
  const voltageDropVolts = (2 * calcCableLength * loadAmp * 0.0175) / (calcCableSize || 2.5);
  const voltageAtEnd = 24 - voltageDropVolts;
  const voltageDropPercent = (voltageDropVolts / 24) * 100;
  const isVoltageDropSafe = voltageDropPercent <= 8;

  // Inquiries for FAQ candidates
  const faqCandidates = inquiries.filter(inq => inq.forFaq || inq.category);

  // Quick suggestion chips
  const quickSearchPrompts = [
    { label: '⚡ หม้อแปลง 24V สำหรับไฟเส้น 15m', query: 'การเลือกขนาดวัตต์หม้อแปลง 24V สำหรับไฟเส้นยาว 15 เมตร' },
    { label: '📏 ขนาดสายไฟ 24V ระยะ 25m ไม่ให้ดรอป', query: 'สายไฟ 24V ระยะทาง 25 เมตร โหลด 100W ต้องใช้ขนาดสายกี่ sq.mm.' },
    { label: '🌊 วิธีต่อสายไฟใต้น้ำ IP68 ไม่ให้รั่ว', query: 'การต่อสายไฟใต้น้ำในสระว่ายน้ำระบบเกลือไม่ให้น้ำซึมเข้า' },
    { label: '✂️ ตัดต่อ Neonflex ดัดโค้งมุมฉาก', query: 'การตัดต่อ Neonflex และรัศมีการดัดโค้งไม่ให้ขาด' },
    { label: '🎛️ DALI Address หลุดบ่อยเกิดจากอะไร', query: 'ปัญหาโคม DALI Address หลุดบ่อย และการตรวจสอบแรงดัน Bus' },
    { label: '🌳 โคมฝังพื้นในสวนน้ำขังแก้ยังไง', query: 'วิธีทำชั้นระบายน้ำโคมไฟฝังพื้นในสวนไม่ให้น้ำท่วมขัง' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner with Search Box & AI Assistant Search */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] shadow-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Engineering Knowledge Hub
              </span>
              <span className="text-xs text-slate-300">
                ค้นหาข้อมูลทั้งภายในองค์กร และค้นหาภายนอกด้วย AI วิศวกรรมไฟฟ้า
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มคำถาม-คำตอบ FAQ ใหม่</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                <HelpCircle className="w-7 h-7 text-amber-400" />
                8. FAQ Knowledge (ถามตอบและค้นหาปัญหาด้านเทคนิคด้วย AI)
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mt-1">
                พิมพ์คำค้นหาหรือคำถามทางเทคนิค ระบบจะค้นหาจากฐานข้อมูลภายในบริษัท 
                และค้นคว้าข้อมูลวิศวกรรมไฟฟ้าสากลภายนอกด้วย AI ช่วยสรุปคำตอบ สูตรคำนวณ และข้อควรระวังให้ทันที
              </p>
            </div>
          </div>

          {/* ================= MAIN SEARCH BAR ================= */}
          <div className="pt-2 space-y-2.5 max-w-4xl">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handlePerformSearch();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="พิมพ์คำถาม เช่น: หม้อแปลง 24V กี่วัตต์สำหรับไฟ 20m, สาย DALI ลูปยาวสุด, ต่อสายไฟใต้น้ำ IP68..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/95 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setAiResult(null);
                      setAiError(null);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="submit"
                  disabled={isAiSearching}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAiSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>กำลังค้นหา & วิเคราะห์...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>ค้นหา</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handlePerformSearch()}
                  disabled={isAiSearching}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Globe className="w-4 h-4 text-amber-300" />
                  <span>ค้นหาข้อมูลจากภายนอก</span>
                </button>
              </div>
            </form>

            {/* Quick Prompts Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                ตัวอย่างคำถามยอดนิยม:
              </span>
              {quickSearchPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePerformSearch(p.query)}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ================= AI SEARCH & ANSWER RESULT CARD ================= */}
      {isAiSearching && (
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-3 shadow-lg animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-amber-400 flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
          <h3 className="text-base font-bold text-white">
            กำลังค้นหาข้อมูลจาก Google และฐานข้อมูลวิศวกรรมไฟฟ้าสากล...
          </h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            กำลังสืบค้นข้อมูลสำหรับ: "{aiSearchedQuery || searchQuery}" พร้อมดึงลิงก์อ้างอิงและสรุปแนวทางปฏิบัติ
          </p>
        </div>
      )}

      {aiError && !isAiSearching && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 text-rose-200 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">การแจ้งเตือนจากระบบค้นหาภายนอก:</span> {aiError}
              <p className="text-rose-300 mt-0.5">คุณสามารถดูผลการค้นหาจากฐานข้อมูลภายในด้านล่าง หรือกดส่งคำถามให้ทีมวิศวกรได้โดยตรง</p>
            </div>
          </div>
          <button
            onClick={() => setAiError(null)}
            className="p-1 text-rose-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {aiResult && !isAiSearching && (
        <div className="bg-gradient-to-br from-white via-indigo-50/30 to-amber-50/20 border-2 border-indigo-500/40 rounded-2xl p-6 shadow-md space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 flex items-center gap-2">
            <button
              onClick={() => setAiResult(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="ปิดผลการตอบของ AI"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-xs">
                <Globe className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-black text-[10px] uppercase tracking-wide border border-blue-200 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-600" />
                    Google Search & External Knowledge
                  </span>
                  {aiResult.categoryLabel && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                      {aiResult.categoryLabel}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                  ผลการค้นหาข้อมูลจากภายนอก: "{aiSearchedQuery}"
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAiAnswer}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{aiCopied ? 'คัดลอกแล้ว!' : 'คัดลอกคำตอบ'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAiAnswerAsFaq}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <BookmarkPlus className="w-4 h-4 text-slate-950" />
                <span>➕ บันทึกข้อมูลนี้เป็น FAQ ใหม่</span>
              </button>
            </div>
          </div>

          {/* AI Summary Answer */}
          <div className="p-4 rounded-xl bg-white border border-indigo-100 shadow-2xs text-xs sm:text-sm text-slate-800 leading-relaxed font-medium space-y-1.5">
            <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              สรุปคำตอบจาก Google และหลักวิศวกรรมไฟฟ้า:
            </div>
            <p className="text-slate-800 whitespace-pre-line pl-1">{aiResult.summary}</p>
          </div>

          {/* AI Steps & Calculation */}
          {aiResult.steps && aiResult.steps.length > 0 && (
            <div className="bg-white/80 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ขั้นตอนการคำนวณ / แนวทางปฏิบัติทางวิศวกรรม:
              </div>
              <div className="space-y-2 text-xs text-slate-700">
                {aiResult.steps.map((step, si) => (
                  <div key={si} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 leading-relaxed flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {si + 1}
                    </span>
                    <span className="flex-1">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Causes / Technical Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiResult.technicalTips && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950">
                  <span className="font-bold">ข้อควรระวังสำคัญหน้างาน:</span> {aiResult.technicalTips}
                </div>
              </div>
            )}

            {aiResult.commonCauses && aiResult.commonCauses.length > 0 && (
              <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3.5 space-y-1">
                <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  สาเหตุที่พบบ่อย:
                </div>
                <ul className="text-xs text-rose-800 pl-4 list-disc space-y-0.5">
                  {aiResult.commonCauses.map((c, ci) => (
                    <li key={ci}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ================= GOOGLE SEARCH LINKS & WEB SOURCES ================= */}
          <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">
                  🔗 ลิงก์แหล่งข้อมูลและผลการค้นหาจาก Google (Google Search Sources)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                คลิกเพื่อเปิดดูเอกสารต้นฉบับในแท็บใหม่
              </span>
            </div>

            {/* Direct Google Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={aiResult.googleLinks?.mainSearchUrl || `https://www.google.com/search?q=${encodeURIComponent(aiSearchedQuery + ' มาตรฐานวิศวกรรมไฟฟ้า')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-amber-300" />
                <span>เปิดดูผลการค้นหาเต็มบน Google ↗</span>
              </a>

              <a
                href={aiResult.googleLinks?.diagramSearchUrl || `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(aiSearchedQuery + ' wiring diagram')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              >
                <span>🖼️ ค้นหาไดอะแกรมวงจร (Images) ↗</span>
              </a>

              <a
                href={aiResult.googleLinks?.datasheetSearchUrl || `https://www.google.com/search?q=${encodeURIComponent(aiSearchedQuery + ' datasheet pdf')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              >
                <span>📑 ค้นหาคู่มือ Datasheet PDF ↗</span>
              </a>
            </div>

            {/* Grounded Web Links Cards */}
            {aiResult.googleLinks?.webSources && aiResult.googleLinks.webSources.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {aiResult.googleLinks.webSources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 transition group flex items-start justify-between gap-2 text-left"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200 line-clamp-1 flex items-center gap-1">
                        <span>{src.title || 'แหล่งข้อมูลอ้างอิง'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono line-clamp-1">
                        {src.url.replace(/^https?:\/\//, '')}
                      </div>
                      {src.description && (
                        <div className="text-[10px] text-slate-300 line-clamp-1">
                          {src.description}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Sources and Tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                อ้างอิงมาตรฐาน:
              </span>
              <span>{(aiResult.sources || ['มาตรฐานวิศวกรรม LUMENCRAFT', 'IEC Standards', 'Google Search Grounding']).join(', ')}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {aiResult.tags && aiResult.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                  #{t}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Main Section Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'faqs'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>คลังคำถาม-คำตอบ FAQ ({displayFaqs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'candidates'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>คำถามจากฝ่ายขาย & รอสร้าง FAQ ({faqCandidates.length})</span>
            {faqCandidates.filter(c => c.status === 'replied' && !c.promotedToFaq).length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                {faqCandidates.filter(c => c.status === 'replied' && !c.promotedToFaq).length} พร้อมขึ้น FAQ
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('calculators')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'calculators'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>เครื่องมือคำนวณหน้างาน (Engineering Calculators)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          ซิงค์ฐานข้อมูลและเชื่อมต่อ AI ค้นหาอัจฉริยะ
        </div>
      </div>

      {/* ================= TAB 1: FAQ KNOWLEDGE BASE ================= */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          
          {/* Category Navigation Pills with smooth horizontal slide */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 slidebar-smooth slidebar-visible">
              {categories.map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="whitespace-nowrap">{cat.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {searchQuery && (
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                พบข้อมูลในระบบตรงกับ "{searchQuery}": <strong>{filteredFaqs.length}</strong> รายการ
              </span>
            )}
          </div>

          {/* FAQ Items Grid / Accordion */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  ไม่พบบทความที่ตรงกับ "{searchQuery}" ในฐานข้อมูลภายใน
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  คุณสามารถให้ AI ช่วยค้นหาคำตอบและสรุปหลักวิศวกรรมไฟฟ้าให้ทันที หรือกดเพิ่มหัวข้อใหม่เพื่อบรรจุลงในระบบ
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => handlePerformSearch()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Bot className="w-4 h-4 text-amber-300" />
                    ให้ AI ค้นหาและตอบคำถามนี้
                  </button>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    ดูคำถามทั้งหมด
                  </button>
                  <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่ม FAQ นี้ลงในฐานข้อมูล
                  </button>
                </div>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isExpanded = expandedId === faq.id;
                const isVoted = helpfulVotes[faq.id];
                const isCopied = copiedId === faq.id;

                return (
                  <div
                    key={faq.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                      isExpanded ? 'border-amber-400/80 shadow-md ring-1 ring-amber-400/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Accordion Header */}
                    <div
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full text-left p-5 flex items-start justify-between gap-4 cursor-pointer focus:outline-hidden"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            {faq.categoryLabel || CATEGORY_META[faq.category]?.label || 'เทคนิคทั่วไป'}
                          </span>
                          {faq.authorName && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                              <UserCheck className="w-3 h-3 text-slate-500" />
                              {faq.authorName}
                            </span>
                          )}
                          {faq.tags && faq.tags.map(t => (
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

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditModal(faq, e)}
                            title="แก้ไข FAQ นี้"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteFaqClick(faq, e)}
                            title="ลบ FAQ นี้"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCopyFaq(faq, e)}
                            title="คัดลอกคำตอบเพื่อส่งให้ลูกค้า/ทีมงาน"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-50 text-slate-500 shrink-0 group-hover:bg-amber-50 group-hover:text-amber-800 transition">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-700 space-y-4 animate-in fade-in duration-200">
                        
                        <p className="font-medium text-slate-800 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                          {faq.summary}
                        </p>

                        {/* Common Causes if any */}
                        {faq.commonCauses && faq.commonCauses.length > 0 && (
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
                        {faq.steps && faq.steps.length > 0 && (
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              แนวทางแก้ไขทีละขั้นตอน / วิธีคำนวณ (Step-by-Step Action Plan):
                            </div>
                            <div className="space-y-2 text-xs text-slate-700">
                              {faq.steps.map((step, si) => (
                                <div key={si} className="p-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs leading-relaxed flex items-start gap-2">
                                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                    {si + 1}
                                  </span>
                                  <span>{step}</span>
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

                        {/* Footer Feedback and Actions */}
                        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">
                              รับรองโดย: {faq.authorName || 'ฝ่ายวิศวกรรม'} {faq.updatedAt ? `(ปรับปรุง: ${faq.updatedAt})` : ''}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleCopyFaq(faq, e)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>{isCopied ? 'คัดลอกเรียบร้อยแล้ว!' : 'คัดลอกข้อความ'}</span>
                            </button>

                            <button
                              onClick={(e) => handleVoteHelpful(faq.id, e)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                isVoted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'text-emerald-700' : 'text-slate-500'}`} />
                              <span>{isVoted ? 'บันทึกเป็นประโยชน์แล้ว!' : 'มีประโยชน์'}</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ================= TAB 2: SALES INQUIRIES & FAQ CANDIDATES ================= */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                ข้อซักถามจากฝ่ายขายที่รอคำตอบ & พร้อมบรรจุขึ้น FAQ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ฝ่ายขายสามารถตั้งคำถามพร้อมเลือกหัวข้อ และเมื่อวิศวกรตอบแล้วสามารถกด "บันทึกเป็น FAQ" เพื่อนำเข้าสู่ฐานข้อมูลความรู้ส่วนกลางทันที
              </p>
            </div>

            <button
              onClick={() => setShowAskModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างคำถามใหม่ส่งให้วิศวกร</span>
            </button>
          </div>

          {faqCandidates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-slate-600">ยังไม่มีข้อซักถามที่ระบุหมวด FAQ ในขณะนี้</p>
              <p>คุณสามารถกดปุ่ม "สร้างคำถามใหม่ส่งให้วิศวกร" ด้านบนเพื่อเริ่มถามคำถามได้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {faqCandidates.map(inq => (
                <div key={inq.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {CATEGORY_META[inq.category || 'switching_power']?.label || 'หม้อแปลง Switching'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 font-mono">{inq.soNumber}</span>
                      <span className="text-xs text-slate-600">{inq.projectName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 text-[11px]">{inq.createdAt}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                        ผู้ถาม: {inq.salesName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold text-[11px]">
                        ช่างผู้รับผิดชอบ: {inq.engineerName}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-800">
                    <span className="font-bold text-slate-900">คำถามจากเซลล์: </span>
                    {inq.message}
                  </div>

                  {inq.status === 'replied' ? (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ช่าง{inq.engineerName} ได้ตอบกลับคำถามนี้แล้ว:
                        </span>
                        <span className="text-[11px] font-mono text-emerald-700">{inq.repliedAt}</span>
                      </div>
                      <p className="text-xs text-emerald-950 bg-white/80 p-3 rounded-lg border border-emerald-100 leading-relaxed">
                        {inq.replyMessage}
                      </p>

                      <div className="pt-2 flex items-center justify-between border-t border-emerald-200">
                        {inq.promotedToFaq ? (
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            บันทึกขึ้นระบบ FAQ เรียบร้อยแล้ว
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (onPromoteInquiryToFaq) {
                                onPromoteInquiryToFaq(inq, {
                                  category: inq.category || 'switching_power',
                                  question: inq.message,
                                  summary: inq.replyMessage || '',
                                  steps: [inq.replyMessage || ''],
                                  authorName: `ช่าง${inq.engineerName}`,
                                });
                              }
                            }}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>✨ บันทึกขึ้นคลัง FAQ ประจำบริษัท (1-Click Promote)</span>
                          </button>
                        )}
                        <span className="text-[11px] text-slate-500">
                          พร้อมใช้งานในส่วน FAQ ทันทีหลังกดบันทึก
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                      <span className="text-amber-800 font-medium flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        อยู่ระหว่างรอช่าง {inq.engineerName} เข้ามาตรวจสอบและตอบกลับทางระบบ
                      </span>
                      <span className="text-[11px] text-slate-500">
                        เมื่อตอบกลับแล้วจะสามารถนำขึ้น FAQ ได้ทันที
                      </span>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: ENGINEERING CALCULATORS ================= */}
      {activeTab === 'calculators' && (
        <div className="space-y-6">
          
          {/* Sub-navigation bar for engineering tools */}
          <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  เครื่องมือคำนวณวิศวกรรมแสงสว่างและไฟฟ้าหน้างาน
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    LUMEN Professional Engine
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  คำนวณความสว่าง Lux/Lumen, ระยะติดตั้งโคม, กระแสไฟฟ้า DC/AC, หม้อแปลง และแรงดันตก
                </p>
              </div>
            </div>

            {/* Sub-tab Filter Pills with Horizontal Slide */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 slidebar-smooth slidebar-visible">
              <button
                type="button"
                onClick={() => setCalcActiveSubTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  calcActiveSubTab === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                📊 แสดงทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setCalcActiveSubTab('lumen_lux')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  calcActiveSubTab === 'lumen_lux'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>1. Lumen & Lux & ระยะโคม</span>
              </button>
              <button
                type="button"
                onClick={() => setCalcActiveSubTab('dc_current')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  calcActiveSubTab === 'dc_current'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>2. กระแสไฟฟ้า DC (12V/24V/48V)</span>
              </button>
              <button
                type="button"
                onClick={() => setCalcActiveSubTab('ac_current')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  calcActiveSubTab === 'ac_current'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>3. กระแสไฟฟ้า AC (1-Phase / 3-Phase)</span>
              </button>
              <button
                type="button"
                onClick={() => setCalcActiveSubTab('switching')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  calcActiveSubTab === 'switching'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>4. หม้อแปลง LED Strip</span>
              </button>
              <button
                type="button"
                onClick={() => setCalcActiveSubTab('voltage_drop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  calcActiveSubTab === 'voltage_drop'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Cable className="w-3.5 h-3.5" />
                <span>5. แรงดันตกสายไฟ 24V</span>
              </button>
            </div>
          </div>

          {/* ================= 1. LUMEN & LUX & FIXTURE SPACING CALCULATOR ================= */}
          {(calcActiveSubTab === 'all' || calcActiveSubTab === 'lumen_lux') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-md">
                    <Sun className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">
                        1. เครื่องคำนวณค่า Lumen, Lux & ระยะการติดตั้งโคมไฟตามความสูงห้อง
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        CIE & TIS Standards
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      เลือกชนิดโคมไฟ, นำเข้าไฟล์ IES Photometric, ปรับแต่งจำนวนโคมไฟ (AUTO / แก้ไขเอง), และคำนวณระยะติดตั้งที่สม่ำเสมอ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700">
                  <Maximize2 className="w-4 h-4 text-amber-600" />
                  <span>พื้นที่ห้อง: <strong>{roomArea.toFixed(1)}</strong> ตร.ม. (กว้าง {roomWidth}m × ยาว {roomLength}m)</span>
                </div>
              </div>

              {/* Grid Form & Outputs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Columns: Inputs (7 cols) */}
                <div className="lg:col-span-7 space-y-5 text-xs">

                  {/* 1. Luminaire Type Selector & IES Photometric File Reader */}
                  <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">
                          <SlidersHorizontal className="w-4 h-4" />
                        </span>
                        <div>
                          <label className="font-bold text-amber-400 text-xs">
                            เลือกชนิดโคมไฟ หรือ นำเข้าไฟล์สเปกแสง IES (.ies)
                          </label>
                          <p className="text-[10px] text-slate-400">
                            ดึงค่าลูเมน, วัตต์, ประสิทธิภาพ lm/W และค่าสัมประสิทธิ์การใช้งานโดยอัตโนมัติ
                          </p>
                        </div>
                      </div>

                      {/* Mode Badge */}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono border border-slate-700">
                        {LUMINAIRE_TYPES[selectedLuminaireType]?.category || 'Luminaire Type'}
                      </span>
                    </div>

                    {/* Luminaire Preset Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(LUMINAIRE_TYPES).map(([typeKey, lum]) => {
                        const isSelected = selectedLuminaireType === typeKey;
                        return (
                          <button
                            key={typeKey}
                            type="button"
                            onClick={() => {
                              setSelectedLuminaireType(typeKey);
                              if (typeKey !== 'custom_ies') {
                                setFixtureWatts(lum.defaultWatts);
                                setEfficacyLmPerWatt(lum.defaultLmPerW);
                                setCustomFixtureLumen(0);
                                setUfCoeff(lum.uf);
                                setMfCoeff(lum.mf);
                              }
                            }}
                            className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base">{lum.icon}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-slate-400'
                              }`}>
                                {lum.defaultWatts}W
                              </span>
                            </div>
                            <div className="font-bold text-[11px] mt-1.5 line-clamp-1">
                              {lum.name.split('(')[0]}
                            </div>
                            <div className={`text-[9px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                              {lum.beamAngle}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* IES Photometric File Reader Section */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                          <FileCode className="w-4 h-4 text-amber-400" />
                          <span>นำเข้าไฟล์ IES Photometric (.ies) จากเครื่องคำนวณ / ห้องแล็บ:</span>
                        </div>
                        
                        {/* Sample IES Quick Load buttons */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 hidden sm:inline">ตัวอย่าง IES:</span>
                          <button
                            type="button"
                            onClick={() => loadSampleIes('panel_36w')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                          >
                            Panel 36W
                          </button>
                          <button
                            type="button"
                            onClick={() => loadSampleIes('downlight_15w')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                          >
                            Downlight 15W
                          </button>
                          <button
                            type="button"
                            onClick={() => loadSampleIes('highbay_150w')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                          >
                            Highbay 150W
                          </button>
                          <button
                            type="button"
                            onClick={() => loadSampleIes('spotlight_25w')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                          >
                            Spot 25W
                          </button>
                        </div>
                      </div>

                      {/* Dropzone & File Input */}
                      <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl bg-slate-900/60 cursor-pointer transition text-center group">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-amber-400 mb-1 transition" />
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-300">
                          คลิกหรือลากไฟล์ .ies มาวางที่นี่เพื่อประมวลผลค่า Luminous Flux & Watts ทันที
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          รองรับมาตรฐาน IESNA LM-63 (Photometric Data File)
                        </span>
                        <input
                          type="file"
                          accept=".ies,.txt"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleIesFileUpload(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>

                      {/* Status / Parsed IES Summary */}
                      {iesUploadStatus && (
                        <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-600/50 text-[11px] text-amber-200 flex items-center justify-between">
                          <span>{iesUploadStatus}</span>
                          {parsedIesData && (
                            <span className="font-mono font-bold text-amber-400">
                              {parsedIesData.lumens} lm / {parsedIesData.watts}W ({parsedIesData.efficacy} lm/W)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Preset Room Type Selector */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block font-bold text-slate-800">
                      🏢 เลือกประเภทห้อง / การใช้งาน (Room Application Preset):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(ROOM_LUX_PRESETS).map(([key, item]) => {
                        const isSelected = roomPreset === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setRoomPreset(key);
                              if (key !== 'custom') {
                                setTargetLux(item.lux);
                              }
                            }}
                            className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base">{item.icon}</span>
                              <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
                                isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {item.lux} Lux
                              </span>
                            </div>
                            <div className="font-bold text-[11px] mt-1 line-clamp-1">
                              {item.label.split('(')[0]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room Dimensions Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Width */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <span>ความกว้างห้อง (Width):</span>
                        <span className="font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {roomWidth} ม.
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1.5}
                        max={30}
                        step={0.5}
                        value={roomWidth}
                        onChange={e => setRoomWidth(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Length */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <span>ความยาวห้อง (Length):</span>
                        <span className="font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {roomLength} ม.
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1.5}
                        max={40}
                        step={0.5}
                        value={roomLength}
                        onChange={e => setRoomLength(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Height */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <span>ความสูงห้อง (Height):</span>
                        <span className="font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {roomHeight} ม.
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2.0}
                        max={14}
                        step={0.1}
                        value={roomHeight}
                        onChange={e => setRoomHeight(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                  </div>

                  {/* Workplane Height & Target Lux */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Workplane Height */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        ระดับความสูงระนาบงาน (Workplane Height):
                      </label>
                      <select
                        value={workplaneHeight}
                        onChange={e => setWorkplaneHeight(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 text-xs"
                      >
                        <option value={0.75}>0.75 ม. (ระดับโต๊ะทำงาน / สำนักงาน / เคาน์เตอร์)</option>
                        <option value={0.85}>0.85 ม. (ระดับโต๊ะปฏิบัติการ / โรงงาน / โต๊ะยืน)</option>
                        <option value={0.0}>0.00 ม. (ระดับพื้น / ทางเดิน / ลานจอดรถ / คลังสินค้า)</option>
                      </select>
                      <div className="text-[10px] text-slate-500 mt-1">
                        ความสูงประสิทธิผลจากโคมถึงโต๊ะงาน (H_eff) = <strong>{effectiveHeight.toFixed(2)}</strong> ม.
                      </div>
                    </div>

                    {/* Target Lux */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        เป้าหมายความสว่าง (Target Lux):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={50}
                          max={3000}
                          step={25}
                          value={targetLux}
                          onChange={e => {
                            setTargetLux(Number(e.target.value));
                            setRoomPreset('custom');
                          }}
                          className="flex-1 p-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-xs"
                        />
                        <span className="font-bold text-slate-600 px-2.5 py-2 rounded-xl bg-slate-100 border border-slate-200">
                          Lux (lx)
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Fixture Efficacy (Lumen/Watt) & Wattage */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between font-bold text-slate-900 border-b border-amber-200/60 pb-2">
                      <span className="flex items-center gap-1.5 text-amber-900">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        ประสิทธิภาพโคมไฟและกำลังวัตต์ (Lumen / Watt / Fixture):
                      </span>
                      <span className="text-[11px] text-amber-800 font-mono font-bold">
                        {fixtureLumens.toLocaleString()} Lumen / โคม
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Efficacy (Lumen per Watt) */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          ค่าประสิทธิภาพส่องสว่าง (Lumen / Watt):
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[90, 100, 110, 140].map(lmw => (
                            <button
                              key={lmw}
                              type="button"
                              onClick={() => {
                                setEfficacyLmPerWatt(lmw);
                                setCustomFixtureLumen(0);
                              }}
                              className={`py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                efficacyLmPerWatt === lmw && customFixtureLumen === 0
                                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {lmw} lm/W
                            </button>
                          ))}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <input
                            type="number"
                            min={50}
                            max={220}
                            value={efficacyLmPerWatt}
                            onChange={e => {
                              setEfficacyLmPerWatt(Number(e.target.value));
                              setCustomFixtureLumen(0);
                            }}
                            className="w-20 p-1.5 rounded-lg border border-slate-300 font-mono font-bold text-center text-xs"
                          />
                          <span className="text-[10px] text-slate-500">lm/W (กำหนดค่าเอง)</span>
                        </div>
                      </div>

                      {/* Watt per Fixture */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          กำลังวัตต์ต่อโคมไฟ (Watt / Fixture):
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[15, 24, 36, 100].map(w => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => {
                                setFixtureWatts(w);
                                setCustomFixtureLumen(0);
                              }}
                              className={`py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                fixtureWatts === w && customFixtureLumen === 0
                                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {w} W
                            </button>
                          ))}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <input
                            type="number"
                            min={3}
                            max={500}
                            value={fixtureWatts}
                            onChange={e => {
                              setFixtureWatts(Number(e.target.value));
                              setCustomFixtureLumen(0);
                            }}
                            className="w-20 p-1.5 rounded-lg border border-slate-300 font-mono font-bold text-center text-xs"
                          />
                          <span className="text-[10px] text-slate-500">Watts (เช่น 18W, 50W, 150W)</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Engineering Coefficients UF & MF */}
                  <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800">Utilization Factor (UF):</span>
                      <select
                        value={ufCoeff}
                        onChange={e => setUfCoeff(Number(e.target.value))}
                        className="w-full mt-1 p-1.5 rounded border border-slate-300 bg-white font-mono font-bold text-slate-800 text-xs"
                      >
                        <option value={0.75}>0.75 (โคม Highbay / แสงลงตรง สะท้อนสูง)</option>
                        <option value={0.70}>0.70 (ห้องเพดานและผนังสีขาว โคม Panel 60x60)</option>
                        <option value={0.65}>0.65 (มาตรฐานสำนักงาน / โคม Linear Batten)</option>
                        <option value={0.60}>0.60 (โคมดาวน์ไลท์ Downlight 60°)</option>
                        <option value={0.50}>0.50 (โคมสปอตไลท์ Track Spot / ผนังสีเข้ม)</option>
                        <option value={0.45}>0.45 (โคม Wall Washer ส่องผนัง)</option>
                      </select>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800">Maintenance Factor (MF):</span>
                      <select
                        value={mfCoeff}
                        onChange={e => setMfCoeff(Number(e.target.value))}
                        className="w-full mt-1 p-1.5 rounded border border-slate-300 bg-white font-mono font-bold text-slate-800 text-xs"
                      >
                        <option value={0.85}>0.85 (ห้องสะอาดมาก / ติดตั้งหลอด LED เกรดพรีเมียม)</option>
                        <option value={0.80}>0.80 (มาตรฐานวิศวกรรมทั่วไป / ฝุ่นละอองปกติ)</option>
                        <option value={0.75}>0.75 (คลังสินค้า / โรงงาน / ฝุ่นละอองสะสม)</option>
                      </select>
                    </div>
                  </div>

                </div>

                {/* Right Columns: Mode Toggle, Calculations, Spacing & Visual 2D Ceiling Layout (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Mode Selector (AUTO vs MANUAL Fixture Editing) */}
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Settings2 className="w-4 h-4" />
                        โหมดกำหนดจำนวนโคมไฟ (Fixture Count Mode):
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {fixtureCalcMode === 'auto' ? '⚡ AUTO CALC' : '✏️ MANUAL EDIT'}
                      </span>
                    </div>

                    {/* Mode Toggle Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFixtureCalcMode('auto')}
                        className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          fixtureCalcMode === 'auto'
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>แบบ AUTO ตามระยะ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFixtureCalcMode('manual');
                          setManualFixtureRows(autoCalcRows);
                          setManualFixtureCols(autoCalcCols);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          fixtureCalcMode === 'manual'
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>กำหนด / แก้ไขเอง</span>
                      </button>
                    </div>

                    {/* Manual Grid Steppers & Sliders */}
                    {fixtureCalcMode === 'manual' && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                        <div className="text-[11px] text-amber-300 font-bold flex items-center justify-between">
                          <span>ปรับจำนวนแถวโคมไฟ (Grid Arrangement):</span>
                          <span className="font-mono text-white">รวม: {manualFixtureCols * manualFixtureRows} โคม</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Cols (Width) */}
                          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-300">
                              <span>แนวกว้าง (Cols):</span>
                              <span className="font-mono font-bold text-amber-400">{manualFixtureCols} แถว</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setManualFixtureCols(Math.max(1, manualFixtureCols - 1))}
                                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={20}
                                value={manualFixtureCols}
                                onChange={e => setManualFixtureCols(Math.max(1, Number(e.target.value)))}
                                className="flex-1 p-1 bg-slate-950 text-white font-mono font-bold text-center rounded border border-slate-700 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => setManualFixtureCols(manualFixtureCols + 1)}
                                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Rows (Length) */}
                          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-300">
                              <span>แนวยาว (Rows):</span>
                              <span className="font-mono font-bold text-amber-400">{manualFixtureRows} แถว</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setManualFixtureRows(Math.max(1, manualFixtureRows - 1))}
                                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={20}
                                value={manualFixtureRows}
                                onChange={e => setManualFixtureRows(Math.max(1, Number(e.target.value)))}
                                className="flex-1 p-1 bg-slate-950 text-white font-mono font-bold text-center rounded border border-slate-700 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => setManualFixtureRows(manualFixtureRows + 1)}
                                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400">
                          💡 เมื่อแก้ไขจำนวนโคมไฟ ระบบจะคำนวณค่า Lux ที่ได้จริงและระยะติดตั้ง $S_L, S_W$ ให้โดยอัตโนมัติทันที
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Results Summary Box */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-2xl p-5 space-y-3.5 shadow-md border border-slate-800">
                    
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        ผลการคำนวณแสงสว่างและระยะติดตั้ง
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        Room Index K = {roomIndexK.toFixed(2)}
                      </span>
                    </div>

                    {/* Fixture Count Recommendation */}
                    <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                      <div>
                        <div className="text-xs text-slate-300 font-medium">
                          {fixtureCalcMode === 'auto' ? 'จำนวนโคมไฟแนะนำ (AUTO):' : 'จำนวนโคมไฟที่กำหนด (MANUAL):'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          จัดวาง {effectiveCols} แถว (กว้าง) × {effectiveRows} แถว (ยาว)
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-amber-400 font-mono">
                          {gridFixtureCount}
                        </span>
                        <span className="text-xs text-slate-300 ml-1 font-bold">โคม</span>
                        <div className="text-[10px] text-slate-400">
                          (คำนวณเป้าหมาย: {exactFixtureCount.toFixed(2)} โคม)
                        </div>
                      </div>
                    </div>

                    {/* Actual Lux & Target Lux Comparison */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
                        <div className="text-[11px] text-slate-400">ความสว่างจริงที่ได้รับ:</div>
                        <div className="font-mono font-black text-lg text-emerald-400">
                          {Math.round(actualCalculatedLux)} <span className="text-xs text-slate-300">Lux</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {luxDifferencePercent >= 0 ? `+${luxDifferencePercent.toFixed(1)}% จากเป้าหมาย` : `${luxDifferencePercent.toFixed(1)}% จากเป้าหมาย`}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
                        <div className="text-[11px] text-slate-400">ลูเมนรวมทั้งห้อง:</div>
                        <div className="font-mono font-bold text-base text-amber-300">
                          {Math.round(gridFixtureCount * fixtureLumens).toLocaleString()} <span className="text-xs text-slate-400">lm</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ต้องการขั้นต่ำ: {Math.round(totalRequiredLumens).toLocaleString()} lm
                        </div>
                      </div>
                    </div>

                    {/* Fixture Spacing Breakdown (ระยะการติดโคมไฟเบื้องต้น) */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                      <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                        <span>📐 ระยะการติดโคมไฟเบื้องต้น (Fixture Spacing):</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          isSpacingUniform 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : isSpacingAcceptable
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          SHR: {spacingToHeightRatio.toFixed(2)} {isSpacingUniform ? '(แสงสม่ำเสมอดีเยี่ยม)' : isSpacingAcceptable ? '(พอใช้)' : '(โคมห่างเกินไป)'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-slate-400">ระยะห่างตามแนวยาว (Length):</div>
                          <div className="font-mono font-bold text-white text-xs">
                            {spacingLength.toFixed(2)} ม.
                          </div>
                          <div className="text-[10px] text-slate-500">
                            (ผนังถึงโคมแรก: {wallSpacingLength.toFixed(2)} ม.)
                          </div>
                        </div>

                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-slate-400">ระยะห่างตามแนวกว้าง (Width):</div>
                          <div className="font-mono font-bold text-white text-xs">
                            {spacingWidth.toFixed(2)} ม.
                          </div>
                          <div className="text-[10px] text-slate-500">
                            (ผนังถึงโคมแรก: {wallSpacingWidth.toFixed(2)} ม.)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Watts & Lighting Power Density (LPD) */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                      <div>
                        <span className="text-slate-400">กำลังไฟฟ้ารวมทั้งห้อง: </span>
                        <span className="font-mono font-bold text-white">{totalLightingWatts} Watts</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400">LPD: </span>
                        <span className={`font-mono font-bold ${isLpdCompliant ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {lightingPowerDensity.toFixed(2)} W/m²
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          {isLpdCompliant ? '(✅ ประหยัดพลังงาน)' : '(⚠️ สูงกว่าเกณฑ์)'}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* 3D & 2D Interactive Lighting Room Simulation with Furniture & Dimensions */}
                  <LightingRoom3DVisualizer
                    roomLength={roomLength}
                    roomWidth={roomWidth}
                    roomHeight={roomHeight}
                    workplaneHeight={workplaneHeight}
                    selectedRoomType={roomPreset}
                    fixtureRows={effectiveRows}
                    fixtureCols={effectiveCols}
                    fixtureWatts={fixtureWatts}
                    fixtureLumens={fixtureLumens}
                    efficacyLmPerWatt={efficacyLmPerWatt}
                    calculatedLux={actualCalculatedLux}
                    targetLux={targetLux}
                    beamAngleText={
                      selectedLuminaireType === 'custom_ies' && parsedIesData
                        ? parsedIesData.beamAngle
                        : (LUMINAIRE_TYPES[selectedLuminaireType]?.beamAngle || '110°')
                    }
                    luminaireName={
                      selectedLuminaireType === 'custom_ies' && parsedIesData
                        ? parsedIesData.luminaireName
                        : (LUMINAIRE_TYPES[selectedLuminaireType]?.name || 'โคมไฟส่องสว่าง')
                    }
                    luminaireIcon={LUMINAIRE_TYPES[selectedLuminaireType]?.icon || '💡'}
                  />

                </div>

              </div>
            </div>
          )}

          {/* ================= 2. DC CURRENT & WATTAGE CALCULATOR (WITH MULTI-LOADS) ================= */}
          {(calcActiveSubTab === 'all' || calcActiveSubTab === 'dc_current') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-amber-100 text-amber-800">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      2. เครื่องคำนวณกำลังวัตต์ (Watt) และกระแสไฟฟ้าตรง DC (DC Current & Loads)
                    </h3>
                    <p className="text-xs text-slate-500">
                      คำนวณกำลังวัตต์โหลด DC แต่ละรายการ, กระแสรวม (A), ขนาดหม้อแปลง Switching และขนาดสายไฟทองแดง DC
                    </p>
                  </div>
                </div>

                {/* Switch between Multi-load and Single Wattage input */}
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDcUseItemized(true)}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                      dcUseItemized
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    📦 รวมโหลดอุปกรณ์ DC หลายรายการ ({dcLoadItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDcUseItemized(false)}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                      !dcUseItemized
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    ⚡ ระบุวัตต์รวมตรง
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* Inputs: Multi-load items or manual watts */}
                <div className="space-y-4">
                  
                  {dcUseItemized ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>รายการโหลดอุปกรณ์ไฟฟ้า DC (DC Load Items):</span>
                        <span className="font-mono text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          รวม: {totalDcItemsWatts} W
                        </span>
                      </div>

                      {/* Item List */}
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {dcLoadItems.map((item, idx) => (
                          <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex-1 pr-2">
                              <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                              <div className="text-[10px] text-slate-500">
                                {item.watts}W × {item.qty} ชิ้น = <strong>{item.watts * item.qty} Watts</strong>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDcLoadItems(dcLoadItems.filter(it => it.id !== item.id))}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="ลบรายการ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Item Row */}
                      <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                        <div className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" />
                          เพิ่มโหลด DC ใหม่:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5">
                          <input
                            type="text"
                            placeholder="ชื่อโหลด (เช่น Neon Flex 10m)"
                            value={newDcItemName}
                            onChange={e => setNewDcItemName(e.target.value)}
                            className="sm:col-span-6 p-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                          />
                          <input
                            type="number"
                            placeholder="วัตต์ (W)"
                            value={newDcItemWatts}
                            onChange={e => setNewDcItemWatts(Number(e.target.value))}
                            className="sm:col-span-3 p-1.5 rounded-lg border border-slate-300 bg-white font-mono text-center text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newDcItemName.trim()) return;
                              setDcLoadItems([
                                ...dcLoadItems,
                                {
                                  id: String(Date.now()),
                                  name: newDcItemName.trim(),
                                  watts: Number(newDcItemWatts) || 10,
                                  qty: 1
                                }
                              ]);
                              setNewDcItemName('');
                              setNewDcItemWatts(50);
                            }}
                            className="sm:col-span-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
                          >
                            + เพิ่ม
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        1. โหลดกำลังวัตต์ DC รวมทั้งหมด (Total Watts):
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={5}
                          max={2000}
                          step={5}
                          value={dcManualWatts}
                          onChange={e => setDcManualWatts(Number(e.target.value))}
                          className="flex-1 accent-amber-500 cursor-pointer"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={10000}
                            value={dcManualWatts}
                            onChange={e => setDcManualWatts(Number(e.target.value))}
                            className="w-20 p-1.5 rounded-lg border border-slate-300 font-mono font-bold text-center"
                          />
                          <span className="font-bold text-slate-600">W</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      2. แรงดันไฟฟ้ากระแสตรง (DC Voltage):
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[5, 12, 24, 36, 48].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setDcInputVoltage(v)}
                          className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            dcInputVoltage === v
                              ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {v} VDC
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      3. กฎความปลอดภัย Safety Derating Factor:
                    </label>
                    <select
                      value={dcDeratingFactor}
                      onChange={e => setDcDeratingFactor(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800"
                    >
                      <option value={0.80}>80% Derating (มาตรฐาน LUMENCRAFT - วิ่งต่อเนื่อง 24 ชม.)</option>
                      <option value={0.70}>70% Derating (ตู้ควบคุมปิดทึบ / อุณหภูมิหน้างานสูง 45°C)</option>
                      <option value={0.85}>85% Derating (ห้องปรับอากาศ / ระบายความร้อนดีเยี่ยม)</option>
                    </select>
                  </div>
                </div>

                {/* Outputs Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-3 shadow-inner">
                  <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
                    <span>ผลลัพธ์การคำนวณระบบไฟฟ้ากระแสตรง (DC Results)</span>
                    <span className="font-mono text-slate-300">P_DC = {effectiveDcWatts}W @ {dcInputVoltage}V</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">กระแสไฟฟ้าใช้งานจริง (I_DC = P / V):</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">{dcCurrentAmp.toFixed(2)} A (แอมป์)</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">กระแสเผื่อ Safety Margin (80% Rule):</span>
                    <span className="font-mono font-bold text-white">{dcRatedAmpSafety.toFixed(2)} A</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
                    <span className="text-amber-300 font-bold">ขนาดหม้อแปลง Switching ขั้นต่ำ:</span>
                    <span className="font-mono font-black text-amber-400 text-base">{dcRecommendedPsuWatts} Watts</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                    <span className="text-slate-300">ขนาดสายไฟ DC ทองแดงแนะนำ:</span>
                    <span className="font-mono font-bold text-emerald-400">{dcRecommendedCable}</span>
                  </div>

                  <div className="text-[11px] text-slate-300 bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
                    💡 คำแนะนำวิศวกร: หากระยะสาย DC เกิน 15 เมตร แนะนำให้เพิ่มขนาดสายไฟเป็น 2.5–4.0 sq.mm. หรือต่อสายไฟเลี้ยงหัว-ท้าย (Double Feed) เพื่อป้องกันแรงดันตก
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= 3. AC CURRENT & BREAKER CALCULATOR (WITH DC LOAD LINK) ================= */}
          {(calcActiveSubTab === 'all' || calcActiveSubTab === 'ac_current') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-800">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    3. เครื่องคำนวณกำลังวัตต์ (Watt) และกระแสไฟฟ้าสลับ AC (AC Current & Breaker with DC Loads)
                  </h3>
                  <p className="text-xs text-slate-500">
                    คำนวณกระแสไฟฟ้า AC 1-Phase / 3-Phase, รวมโหลดหม้อแปลง DC, กำลังไฟฟ้าปรากฏ (VA), ขนาดเบรกเกอร์ MCB และสายไฟ วสท.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* Inputs */}
                <div className="space-y-3.5">
                  
                  {/* System Phase Selection */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      1. เลือกระบบไฟฟ้า AC:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAcPhaseType('1_phase')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                          acPhaseType === '1_phase'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>1 Phase (220V - 230V)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAcPhaseType('3_phase')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                          acPhaseType === '3_phase'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>3 Phase (380V - 400V)</span>
                      </button>
                    </div>
                  </div>

                  {/* Direct AC Luminaire Load */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      2. โหลดกำลังวัตต์ AC ตรง (Direct AC Luminaires / Equipment):
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={10000}
                        step={50}
                        value={acDirectWatts}
                        onChange={e => setAcDirectWatts(Number(e.target.value))}
                        className="flex-1 accent-indigo-600 cursor-pointer"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={50000}
                          value={acDirectWatts}
                          onChange={e => setAcDirectWatts(Number(e.target.value))}
                          className="w-20 p-1.5 rounded-lg border border-slate-300 font-mono font-bold text-center"
                        />
                        <span className="font-bold text-slate-600">W</span>
                      </div>
                    </div>
                  </div>

                  {/* DC Load Integration Checkbox */}
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acIncludeDcLoad}
                        onChange={e => setAcIncludeDcLoad(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                      />
                      <span className="font-bold text-indigo-950 text-xs">
                        ⚡ รวมโหลดกำลังวัตต์ DC จากหม้อแปลง Switching เข้าในวงจร AC นี้ด้วย
                      </span>
                    </label>

                    {acIncludeDcLoad && (
                      <div className="pl-6 text-[11px] text-indigo-900 space-y-1">
                        <div>
                          โหลด DC รวม: <strong>{effectiveDcWatts}W</strong> แปลงเป็น AC Input: <strong>{Math.round(dcInputWattsFromAc)}W</strong> (คำนวณผ่าน Driver Eff η = {acEfficiency})
                        </div>
                        <div className="font-bold text-slate-900">
                          = กำลังวัตต์ AC สุทธิรวมทั้งระบบ: <span className="font-mono text-indigo-700 text-xs">{Math.round(totalAcCombinedWatts)} Watts</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AC Voltage, PF & Efficiency */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        แรงดัน (V):
                      </label>
                      <input
                        type="number"
                        value={acPhaseType === '1_phase' ? acVoltage1P : acVoltage3P}
                        onChange={e => {
                          if (acPhaseType === '1_phase') setAcVoltage1P(Number(e.target.value));
                          else setAcVoltage3P(Number(e.target.value));
                        }}
                        className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Power Factor:
                      </label>
                      <input
                        type="number"
                        min={0.6}
                        max={1.0}
                        step={0.01}
                        value={acPowerFactor}
                        onChange={e => setAcPowerFactor(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Driver Eff (η):
                      </label>
                      <input
                        type="number"
                        min={0.7}
                        max={0.99}
                        step={0.01}
                        value={acEfficiency}
                        onChange={e => setAcEfficiency(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-center"
                      />
                    </div>
                  </div>

                </div>

                {/* Outputs Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-3 shadow-inner">
                  <div className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
                    <span>ผลลัพธ์การคำนวณระบบไฟฟ้ากระแสสลับ ({acPhaseType === '1_phase' ? '1-Phase 230V' : '3-Phase 400V'})</span>
                    <span className="font-mono text-amber-400 font-bold">{Math.round(totalAcCombinedWatts)} W</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">กระแสไฟฟ้าไหลในสาย (I_AC):</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {acCurrentAmp.toFixed(2)} A {acPhaseType === '3_phase' ? '/ เฟส' : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">กำลังไฟฟ้าปรากฏ (Apparent Power):</span>
                    <span className="font-mono font-bold text-white">{Math.round(acApparentPowerVA).toLocaleString()} VA</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">กระแสเผื่อโหลดต่อเนื่อง 125% (Continuous Load):</span>
                    <span className="font-mono font-bold text-slate-300">{acContinuousLoadAmp.toFixed(2)} A</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
                    <span className="text-indigo-300 font-bold">พิกัดเบรกเกอร์ลูกย่อยแนะนำ (MCB):</span>
                    <span className="font-mono font-black text-amber-400 text-base">{recommendedMCB} A ({acPhaseType === '1_phase' ? '1P' : '3P'})</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                    <span className="text-slate-300">ขนาดสายไฟ AC ทองแดงแนะนำ (วสท.):</span>
                    <span className="font-mono font-bold text-emerald-400">{acRecommendedCable}</span>
                  </div>

                  <div className="text-[11px] text-slate-300 bg-slate-800/90 p-2 rounded-xl border border-slate-700">
                    📋 สูตรอ้างอิง: {acPhaseType === '1_phase' ? 'I = P_Total / (V × PF)' : 'I = P_Total / (√3 × V_LL × PF)'} โดยรวมกำลังสูญเสียในไดรเวอร์ DC ครบถ้วนตามหลักวิศวกรรมไฟฟ้า
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= 4 & 5. EXISTING LED STRIP & VOLTAGE DROP CALCULATORS ================= */}
          {(calcActiveSubTab === 'all' || calcActiveSubTab === 'switching' || calcActiveSubTab === 'voltage_drop') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 4. Switching Wattage & Derating Calculator */}
              {(calcActiveSubTab === 'all' || calcActiveSubTab === 'switching') && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        4. เครื่องคำนวณขนาดหม้อแปลง LED Strip 12V/24V
                      </h3>
                      <p className="text-xs text-slate-500">
                        คำนวณวัตต์รวมและเผื่อ Safety Factor (Derating 80% Rule)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        1. ความยาวไฟเส้น LED Strip ทั้งหมด (เมตร):
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={1}
                          max={100}
                          step={0.5}
                          value={calcStripLength}
                          onChange={e => setCalcStripLength(Number(e.target.value))}
                          className="flex-1 accent-amber-600"
                        />
                        <span className="w-16 px-2 py-1 rounded-lg bg-slate-100 border border-slate-300 font-bold font-mono text-center">
                          {calcStripLength} m
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        2. กำลังวัตต์ต่อเมตรของไฟเส้น (Watt/Meter):
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[4.8, 9.6, 14.4, 19.2].map(w => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setCalcWattPerMeter(w)}
                            className={`p-2 rounded-xl text-xs font-bold border transition ${
                              calcWattPerMeter === w
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {w} W/m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        3. กฎความปลอดภัย Safety Derating Factor:
                      </label>
                      <select
                        value={calcSafetyFactor}
                        onChange={e => setCalcSafetyFactor(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value={0.8}>80% Derating (มาตรฐานวิศวกรรม LUMENCRAFT)</option>
                        <option value={0.7}>70% Derating (พื้นที่อุณหภูมิสูง / กล่องปิดทึบ)</option>
                        <option value={0.85}>85% Derating (ติดตั้งในที่เปิดโล่ง ถ่ายเทดี)</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-2 shadow-inner">
                      <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                        ผลลัพธ์การคำนวณหม้อแปลง
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">โหลดวัตต์รวมหน้างาน:</span>
                        <span className="font-mono font-bold text-white text-sm">{totalStripWatts.toFixed(1)} Watts</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                        <span className="text-amber-300 font-bold">ขนาดหม้อแปลงขั้นต่ำที่ต้องเลือก:</span>
                        <span className="font-mono font-black text-amber-400 text-base">{Math.ceil(recommendedPsuWatts)} Watts</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>กระแสไฟ 24VDC:</span>
                        <span className="font-mono font-bold text-white">~{currentAmp24V.toFixed(2)} A</span>
                      </div>
                      <div className="text-[11px] text-slate-300 bg-slate-800/80 p-2 rounded border border-slate-700">
                        💡 รุ่นหม้อแปลงแนะนำ: <strong>{Math.ceil(recommendedPsuWatts) <= 100 ? '100W/150W 24V' : Math.ceil(recommendedPsuWatts) <= 200 ? '200W/240W 24V' : Math.ceil(recommendedPsuWatts) <= 350 ? '350W 24V' : 'แยกวงจรหม้อแปลง 2 ตัว'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Voltage Drop Calculator */}
              {(calcActiveSubTab === 'all' || calcActiveSubTab === 'voltage_drop') && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                    <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
                      <Cable className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        5. เครื่องคำนวณแรงดันตกสาย 24V (Voltage Drop)
                      </h3>
                      <p className="text-xs text-slate-500">
                        ตรวจสอบระยะสายไฟและขนาดสายทองแดงไม่ให้แสงดรอป
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        1. โหลดกำลังวัตต์ปลายทาง (Watts):
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={500}
                        value={calcLoadWatts}
                        onChange={e => setCalcLoadWatts(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-300 font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        2. ระยะทางจากหม้อแปลงถึงจุดไฟ (เมตร):
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={1}
                          max={60}
                          value={calcCableLength}
                          onChange={e => setCalcCableLength(Number(e.target.value))}
                          className="flex-1 accent-blue-600"
                        />
                        <span className="w-16 px-2 py-1 rounded-lg bg-slate-100 border border-slate-300 font-bold font-mono text-center">
                          {calcCableLength} m
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        3. ขนาดสายไฟทองแดง (sq.mm.):
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[1.0, 1.5, 2.5, 4.0].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCalcCableSize(s)}
                            className={`p-2 rounded-xl text-xs font-bold border transition ${
                              calcCableSize === s
                                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {s} sq.mm.
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl text-white space-y-2 shadow-inner ${
                      isVoltageDropSafe ? 'bg-slate-900' : 'bg-rose-950'
                    }`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">แรงดันตกในสาย (V_drop):</span>
                        <span className="font-mono font-bold text-white text-sm">
                          {voltageDropVolts.toFixed(2)} V ({voltageDropPercent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                        <span className="text-slate-300 font-bold">แรงดันปลายสายที่ไฟเส้นได้รับ:</span>
                        <span className={`font-mono font-black text-base ${isVoltageDropSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {voltageAtEnd.toFixed(2)} VDC
                        </span>
                      </div>
                      <div className={`p-2 rounded border text-[11px] ${
                        isVoltageDropSafe
                          ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                          : 'bg-rose-900/60 border-rose-700 text-rose-200'
                      }`}>
                        {isVoltageDropSafe ? (
                          <span>✅ ผ่านมาตรฐาน: แรงดันตกไม่เกิน 8% แสงสว่างสม่ำเสมอ ไม่ดรอป</span>
                        ) : (
                          <span>⚠️ เกินเกณฑ์มาตรฐาน! แนะนำเพิ่มขนาดสายไฟเป็น 4.0 sq.mm. หรือขยับหม้อแปลงเข้าใกล้หน้างาน</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

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

      {/* ================= MODAL: ADD / EDIT FAQ ITEM ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 my-4">
            
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-slate-700 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingFaq ? 'แก้ไขคำถาม-คำตอบ FAQ' : 'เพิ่มคำถาม-คำตอบ FAQ ใหม่ลงระบบ'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    ข้อมูลจะถูกบันทึกและซิงค์ผ่าน Cloud Firestore สำหรับฝ่ายขายและช่างทุกคน
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  หมวดหมู่ความรู้ (FAQ Category) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={faqCategory}
                  onChange={e => setFaqCategory(e.target.value as FaqCategory)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="switching_power">⚡ การเลือกหม้อแปลง Switching 12V/24V</option>
                  <option value="dimming_driver">🎛️ การเลือกหม้อแปลงดิม (DALI, 0-10V, Triac, Push-Dim)</option>
                  <option value="cable_sizing">📏 การเลือกสายไฟ 24V และระยะสาย (Voltage Drop)</option>
                  <option value="strip_neonflex">✂️ การตัดต่อ LED Strip & Neon Flex</option>
                  <option value="underwater">🌊 โคมใต้น้ำ & การต่อสายไฟใต้น้ำ (IP68)</option>
                  <option value="garden_landscape">🌳 การติดตั้งโคมในสวน & ข้อจำกัด (IP67)</option>
                  <option value="dali_control">💻 ระบบ DALI & Automation Control</option>
                  <option value="troubleshooting">🛠️ แก้ปัญหาและอาการเสียหน้างาน</option>
                  <option value="general">📖 ความรู้เทคนิคไฟฟ้าทั่วไป</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  หัวข้อคำถาม (Question) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น การต่อสายไฟใต้น้ำในสระว่ายน้ำระบบเกลือ ต้องใช้เทปและเรซินแบบใด?"
                  value={faqQuestion}
                  onChange={e => setFaqQuestion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  คำตอบ / ข้อสรุปทางเทคนิค (Summary Answer) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="สรุปคำตอบทางเทคนิคที่กระชับและเข้าใจง่าย..."
                  value={faqSummary}
                  onChange={e => setFaqSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  ขั้นตอนการคำนวณ / แนวทางแก้ไขทีละขั้นตอน (1 บรรทัด = 1 ขั้นตอน)
                </label>
                <textarea
                  rows={3}
                  placeholder="1. ตรวจสอบแรงดันไฟและระยะสาย&#10;2. หล่อเรซินปิดทึบ 100%&#10;3. ทดสอบการรั่วไหลของกระแสไฟ"
                  value={faqStepsText}
                  onChange={e => setFaqStepsText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-amber-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  ข้อควรระวัง / เคล็ดลับช่างเทคนิค (Technical Tips & Precautions)
                </label>
                <textarea
                  rows={2}
                  placeholder="ข้อควรระวังสำคัญ เช่น ห้ามเปิดไฟใต้น้ำบนบกเกิน 1 นาที..."
                  value={faqTechnicalTips}
                  onChange={e => setFaqTechnicalTips(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  สาเหตุที่พบบ่อย (1 บรรทัด = 1 สาเหตุ)
                </label>
                <textarea
                  rows={2}
                  placeholder="ใช้สายไฟผิดประเภท&#10;ไม่ได้ใส่ชั้นหินกรวดระบายน้ำ"
                  value={faqCommonCausesText}
                  onChange={e => setFaqCommonCausesText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    แท็กคำค้นหา (คั่นด้วยเครื่องหมายจุลภาค ,)
                  </label>
                  <input
                    type="text"
                    placeholder="หม้อแปลง, IP68, 24V, สายไฟ"
                    value={faqTagsText}
                    onChange={e => setFaqTagsText(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ชื่อผู้จัดทำ / วิศวกรผู้รับรอง
                  </label>
                  <input
                    type="text"
                    placeholder="ฝ่ายวิศวกรรม LUMENCRAFT"
                    value={faqAuthorName}
                    onChange={e => setFaqAuthorName(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึก FAQ ลงระบบส่วนกลาง</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL: ASK QUESTION TO ENGINEERS ================= */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-900">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">ส่งคำถามหรือบันทึกปัญหาทางเทคนิคใหม่</h3>
                  <p className="text-xs text-slate-500">ทีมวิศวกรจะนำข้อมูลไปตอบและสามารถบันทึกเป็น FAQ ประจำระบบได้</p>
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
                <h4 className="font-bold text-slate-900 text-sm">ส่งคำถามไปยังทีมวิศวกรสำเร็จเรียบร้อย!</h4>
                <p className="text-xs text-slate-600">คำถามจะปรากฏในหน้า Engineer Hub สำหรับตอบกลับและบรรจุขึ้น FAQ</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuestion} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    หมวดหมู่ของปัญหา <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as FaqCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="switching_power">การเลือกหม้อแปลง Switching 12V/24V</option>
                    <option value="dimming_driver">การเลือกหม้อแปลงดิม (DALI, 0-10V, Triac, Push-Dim)</option>
                    <option value="cable_sizing">การเลือกสายไฟ 24V และระยะสาย (Voltage Drop)</option>
                    <option value="strip_neonflex">การตัดต่อ LED Strip & Neon Flex</option>
                    <option value="underwater">โคมใต้น้ำ & การต่อสายไฟใต้น้ำ (IP68)</option>
                    <option value="garden_landscape">การติดตั้งโคมในสวน & ข้อจำกัด (IP67)</option>
                    <option value="dali_control">ระบบ DALI & Automation Control</option>
                    <option value="troubleshooting">การแก้ปัญหาและอาการเสียหน้างาน</option>
                    <option value="general">เทคนิคไฟฟ้าทั่วไป</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">SO Number (ถ้ามี)</label>
                    <input
                      type="text"
                      placeholder="เช่น SO-670123"
                      value={newSoNumber}
                      onChange={e => setNewSoNumber(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">ชื่อโครงการ</label>
                    <input
                      type="text"
                      placeholder="เช่น One Bangkok"
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">ผู้ถาม (ฝ่ายขาย/ทีมงาน)</label>
                    <input
                      type="text"
                      value={newSalesName}
                      onChange={e => setNewSalesName(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">วิศวกรที่ต้องการให้ตอบ</label>
                    <select
                      value={newEngineerName}
                      onChange={e => setNewEngineerName(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 font-semibold bg-white"
                    >
                      <option value="พัด">ช่างพัด (หัวหน้าวิศวกร)</option>
                      <option value="ชิน">ช่างชิน (วิศวกร)</option>
                      <option value="เอิร์ธ">ช่างเอิร์ธ (วิศวกร)</option>
                      <option value="พี">ช่างพี (วิศวกร)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    หัวข้อคำถาม / สรุปประเด็นสงสัย <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น หม้อแปลงดิม 0-10V ต่อขนานกับสวิตช์ดิมเมอร์ 2 จุดได้หรือไม่?"
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    รายละเอียดเพิ่มเติม / สภาพแวดล้อมหน้างาน:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ระบุรุ่น Driver, ระยะสาย, หรือรายละเอียดเพิ่มเติมเพื่อการตอบที่แม่นยำ..."
                    value={newDetail}
                    onChange={e => setNewDetail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-amber-500"
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    ส่งคำถามให้วิศวกรตอบ
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
