import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import SensoryTraining from "@/pages/SensoryTraining";
import EyeMovementTraining from "@/pages/EyeMovementTraining";
import RedBlueTraining from "@/pages/RedBlueTraining";
import FocusTraining from "@/pages/FocusTraining";
import CognitiveTraining from "@/pages/CognitiveTraining";

/**
 * 应用根组件
 * 定义所有训练页面的路由
 */
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sensory" element={<SensoryTraining />} />
        <Route path="/eye-movement" element={<EyeMovementTraining />} />
        <Route path="/red-blue" element={<RedBlueTraining />} />
        <Route path="/focus" element={<FocusTraining />} />
        <Route path="/cognitive" element={<CognitiveTraining />} />
      </Routes>
    </Router>
  );
}
