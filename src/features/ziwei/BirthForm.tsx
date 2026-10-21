import { useState } from 'react'

export interface BirthInfo {
  date: string         // 阳历日期 YYYY-MM-DD
  timeIndex: number    // 时辰索引 0-11
  gender: '男' | '女'
}

const timeSlots = [
  { index: 0, name: '子时', range: '23:00 - 01:00' },
  { index: 1, name: '丑时', range: '01:00 - 03:00' },
  { index: 2, name: '寅时', range: '03:00 - 05:00' },
  { index: 3, name: '卯时', range: '05:00 - 07:00' },
  { index: 4, name: '辰时', range: '07:00 - 09:00' },
  { index: 5, name: '巳时', range: '09:00 - 11:00' },
  { index: 6, name: '午时', range: '11:00 - 13:00' },
  { index: 7, name: '未时', range: '13:00 - 15:00' },
  { index: 8, name: '申时', range: '15:00 - 17:00' },
  { index: 9, name: '酉时', range: '17:00 - 19:00' },
  { index: 10, name: '戌时', range: '19:00 - 21:00' },
  { index: 11, name: '亥时', range: '21:00 - 23:00' },
]

interface BirthFormProps {
  onSubmit: (birthInfo: BirthInfo) => void
  loading?: boolean
}

export function BirthForm({ onSubmit, loading }: BirthFormProps) {
  const [date, setDate] = useState('1990-01-01')
  const [timeIndex, setTimeIndex] = useState(0)
  const [gender, setGender] = useState<'男' | '女'>('男')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ date, timeIndex, gender })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-[#d4c9b8] p-6">
      <h2 className="text-lg font-bold text-[#2c2416] mb-5 border-b border-[#e8dcc8] pb-3">
        出生信息
      </h2>

      <div className="space-y-4">
        {/* 出生日期 */}
        <div>
          <label className="block text-sm text-[#5c4d3d] mb-1.5">出生日期（阳历）</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-[#d4c9b8] rounded-md bg-[#fdfaf3] text-[#2c2416] focus:outline-none focus:border-[#c0392b] focus:ring-1 focus:ring-[#c0392b]"
          />
        </div>

        {/* 出生时辰 */}
        <div>
          <label className="block text-sm text-[#5c4d3d] mb-1.5">出生时辰</label>
          <select
            value={timeIndex}
            onChange={(e) => setTimeIndex(Number(e.target.value))}
            className="w-full px-3 py-2 border border-[#d4c9b8] rounded-md bg-[#fdfaf3] text-[#2c2416] focus:outline-none focus:border-[#c0392b] focus:ring-1 focus:ring-[#c0392b]"
          >
            {timeSlots.map((slot) => (
              <option key={slot.index} value={slot.index}>
                {slot.name}（{slot.range}）
              </option>
            ))}
          </select>
        </div>

        {/* 性别 */}
        <div>
          <label className="block text-sm text-[#5c4d3d] mb-1.5">性别</label>
          <div className="flex gap-3">
            {(['男', '女'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`flex-1 py-2 rounded-md border transition-colors ${
                  gender === g
                    ? 'bg-[#c0392b] text-white border-[#c0392b]'
                    : 'bg-[#fdfaf3] text-[#5c4d3d] border-[#d4c9b8] hover:border-[#c0392b]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#c0392b] text-white rounded-md font-medium hover:bg-[#a93226] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? '排盘中...' : '开始排盘'}
        </button>
      </div>
    </form>
  )
}
