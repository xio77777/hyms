import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import SensoryTraining from "@/pages/SensoryTraining";
import EyeMovementTraining from "@/pages/EyeMovementTraining";
import RedBlueTraining from "@/pages/RedBlueTraining";
import FocusTraining from "@/pages/FocusTraining";
import CognitiveTraining from "@/pages/CognitiveTraining";
import PictureInPicture from "@/pages/PictureInPicture";
import TrainingStats from "@/pages/TrainingStats";
import TrainingPlan from "@/pages/TrainingPlan";
import TrainingHistory from "@/pages/TrainingHistory";
import ReminderSettings from "@/pages/ReminderSettings";

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
        <Route path="/pip" element={<PictureInPicture />} />
        <Route path="/stats" element={<TrainingStats />} />
        <Route path="/plan" element={<TrainingPlan />} />
        <Route path="/history" element={<TrainingHistory />} />
        <Route path="/reminders" element={<ReminderSettings />} />
      </Routes>
    </Router>
  );
}
