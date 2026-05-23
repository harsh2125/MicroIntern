// src/hooks/useAdminData.js
// Fetches all users, internships, and applications for admin use.
// Uses simple single-field queries — no composite indexes needed.

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const useAdminData = () => {
  const [users,        setUsers]        = useState([]);
  const [internships,  setInternships]  = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshKey,   setRefreshKey]   = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Fetch all three collections in parallel
        const [usersSnap, internsSnap, appsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'internships')),
          getDocs(collection(db, 'applications')),
        ]);

        const usersData  = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const internsData = internsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const appsData   = appsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Sort client-side — newest first
        usersData.sort((a, b)  => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        internsData.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        appsData.sort((a, b)   => (b.appliedAt?.toMillis?.() || 0) - (a.appliedAt?.toMillis?.() || 0));

        setUsers(usersData);
        setInternships(internsData);
        setApplications(appsData);
      } catch (err) {
        console.error('useAdminData error:', err);
        toast.error('Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey]);

  return { users, internships, applications, loading, refresh };
};

export default useAdminData;