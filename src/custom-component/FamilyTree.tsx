import React, { useEffect, useRef } from 'react';
import FamilyTree, { FamilyTreeProps } from "@/family-tree/wrapper";
import useFamilyStore from "@/store/globalFamily";

const FamilyTreeComponent: React.FC<FamilyTreeProps> = ({ nodes }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const familyRef = useRef<FamilyTree | null>(null); // Use a ref to store the FamilyTree instance
  const setFamily = useFamilyStore(state => state.setFamily);

  useEffect(() => {
    if (divRef.current) {
      const f = new FamilyTree(divRef.current, {
        nodes: nodes,
        template: "rabin",
        nodeBinding: {
          field_0: "name",
          field_1: "title",
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
      familyRef.current = f; // Store the FamilyTree instance in the ref
      setFamily(f);
      f.editUI.on('save', handleEdit);
    }
  }, []);

  const handleEdit = (sender: FamilyTree["editUI"], args: any) => {
    const familyInstance = familyRef.current;
    if (familyInstance) {
      console.log(args);
    }
    return false
  };

  return <div id='family-tree' ref={divRef} style={{ width: '100%', height: '600px' }}></div>;
};

export default FamilyTreeComponent;
