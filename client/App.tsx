import React from "react";
import TopBar from "./components/TopBar";
import Configuration from "./components/Configuration";
import IDConfig from "./components/IDConfig";
import AskCookies from "./components/AskCookies";

const App: React.FC = () => {
  return <>
    <AskCookies />
    <TopBar />
    <Configuration />
    <IDConfig />
  </>;
};

export default App;