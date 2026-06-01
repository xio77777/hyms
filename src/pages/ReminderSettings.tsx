import { useState } from 'react'
import { ArrowLeft, Bell, Plus, Trash2, Clock, Check, X, BellOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useReminders, DAY_LABELS, formatTime, PRESET_REMINDERS } from '@/hooks/useReminders'
import { useTrainingStore } from '@/store/trainingStore'

export default function ReminderSettings() {
  const navigate = useNavigate()
  const { 
    reminders, 
    notificationPermission, 
    requestPermission,
    addReminder, 
    deleteReminder, 
    toggleReminder 
  } = useReminders()
  const { speak } = useTrainingStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [newReminder, setNewReminder] = useState({
    time: '09:00',
    label: '训练提醒',
    days: [1, 2, 3, 4, 5]
  })

  const handleAddPreset = (preset: typeof PRESET_REMINDERS[0]) => {
    addReminder({
      ...preset,
      enabled: true
    })
    speak('已添加提醒')
  }

  const handleAddCustom = () => {
    if (newReminder.days.length === 0) {
      speak('请至少选择一天')
      return
    }
    addReminder({
      ...newReminder,
      enabled: true
    })
    speak('已添加自定义提醒')
    setShowAddModal(false)
    setNewReminder({
      time: '09:00',
      label: '训练提醒',
      days: [1, 2, 3, 4, 5]
    })
  }

  const toggleDay = (day: number) => {
    setNewReminder(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort()
    }))
  }

  return (
    <div className="h-full w-full bg-dark flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>

        <h1 className="text-white/80 text-lg font-semibold">训练提醒</h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {notificationPermission !== 'granted' && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BellOff className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-amber-400 font-medium mb-2">需要通知权限</h3>
                  <p className="text-amber-400/70 text-sm mb-4">
                    开启通知权限后，我们才能在训练时间提醒您
                  </p>
                  <button
                    onClick={requestPermission}
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors text-sm font-medium"
                  >
                    开启通知权限
                  </button>
                </div>
              </div>
            </div>
          )}

          {reminders.length === 0 && (
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <h3 className="text-white/70 font-medium mb-2">暂无提醒</h3>
              <p className="text-white/40 text-sm mb-6">
                添加训练提醒，帮助您养成规律训练的好习惯
              </p>
              <div className="space-y-2">
                <div className="text-white/50 text-xs mb-2">快速添加</div>
                {PRESET_REMINDERS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddPreset(preset)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-neon-cyan" />
                      <div className="text-left">
                        <div className="text-white text-sm font-medium">{preset.label}</div>
                        <div className="text-white/50 text-xs">{formatTime(preset.time)}</div>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-white/40" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {reminders.length > 0 && (
            <div>
              <h2 className="text-white/50 text-sm font-medium uppercase tracking-widest mb-4">
                我的提醒 ({reminders.length})
              </h2>
              <div className="space-y-3">
                {reminders.map(reminder => (
                  <div
                    key={reminder.id}
                    className={`bg-white/5 rounded-xl p-4 border transition-all ${
                      reminder.enabled 
                        ? 'border-neon-cyan/20' 
                        : 'border-white/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleReminder(reminder.id)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                            reminder.enabled
                              ? 'bg-neon-cyan/20 text-neon-cyan'
                              : 'bg-white/10 text-white/40'
                          }`}
                        >
                          <Bell className="w-5 h-5" />
                        </button>
                        <div>
                          <div className="text-white font-medium">{reminder.label}</div>
                          <div className="text-neon-cyan text-lg font-bold">
                            {formatTime(reminder.time)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-red-400/60 hover:text-red-400 transition-colors p-2"
                        title="删除提醒"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {DAY_LABELS.map((day, index) => {
                        const isSelected = reminder.days.includes(index)
                        return (
                          <button
                            key={index}
                            disabled
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-neon-cyan/20 text-neon-cyan'
                                : 'bg-white/5 text-white/30'
                            }`}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reminders.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-white/70 text-sm font-medium mb-3">💡 提示</h3>
              <ul className="text-white/50 text-sm space-y-2">
                <li>• 提醒将在设定时间前5分钟发送</li>
                <li>• 确保浏览器通知权限已开启</li>
                <li>• 关闭浏览器后会暂停提醒</li>
                <li>• 建议保持应用在后台运行</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">添加提醒</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">提醒时间</label>
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">提醒名称</label>
                <input
                  type="text"
                  value={newReminder.label}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="例如：晨间训练"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">重复日期</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {DAY_LABELS.map((day, index) => {
                    const isSelected = newReminder.days.includes(index)
                    return (
                      <button
                        key={index}
                        onClick={() => toggleDay(index)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                            : 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleAddCustom}
                disabled={newReminder.days.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-neon-cyan/20 hover:bg-neon-cyan/30 disabled:bg-white/5 disabled:text-white/30 text-neon-cyan rounded-xl transition-colors font-medium"
              >
                <Check className="w-4 h-4" />
                <span>添加提醒</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
