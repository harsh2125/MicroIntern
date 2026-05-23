import {
  collection, doc, addDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where,
  orderBy, serverTimestamp, limit, startAfter,
} from 'firebase/firestore';
import { db } from './config';

const COL = {
  INTERNSHIPS:   'internships',
  APPLICATIONS:  'applications',
  SAVED:         'savedInternships',
  USERS:         'users',
  NOTIFICATIONS: 'notifications',
  MESSAGES:      'messages',
};

// ══════════════════════════════════════════════════════
// INTERNSHIPS
// ══════════════════════════════════════════════════════

export const createInternship = async (data, companyId) => {
  const ref = await addDoc(collection(db, COL.INTERNSHIPS), {
    ...data,
    companyId,
    status:          'active',
    applicantsCount: 0,
    createdAt:       serverTimestamp(),
    updatedAt:       serverTimestamp(),
  });
  return ref.id;
};

export const getInternshipById = async (id) => {
  const snap = await getDoc(doc(db, COL.INTERNSHIPS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const getInternships = async (pageSize = 9, lastDoc = null) => {
  let q = query(
    collection(db, COL.INTERNSHIPS),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  if (lastDoc) {
    q = query(
      collection(db, COL.INTERNSHIPS),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(pageSize)
    );
  }
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return {
    docs,
    lastVisible: snap.docs[snap.docs.length - 1] || null,
    hasMore: docs.length === pageSize,
  };
};

export const getCompanyInternships = async (companyId) => {
  const q = query(
    collection(db, COL.INTERNSHIPS),
    where('companyId', '==', companyId)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  docs.sort((a, b) =>
    (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
  );
  return docs;
};

export const updateInternship = async (id, data) => {
  await updateDoc(doc(db, COL.INTERNSHIPS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteInternship = async (id) => {
  await deleteDoc(doc(db, COL.INTERNSHIPS, id));
};

export const closeInternship = async (id) => {
  await updateDoc(doc(db, COL.INTERNSHIPS, id), {
    status:    'closed',
    updatedAt: serverTimestamp(),
  });
};

// ══════════════════════════════════════════════════════
// APPLICATIONS
// ══════════════════════════════════════════════════════

export const applyForInternship = async (internshipId, studentId, resumeUrl = '') => {
  const q = query(
    collection(db, COL.APPLICATIONS),
    where('internshipId', '==', internshipId),
    where('studentId',    '==', studentId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) throw new Error('You have already applied for this internship.');

  await addDoc(collection(db, COL.APPLICATIONS), {
    internshipId,
    studentId,
    resumeUrl,
    status:    'pending',
    appliedAt: serverTimestamp(),
  });

  const ref  = doc(db, COL.INTERNSHIPS, internshipId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      applicantsCount: (snap.data().applicantsCount || 0) + 1,
    });
  }
};

export const hasApplied = async (internshipId, studentId) => {
  const q = query(
    collection(db, COL.APPLICATIONS),
    where('internshipId', '==', internshipId),
    where('studentId',    '==', studentId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
};

export const getStudentApplications = async (studentId) => {
  const q = query(
    collection(db, COL.APPLICATIONS),
    where('studentId', '==', studentId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getInternshipApplicants = async (internshipId) => {
  const q = query(
    collection(db, COL.APPLICATIONS),
    where('internshipId', '==', internshipId)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  docs.sort((a, b) =>
    (b.appliedAt?.toMillis?.() || 0) - (a.appliedAt?.toMillis?.() || 0)
  );
  return docs;
};

export const updateApplicationStatus = async (applicationId, status) => {
  await updateDoc(doc(db, COL.APPLICATIONS, applicationId), {
    status,
    updatedAt: serverTimestamp(),
  });
};

// ══════════════════════════════════════════════════════
// SAVED INTERNSHIPS
// ══════════════════════════════════════════════════════

export const saveInternship = async (studentId, internshipId) => {
  const q = query(
    collection(db, COL.SAVED),
    where('studentId',    '==', studentId),
    where('internshipId', '==', internshipId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) return existing.docs[0].id;

  const ref = await addDoc(collection(db, COL.SAVED), {
    studentId,
    internshipId,
    savedAt: serverTimestamp(),
  });
  return ref.id;
};

export const unsaveInternship = async (savedDocId) => {
  await deleteDoc(doc(db, COL.SAVED, savedDocId));
};

export const getSavedInternships = async (studentId) => {
  const q = query(
    collection(db, COL.SAVED),
    where('studentId', '==', studentId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ══════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, COL.USERS));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, COL.USERS, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const blockUser = async (uid, isBlocked) => {
  await updateDoc(doc(db, COL.USERS, uid), { isBlocked });
};

// ══════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════

export const createNotification = async (userId, data) => {
  await addDoc(collection(db, COL.NOTIFICATIONS), {
    userId,
    ...data,
    read:      false,
    createdAt: serverTimestamp(),
  });
};

export const getNotifications = async (userId) => {
  const q = query(
    collection(db, COL.NOTIFICATIONS),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  docs.sort((a, b) =>
    (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
  );
  return docs;
};

export const markNotificationRead = async (notificationId) => {
  await updateDoc(doc(db, COL.NOTIFICATIONS, notificationId), { read: true });
};

export const markAllNotificationsRead = async (userId) => {
  const q = query(
    collection(db, COL.NOTIFICATIONS),
    where('userId', '==', userId),
    where('read',   '==', false)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map(d => updateDoc(d.ref, { read: true })));
};

// ══════════════════════════════════════════════════════
// MESSAGES / CHAT
// ══════════════════════════════════════════════════════

export const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');

export const sendMessage = async (chatId, senderId, receiverId, senderName, text) => {
  await addDoc(collection(db, COL.MESSAGES), {
    chatId,
    senderId,
    receiverId,
    senderName,
    text,
    read:      false,
    createdAt: serverTimestamp(),
  });
};

export const getUserChats = async (userId) => {
  const q = query(
    collection(db, COL.MESSAGES),
    where('senderId', '==', userId)
  );
  const q2 = query(
    collection(db, COL.MESSAGES),
    where('receiverId', '==', userId)
  );
  const [s1, s2] = await Promise.all([getDocs(q), getDocs(q2)]);
  const all = [
    ...s1.docs.map(d => ({ id: d.id, ...d.data() })),
    ...s2.docs.map(d => ({ id: d.id, ...d.data() })),
  ];
  return all;
};