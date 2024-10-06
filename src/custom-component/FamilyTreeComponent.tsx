import React, { useEffect, useRef, useState } from "react";
import FamilyTree from "@balkangraph/familytree.js";
import { Button } from "@/components/ui/button";
import AddMemberForm from "@/forms/AddMemberForm";
import { useFamilyTree } from "@/hooks/useFamilyTree";
import {
  updateFamilyMember,
  deleteFamilyMember,
} from "@/services/familyService";
import { FamilyMember } from "@/types/familyTypes";
import { DebugInfo } from "./DebugInfo";

const FamilyTreeComponent: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const familyTreeRef = useRef<FamilyTree | null>(null);
  const { nodes, loading, error } = useFamilyTree();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    if (divRef.current && nodes.length > 0 && !loading) {
      try {
        if (familyTreeRef.current) {
          familyTreeRef.current.destroy();
          divRef.current.innerHTML = "";
        }

        familyTreeRef.current = new FamilyTree(divRef.current, {
          nodes: nodes.map((node) => ({
            id: node.id,
            pids: node.pids || [],
            fid: node.fid ? node.fid[0] : null,
            mid: node.mid ? node.mid[0] : null,
            name: node.name || "",
            gender: node.gender || "",
            img: node.img || "",
          })),
          template: "rabin",
          nodeBinding: {
            field_0: "name",
            img_0: "img",
          },
          levelSeparation: 100,
          siblingSeparation: 50,
          subtreeSeparation: 100,
          toolbar: {
            zoom: true,
            fit: true,
          },
        });

        familyTreeRef.current.editUI.on("save", handleEdit);
        setDebugInfo("Family tree initialized successfully");
      } catch (err) {
        console.error("Error initializing family tree:", err);
        setDebugInfo(`Error initializing family tree: ${err}`);
      }
    }
  }, [nodes, loading]);

  const handleEdit = (sender: any, args: any) => {
    console.log("Edit node:", args);
    if (args.nodes && args.nodes.length > 0) {
      const nodeToEdit = args.nodes[0];
      updateFamilyMember(nodeToEdit.id, {
        name: nodeToEdit.name,
        gender: nodeToEdit.gender,
        img: nodeToEdit.img,
      }).catch((error) => {
        console.error("Error updating document: ", error);
      });
    }
    return false;
  };

  const handleAdd = () => {
    console.log("Add new member");
    setIsAddFormOpen(true);
  };

  const handleRemove = (nodeId: string) => {
    console.log("Remove node:", nodeId);
    deleteFamilyMember(nodeId).catch((error) => {
      console.error("Error removing document: ", error);
    });
  };

  const handleAddMember = (newMember: FamilyMember) => {
    setIsAddFormOpen(false);
    console.log("New member added:", newMember);
  };

  if (loading) {
    return <div>Loading family tree data...</div>;
  }

  if (error) {
    return <div>Error loading family tree data: {error}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <div
        className="w-full md:w-3/4 h-full"
        style={{ height: "600px" }}
        ref={divRef}
      ></div>
      <div className="w-full md:w-1/4 p-4 bg-gray-100">
        <Button onClick={handleAdd} className="mb-4">
          Add Member
        </Button>
        {isAddFormOpen && (
          <AddMemberForm
            onSubmit={handleAddMember}
            onCancel={() => setIsAddFormOpen(false)}
            existingNodes={nodes}
          />
        )}
        <DebugInfo info={debugInfo} nodeCount={nodes.length} />
      </div>
    </div>
  );
};

export default FamilyTreeComponent;
