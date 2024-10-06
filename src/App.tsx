import React from "react";
import "./App.css";
import FamilyTreeComponent from "./custom-component/FamilyTreeComponent";
import LoginModal from "./components/login-modal";
import useFamilyStore from "./store/globalFamily";

const App: React.FC = () => {
  const isOpen = useFamilyStore((state) => state.isOpen);

  return (
    <div className="App">
      <FamilyTreeComponent />
      <LoginModal isOpen={isOpen} />
    </div>
  );
};

export default App;
