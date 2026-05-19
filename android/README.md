# HYMS 安卓应用构建指南

## 项目结构

- `android/` - Android原生项目目录
- `src/` - React Web应用源码
- `capacitor.config.ts` - Capacitor配置

## 投屏支持

本应用支持以下投屏方式：

### 1. 无线投屏 (Miracast/WiFi Display)
- 在Android设置中开启"无线显示"或"屏幕镜像"
- 选择电视设备进行连接
- 应用内容将同步显示在电视上

### 2. Chromecast
- 确保手机和Chromecast在同一WiFi网络
- 在应用中点击系统投屏按钮
- 选择Chromecast设备

### 3. 有线投屏 (HDMI/USB-C)
- 使用USB-C转HDMI线连接电视
- 手机会自动切换到外接显示器模式

## 构建APK

### 前置要求
- Android Studio (最新版)
- JDK 17+
- Android SDK

### 构建步骤

1. 构建Web应用
```bash
npm run build
```

2. 同步到Android项目
```bash
npx cap sync
```

3. 打开Android Studio
```bash
npx cap open android
```

4. 在Android Studio中构建APK
- Build → Build Bundle(s) / APK(s) → Build APK(s)
- 或 Build → Generate Signed Bundle / APK

### 直接构建（命令行）

```bash
cd android
./gradlew assembleDebug
```

APK输出位置：`android/app/build/outputs/apk/debug/app-debug.apk`

## 安装到设备

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 开发调试

1. 启用手机的开发者选项和USB调试
2. 连接手机到电脑
3. 在Android Studio中选择设备并运行

## 注意事项

- 应用已配置保持屏幕常亮，适合长时间训练
- 支持横屏/竖屏自适应
- 投屏时建议使用横屏模式获得最佳体验
