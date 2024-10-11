import { create } from 'zustand'
import FamilyTree from "@/family-tree/wrapper"

interface familyStore {
    family : FamilyTree | null
    setFamily: (family:FamilyTree)=>void
    isOpen: boolean
    setIsOpen: (isOpen:boolean)=>void
    user: any
    setUser: (user)=>void
}

const useFamilyStore = create<familyStore>((set) => ({
    family: null,
    setFamily:(family:FamilyTree) => set(()=> ({ family:family }) ),
    isOpen: false,
    setIsOpen: (isOpen:boolean) => set(()=> ({ isOpen:isOpen }) ),
    user: null,
    setUser: (user) => set(()=> ({ user:user }) )
}))

export default useFamilyStore