# 当前工作上下文

## 当前工作重点
无障碍优化第七轮 - 第一性原理：ControlBar（训练中最关键控制面板）全面优化、GestureGuide修复

## 最近变更
- 2026-07-23: 第七轮第一性原理优化，聚焦"ControlBar训练控制面板全面无障碍化"：

### ControlBar全面优化
- **速度/亮度预设按钮**：py-2→py-3（触控区从~32px增至~52px，满足48px最低要求）；min-w-[60px]→[64px]
- **速度/亮度档位统一**：速度0.5/1.0/2.0（原0.5/1/1.5）、亮度0.5/0.8/1.0（原0.4/0.7/1.0），与PictureInPicture一致
- **速度/亮度按钮选中判定宽容度增大**：±0.05→±0.15（速度）/±0.1（亮度），避免档位边界不亮
- **速度/亮度容器**：添加border-2 border-white/10，与其他控件视觉统一
- **速度/亮度标签**：text-base w-10→text-lg w-12
- **所有按钮文字**：text-base→text-lg统一
- **计时条**：border-b→border-b-2；Timer图标w-5 h-5→w-6 h-6；时间显示text-xl→text-2xl font-bold；min-w-[120px]→[140px]；进度条添加rounded-full
- **停止计时按钮**：p-3→w-12 h-12 flex justify-center rounded-2xl；**添加confirm二次确认**防止误触
- **训练完成面板**：border-b→border-b-2；按钮添加border-2；flex-wrap justify-center适配小屏
- **计时激活时不隐藏计时条**：原`timerActive && ...`在timerCompleted时会隐藏，改为`timerActive && !timerCompleted`
- **收起态按钮flex-wrap**：防止小屏挤压
- **语音开关修复**：关闭语音前先speak"语音播报已关闭"延迟500ms再关闭（原bug：关闭时无语音反馈）；开启时延迟100ms再speak确保voiceEnabled已生效
- **计时按钮**：timerActive时显示剩余分钟数（如"5分"）而非只显示"计时"；点击计时按钮添加语音反馈；计时菜单添加click-outside遮罩层
- **计时菜单**：border→border-2；按钮text-lg→text-xl font-bold；添加hover边框高亮；min-w-[200px]；选项按钮添加border-2
- **速度/亮度区域flex-wrap**：防止小屏挤压

### 组件级优化
- **GestureGuide**：面板border→border-2 p-4→p-5；标题text-sm→text-lg font-bold；手势说明text-xs→text-base/xl、p-2→p-3、gap-3→gap-4；关闭按钮从w-4 h-4无padding→w-10 h-10 flex justify-center rounded-xl带hover背景；Hand图标w-4 h-4→w-6 h-6
- **KeyboardShortcuts**：bottom-20→bottom-24避免被ControlBar遮挡；border→border-2；px-3 py-2→px-4 py-3；kbd px-1.5 py-0.5 text-xs→px-2.5 py-1 text-base rounded-lg；"Space"→"空格"中文

## 下一步计划
1. 训练结束后自动回到首页的倒计时选项
2. 遥控器长按/短按交互优化
3. 评估训练计划自动按步骤切换模式的功能（当前handleStartPreset只设第一步模式）
4. 启动dev server实际测试所有交互流程

## 活跃决策与考虑
- **所有页面统一按钮规格**：导航栏按钮w-12 h-12 w-6 h-6图标 px-5 py-3 rounded-2xl text-lg；列表/卡片操作按钮w-12 h-12；主操作按钮py-4 text-lg
- **删除/停止操作必须确认**：所有破坏性操作点击后弹confirm，防止误触（脑梗患者手部控制差）
- **删除按钮始终可见**：禁止hover-only交互，所有操作控件必须始终可见
- **模态框/下拉菜单关闭按钮统一w-12 h-12**：X图标w-6 h-6，不再使用"×"文字
- **输入框统一border-2 px-5 py-4 text-lg**：大字体大触控区
- **滑块（range input）禁止使用**：所有滑块改为大按钮预设档位，脑梗患者无法精准拖动滑块
- **语音关闭前必须先说话**：关闭语音后语音系统立即失效，所以要speak()之后延迟关闭
- **速度/亮度档位全局统一**：速度慢0.5x/中1.0x/快2.0x，亮度暗50%/中80%/亮100%
- **npm install会升级TypeScript**：每次build前检查版本，必要时重装5.8.3
- **CastButton状态文字不适合移动端**：手机端只显示图标，投屏状态用颜色区分（绿色=已连接）
- **下拉/弹出菜单必须有click-outside遮罩**：防止点击其他区域时菜单不关闭

## 重要模式与经验
- 所有按钮最小触控区48x48px（w-12 h-12），主要按钮≥64px高度（py-4）
- 禁止hover-only交互，所有功能在触控设备上必须可访问
- 删除/清空/断开/停止等破坏性操作必须二次确认
- 模态框/菜单使用X图标而非"×"文字，大小w-12 h-10~12 rounded-xl~2xl
- 边框统一用border-2（不是border/border-1）提升视觉辨识度
- 语音反馈覆盖所有状态切换操作，关闭语音前先播报
- 滑块range input脑梗患者无法使用，必须改为大按钮预设档位
- 速度/亮度预设档位必须全局统一（ControlBar与PictureInPicture一致）
- 下拉菜单必须添加fixed inset-0 z-40遮罩层处理click-outside
- TypeScript版本必须精确锁定（5.8.3），npm install可能意外升级
