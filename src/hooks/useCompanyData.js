import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const useCompanyData = (companyId) => {
  const [internships,  setInternships]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshKey,   setRefreshKey]   = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(query(
          collection(db, 'internships'),
          where('companyId', '==', companyId)
        ));
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setInternships(docs);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load company data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [companyId, refreshKey]);

  return { internships, loading, refresh };
};

export default useCompanyData;