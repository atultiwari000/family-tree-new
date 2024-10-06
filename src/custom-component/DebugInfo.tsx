import React from "react";

interface DebugInfoProps {
  info: string;
  nodeCount: number;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ info, nodeCount }) => (
  <div className="mt-4 p-2 bg-white rounded shadow">
    <h3 className="font-bold">Debug Info:</h3>
    <p>{info}</p>
    <p>Number of nodes: {nodeCount}</p>
  </div>
);
