# 当前工作上下文

## 当前工作重点
无障碍优化第六轮 - 第一性原理：遗漏组件无障碍化、滑块彻底消除

## 最近变更
- 2026-07-22: 第六轮第一性原理优化，聚焦"遗漏组件无障碍化"：

### 之前遗漏的组件全面修复
- **ShareButton**：触发按钮从p-1 w-4 h-4 → w-12 h-12 w-6 h-6 rounded-2xl；下拉菜单项py-3.5 px-4 w-6 h-6 text-base；菜单border-2 rounded-2xl；添加语音反馈
- **ShareModal**：关闭按钮w-12 h-12 X图标；四个操作按钮py-4 w-6 h-6 text-lg rounded-2xl border-2；预览区border-2 p-5 rounded-2xl；添加复制/下载语音反馈
- **Home**：工具区按钮border-2 p-5 min-h-[140px] w-12 h-12图标、显示描述文字、点击语音播报；无障碍菜单项py-4 px-4 w-6 h-6 text-lg、border-2、菜单min-w-[280px]
- **PictureInPicture**：返回按钮px-5 py-3 w-6 h-6 text-lg rounded-2xl；全屏按钮w-12 h-12；画中画按钮px-5 py-3 w-6 h-6 text-lg border-2；进度条h-3；计时器完成提示py-4 px-5 border-2 w-6 h-6确定按钮px-5 py-2；**速度/亮度滑块彻底改为三档预设按钮（慢/中/快、暗/中/亮）py-3 text-lg**；暂停按钮py-4 w-6 h-6 text-lg；所有操作全覆盖语音反馈；中央信息区字号整体增大（text-7xl/2xl/xl/base）

## 下一步计划
1. 训练结束后自动回到首页的倒计时选项
2. 遥控器长按/短按交互优化
3. 评估训练计划自动按步骤切换模式的功能（当前handleStartPreset只设第一步模式）
4. 启动dev server实际测试所有交互流程

## 活跃决策与考虑
- **所有页面统一按钮规格**：导航栏按钮w-12 h-12 w-6 h-6图标 px-5 py-3 rounded-2xl text-lg；列表/卡片操作按钮w-12 h-12；主操作按钮py-4 text-lg
- **删除操作必须确认**：所有删除按钮点击后弹confirm，防止误触（脑梗患者手部控制差）
- **删除按钮始终可见**：禁止hover-only交互，所有操作控件必须始终可见
- **模态框关闭按钮统一w-12 h-12**：X图标w-6 h-6，不再使用"×"文字
- **输入框统一border-2 px-5 py-4 text-lg**：大字体大触控区
- **滑块（range input）禁止使用**：所有滑块改为大按钮预设档位，脑梗患者无法精准拖动滑块
- **跨页面导航时本地状态无效**：TrainingPlan中移除了isRunning等无法跨navigate保存的本地状态
- **npm install会升级TypeScript**：每次build前检查版本，必要时重装5.8.3
- **CastButton状态文字不适合移动端**：手机端只显示图标，投屏状态用颜色区分（绿色=已连接）

## 重要模式与经验
- 所有按钮最小触控区48x48px（w-12 h-12），主要按钮≥64px高度（py-4）
- 禁止hover-only交互，所有功能在触控设备上必须可访问
- 删除/清空/断开等破坏性操作必须二次确认
- 模态框使用X图标而非"×"文字，大小w-12 h-12 rounded-2xl
- 边框统一用border-2（不是border/border-1）提升视觉辨识度
- 语音反馈覆盖所有状态切换操作
- 滑块range input脑梗患者无法使用，必须改为大按钮预设档位
- TypeScript版本必须精确锁定（5.8.3），npm install可能意外升级
