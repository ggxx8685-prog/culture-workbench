import { useState } from 'react'
// @ts-ignore lunar-javascript 无类型声明
import { Solar } from 'lunar-javascript'
import { CALENDAR_KNOWLEDGE, ER_SHI_SI, JIEQI_MAP } from './calendarKnowledge'
import { navTo } from '../../shared/profile'

const HOURS = [
  '子时（23:00-01:00）', '丑时（01:00-03:00）', '寅时（03:00-05:00）', '卯时（05:00-07:00）',
  '辰时（07:00-09:00）', '巳时（09:00-11:00）', '午时（11:00-13:00）', '未时（13:00-15:00）',
  '申时（15:00-17:00）', '酉时（17:00-19:00）', '戌时（19:00-21:00）', '亥时（21:00-23:00）',
]

const WEEK = ['日', '一', '二', '三', '四', '五', '六']

interface JieQiItem {
  name: string
  solar: string
  isJie: boolean
}

export function CalendarPanel() {
  const [tab, setTab] = useState<'chart' | 'learn'>('chart')
  const [date, setDate] = useState('2026-10-19')
  const [hourIndex, setHourIndex] = useState(6)
  const [jieqiYear, setJieqiYear] = useState(2026)
  const [jqList, setJqList] = useState<JieQiItem[] | null>(null)
  const [birthDate, setBirthDate] = useState('1990-01-01')
  const [birthHour, setBirthHour] = useState(0)
  const [huangliDate, setHuangliDate] = useState('2026-10-19')

  const runChart = () => {
    const [y, m, d] = date.split('-').map(Number)
    const hour = hourIndex * 2
    const solar = Solar.fromYmdHms(y, m, d, hour, 0, 0)
    const lunar = solar.getLunar()
    // 节气表（当年）
    const table = lunar.getJieQiTable() as Record<string, { _p: { year: number; month: number; day: number; hour: number; minute: number; second: number } }>
    const items: JieQiItem[] = []
    Object.entries(table).forEach(([key, val]) => {
      const name = JIEQI_MAP[key]
      if (!name) return
      const p = val._p
      if (p.year !== y) return
      const solarStr = `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')} ${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`
      items.push({ name, solar: solarStr, isJie: ER_SHI_SI.indexOf(name) % 2 === 0 })
    })
    items.sort((a, b) => a.solar.localeCompare(b.solar))
    setJqList(items)
  }

  if (tab === 'learn') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setTab('chart')} className="px-4 py-1.5 bg-[#f0e7d8] text-[#5c4d3d] rounded text-sm hover:bg-[#e8dcc8]">历法换算</button>
          <button onClick={() => setTab('learn')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">学习知识</button>
        </div>
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h3 className="text-base font-bold text-[#2c2416] mb-3">天文历法 · 基础知识</h3>
          <div className="space-y-2.5">
            {CALENDAR_KNOWLEDGE.map((k, i) => (
              <div key={i} className="border border-[#e8dcc8] rounded p-3 bg-[#fdfaf3]">
                <div className="text-sm font-bold text-[#c0392b]">{k.title}</div>
                <p className="text-xs text-[#5c4d3d] mt-1 leading-relaxed">{k.content}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">注：历法各书口径略有差异（立春换年/春节换年），此处取节气历通行口径，供研习验证。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTab('chart')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">历法换算</button>
        <button onClick={() => setTab('learn')} className="px-4 py-1.5 bg-[#f0e7d8] text-[#5c4d3d] rounded text-sm hover:bg-[#e8dcc8]">学习知识</button>
      </div>

      {/* 表单 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <h3 className="text-base font-bold text-[#2c2416] mb-3">干支纪时换算</h3>
        <p className="text-xs text-[#9a8b75] mb-3">公历 → 农历 / 干支历 / 生肖 / 纳音 / 节气对照（干支历以节气分界）。</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">公历日期</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]" />
          </div>
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">时辰</div>
            <select value={hourIndex} onChange={(e) => setHourIndex(Number(e.target.value))} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]">
              {HOURS.map((h, i) => <option key={h} value={i}>{h}</option>)}
            </select>
          </div>
          <button onClick={runChart} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm hover:bg-[#a93226]">换算</button>
        </div>
      </div>

      {/* 结果 */}
      {(() => {
        const [y, m, d] = date.split('-').map(Number)
        const solar = Solar.fromYmdHms(y, m, d, hourIndex * 2, 0, 0)
        const lunar = solar.getLunar()
        const ec = lunar.getEightChar()
        const prevJie = lunar.getPrevJie()
        const nextJie = lunar.getNextJie()
        return (
          <div className="space-y-4">
            {/* 历法卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
                <div className="text-sm font-bold text-[#2c2416] mb-2">公历</div>
                <div className="text-xl font-bold text-[#2c2416]">{y}年{m}月{d}日</div>
                <div className="text-xs text-[#9a8b75] mt-1">星期{WEEK[solar.getWeek()]} · {solar.toYmdHms().slice(11, 16)}</div>
              </div>
              <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
                <div className="text-sm font-bold text-[#2c2416] mb-2">农历</div>
                <div className="text-xl font-bold text-[#2c2416]">{lunar.getYearInGanZhi()}年</div>
                <div className="text-xs text-[#9a8b75] mt-1">
                  {lunar.getMonthInChinese()}月{lunar.getDayInChinese()} · 生肖 <b className="text-[#c0392b]">{lunar.getYearShengXiao()}</b>
                </div>
              </div>
              <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
                <div className="text-sm font-bold text-[#2c2416] mb-2">节气</div>
                <div className="text-xs text-[#5c4d3d] mt-1">
                  <p>上一节：<b className="text-[#b8860b]">{prevJie.getName()}</b> {prevJie.getSolar().toYmdHms().slice(0, 16)}</p>
                  <p className="mt-1">下一节：<b className="text-[#c0392b]">{nextJie.getName()}</b> {nextJie.getSolar().toYmdHms().slice(0, 16)}</p>
                </div>
              </div>
            </div>

            {/* 干支历四柱 */}
            <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
              <div className="text-sm font-bold text-[#2c2416] mb-3">干支历（节气分界）</div>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { label: '年柱', gz: ec.getYear(), nayin: ec.getYearNaYin() },
                  { label: '月柱', gz: ec.getMonth(), nayin: ec.getMonthNaYin() },
                  { label: '日柱', gz: ec.getDay(), nayin: ec.getDayNaYin() },
                  { label: '时柱', gz: ec.getTime(), nayin: ec.getTimeNaYin() },
                ].map((p) => (
                  <div key={p.label} className="border border-[#e8dcc8] rounded p-3 bg-[#fdfaf3] text-center">
                    <div className="text-xs text-[#9a8b75] mb-1.5">{p.label}</div>
                    <div className="text-lg font-bold text-[#2c2416]">{p.gz}</div>
                    <div className="text-[10px] text-[#b8860b] mt-1">{p.nayin}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#b8a98f] mt-2.5">月柱以节为界（立春起寅月），时柱以子时为日界，与八字排盘口径一致。</p>
            </div>
          </div>
        )
      })()}

      {/* 节气年表 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-sm font-bold text-[#2c2416]">二十四节气年表</div>
          <select value={jieqiYear} onChange={(e) => { setJieqiYear(Number(e.target.value)); setJqList(null) }} className="px-2.5 py-1 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm">
            {Array.from({ length: 21 }, (_, i) => 2016 + i).map((yy) => <option key={yy} value={yy}>{yy}年</option>)}
          </select>
          <button onClick={runChart} className="px-3 py-1 bg-[#fdf8e8] border border-[#f0e0b8] text-[#b8860b] rounded text-sm hover:bg-[#f8eed4]">生成</button>
        </div>
        {jqList && jqList.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {jqList.map((j, i) => (
                <div key={i} className={`border rounded p-2.5 text-center ${j.isJie ? 'border-[#e8dcc8] bg-[#fdfaf3]' : 'border-[#f0e0b8] bg-[#fdf8e8]'}`}>
                  <div className={`text-sm font-bold ${j.isJie ? 'text-[#2c2416]' : 'text-[#b8860b]'}`}>{j.name}</div>
                  <div className="text-[10px] text-[#9a8b75] mt-1">{j.isJie ? '节' : '气'}</div>
                  <div className="text-[11px] text-[#5c4d3d] mt-0.5">{j.solar}</div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#b8a98f] mt-2.5">节（奇数位）为月之始、气（偶数位）居月中；八字月柱以节分界。</p>
          </>
        )}
      </div>

      {/* 生辰节气定位 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="text-sm font-bold text-[#2c2416] mb-1">生辰节气定位（八字月柱与节令）</div>
        <p className="text-[11px] text-[#9a8b75] mb-3">看生辰月柱由何节起始、距上下两节几何，理解"月柱以节分界"。</p>
        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">出生日期</div>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]" />
          </div>
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">出生时辰</div>
            <select value={birthHour} onChange={(e) => setBirthHour(Number(e.target.value))} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]">
              {HOURS.map((h, i) => <option key={h} value={i}>{h}</option>)}
            </select>
          </div>
        </div>
        {(() => {
          const [y, m, d] = birthDate.split('-').map(Number)
          const lunar = Solar.fromYmdHms(y, m, d, birthHour * 2, 0, 0).getLunar()
          const ec = lunar.getEightChar()
          const prevJie = lunar.getPrevJie()
          const nextJie = lunar.getNextJie()
          const birthSolar = Solar.fromYmdHms(y, m, d, birthHour * 2, 0, 0)
          const prevDays = birthSolar.subtract(prevJie.getSolar())
          const nextDays = nextJie.getSolar().subtract(birthSolar)
          return (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 bg-[#fdfaf3] border border-[#f0e7d8] rounded p-3">
                <span className="text-sm text-[#2c2416]">生辰：<b className="text-[#c0392b]">{birthDate}</b> {HOURS[birthHour].slice(0, 2)}</span>
                <span className="text-sm text-[#2c2416]">月柱 <b className="text-[#c0392b]">{ec.getMonth()}</b></span>
                <span className="text-xs text-[#9a8b75]">由<b className="text-[#b8860b]"> {prevJie.getName()}（{prevJie.getSolar().toYmd()}）</b>起，至<b className="text-[#b8860b]"> {nextJie.getName()}（{nextJie.getSolar().toYmd()}）</b>前止</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded bg-[#f5efe0] text-xs text-[#5c4d3d]">出生在 {prevJie.getName()} 后 <b className="text-[#c0392b]">{prevDays}</b> 天</span>
                <span className="px-3 py-1.5 rounded bg-[#f5efe0] text-xs text-[#5c4d3d]">距 {nextJie.getName()} 尚有 <b className="text-[#c0392b]">{nextDays}</b> 天</span>
                <span className="px-3 py-1.5 rounded bg-[#fdf8e8] text-xs text-[#b8860b]">四柱：{ec.getYear()} {ec.getMonth()} {ec.getDay()} {ec.getTime()}</span>
              </div>
            </div>
          )
        })()}
      </div>

      {/* 黄历速查联动 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-sm font-bold text-[#2c2416]">黄历速查</div>
          <input type="date" value={huangliDate} onChange={(e) => setHuangliDate(e.target.value)} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]" />
        </div>
        {(() => {
          const [y, m, d] = huangliDate.split('-').map(Number)
          const lunar = Solar.fromYmdHms(y, m, d, 12, 0, 0).getLunar()
          const yi = lunar.getDayYi() as string[]
          const ji = lunar.getDayJi() as string[]
          return (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 bg-[#fdf0ee] border border-[#e8dcc8] rounded text-lg font-bold text-[#c0392b]">{lunar.getDayInGanZhi()}</span>
                <span className="text-xs text-[#9a8b75]">冲 <b className="text-[#5c4d3d]">{lunar.getDayChongDesc()}</b> · 煞<b className="text-[#5c4d3d]"> {lunar.getDaySha()}</b></span>
                <span className="text-xs text-[#9a8b75]">农历 {lunar.getMonthInChinese()}月{lunar.getDayInChinese()}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <div className="text-xs font-bold text-[#2f6b4f] pt-1">宜：</div>
                {yi.map((x, i) => <span key={i} className="px-2 py-0.5 rounded bg-[#e3f0e6] text-[11px] text-[#2f6b4f]">{x}</span>)}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <div className="text-xs font-bold text-[#c0392b] pt-1">忌：</div>
                {ji.map((x, i) => <span key={i} className="px-2 py-0.5 rounded bg-[#fdeaea] text-[11px] text-[#c0392b]">{x}</span>)}
              </div>
              <button onClick={() => navTo('zeri')} className="px-3 py-1.5 bg-[#fdf8e8] border border-[#f0e0b8] text-[#b8860b] rounded text-sm hover:bg-[#f8eed4]">
                去择日模块看建除/吉时/评级详情 →
              </button>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
