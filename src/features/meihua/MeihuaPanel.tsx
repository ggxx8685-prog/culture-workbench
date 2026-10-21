import { useState } from 'react'
// @ts-ignore lunar-javascript 无类型声明
import { Solar } from 'lunar-javascript'
import { TRIGRAM, HEXAGRAM_NAMES, SHENG, KE, TI_YONG, MEIHUA_KNOWLEDGE } from './meihuaKnowledge'

const ZHI_NUM: Record<string, number> = { 子: 1, 丑: 2, 寅: 3, 卯: 4, 辰: 5, 巳: 6, 午: 7, 未: 8, 申: 9, 酉: 10, 戌: 11, 亥: 12 }
const SHI_NUM: Record<string, number> = { 子: 1, 丑: 2, 寅: 3, 卯: 4, 辰: 5, 巳: 6, 午: 7, 未: 8, 申: 9, 酉: 10, 戌: 11, 亥: 12 }
const HOURS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 三爻（从下到上：1=阳 0=阴）
const YAO: Record<number, number[]> = {
  1: [1, 1, 1], 2: [1, 1, 0], 3: [0, 1, 1], 4: [1, 0, 0], 5: [0, 0, 1], 6: [0, 1, 0], 7: [0, 0, 0], 8: [1, 0, 1],
}
// 反向：三爻 → 卦数
const GUA_FROM_YAO: Record<string, number> = {
  '111': 1, '110': 2, '011': 3, '100': 4, '001': 5, '010': 6, '000': 7, '101': 8,
}

interface GuaResult {
  shang: number
  xia: number
  name: string
  dongYao: number | null // 1-6（自下而上），null 表示该卦无动爻
}

// 六爻卦
function buildHex(shang: number, xia: number, dongYao: number | null): { yao: number[]; dongIndex: number | null } {
  const lines = [...YAO[xia], ...YAO[shang]] // 1-6 自下而上
  let dongIndex: number | null = null
  if (dongYao) {
    const idx = dongYao - 1
    lines[idx] = lines[idx] === 1 ? 0 : 1
    dongIndex = idx
  }
  return { yao: lines, dongIndex }
}

// 变卦：由六爻重定上下卦
function bianGua(yao: number[]): { shang: number; xia: number; name: string } {
  const xia = GUA_FROM_YAO[yao.slice(0, 3).join('')]
  const shang = GUA_FROM_YAO[yao.slice(3, 6).join('')]
  return { shang, xia, name: HEXAGRAM_NAMES[shang][xia] }
}

// 互卦：主卦（未变）二三四爻下互、三四五爻上互
function huGua(yao: number[]): { shang: number; xia: number; name: string } {
  const xia = GUA_FROM_YAO[yao.slice(1, 4).join('')]
  const shang = GUA_FROM_YAO[yao.slice(2, 5).join('')]
  return { shang, xia, name: HEXAGRAM_NAMES[shang][xia] }
}

export function MeihuaPanel() {
  const [tab, setTab] = useState<'chart' | 'learn'>('chart')
  const [method, setMethod] = useState<'time' | 'num'>('time')
  const [date, setDate] = useState('2026-10-19')
  const [hour, setHour] = useState(6)
  const [numA, setNumA] = useState(3)
  const [numB, setNumB] = useState(5)
  const [result, setResult] = useState<null | {
    source: string
    zhu: GuaResult
    hu: GuaResult
    bian: GuaResult
    ti: { gua: number; wuxing: string }
    yong: { gua: number; wuxing: string }
    tiYong: string
    verdict: { ji: '吉' | '凶' | '平'; text: string }
    lines: number[]
  }>(null)

  if (tab === 'learn') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setTab('chart')} className="px-4 py-1.5 bg-[#f0e7d8] text-[#5c4d3d] rounded text-sm hover:bg-[#e8dcc8]">起卦推演</button>
          <button onClick={() => setTab('learn')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">学习知识</button>
        </div>
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h3 className="text-base font-bold text-[#2c2416] mb-3">梅花易数 · 基础知识</h3>
          <div className="space-y-2.5">
            {MEIHUA_KNOWLEDGE.map((k, i) => (
              <div key={i} className="border border-[#e8dcc8] rounded p-3 bg-[#fdfaf3]">
                <div className="text-sm font-bold text-[#c0392b]">{k.title}</div>
                <p className="text-xs text-[#5c4d3d] mt-1 leading-relaxed">{k.content}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">注：起卦断卦各家略有差异（年数取法/旺衰参断），此处取《梅花易数》通行口径，供研习验证。</p>
        </div>
      </div>
    )
  }

  const runGua = () => {
    let shangNum: number, xiaNum: number, dong: number, source: string
    if (method === 'time') {
      const [y, m, d] = date.split('-').map(Number)
      const lunar = Solar.fromYmdHms(y, m, d, hour * 2, 0, 0).getLunar()
      const yearZhi = lunar.getYearInGanZhi().slice(1, 2)
      const nian = ZHI_NUM[yearZhi] || 1
      const yue = lunar.getMonth()
      const ri = lunar.getDay()
      const shi = SHI_NUM[HOURS[hour]]
      shangNum = (nian + yue + ri) % 8 || 8
      xiaNum = (nian + yue + ri + shi) % 8 || 8
      dong = (nian + yue + ri + shi) % 6 || 6
      source = `时间起卦：${y}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}日${HOURS[hour]}时（${nian}+${yue}+${ri}+${shi}）`
    } else {
      const a = Math.abs(numA) || 1
      const b = Math.abs(numB) || 1
      shangNum = a % 8 || 8
      xiaNum = b % 8 || 8
      dong = (a + b) % 6 || 6
      source = `数字起卦：${a}、${b}（上卦${a}÷8余${shangNum}，下卦${b}÷8余${xiaNum}，动爻${a + b}÷6余${dong}）`
    }
    // 主卦（动爻在上卦则用=上，体=下）
    const dongInShang = dong >= 4
    const tiGua = dongInShang ? xiaNum : shangNum
    const yongGua = dongInShang ? shangNum : xiaNum
    // 六爻（自下而上 1-6），动爻即 dong
    const zhuLines = [...YAO[xiaNum], ...YAO[shangNum]]
    const hu = huGua(zhuLines)
    const bian = bianGua(zhuLines.map((l, i) => (i === dong - 1 ? (l === 1 ? 0 : 1) : l)))
    const tiWx = TRIGRAM[tiGua].wuxing as '木' | '火' | '土' | '金' | '水'
    const yongWx = TRIGRAM[yongGua].wuxing as '木' | '火' | '土' | '金' | '水'
    let tiYong: string
    if (tiWx === yongWx) tiYong = '比和'
    else if (SHENG[yongWx] === tiWx) tiYong = '用生体'
    else if (SHENG[tiWx] === yongWx) tiYong = '体生用'
    else if (KE[tiWx] === yongWx) tiYong = '体克用'
    else tiYong = '用克体'
    setResult({
      source,
      zhu: { shang: shangNum, xia: xiaNum, name: HEXAGRAM_NAMES[shangNum][xiaNum], dongYao: dong },
      hu: { shang: hu.shang, xia: hu.xia, name: hu.name, dongYao: null },
      bian: { shang: bian.shang, xia: bian.xia, name: bian.name, dongYao: null },
      ti: { gua: tiGua, wuxing: tiWx },
      yong: { gua: yongGua, wuxing: yongWx },
      tiYong,
      verdict: TI_YONG[tiYong],
      lines: zhuLines,
    })
  }

  const GuaCard = ({ label, g, highlight }: { label: string; g: { shang: number; xia: number; name: string; dongYao: number | null }; highlight?: boolean }) => {
    const hex = buildHex(g.shang, g.xia, g.dongYao)
    return (
      <div className={`rounded-lg border p-3 ${highlight ? 'border-2 border-[#c0392b] bg-[#fdf0ee]' : 'border-[#e8dcc8] bg-[#fdfaf3]'}`}>
        <div className="text-[11px] text-[#9a8b75]">{label}</div>
        <div className="text-base font-bold text-[#2c2416] mt-0.5">{g.name}</div>
        <div className="flex gap-1 mt-2">
          {hex.yao.map((l, i) => (
            <div key={i} className={`w-3.5 text-center text-sm ${hex.dongIndex === i ? 'text-[#c0392b] font-bold' : 'text-[#2c2416]'}`}>
              {l === 1 ? '⚊' : '⚋'}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-[#9a8b75] mt-1.5">上 {TRIGRAM[g.shang].name}·下 {TRIGRAM[g.xia].name}{g.dongYao ? ` · ${g.dongYao}爻动` : ''}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTab('chart')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">起卦推演</button>
        <button onClick={() => setTab('learn')} className="px-4 py-1.5 bg-[#f0e7d8] text-[#5c4d3d] rounded text-sm hover:bg-[#e8dcc8]">学习知识</button>
      </div>

      {/* 起卦表单 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <h3 className="text-base font-bold text-[#2c2416] mb-3">梅花易数起卦</h3>
        <div className="flex gap-2 mb-3">
          {([['time', '时间起卦'], ['num', '数字起卦']] as const).map(([k, v]) => (
            <button key={k} onClick={() => setMethod(k)} className={`px-4 py-1.5 rounded text-sm ${method === k ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d]'}`}>{v}</button>
          ))}
        </div>
        {method === 'time' ? (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <div className="text-xs text-[#9a8b75] mb-1">日期</div>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]" />
            </div>
            <div>
              <div className="text-xs text-[#9a8b75] mb-1">时辰</div>
              <select value={hour} onChange={(e) => setHour(Number(e.target.value))} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]">
                {HOURS.map((h, i) => <option key={h} value={i}>{h}时</option>)}
              </select>
            </div>
            <button onClick={runGua} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm hover:bg-[#a93226]">起卦</button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <div className="text-xs text-[#9a8b75] mb-1">第一个数（上卦）</div>
              <input type="number" value={numA} onChange={(e) => setNumA(Number(e.target.value))} className="w-24 px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]" />
            </div>
            <div>
              <div className="text-xs text-[#9a8b75] mb-1">第二个数（下卦）</div>
              <input type="number" value={numB} onChange={(e) => setNumB(Number(e.target.value))} className="w-24 px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]" />
            </div>
            <button onClick={runGua} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm hover:bg-[#a93226]">起卦</button>
          </div>
        )}
        {result && <p className="text-[11px] text-[#9a8b75] mt-3">{result.source}</p>}
      </div>

      {/* 卦象 */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <GuaCard label="主卦（本卦）" g={result.zhu} highlight />
            <GuaCard label="互卦（事之过程）" g={result.hu} />
            <GuaCard label="变卦（事之结果）" g={result.bian} />
          </div>

          {/* 体用分析 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="text-sm font-bold text-[#2c2416] mb-2">体用分析</div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1.5 rounded bg-[#f0e7d8] text-sm text-[#2c2416]">体卦 <b className="text-[#c0392b]">{TRIGRAM[result.ti.gua].name}</b>（{result.ti.wuxing}）</span>
              <span className="text-[#9a8b75]">{TRIGRAM[result.ti.gua].name}为体、{TRIGRAM[result.yong.gua].name}为用</span>
              <span className="px-3 py-1.5 rounded bg-[#f0e7d8] text-sm text-[#2c2416]">用卦 <b className="text-[#c0392b]">{TRIGRAM[result.yong.gua].name}</b>（{result.yong.wuxing}）</span>
            </div>
            <div className={`px-3 py-2.5 rounded text-sm ${result.verdict.ji === '吉' ? 'bg-[#e3f0e6] text-[#2f6b4f]' : result.verdict.ji === '凶' ? 'bg-[#fdeaea] text-[#c0392b]' : 'bg-[#fdf8e8] text-[#8a6d3b]'}`}>
              <b>{result.tiYong}</b>（{result.verdict.ji}）· {result.verdict.text}
            </div>
          </div>

          {/* 六爻详列 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="text-sm font-bold text-[#2c2416] mb-2">主卦六爻（自下而上）</div>
            <div className="flex gap-2">
              {result.lines.map((l, i) => (
                <div key={i} className={`px-2.5 py-2 rounded border text-center ${result.zhu.dongYao !== null && i === result.zhu.dongYao - 1 ? 'border-[#c0392b] bg-[#fdf0ee]' : 'border-[#e8dcc8] bg-[#fdfaf3]'}`}>
                  <div className="text-[10px] text-[#9a8b75]">第{i + 1}爻</div>
                  <div className="text-lg font-bold text-[#2c2416]">{l === 1 ? '⚊' : '⚋'}</div>
                  {result.zhu.dongYao !== null && i === result.zhu.dongYao - 1 && <div className="text-[10px] text-[#c0392b] font-bold">动</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
