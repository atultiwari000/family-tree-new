import React from 'react';
import './App.css';
import FamilyTreeComponent from './component/FamilyTree';
import Ambika from "@/assets/images/ambika.png"
import hariMaya from "@/assets/images/hari-maya.png"

import bidhya from "@/assets/images/bidhya.png"
import gita from "@/assets/images/gita.png"
import hariKrishna from "@/assets/images/hari-krishna.png"
import keshab from "@/assets/images/keshab.png"
import malati from "@/assets/images/malati.png"
import maya from "@/assets/images/maya.png"
import me from "@/assets/images/me.png"
import mummy from "@/assets/images/mummy.png"
import rikhi from "@/assets/images/rikhi.png"
import subhash from "@/assets/images/subhash.png"
import sarswati from "@/assets/images/sarswati.png"
import avatar from "@/assets/images/avatar.png"




const App: React.FC = () => {
  const nodes = [
    {id: 1, name:"Rikhi Ram Lc",pids:[2], gender:"male", img:rikhi},
    {id: 2, name:"Hari Maya Lc", pids:[1], gender:"female", img:hariMaya},

    // sons
    {id: 3, name:"Keshab Raj Lc", mid:[1], fid:[2], pids:[10], gender:"male", img:keshab},
    {id: 4, name:"kshitiz Lc", mid:[1], fid:[2], pids:[11], gender:"male", img:avatar},
    {id: 5, name:"Hari Krishna Lc", mid:[1], fid:[2] ,pids:[12], gender:"male", img:hariKrishna},

    // daughters
    {id: 6, name:"Sarswati Subedi", mid:[1], fid:[2], gender:"female", img:sarswati},
    {id: 7, name:"Malati Tiwari", mid:[1], fid:[2], gender:"female", img:malati},
    {id: 8, name:"Ambika Lc", mid:[1], fid:[2], gender:"female", img:Ambika},
    {id: 9, name:"Maya Bhattrai", mid:[1], fid:[2], gender:"female", img:maya},

    // wife of sons
    {id: 10, name:"Sarswati Kumari Lc", pids:[3], gender:"female", img:mummy},
    {id: 11, name:"Bidhya Chettri", pids:[4], gender:"female", img:bidhya},
    {id: 12, name:"Gita Lc", pids:[5], gender:"female", img:gita},

    // children of sons
    {id: 13, name:"Subhash Lc" , fid:[3], mid:[10], gender:"male", img:subhash},
    {id: 14, name:"Rabin Lc" , fid:[3], mid:[10], gender:"male", img:me},

]

  return (
    <div className="App">
      <FamilyTreeComponent nodes={nodes} />
    </div>
  );
};

export default App;
