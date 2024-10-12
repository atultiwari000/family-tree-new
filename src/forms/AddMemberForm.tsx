import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addFamilyMember } from "@/services/familyService";
import { FamilyMember, AddMemberFormProps } from "@/types/familyTypes";
import imageCompression from 'browser-image-compression';
import { useToast } from "@/hooks/use-toast";


const AddMemberForm: React.FC<AddMemberFormProps> = ({
  onSubmit,
  onCancel,
  existingNodes,
}) => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [fatherId, setFatherId] = useState<string | null>(null);
  const [motherId, setMotherId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {toast} = useToast()

  function showPremissionToast(){
    toast({
      title: "Insufficient permissions",
      description: "please, contact admin",
      variant: "destructive"
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const newMember: FamilyMember = {
        id: "", // This will be set by Firestore
        name,
        gender,
        fid: fatherId && fatherId !== "unassigned" ? [fatherId] : undefined,
        mid: motherId && motherId !== "unassigned" ? [motherId] : undefined,
        pids: partnerId && partnerId !== "unassigned" ? [partnerId] : [],
        img: null,
      };

      const addedMember = await addFamilyMember(newMember, image);
      onSubmit(addedMember);
    } catch (error) {
      if(error.code == "permission-denied"){
        showPremissionToast()
      }
      console.error("Error adding family member: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e && e.target && e.target && e.target.files && e.target.files.length > 0) {
      const imageFile = e.target.files[0];
      const options = {
        maxSizeMB: 0.2,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(imageFile, options);
      console.log(compressedFile)
      setImage(compressedFile);
      return;
    }
    setImage(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="gender">Gender</Label>
        <Select onValueChange={setGender}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={imageHandler}
        />
      </div>
      <div>
        <Label htmlFor="fatherId">Father</Label>
        <Select onValueChange={setFatherId}>
          <SelectTrigger>
            <SelectValue placeholder="Select father" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">None</SelectItem>
            {existingNodes
              .filter((node) => node.gender === "male")
              .map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="motherId">Mother</Label>
        <Select onValueChange={setMotherId}>
          <SelectTrigger>
            <SelectValue placeholder="Select mother" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">None</SelectItem>
            {existingNodes
              .filter((node) => node.gender === "female")
              .map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="partnerId">Partner</Label>
        <Select onValueChange={setPartnerId}>
          <SelectTrigger>
            <SelectValue placeholder="Select partner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">None</SelectItem>
            {existingNodes.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {node.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Member"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddMemberForm;
