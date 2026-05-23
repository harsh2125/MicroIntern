import { useState, useEffect, useCallback } from 'react';
import {
  collection, getDocs, query, where, doc, getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const useStudentData = (studentId) => {
  const [applications,     setApplications]     = useState([]);
  const [savedDocs,        setSavedDocs]         = useState([]);
  const [savedInternships, setSavedInternships]  = useState([]);
  const [appInternships,   setAppInternships]    = useState({});
  const [loading,          setLoading]           = useState(true);
  const [refreshKey,       setRefreshKey]        = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      try {
        // Simple single-field queries — no composite index needed
        const [appsSnap, savedSnap] = await Promise.all([
          getDocs(query(
            collection(db, 'applications'),
            where('studentId', '==', studentId)
          )),
          getDocs(query(
            collection(db, 'savedInternships'),
            where('studentId', '==', studentId)
          )),
        ]);

        const apps  = appsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const saved = savedSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Sort client-side to avoid needing composite indexes
        apps.sort((a, b) => {
          const ta = a.appliedAt?.toMillis?.() || 0;
          const tb = b.appliedAt?.toMillis?.() || 0;
          return tb - ta;
        });
        saved.sort((a, b) => {
          const ta = a.savedAt?.toMillis?.() || 0;
          const tb = b.savedAt?.toMillis?.() || 0;
          return tb - ta;
        });

        setApplications(apps);
        setSavedDocs(saved);

        // Hydrate application internships
        const uniqueIds = [...new Set(apps.map(a => a.internshipId))];
        const internshipMap = {};
        await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const snap = await getDoc(doc(db, 'internships', id));
              if (snap.exists()) internshipMap[id] = { id: snap.id, ...snap.data() };
            } catch { /* skip missing */ }
          })
        );
        setAppInternships(internshipMap);

        // Hydrate saved internships
        const hydratedSaved = await Promise.all(
          saved.map(async (s) => {
            try {
              const snap = await getDoc(doc(db, 'internships', s.internshipId));
              if (snap.exists()) return { id: snap.id, ...snap.data(), savedDocId: s.id };
            } catch { /* skip */ }
            return null;
          })
        );
        setSavedInternships(hydratedSaved.filter(Boolean));

      } catch (err) {
        console.error('useStudentData error:', err);
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId, refreshKey]);

  return { applications, savedDocs, savedInternships, appInternships, loading, refresh };
};

export default useStudentData;