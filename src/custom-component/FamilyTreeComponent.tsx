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
  uploadPhoto,
} from "@/services/familyService";
import { FamilyMember } from "@/types/familyTypes";
import useFamilyStore from "@/store/globalFamily";
import { GearIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useToast } from "@/hooks/use-toast";
import imageCompression from "browser-image-compression";

const FamilyTreeComponent: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const familyTreeRef = useRef<FamilyTree | null>(null);
  const { nodes, loading, error } = useFamilyTree();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
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
          if (node.pids && node.pids.length > 0) {
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
            elements: [
              { type: "textbox", label: "Full Name", binding: "name" },
              { type: "textbox", label: "Gender", binding: "gender" },
              { type: 'textbox', label: 'Photo Url', binding: 'img', btn: 'Upload' },
              [
                { type: "textbox", label: "Phone", binding: "phone" },
                { type: "date", label: "Date Of Birth", binding: "dob" },
              ],
            ],
            buttons: {
              pdf: null,
            },
            addMore: "",
          },
        });

        familyTreeRef.current = f;
        familyTreeRef.current.onUpdateNode(handleEdit);
        familyTreeRef.current.editUI.on('element-btn-click', function (sender, args) {
          FamilyTree.fileUploadDialog(async function (file) {
            const options = {
              maxSizeMB: 0.2,
              useWebWorker: true,
            };
            try {
              toast({
                title: "Uploading Image",
                description: "We are uploading your image, wait for a moment",
              })
              const compressedFile = await imageCompression(file, options);
              const imageUrl = await uploadPhoto(compressedFile);
              let nodeId = args.nodeId;
              updateFamilyMember(nodeId, { img: imageUrl }).then(() => {
                toast({
                  title: "Success",
                  description: "Image uploaded successfully",
                  
                });
              })
              console.log(sender, args)
            } catch (error) {
              console.error("Error compressing image: ", error);
              toast({
                title: "Error",
                description: "Failed to compress image",
                variant: "destructive",
              });
            }
          })
      });
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
            phone: node.phone,
            dob: node.dob,
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

  const handleFormSubmit = (newMember: FamilyMember) => {
    setIsAddFormOpen(false);
    console.log("New member added:", newMember);
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
    <div className="flex w-full h-screen">
      <div
        className={`fixed top-0 left-0 w-full md:w-1/5 h-full bg-white shadow-lg p-4 transition-transform duration-300 ease-in-out z-50 ${
          isSetting ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={() => setIsSetting(false)}
            variant="ghost"
            size="icon"
          >
            <Cross1Icon />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="rootNodeSelect"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Root Node:
            </label>
            <select
              id="rootNodeSelect"
              className="w-full p-2 border border-gray-300 rounded"
              onChange={(e) => setSelectedNode(e.target.value)}
              value={selectedNode || ""}
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={setRootNode} className="w-full">
            Set as Root Node
          </Button>
          <Button onClick={handleAdd} className="w-full">
            Add Member
          </Button>
        </div>
      </div>
      <div className="flex-1 relative">
        <div
          className="w-full h-full"
          style={{ height: "100vh" }}
          ref={divRef}
        ></div>
        {!isSetting && (
          <Button
            className="absolute bottom-4 left-3"
            onClick={() => setIsSetting(true)}
            variant="default"
            size="icon"
          >
            <GearIcon />
          </Button>
        )}
      </div>
      {isAddFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-transform duration-500 ease-in-out">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md ">
            <AddMemberForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsAddFormOpen(false)}
              existingNodes={nodes}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyTreeComponent;
