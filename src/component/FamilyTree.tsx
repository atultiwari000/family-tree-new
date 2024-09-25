import React, { useEffect, useRef } from 'react';
import FamilyTree, { FamilyTreeProps } from "@/family-tree/wrapper"

const FamilyTreeComponent: React.FC<FamilyTreeProps> = ({ nodes }) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      const family = new FamilyTree(divRef.current, {
        nodes: nodes,
        template:"rabin",
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
    }
  }, [nodes]);

  return <div id='family-tree' ref={divRef} style={{ width: '100%', height: '600px' }}></div>;
};

export default FamilyTreeComponent;