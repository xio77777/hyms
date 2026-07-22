# 当前工作上下文

## 当前工作重点
无障碍优化第五轮 - 第一性原理：非Canvas页面全面无障碍化，统一交互标准

## 最近变更
- 2026-07-22: 第五轮第一性原理优化，聚焦"非Canvas页面无障碍统一"：

### 非Canvas页面按钮全面增大
- **TrainingStats**：返回按钮w-6 h-6 px-5 py-3 rounded-2xl text-lg；统计卡片图标w-7 h-7 w-14 h-14容器；进度条h-3；设置文字从text-sm→text-lg；新增显示高对比度/大字体状态；修复速度硬编码"1.0x"改为读取store.speed
- **TrainingHistory**：返回按钮统一规格；统计卡片增大；Tab按钮px-6 py-3 rounded-2xl text-base border-2；删除按钮始终可见w-12 h-12（移除group-hover隐藏）；删除操作加confirm确认；Tab切换添加语音反馈；空状态字号增大；进度条h-3
- **ReminderSettings**：所有按钮增大到80px+（toggle开关w-14 h-14、删除按钮w-12 h-12、预设提醒按钮py-4 px-5）；删除操作加confirm确认；快速添加按钮增大；模态框关闭按钮w-12 h-12 X图标；模态框输入框px-5 py-4 text-lg border-2；星期选择按钮w-12 h-12；提醒开/关切换语音反馈；星期标签改为静态显示（非disabled按钮）
- **TrainingPlan**：返回/创建按钮统一规格；计划卡片"开始训练"按钮py-4 text-lg w-6 h-6 Play图标；删除按钮始终可见w-10 h-10（移除opacity-0 group-hover）；删除操作加confirm确认；创建计划模态框：关闭按钮w-12 h-12 X图标；输入框px-5 py-4 text-lg border-2；模式选择按钮px-4 py-3 border-2 hover:border-neon-cyan/30；保存按钮py-4 text-lg w-6 h-6图标；时长徽章bg-white/10 px-3 py-1.5；步骤列表删除按钮w-10 h-10；添加步骤时语音反馈；移除无效的isRunning/stepTimeLeft/currentStepIndex本地状态（跨页面导航后无效）；训练开始前重置speed和brightness

### 组件级优化
- **ThemeSwitcher**：触发按钮从p-1/p-2 w-4 h-4 → w-12 h-12 w-6 h-6图标 rounded-2xl；下拉菜单项py-3.5 px-4 w-6 h-6图标 text-base；下拉菜单border-2 p-3 rounded-2xl；QuickThemeToggle同样增大到w-12 h-12 w-6 h-6
- **CastButton**：触发按钮从px-1.5 py-1 w-4 h-4 → px-4 py-3 w-6 h-6 rounded-2xl text-base；关闭按钮从"×"文字→w-12 h-12 X图标 rounded-2xl；设备列表按钮py-4 px-5 w-6 h-6图标 border-2；系统投屏按钮py-4 px-5；重新搜索按钮py-4；添加语音反馈（搜索设备/连接成功/断开/重新搜索）；移除过长的投屏状态文字（只在sm显示"投屏中"/"投屏"）；错误提示文字增大

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
- TypeScript版本必须精确锁定（5.8.3），npm install可能意外升级
