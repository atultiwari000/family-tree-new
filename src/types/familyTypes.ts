export interface FamilyMember {
    id: string;
    name?: string | undefined;
    img?: string | null | undefined;
    pids?: string[] | undefined;
    fid?: string[] | undefined;
    mid?: string[] | undefined;
    gender?: string | undefined;
}

export interface AddMemberFormProps {
  onSubmit: (member: FamilyMember) => void;
  onCancel: () => void;
  existingNodes: FamilyMember[];
}