import React, { useEffect, useRef, useState } from "react";
import FamilyTree from "@/family-tree/wrapper";
import { Button } from "@/components/ui/button";
import AddMemberForm from "@/forms/AddMemberForm";
import { useFamilyTree } from "@/hooks/useFamilyTree";
import {
  updateFamilyMember,
  deleteFamilyMember,
  setRootFamilyMember,
  getRootFamilyMember,
  addFamilyMember,
} from "@/services/familyService";
import { FamilyMember } from "@/types/familyTypes";
import useFamilyStore from "@/store/globalFamily";
import { GearIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useToast } from "@/hooks/use-toast";
import { Phone } from "lucide-react";

const FamilyTreeComponent: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const familyTreeRef = useRef<FamilyTree | null>(null);
  const { nodes, loading, error } = useFamilyTree();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);
  const { toast } = useToast();

  const user = useFamilyStore((state) => state.user);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isSetting, setIsSetting] = useState(false);

  useEffect(() => {
    async function rootNodeSelector() {
      const rootFamilyMember = await getRootFamilyMember();
      if (rootFamilyMember.length > 0) {
        setSelectedNode(rootFamilyMember[0].id);
      } else {
        setSelectedNode(null);
      }
    }
    rootNodeSelector();
  }, []);

  useEffect(() => {
    if (divRef.current && nodes.length > 0 && !loading) {
      try {
        if (familyTreeRef.current) {
          familyTreeRef.current.destroy();
          divRef.current.innerHTML = "";
        }

        const newNode = nodes.map((node) => {
          const obj = {
            id: node.id,
            name: node.name ?? "",
            gender: node.gender ?? "",
            dob: node.dob ?? "",
            phone: node.phone ?? "",
          };
          if (node.img) {
            obj["img"] = node.img;
          }
          if (node.fid?.length > 0) {
            obj["fid"] = node.fid;
          }
          if (node.mid?.length > 0) {
            obj["mid"] = node.mid;
          }
          if (node.pids) {
            obj["pids"] = node.pids;
          }
          return obj;
        });

        const f = new FamilyTree(divRef.current, {
          nodes: newNode,
          template: "atul",
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
          roots: selectedNode ? [selectedNode] : [],
          editForm: {
            buttons: {
              pdf: null,
            },
            addMore: "",
          },
        });

        familyTreeRef.current = f;
        familyTreeRef.current.onUpdateNode(handleEdit);
      } catch (err) {
        console.error("Error initializing family tree:", err);
      }
    }
  }, [nodes, loading]);

  const showPermissionToast = () => {
    toast({
      title: "Insufficient permissions",
      description: "Please contact admin",
      variant: "destructive",
    });
  };

  type argsType = {
    addNodesData: Array<object>;
    updateNodesData: Array<{ [key: string]: string }>;
    removeNodeId: number | string;
  };

  const handleEdit = async (args: argsType) => {
    console.log("Edit node:", args);

    if (args.updateNodesData.length > 0) {
      const nodesToEdit = args.updateNodesData;
      for (const node of nodesToEdit) {
        try {
          await updateFamilyMember(node.id, {
            name: node.name,
            gender: node.gender,
            img: node.img,
          });
        } catch (error) {
          if (error.code === "permission-denied") {
            console.error("Insufficient permissions to update the document.");
            showPermissionToast();
          } else {
            console.error("Error updating document: ", error);
            toast({
              title: "Error",
              description: "Failed to update family member",
              variant: "destructive",
            });
          }
        }
      }
    }

    if (args.removeNodeId !== null) {
      try {
        await deleteFamilyMember(args.removeNodeId.toString());
        console.log("Document successfully removed!");
        toast({
          title: "Success",
          description: "Family member removed successfully",
        });
        return true;
      } catch (error) {
        if (error.code === "permission-denied") {
          showPermissionToast();
        } else {
          console.error("Error removing document: ", error);
          toast({
            title: "Error",
            description: "Failed to remove family member",
            variant: "destructive",
          });
        }
      }
    }
    return false;
  };

  const handleAdd = () => {
    setEditMember(null);
    setIsAddFormOpen(true);
  };

  const setRootNode = () => {
    if (!familyTreeRef.current || !selectedNode) return;
    setRootFamilyMember(selectedNode)
      .then(() => {
        if (!familyTreeRef.current || !selectedNode) return;
        familyTreeRef.current.config.roots = [selectedNode];
        familyTreeRef.current?.draw();
      })
      .catch((error) => {
        console.error("Error setting root family member: ", error);
      });
  };

  const handleFormSubmit = async (member: FamilyMember, image: File | null) => {
    setIsAddFormOpen(false);
    try {
      if (editMember) {
        await updateFamilyMember(editMember.id, member, image);
        toast({
          title: "Success",
          description: "Family member updated successfully",
        });
      } else {
        await addFamilyMember(member, image);
        toast({
          title: "Success",
          description: "New family member added successfully",
        });
      }
      // The Firestore listener in useFamilyTree will automatically update the nodes
    } catch (error) {
      console.error("Error adding/updating family member: ", error);
      toast({
        title: "Error",
        description: "Failed to add/update family member",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading family tree data: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <div
        className={"w-full h-full " + (isSetting ? "md:w-3/4" : "")}
        style={{ height: "100vh" }}
        ref={divRef}
      ></div>
      {user && (
        <>
          {isSetting ? (
            <div className="w-full md:w-1/4 p-4 bg-gray-100">
              <div>
                <Button onClick={() => setIsSetting(false)}>
                  <Cross1Icon />
                </Button>
              </div>
              <div className="mb-3 mt-5">
                <label htmlFor="rootNodeSelect" className="block mb-2">
                  Select Root Node:
                </label>
                <select
                  id="rootNodeSelect"
                  className="w-full p-2 border border-gray-300 rounded"
                  onChange={(e) => {
                    const selectedNodeId = e.target.value;
                    setSelectedNode(selectedNodeId);
                  }}
                  value={selectedNode || ""}
                >
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
                </select>
                <Button className="mb-4 mt-4" onClick={setRootNode}>
                  Set as Root Node
                </Button>
              </div>
              <Button onClick={handleAdd} className="mb-4">
                Add Member
              </Button>
            </div>
          ) : (
            <Button
              className="mt-7 mr-5 absolute bottom-5 ml-3"
              onClick={() => setIsSetting(true)}
              variant="default"
              size="icon"
            >
              <GearIcon />
            </Button>
          )}
        </>
      )}
      {isAddFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <AddMemberForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsAddFormOpen(false)}
              existingNodes={nodes}
              editMember={editMember}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyTreeComponent;
