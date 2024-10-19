import { db, storage } from '@/firebase';
import { collection, addDoc,getDoc, deleteDoc, doc, updateDoc, getDocs,where,query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FamilyMember } from '@/types/familyTypes';

export const uploadPhoto = async (image: File) => {
  try {
    const storageRef = ref(storage, `images/${Date.now()}_${image.name}`);
    await uploadBytes(storageRef, image);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
}

export const addFamilyMember = async (newMember: FamilyMember, image: File | null) => {
  let imageUrl = "";
  if (image) {
    const storageRef = ref(storage, `images/${Date.now()}_${image.name}`);
    await uploadBytes(storageRef, image);
    imageUrl = await getDownloadURL(storageRef);
  }

  const memberToAdd: Partial<FamilyMember> = {
    name: newMember.name,
    gender: newMember.gender,
    img: imageUrl || null,
    phone: newMember.phone,
    dob: newMember.dob,
  };

  if (newMember.fid && newMember.fid.length) {
    memberToAdd.fid = newMember.fid;    
  }
  if (newMember.mid && newMember.mid.length) {
    memberToAdd.mid = newMember.mid;
  }
  if (newMember.pids && newMember.pids.length) {
    memberToAdd.pids = newMember.pids;
  }

  try {
    const docRef = await addDoc(collection(db, "familyMembers"), memberToAdd);
    if (newMember.pids && newMember.pids.length) {
      await updateFamilyMember(newMember.pids[0], { pids: [docRef.id] });
    }
    return { ...memberToAdd, id: docRef.id };
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const updateFamilyMember = async (memberId: string, updates: Partial<FamilyMember>) => {
   try {
    const memberRef = doc(db, "familyMembers", memberId);
    const memberSnapshot = await getDoc(memberRef);

    const currentData = memberSnapshot.data();
    if (updates.pids) {
      updates.pids = [...(currentData.pids || []), ...updates.pids];  // Append new partners
    }

    await updateDoc(memberRef, updates);
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

export const setFamilyMember = async (memberId: string, updates: Partial<FamilyMember>) => {
  try {
    const memberRef = doc(db, "familyMembers", memberId);
    await updateDoc(memberRef, updates);
  } catch (error) {
    console.error("Error setting document: ", error);
    throw error;
  }
}

export const deleteFamilyMember = async (memberId: string) => {
  try {
    const memberRef = doc(db, "familyMembers", memberId);
    const memberSnapshot = await getDocs(collection(db, "familyMembers"));
    const memberToDelete = memberSnapshot.docs.find(doc => doc.id === memberId)?.data() as FamilyMember;

    if (memberToDelete.img) {
      try{
        const imageRef = ref(storage, memberToDelete.img);
        await deleteObject(imageRef);
      }
      catch (error) {
        console.error("Error removing image: ", error);
      }
    }

    await deleteDoc(memberRef);
    await clearNoExistantData();
  } catch (error) {
    console.error("Error removing document: ", error);
    throw error;
  }
};

export const clearNoExistantData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "familyMembers"));
    querySnapshot.forEach(async (doc) => {
      const member = doc.data() as FamilyMember;
      if (member.fid?.length) {
        const fatherSnapshot = await getDocs(collection(db, "familyMembers"));
        if (!fatherSnapshot.docs.find(father => father.id === member.fid[0])) {
          await setFamilyMember(doc.id, { fid: [] });
        }
      }
      if (member.mid?.length) {
        const q = query(collection(db, "familyMembers"), where("capital", "==", true));
        const motherSnapshot = await getDocs(collection(db, "familyMembers"));

        if (!motherSnapshot.docs.find(mother => mother.id === member.mid[0])) {
          await setFamilyMember(doc.id, { mid: [] });
        }
      }
      if (member.pids?.length) {
        const partnerSnapshot = await getDocs(collection(db, "familyMembers"));
        const updatedPartners = member.pids.filter(partner => partnerSnapshot.docs.find(p => p.id === partner));
        const uniquePartners = [...new Set(updatedPartners)];
        if (updatedPartners.length === uniquePartners.length) {
          return;
        }        
        console.log("Unique partners: ", uniquePartners);
        await setFamilyMember(doc.id, { pids: uniquePartners });
      }
    });
  } catch (error) {
    console.error("Error clearing no existant data: ", error);
    throw error;
  }
};

export const setRootFamilyMember = async (memberId: string) => {
  try {
    const rootFamilyMembers = collection(db, "rootFamilyMembers");
    const querySnapshot = await getDocs(rootFamilyMembers);
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref);
    });
    await addDoc(collection(db, "rootFamilyMembers"), { id: memberId });
  } catch (error) {
    console.error("Error setting root family member: ", error);
    throw error;
  }
}

export const getRootFamilyMember = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "rootFamilyMembers"));
    return querySnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error getting root family member: ", error);
    throw error;
  }
};

export function getFamilyInfo(data: any, userId: string) {
  // Find the user by ID
  const user = data.find(member => member.id === userId);
  
  // If user not found, return early with a message
  if (!user) {
    return { error: "User not found" };
  }

  // Helper function to find a family member by ID
  const findById = (id: number | undefined) => data.find(member => member.id === id);

  // Get the partner(s)
  const partners = user.pids.map(findById).filter(Boolean); // Safely handle empty array

  // Get the first parent IDs (from mid and fid arrays)
  const motherId = user.mid[0]; // First element of mid array
  const fatherId = user.fid[0]; // First element of fid array

  // Get children (those whose father or mother matches the user's ID)
  const children = data.filter(member => member.fid[0] === user.id || member.mid[0] === user.id);

  // Get grandchildren (children of the user's children)
  const grandchildren = children
    .map(child => data.filter(member => member.fid[0] === child.id || member.mid[0] === child.id))
    .flat();

  return {
    user: user.name,
    partners: partners.map(partner => partner?.name),
    children: children.map(child => child.name),
    grandchildren: grandchildren.map(grandchild => grandchild.name),
    parents: {
      mother: motherId ? findById(motherId)?.name : undefined,
      father: fatherId ? findById(fatherId)?.name : undefined,
    }
  }
}
