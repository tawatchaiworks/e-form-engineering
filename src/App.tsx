import React, { useState, useEffect } from 'react';
import { 
  getStoredRequests, saveStoredRequests,
  getStoredStaff, saveStoredStaff,
  getStoredInquiries, saveStoredInquiries,
  getStoredAttendance, saveStoredAttendance,
  getDaysOverdue
} from './utils/storage';
import { EEngineerRequest, StaffMember, EngineerInquiry, Role, EngineerDailyAttendance } from './types';
import { CompanyHeader } from './components/CompanyHeader';
import { AdminSaleForm } from './components/AdminSaleForm';
import { SalesHub } from './components/SalesHub';
import { EngineerHub } from './components/EngineerHub';
import { CustomerPortal } from './components/CustomerPortal';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { StaffManagement } from './components/StaffManagement';
import { EngineerCalendarModal } from './components/EngineerCalendarModal';
import { EngineerStatusModal } from './components/EngineerStatusModal';
import { EngineerLocationModal } from './components/EngineerLocationModal';
import { DocumentPrintModal } from './components/DocumentPrintModal';
import { 
  auth, 
  db, 
  COLLECTIONS, 
  signInWithGoogle, 
  logOut, 
  syncRequestToFirestore, 
  syncAllRequestsToFirestore, 
  syncStaffToFirestore, 
  syncInquiryToFirestore, 
  syncAttendanceToFirestore, 
  deleteStaffFromFirestore 
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';

export const App: React.FC = () => {
  const [requests, setRequests] = useState<EEngineerRequest[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [inquiries, setInquiries] = useState<EngineerInquiry[]>([]);
  const [attendance, setAttendance] = useState<EngineerDailyAttendance[]>([]);

  // Firebase Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);

  // Navigation state using Role
  const [currentRole, setCurrentRole] = useState<Role>('admin_sale');

  // Real-time Modals state
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isStatusOpen, setIsStatusOpen] = useState<boolean>(false);
  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(false);

  // Document A4 Print modal
  const [printRequest, setPrintRequest] = useState<EEngineerRequest | null>(null);

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Load initial local data & Listen to Firestore collections
  useEffect(() => {
    const loadedRequests = getStoredRequests();
    const loadedStaff = getStoredStaff();
    const loadedInquiries = getStoredInquiries();
    const loadedAttendance = getStoredAttendance();

    setRequests(loadedRequests);
    setStaff(loadedStaff);
    setInquiries(loadedInquiries);
    setAttendance(loadedAttendance);

    // Setup Firestore Listeners for real-time live synchronization
    try {
      const unsubRequests = onSnapshot(collection(db, COLLECTIONS.REQUESTS), snapshot => {
        if (!snapshot.empty) {
          const cloudRequests: EEngineerRequest[] = [];
          snapshot.forEach(doc => {
            cloudRequests.push(doc.data() as EEngineerRequest);
          });
          setRequests(cloudRequests);
          saveStoredRequests(cloudRequests);
        } else if (loadedRequests.length > 0) {
          // If firestore is empty, seed with initial requests
          syncAllRequestsToFirestore(loadedRequests);
        }
      }, err => {
        console.warn('Firestore requests listener error (using local storage):', err);
      });

      const unsubStaff = onSnapshot(collection(db, COLLECTIONS.STAFF), snapshot => {
        if (!snapshot.empty) {
          const cloudStaff: StaffMember[] = [];
          snapshot.forEach(doc => {
            cloudStaff.push(doc.data() as StaffMember);
          });
          setStaff(cloudStaff);
          saveStoredStaff(cloudStaff);
        } else if (loadedStaff.length > 0) {
          syncStaffToFirestore(loadedStaff);
        }
      }, err => {
        console.warn('Firestore staff listener error:', err);
      });

      const unsubInquiries = onSnapshot(collection(db, COLLECTIONS.INQUIRIES), snapshot => {
        if (!snapshot.empty) {
          const cloudInquiries: EngineerInquiry[] = [];
          snapshot.forEach(doc => {
            cloudInquiries.push(doc.data() as EngineerInquiry);
          });
          setInquiries(cloudInquiries);
          saveStoredInquiries(cloudInquiries);
        }
      }, err => {
        console.warn('Firestore inquiries listener error:', err);
      });

      const unsubAttendance = onSnapshot(collection(db, COLLECTIONS.ATTENDANCE), snapshot => {
        if (!snapshot.empty) {
          const cloudAttendance: EngineerDailyAttendance[] = [];
          snapshot.forEach(doc => {
            cloudAttendance.push(doc.data() as EngineerDailyAttendance);
          });
          setAttendance(cloudAttendance);
          saveStoredAttendance(cloudAttendance);
        } else if (loadedAttendance.length > 0) {
          loadedAttendance.forEach(a => syncAttendanceToFirestore(a));
        }
      }, err => {
        console.warn('Firestore attendance listener error:', err);
      });

      return () => {
        unsubRequests();
        unsubStaff();
        unsubInquiries();
        unsubAttendance();
      };
    } catch (e) {
      console.error('Error connecting to Firestore:', e);
    }
  }, []);

  // Handlers for updating requests
  const handleAddRequest = (newReq: EEngineerRequest) => {
    const updated = [newReq, ...requests.filter(r => r.id !== newReq.id)];
    setRequests(updated);
    saveStoredRequests(updated);
    syncRequestToFirestore(newReq);
    // Switch to sales hub so user sees new item
    setCurrentRole('sale');
  };

  const handleUpdateRequest = (updatedReq: EEngineerRequest) => {
    const updated = requests.map(r => r.id === updatedReq.id ? updatedReq : r);
    setRequests(updated);
    saveStoredRequests(updated);
    syncRequestToFirestore(updatedReq);
  };

  // Inquiry handlers
  const handleSendInquiry = (newInquiry: EngineerInquiry) => {
    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);
    saveStoredInquiries(updated);
    syncInquiryToFirestore(newInquiry);
  };

  const handleReplyInquiry = (inquiryId: string, replyMessage: string, signatureUrl: string) => {
    const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    let updatedInquiry: EngineerInquiry | null = null;
    const updated = inquiries.map(i => {
      if (i.id === inquiryId) {
        updatedInquiry = {
          ...i,
          status: 'replied' as const,
          replyMessage,
          repliedAt: timeStr,
          engineerSignatureUrl: signatureUrl,
        };
        return updatedInquiry;
      }
      return i;
    });
    setInquiries(updated);
    saveStoredInquiries(updated);
    if (updatedInquiry) {
      syncInquiryToFirestore(updatedInquiry);
    }
  };

  // Staff CRUD handlers
  const handleAddStaff = (newMember: StaffMember) => {
    const updated = [...staff, newMember];
    setStaff(updated);
    saveStoredStaff(updated);
    syncStaffToFirestore(updated);
  };

  const handleUpdateStaff = (updatedMember: StaffMember) => {
    const updated = staff.map(s => s.id === updatedMember.id ? updatedMember : s);
    setStaff(updated);
    saveStoredStaff(updated);
    syncStaffToFirestore(updated);
  };

  const handleDeleteStaff = (id: string) => {
    const updated = staff.filter(s => s.id !== id);
    setStaff(updated);
    saveStoredStaff(updated);
    deleteStaffFromFirestore(id);
  };

  // Attendance handlers (Check-in, Check-out, Live Daily tracking)
  const handleSaveAttendance = (record: EngineerDailyAttendance) => {
    const updated = [
      ...attendance.filter(a => !(a.engineerId === record.engineerId && a.date === record.date)),
      record
    ];
    setAttendance(updated);
    saveStoredAttendance(updated);
    syncAttendanceToFirestore(record);
  };

  const handleUpdateEngineerStatus = (engineerId: string, status: 'active' | 'waiting' | 'busy') => {
    const updated = staff.map(s => s.id === engineerId ? { ...s, workStatus: status } : s);
    setStaff(updated);
    saveStoredStaff(updated);
    syncStaffToFirestore(updated);
  };

  // Google Login handlers
  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign In Failed:', err);
    }
  };

  const handleSignOutGoogle = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Sign Out Failed:', err);
    }
  };

  // Alert Counts for Header Badges
  const pendingSalesCount = requests.filter(r => 
    r.status === 'pending_sale_sign' || 
    r.status === 'engineer_rejected' || 
    r.status === 'engineer_rescheduled' ||
    r.status === 'completed_by_customer'
  ).length;

  const pendingEngineerCount = requests.filter(r => 
    r.status === 'pending_engineer_accept'
  ).length;

  const pendingCustomerCount = requests.filter(r => 
    r.status === 'completed_by_engineer'
  ).length;

  const readyForSiteCount = requests.filter(r => 
    r.status === 'ready_for_site'
  ).length;

  const overdueCount = requests.filter(r => {
    if (r.status === 'closed' || r.status === 'completed_by_customer' || r.status === 'cancelled') return false;
    return getDaysOverdue(r.deadlineDate || r.targetDate) > 0;
  }).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* 1. Official Header & Navigation Bar */}
      <CompanyHeader
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        pendingSalesCount={pendingSalesCount}
        pendingEngineerCount={pendingEngineerCount}
        pendingCustomerCount={pendingCustomerCount}
        readyForSiteCount={readyForSiteCount}
        overdueCount={overdueCount}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenStatus={() => setIsStatusOpen(true)}
        onOpenLocation={() => setIsLocationOpen(true)}
        currentUser={currentUser}
        isFirebaseSyncing={isFirebaseSyncing}
        onSignInGoogle={handleSignInGoogle}
        onSignOutGoogle={handleSignOutGoogle}
      />

      {/* 2. Main Module View Router */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        
        {currentRole === 'admin_sale' && (
          <AdminSaleForm
            requests={requests}
            staff={staff}
            onCreateRequest={handleAddRequest}
            onSubmitSuccess={handleAddRequest}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenStatus={() => setIsStatusOpen(true)}
            onOpenLocation={() => setIsLocationOpen(true)}
            onOpenDocumentPrint={req => setPrintRequest(req)}
            onCloseForm={() => setCurrentRole('sale')}
          />
        )}

        {currentRole === 'sale' && (
          <SalesHub
            requests={requests}
            staff={staff}
            inquiries={inquiries}
            onUpdateRequest={handleUpdateRequest}
            onSendInquiry={handleSendInquiry}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenStatus={() => setIsStatusOpen(true)}
            onOpenLocation={() => setIsLocationOpen(true)}
          />
        )}

        {currentRole === 'engineer' && (
          <EngineerHub
            requests={requests}
            staff={staff}
            inquiries={inquiries}
            onUpdateRequest={handleUpdateRequest}
            onReplyInquiry={handleReplyInquiry}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenStatus={() => setIsStatusOpen(true)}
            onOpenLocation={() => setIsLocationOpen(true)}
          />
        )}

        {currentRole === 'customer' && (
          <CustomerPortal
            requests={requests}
            onUpdateRequest={handleUpdateRequest}
          />
        )}

        {currentRole === 'dashboard' && (
          <ExecutiveDashboard
            requests={requests}
            staff={staff}
            onOpenDocumentPrint={req => setPrintRequest(req)}
          />
        )}

        {currentRole === 'staff' && (
          <StaffManagement
            staff={staff}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
          />
        )}

        {currentRole === 'logs' && (
          <ExecutiveDashboard
            requests={requests}
            staff={staff}
            onOpenDocumentPrint={req => setPrintRequest(req)}
          />
        )}

      </main>

      {/* 3. Global Real-time Modals */}
      <EngineerCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        requests={requests}
        staff={staff}
      />

      <EngineerStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        requests={requests}
        staff={staff}
        attendance={attendance}
        onUpdateStatus={handleUpdateEngineerStatus}
        onSaveAttendance={handleSaveAttendance}
      />

      <EngineerLocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        requests={requests}
        staff={staff}
      />

      <DocumentPrintModal
        request={printRequest}
        onClose={() => setPrintRequest(null)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-4 px-6 text-center text-xs border-t border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} LUMENCRAFT CO., LTD. — ระบบ E-Engineer Request & Management Platform
          </span>
          <span className="text-[11px] text-slate-500">
            ที่อยู่ 125 อาคารอินฟินิท พัฒนาการ 13 แขวงสวนหลวง เขตสวนหลวง กทม. 10250
          </span>
        </div>
      </footer>

    </div>
  );
};

export default App;

