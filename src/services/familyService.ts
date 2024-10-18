import { db, storage } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs,where,query } from 'firebase/firestore';
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
        console.log("f:",fatherSnapshot.docs)
        if (!fatherSnapshot.docs.find(father => father.id === member.fid[0])) {
          await updateFamilyMember(doc.id, { fid: [] });
        }
      }
      if (member.mid?.length) {
        const q = query(collection(db, "familyMembers"), where("capital", "==", true));
        const motherSnapshot = await getDocs(collection(db, "familyMembers"));
        motherSnapshot.forEach(doc => {
          console.log(doc.id, " => ", doc.data());
        });
        if (!motherSnapshot.docs.find(mother => mother.id === member.mid[0])) {
          await updateFamilyMember(doc.id, { mid: [] });
        }
      }
      if (member.pids?.length) {
        const partnerSnapshot = await getDocs(collection(db, "familyMembers"));
        console.log("p:",partnerSnapshot.docs)
        const updatedPartners = member.pids.filter(partner => partnerSnapshot.docs.find(p => p.id === partner));
        await updateFamilyMember(doc.id, { pids: updatedPartners });
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