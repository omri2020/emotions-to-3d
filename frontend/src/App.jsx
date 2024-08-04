import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import ModelPage from "./Pages/ModelPage";
import ModelsAnalysis from "./Pages/ModelsAnalysis";
import "boxicons/css/boxicons.min.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/model/:id" element={<ModelPage />} />
        <Route path="/analytics" element={<ModelsAnalysis />} />
      </Routes>
    </Router>
  );
};

export default App;
