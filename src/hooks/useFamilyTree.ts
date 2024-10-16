import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { FamilyMember } from '@/types/familyTypes';

export const useFamilyTree = () => {
  const [nodes, setNodes] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "familyMembers"),
      (snapshot) => {
        try {
          const newNodes = snapshot.docs.map(
            (doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name || "",
                gender: data.gender || "",
                img: data.img || "",
                dob: data.dob || "",
                phone: data.phone || "",
                pids: data.pids || [],
                fid: data.fid || [],
                mid: data.mid || [],
              } as FamilyMember;
            }
          );
          console.log("Fetched nodes: ", newNodes);
          setNodes(newNodes);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching family members:", err);
          setError("Failed to fetch family members");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore subscription error:", err);
        setError("Failed to subscribe to family members");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { nodes, loading, error };
};