import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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
import { useTrainingStore } from "@/store/trainingStore";

/**
 * 应用根组件
 * 全局应用无障碍设置（高对比度、大字体）
 * 定义所有训练页面的路由
 */
export default function App() {
  const { settings } = useTrainingStore()

  useEffect(() => {
    const root = document.documentElement
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    if (settings.largeFont) {
      root.classList.add('large-font')
    } else {
      root.classList.remove('large-font')
    }
  }, [settings.highContrast, settings.largeFont])

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
