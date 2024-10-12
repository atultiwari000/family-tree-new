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
} from "@/services/familyService";
import { FamilyMember } from "@/types/familyTypes";
import { DebugInfo } from "./DebugInfo";
import useFamilyStore from "@/store/globalFamily";
import { GearIcon, Cross1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useToast } from "@/hooks/use-toast";

const FamilyTreeComponent: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const familyTreeRef = useRef<FamilyTree | null>(null);
  const { nodes, loading, error } = useFamilyTree();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const { toast } = useToast();
  const [isRemoveFormOpen, setIsRemoveFormOpen] = useState(false);
  const user = useFamilyStore((state) => state.user);
  const [selectedRemoveMemberId, setSelectedRemoveMemberId] = useState<
    string | null
  >(null);
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
        if (
          familyTreeRef.current &&
          typeof familyTreeRef.current.destroy === "function"
        ) {
          familyTreeRef.current.destroy();

          divRef.current.innerHTML = "";
        }

        let newNode = nodes.map((node) => ({
          id: node.id,
          name: node.name ?? "",
          gender: node.gender ?? "",
          img: node.img,
          fid: node.fid?.length > 0 ? node.fid[0] : undefined,
          mid: node.mid?.length > 0 ? node.mid[0] : undefined,
          pids: node.pids,
        }));

        FamilyTree.templates.myTemplate = Object.assign(
          {},
          FamilyTree.templates.tommy
        );
        FamilyTree.templates.myTemplate.node =
          '<circle cx="50" cy="50" r="40" fill="#039BE5" stroke="#AEAEAE" stroke-width="1"></circle>' +
          '<g style="cursor: pointer;" transform="matrix(0,0,0,0,100,100)" class="remove-btn">' +
          '<circle cx="0" cy="0" r="12" fill="#FF0000" stroke="#FFFFFF" stroke-width="2"></circle>' +
          "</g>";

        FamilyTree.templates.myTemplate.nodeMenuButton = "";

        const f = new FamilyTree(divRef.current, {
          nodes: newNode,
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
            expandAll: false,
          },
          roots: selectedNode ? [selectedNode] : [],
        });

        f.on("click", function (sender, args) {
          if (args.node && args.event.target.closest(".remove-btn")) {
            handleRemove(args.node.id);
            return false;
          }
        });

        familyTreeRef.current = f;
        familyTreeRef.current.onUpdateNode(handleEdit);
        console.log(f);
        setDebugInfo("Family tree initialized successfully");
      } catch (err) {
        console.error("Error initializing family tree:", err);
        setDebugInfo(`Error initializing family tree: ${err}`);
      }
    }
  }, [nodes, loading]);

  function showPermissionToast() {
    toast({
      title: "Insufficient permissions",
      description: "please, contact admin",
      variant: "destructive",
    });
  }

  const handleEdit = async (args: any) => {
    console.log("Edit node:", args);
    try {
      if (args.updateNodesData && args.updateNodesData.length > 0) {
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
            }
          });
        });
      }

    if(args.removeNodeId !== null) {
      try{
        const s = await deleteFamilyMember(args.removeNodeId.toString());
        console.log("Document successfully removed!");
        console.log(s);
        return true;
      }
      catch(error){
    if (error.code == "permission-denied") {
      showPremissionToast()
    } else {
      console.error("Error removing document: ", error);
      setDebugInfo(`Error removing member ${selectedRemoveMemberId}: ${error}`);
      toast({
        title: "Error",
        description: "Failed to remove family member",
        variant: "destructive",
      });
    }
  };

  const handleAdd = () => {
    console.log("Add new member");
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

  const handleAddMember = (newMember: FamilyMember) => {
    setIsAddFormOpen(false);
    console.log("New member added:", newMember);
    if (familyTreeRef.current) {
      familyTreeRef.current.addNode(newMember);
    }
  };

  const handleRemoveForm = () => {
    console.log("Remove member form opened");
    setIsRemoveFormOpen(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div>Error loading family tree data: {error}</div>;
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
                    <Button onClick={()=> setIsSetting(false)}>
                      <Cross1Icon />
                    </Button>
                  </div>
                <div className="mb-4">
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
                  >
                    {nodes.map((node) => (
                      <option
                        key={node.id}
                        value={node.id}
                        selected={selectedNode === node.id}
                      >
                        {node.name}
                      </option>
                    ))}
                  </select>
                  <Button className="mb-4" onClick={setRootNode}>
                    Set as Root Node
                  </Button>
                </div>
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
                {/* <DebugInfo info={debugInfo} nodeCount={nodes.length} /> */}
              </div>
        ):(
          <Button className="mt-7 mr-5 absolute top-14 ml-3" onClick={()=> setIsSetting(true)} variant="default" size="icon">
            <GearIcon  />
          </Button>
        )}
        </>
      )}
    </div>
  );
};

export default FamilyTreeComponent;
