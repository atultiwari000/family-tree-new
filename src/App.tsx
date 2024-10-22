import React from "react";
import "./App.css";
import FamilyTreeComponent from "./custom-component/FamilyTreeComponent";
import LoginUI from "./components/login-ui";
import { Toaster } from "./components/ui/toaster";

const App: React.FC = () => {

  return (
    <div className="App">
      <div className="bg-slate-100">
      <h5 className="text-left">
      ठुलो वंशावली किताबको वंश नं २५ भन्दा अगाडीको यथावत राखी सो भन्दा माथिकोमा थप हुन आएका थपगर्न दोस्रो संसोधन पुस्तकको लागि सफ्टवेर बनाउन ड्रफ्ट  
      विषय सुची  
      </h5>
      </div>
      <LoginUI />
      <FamilyTreeComponent />
      <Toaster/>
    </div>
  );
};

export default App;
