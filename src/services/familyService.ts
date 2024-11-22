import { db, storage } from '@/firebase';
import { collection, addDoc,getDoc, deleteDoc, doc, updateDoc, getDocs,where,query, deleteField } from 'firebase/firestore';
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
    console.log("Image uploaded");
    imageUrl = await getDownloadURL(storageRef);
    console.log("Image URL: ", imageUrl);
  }

  const memberToAdd: Partial<FamilyMember> = {
    name: newMember.name,
    gender: newMember.gender,
    phone: newMember.phone,
    dob: newMember.dob,
    img: imageUrl || null,
    treename: newMember.treename,
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

export const getTreeNames = async () => {
  try {
    const rootMembersRef = collection(db, "familyMembers");
    const querySnapshot = await getDocs(rootMembersRef);
    const treeNames = querySnapshot.docs.map(doc => doc.data().treename);
    return [...new Set(treeNames)];
  } catch (error) {
    console.error('Error getting tree names:', error);
  }
};

export const deleteTree = async (treename: string, confirmation: string) => {
  if (confirmation !== treename) {
    throw new Error("Tree name confirmation does not match. Deletion aborted.");
  }

  try {
    const rootMembersRef = collection(db, "rootFamilyMembers");
    const q = query(rootMembersRef, where("treename", "==", treename));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      await deleteDoc(doc(db, "rootFamilyMembers", querySnapshot.docs[0].id));
    }

    const familyMembersRef = collection(db, "familyMembers");
    const familyMembersSnapshot = await getDocs(familyMembersRef);
    const deletePromises = familyMembersSnapshot.docs.map(async doc => {
      if (doc.data().treename === treename) {
        await deleteFamilyMember(doc.id);
      }
    });
    await Promise.all(deletePromises);

    console.log(`Tree "${treename}" has been successfully deleted.`);
  } catch (error) {
    console.error('Error deleting tree:', error);
    throw error;
  }
}

export const updateAllFamilyMembersWithTreeName = async () => {
  try {
    const familyMembersRef = collection(db, "familyMembers");
    const querySnapshot = await getDocs(familyMembersRef);

    const updatePromises = querySnapshot.docs.map(async (doc) => {
      const memberRef = doc.ref;
      await updateDoc(memberRef, {
        treename: "Default Tree"
      });
    });

    await Promise.all(updatePromises);

    console.log("All family members updated with treename: Default Tree");
  } catch (error) {
    console.error("Error updating family members with treename:", error);
  }
};


export const deleteEmptyIdField = async () => {
 try {
    const familyMembersRef = collection(db, "familyMembers");
    const querySnapshot = await getDocs(familyMembersRef);

    const updatePromises = querySnapshot.docs.map(async (document) => {
      const docData = document.data();
      if ('id' in docData && docData.id === null) {
        const docRef = doc(db, "familyMembers", document.id);
        await updateDoc(docRef, {
          id: deleteField()
        });
      }
    });

    await Promise.all(updatePromises);

    console.log("Empty 'id' fields have been deleted from all documents");
  } catch (error) {
    console.error("Error deleting empty 'id' fields:", error);
  }
};

export const downLoadFamilyMembersToTxt = async () => {
  try {
    // format
    /*
    treeName1
    name1
    name2

    treeName2
    name1
    ...
    */
    const familyMembersRef = collection(db, "familyMembers");
    const familyMembersSnapshot = await getDocs(familyMembersRef);
    const familyMembers = familyMembersSnapshot.docs.map(doc => doc.data() as FamilyMember);

    const treeNames = [...new Set(familyMembers.map(member => member.treename))];
    const txtData = treeNames.map(treename => {
      const members = familyMembers.filter(member => member.treename === treename);
      const memberNames = members.map(member => member.name);
      return [treename, ...memberNames];
    });

    const txt = txtData.map(data => data.join("\n")).join("\n\n");
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "familyMembers.txt";
    a.click();
    
  } catch (error) {
    console.error("Error downloading family members to CSV: ", error);
  }
}


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

export const setRootFamilyMember = async (memberId: string, treename: string) => {
  try {
    const rootMembersRef = collection(db, "rootFamilyMembers");
    const q = query(rootMembersRef, where("treename", "==", treename));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(rootMembersRef, { treename, rootMemberId: memberId });
    } else {
      const docRef = doc(db, "rootFamilyMembers", querySnapshot.docs[0].id);
      await updateDoc(docRef, { rootMemberId: memberId });
    }
  } catch (error) {
    console.error("Error setting root family member: ", error);
    throw error;
  }
}

export const getRootFamilyMember = async (treename: string) => {
  try {
    const rootMembersRef = collection(db, "rootFamilyMembers");
    const q = query(rootMembersRef, where("treename", "==", treename));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().rootMemberId;
    }
    return null;
  } catch (error) {
    console.error("Error getting root family member: ", error);
    throw error;
  }
};

export function getFamilyInfo(data: any, userId: string) {
  // Find the user by ID
  const user = data.find(member => member.id === userId);
  console.log(user)
  
  // If user not found, return early with a message
  if (!user) {
    return { error: "User not found" };
  }

  // Helper function to find a family member by ID
  const findById = (id: number | undefined) => data.find(member => member.id === id);

  // Get the partner(s)
  let partners = []
  console.log(user.pids)
  if(user.pids){
    partners = user.pids.map(findById).filter(Boolean); // Safely handle empty array
  }

  // Get the first parent IDs (from mid and fid arrays)

  let motherId;

  if(user.mid){
  motherId = user.mid[0]; // First element of mid array
  }
  let fatherId;
  if(user.fid){
    fatherId = user.fid[0];
  }

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
