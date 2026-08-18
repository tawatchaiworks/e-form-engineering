import React, { useState } from 'react';
import { 
  HelpCircle, Search, BookOpen, Wrench, Zap, 
  CheckCircle2, ChevronDown, ChevronUp, AlertTriangle, 
  Lightbulb, Phone, Mail, Sparkles, Sliders,
  MessageSquare, Send, ThumbsUp, Tag, Scissors,
  Waves, Trees, Cable, Cpu, Plus, Edit3, Trash2,
  Calculator, Check, X, ArrowRight, Share2, Copy,
  UserCheck, Clock, ShieldCheck
} from 'lucide-react';
import { FaqItem, FaqCategory, EngineerInquiry, StaffMember } from '../types';
import { INITIAL_FAQS } from '../utils/initialFaqs';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(displayFaqs[0]?.id || 'faq-psu-1');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
  // 1. Switching Wattage Calculator
  const [calcStripLength, setCalcStripLength] = useState<number>(15);
  const [calcWattPerMeter, setCalcWattPerMeter] = useState<number>(14.4);
  const [calcSafetyFactor, setCalcSafetyFactor] = useState<number>(0.8);

  // 2. Voltage Drop Calculator (24VDC)
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

  // Open modal to add new FAQ
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

  // Calculations
  // 1. Switching Wattage
  const totalStripWatts = calcStripLength * calcWattPerMeter;
  const recommendedPsuWatts = totalStripWatts / (calcSafetyFactor || 0.8);
  const currentAmp24V = recommendedPsuWatts / 24;

  // 2. Voltage Drop
  const loadAmp = calcLoadWatts / 24;
  const voltageDropVolts = (2 * calcCableLength * loadAmp * 0.0175) / (calcCableSize || 2.5);
  const voltageAtEnd = 24 - voltageDropVolts;
  const voltageDropPercent = (voltageDropVolts / 24) * 100;
  const isVoltageDropSafe = voltageDropPercent <= 8;

  // Inquiries for FAQ candidates
  const faqCandidates = inquiries.filter(inq => inq.forFaq || inq.category);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] shadow-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Technical Engineering Knowledge Base
              </span>
              <span className="text-xs text-slate-300">
                คู่มือเทคนิคไฟฟ้าแสงสว่าง: หม้อแปลง, สายไฟ 24V, การตัดต่อไฟเส้น, งานใต้น้ำ, และสวน
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
                8. FAQ Knowledge (ถามตอบและข้อมูลปัญหาด้านเทคนิค)
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mt-1">
                ศูนย์รวมองค์ความรู้ด้านวิศวกรรมแสงสว่าง LUMENCRAFT สามารถเพิ่ม-แก้ไขคำถามคำตอบได้โดยตรง 
                และเชื่อมโยงกับคำถามฝ่ายขายที่วิศวกรตอบเพื่อบรรจุขึ้นเป็น FAQ อย่างเป็นทางการ
              </p>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-3xl">
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
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-slate-100 text-slate-900 shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>ส่งคำถามให้วิศวกรตอบ</span>
            </button>
          </div>
        </div>
      </div>

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

        <div className="text-xs text-slate-500 font-medium">
          คลังความรู้มาตรฐานอัปเดตอัตโนมัติผ่าน Cloud Firestore
        </div>
      </div>

      {/* ================= TAB 1: FAQ KNOWLEDGE BASE ================= */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          
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
                  ลองค้นหาด้วยคำค้นอื่น หรือกดปุ่มเพิ่มคำถามคำตอบใหม่เพื่อบรรจุลงในระบบ
                </p>
                <div className="pt-2 flex justify-center gap-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Switching Wattage & Derating Calculator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  เครื่องคำนวณขนาดหม้อแปลง Switching 12V/24V
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

          {/* 2. Voltage Drop Calculator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
                <Cable className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  เครื่องคำนวณแรงดันตกสาย 24V (Voltage Drop)
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
