import React from 'react';
import './App.css';
import FamilyTreeComponent from './component/FamilyTree';

const App: React.FC = () => {
  const nodes = [
    {id: 1, name:"Rikhi Ram Lc",pids:[2], gender:"male", img:"./images/rikhi.png"},
    {id: 2, name:"Hari Maya Lc", pids:[1], gender:"female", img:"./images/hari-maya.png"},

    // sons
    {id: 3, name:"Keshab Raj Lc", mid:[1], fid:[2], pids:[10], gender:"male", img:"./images/keshab.png"},
    {id: 4, name:"kshitiz Lc", mid:[1], fid:[2], pids:[11], gender:"male", img:"./images/avatar.png"},
    {id: 5, name:"Hari Krishna Lc", mid:[1], fid:[2] ,pids:[12], gender:"male", img:"./images/hari-krishna.png"},

    // daughters
    {id: 6, name:"Sarswati Subedi", mid:[1], fid:[2], gender:"female", img:"./images/sarswati.png"},
    {id: 7, name:"Malati Tiwari", mid:[1], fid:[2], gender:"female", img:"./images/malati.png"},
    {id: 8, name:"Ambika Lc", mid:[1], fid:[2], gender:"female", img:"./images/ambika.png"},
    {id: 9, name:"Maya Bhattrai", mid:[1], fid:[2], gender:"female", img:"./images/maya.png"},

    // wife of sons
    {id: 10, name:"Sarswati Kumari Lc", pids:[3], gender:"female", img:"./images/mummy.png"},
    {id: 11, name:"Bidhya Chettri", pids:[4], gender:"female", img:"./images/bidhya.png"},
    {id: 12, name:"Gita Lc", pids:[5], gender:"female", img:"./images/gita.png"},

    // children of sons
    {id: 13, name:"Subhash Lc" , fid:[3], mid:[10], gender:"male", img:"./images/subhash.png"},
    {id: 14, name:"Rabin Lc" , fid:[3], mid:[10], gender:"male", img:"./images/me.png"},

]

  return (
    <div className="App">
      <FamilyTreeComponent nodes={nodes} />
    </div>
  );
};

export default App;
