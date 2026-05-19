# 技术上下文

## 使用的技术

### 前端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.3.1 | UI 框架 |
| TypeScript | ~5.8.3 | 类型系统 |
| Vite | ^6.3.5 | 构建工具 |
| Tailwind CSS | ^3.4.17 | 样式框架 |
| Zustand | ^5.0.3 | 状态管理 |
| React Router | ^7.3.0 | 路由管理 |
| Lucide React | ^0.511.0 | 图标库 |

### 移动端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Capacitor Core | ^8.3.3 | 跨平台桥接 |
| Capacitor Android | ^8.3.3 | Android 支持 |
| Android SDK | - | 原生功能 |

## 开发环境
- Node.js + npm
- Android Studio（用于 Android 构建）
- 现代浏览器（Chrome/Firefox/Safari）

## 技术约束
1. **性能要求**：Canvas 动画需保持 60fps
2. **兼容性**：支持大屏电视（1920×1080）和桌面浏览器
3. **无障碍**：高对比度、动画速度可调节
4. **移动端**：Android 应用需支持投屏功能

## 依赖与工具使用模式

### 构建脚本
```bash
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run lint     # ESLint 检查
npm run check    # TypeScript 类型检查
npm run cap:sync # 同步到 Android 项目
npm run cap:open # 打开 Android Studio
```

### 代码规范
- ESLint + TypeScript ESLint 配置
- 使用 functional 组件 + Hooks
- 类型定义优先，避免 any

## 项目配置

### Vite 配置
- 使用 `@vitejs/plugin-react` 插件
- 支持路径别名（通过 `vite-tsconfig-paths`）

### Tailwind 配置
- 自定义主题色（深色背景 + 霓虹色彩）
- 支持响应式设计

### Capacitor 配置
- App ID: `com.hyms.rehab`
- 支持 Android 平台
