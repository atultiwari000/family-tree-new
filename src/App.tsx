import React from "react";
import "./App.css";
import FamilyTreeComponent from "./custom-component/FamilyTreeComponent";
import useFamilyStore from "./store/globalFamily";
import LoginUI from "./components/login-ui";

const App: React.FC = () => {
  const isOpen = useFamilyStore((state) => state.isOpen);

  return (
    <div className="App">
      <LoginUI />
      <FamilyTreeComponent />
    </div>
  );
};

export default App;
