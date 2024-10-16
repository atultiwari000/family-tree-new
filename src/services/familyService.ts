import { db, storage } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FamilyMember } from '@/types/familyTypes';

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
    await updateDoc(doc(db, "familyMembers", memberId), updates);
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

export const deleteFamilyMember = async (memberId: string) => {
  try {
    const memberRef = doc(db, "familyMembers", memberId);
    const memberSnapshot = await getDocs(collection(db, "familyMembers"));
    const memberToDelete = memberSnapshot.docs.find(doc => doc.id === memberId)?.data() as FamilyMember;

    if (memberToDelete.img) {
      const imageRef = ref(storage, memberToDelete.img);
      await deleteObject(imageRef);
    }

    await deleteDoc(memberRef);
  } catch (error) {
    console.error("Error removing document: ", error);
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