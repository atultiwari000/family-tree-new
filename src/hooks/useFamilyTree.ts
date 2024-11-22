import { useState, useEffect, useCallback } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc 
} from "firebase/firestore";
import { db } from "@/firebase";
//import { updateAllFamilyMembersWithTreeName } from "@/services/familyService";
import { FamilyMember } from "@/types/familyTypes";

export const useFamilyTree = (treeName: string = "Default Tree") => {
  const [nodes, setNodes] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  if (treeName.length == 0) {
    treeName = "Default Tree";
    // updateAllFamilyMembersWithTreeName();
  }

  const membersRef = collection(db, "familyMembers");
  useEffect(() => {
    setLoading(true);
    const q = query(membersRef, where("treename", "==", treeName));
        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const nodes = querySnapshot.docs.map((doc) => {
              const data = doc.data()
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
              treename: data.treename || "",
            } as FamilyMember
            }
          );
            setNodes(nodes);
            console.log("Nodes:", nodes);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching members:", err);
            setError("Failed to fetch family members.");
            setLoading(false);
          }
        );

        return () => unsubscribe();
  }, [treeName]);

  return { nodes, loading, error };
};
