# 系统架构

## 技术架构

### 前端架构
```
src/
├── components/     # React 组件
│   ├── CastButton.tsx
│   └── ControlBar.tsx
├── hooks/          # 自定义 Hooks
│   ├── useCanvas.ts
│   └── useCast.ts
├── pages/          # 页面组件
│   ├── Home.tsx
│   ├── CognitiveTraining.tsx
│   ├── EyeMovementTraining.tsx
│   ├── FocusTraining.tsx
│   ├── RedBlueTraining.tsx
│   └── SensoryTraining.tsx
├── renderers/      # Canvas 渲染器
│   ├── CalmRenderer.ts
│   ├── ColorCarouselRenderer.ts
│   ├── ExciteRenderer.ts
│   ├── EyeMovementRenderer.ts
│   ├── FocusRenderer.ts
│   ├── RedBlueRenderer.ts
│   └── TrackingRenderer.ts
├── store/          # 状态管理
│   └── trainingStore.ts
├── App.tsx
└── main.tsx
```

### 移动端架构（Capacitor）
```
android/
├── app/src/main/java/com/hyms/rehab/
│   ├── CastPlugin.java       # 投屏插件
│   ├── CastPresentation.java
│   ├── MainActivity.java
│   ├── dlna/
│   │   ├── DlnaController.java
│   │   ├── DlnaDevice.java
│   │   └── SsdpDiscovery.java
│   └── server/
│       ├── LocalWebServer.java
│       └── SyncWebSocketServer.java
```

## 关键设计模式

### 1. 渲染器模式
每种训练模式对应一个独立的 Renderer 类，负责 Canvas 绘制逻辑：
- `TrackingRenderer` - 视觉追踪训练
- `CalmRenderer` - 舒缓模式
- `ExciteRenderer` - 兴奋模式
- `EyeMovementRenderer` - 眼动训练
- `FocusRenderer` - 专注训练
- `RedBlueRenderer` - 红蓝训练
- `ColorCarouselRenderer` - 色彩轮播

### 2. 状态管理
使用 Zustand 管理全局状态：
- 当前训练模式
- 速度设置
- 亮度设置
- 训练状态（运行/暂停）

### 3. 插件架构
Android 端使用 Capacitor 插件机制：
- `CastPlugin` - 处理投屏功能
- DLNA 发现与控制
- 本地 WebSocket 服务器

## 关键实现路径

### 训练流程
1. 用户选择训练模式 → 进入对应页面
2. 页面初始化 Canvas 和对应 Renderer
3. 使用 `useCanvas` Hook 管理 Canvas 生命周期
4. Renderer 根据状态（速度、亮度）渲染动画
5. 控制栏通过 Zustand 更新状态，触发重新渲染

### 投屏流程
1. 用户点击投屏按钮
2. `CastPlugin` 调用 Android 原生代码
3. DLNA 发现局域网设备
4. 选择设备后建立连接
5. 通过 WebSocket 同步播放状态
