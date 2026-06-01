# HYMS 康复视神经训练系统

> 专业的视觉康复训练应用，帮助用户通过科学的训练方法改善视觉健康

---

## 🎯 项目简介

HYMS（Healing Your Mind and Sight）是一款专为视神经康复设计的训练应用。通过多种科学的视觉训练模式，帮助用户锻炼眼肌、改善聚焦能力、调节情绪状态。

## ✨ 核心功能

### 🏋️ 训练模式
- **视觉追踪训练** - 移动的彩色光球引导目光追随
- **颜色轮播** - 8种颜色平滑滚动轮询
- **舒缓放松模式** - 呼吸般的明暗脉动，水波纹效果
- **兴奋刺激模式** - 高饱和度色块快速变换
- **眼球运动引导** - 光点按预设轨迹移动
- **视觉聚焦训练** - 目标远近切换练习
- **红蓝光交替刺激** - 专业视神经激活方法
- **认知记忆训练** - 数字排序与记忆翻牌游戏

### 🎛️ 交互功能
- **训练计时器** - 支持3-30分钟预设时长
- **语音播报** - 每分钟提醒，完成提示
- **速度调节** - 0.2x - 5x 可调
- **亮度控制** - 30%-100% 可调
- **暂停/继续** - 随时暂停训练
- **手势操作** - 左右滑动切换模式，双击全屏
- **键盘快捷键** - Space暂停、方向键切换、F全屏

### 📊 数据管理
- **训练统计** - 总时长、次数、平均时长
- **训练历史** - 每日记录、模式分布、趋势分析
- **进度保存** - 设置自动持久化
- **训练计划** - 预设组合 + 自定义创建
- **训练报告** - 文本/图片报告，支持分享

### 🎨 个性化设置
- **主题切换** - 深色/浅色/夜间模式
- **音效系统** - 操作反馈、氛围音效
- **定时提醒** - 自定义训练提醒
- **画中画模式** - 投屏时手机端控制

### 📱 投屏支持
- **DLNA投屏** - 支持电视投屏
- **WebSocket控制** - 手机端远程控制
- **画面优化** - 60fps帧率控制，硬件加速

---

## 🛠️ 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 18+ |
| 语言 | TypeScript | 5+ |
| 构建工具 | Vite | 6+ |
| 样式 | Tailwind CSS | 3+ |
| 状态管理 | Zustand | 4+ |
| 图标 | Lucide React | 0.312+ |
| 移动端 | Capacitor | 6+ |

---

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

### 构建Android应用
```bash
npm run build
npx cap sync
npx cap open android
```

---

## 📁 项目结构

```
src/
├── components/          # UI组件
│   ├── ControlBar.tsx   # 底部控制栏
│   ├── TrainingCard.tsx # 训练卡片
│   ├── ThemeSwitcher.tsx # 主题切换器
│   ├── ShareButton.tsx  # 分享按钮
│   ├── GestureGuide.tsx # 手势提示
│   └── CastButton.tsx   # 投屏按钮
├── hooks/               # 自定义Hooks
│   ├── useCanvas.ts     # Canvas渲染Hook
│   ├── useAudio.ts      # 音效Hook
│   ├── useCapture.tsx   # 截图Hook
│   ├── useTheme.ts      # 主题Hook
│   ├── useGestures.ts   # 手势Hook
│   ├── useShare.ts      # 分享Hook
│   ├── useTrainingHistory.ts # 历史记录Hook
│   └── useReminders.ts  # 提醒Hook
├── pages/               # 页面组件
│   ├── Home.tsx         # 首页
│   ├── SensoryTraining.tsx # 多感官训练
│   ├── EyeMovementTraining.tsx # 眼动训练
│   ├── RedBlueTraining.tsx # 红蓝训练
│   ├── FocusTraining.tsx # 聚焦训练
│   ├── CognitiveTraining.tsx # 认知训练
│   ├── PictureInPicture.tsx # 画中画模式
│   ├── TrainingStats.tsx # 训练统计
│   ├── TrainingHistory.tsx # 训练历史
│   ├── TrainingPlan.tsx # 训练计划
│   └── ReminderSettings.tsx # 提醒设置
├── renderers/           # Canvas渲染器
│   ├── TrackingRenderer.ts
│   ├── CalmRenderer.ts
│   ├── ExciteRenderer.ts
│   ├── ColorCarouselRenderer.ts
│   ├── FocusRenderer.ts
│   ├── RedBlueRenderer.ts
│   └── EyeMovementRenderer.ts
├── store/               # 状态管理
│   └── trainingStore.ts
├── App.tsx              # 应用入口
├── main.tsx             # 主入口
└── index.css            # 全局样式
```

---

## 🎮 使用说明

### 基本操作
1. 打开应用，选择训练模式
2. 点击开始训练
3. 使用底部控制栏调节参数
4. 训练完成后查看统计报告

### 快捷键
- `Space` - 暂停/继续
- `← →` - 切换训练模式
- `F` - 全屏/退出全屏
- `Esc` - 退出全屏

### 手势操作
- 左右滑动 - 切换模式
- 双击 - 全屏切换
- 长按 - 显示操作提示

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 仓库
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

---

## 📄 许可证

MIT License

---

## 📧 联系方式

如有问题或建议，欢迎反馈！

---

**HYMS 康复视神经训练系统** - 让视觉康复更科学、更有效 ✨