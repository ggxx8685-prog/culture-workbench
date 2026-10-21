import { useState } from 'react'
import { QI_ORDER, QI_BY_SEQ, GAN_YUN, ZHI_SITIAN, ZHU_QI, WUQI_KNOWLEDGE } from './wuqiKnowledge'

// 年干支
function yearGanZhi(year: number): string {
  return '甲乙丙丁戊己庚辛壬癸'[(year - 4) % 10] + '子丑寅卯辰巳午未申酉戌亥'[(year - 4) % 12]
}

// 司天对在泉（六气相对，相隔三气）：厥阴↔少阳、少阴↔阳明、太阴↔太阳
const DUI_GONG: Record<number, number> = { 1: 4, 2: 5, 3: 6, 4: 1, 5: 2, 6: 3 }

// 客气序：第 k 气 = ((司天序 + k - 4) mod 6 + 6) mod 6 + 1

const WX_COLOR: Record<string, string> = {
  木: 'bg-[#2f6b4f]', 火: 'bg-[#c0392b]', 土: 'bg-[#b8860b]', 金: 'bg-[#8a6d3b]', 水: 'bg-[#2c5f8a]',
}

export function WuqiPanel() {
  const [year, setYear] = useState(2026)
  const [tab, setTab] = useState<'chart' | 'learn'>('chart')

  if (tab === 'learn') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setTab('chart')} className="px-4 py-1.5 bg-[#f0e7d8] text-[#5c4d3d] rounded text-sm hover:bg-[#e8dcc8]">运气推演</button>
          <button onClick={() => setTab('learn')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">学习知识</button>
        </div>
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h3 className="text-base font-bold text-[#2c2416] mb-3">五运六气 · 基础知识</h3>
          <div className="space-y-2.5">
            {WUQI_KNOWLEDGE.map((k, i) => (
              <div key={i} className="border border-[#e8dcc8] rounded p-3 bg-[#fdfaf3]">
                <div className="text-sm font-bold text-[#c0392b]">{k.title}</div>
                <p className="text-xs text-[#5c4d3d] mt-1 leading-relaxed">{k.content}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">注：运气学说各家推演略有差异（岁首口径/客气排法），此处取《素问》通行口径，供研习验证。</p>
        </div>
      </div>
    )
  }

  const gz = yearGanZhi(year)
  const gan = gz[0]
  const zhi = gz[1]
  const yun = GAN_YUN[gan]
  const siTian = ZHI_SITIAN[zhi]
  const s = siTian.seq
  const zaiQuan = DUI_GONG[s]
  // 客气六步
  const keQi = [1, 2, 3, 4, 5, 6].map((k) => {
    const seq = ((s + k - 4) % 6 + 6) % 6 + 1
    return { step: ['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'][k - 1], ...QI_BY_SEQ[seq], seq, siTian: seq === s, zaiQuan: seq === zaiQuan }
  })
  // 天符/岁会简注
  const tianFu = yun.wuxing === QI_BY_SEQ[s].wuxing
  const wuxingOfZhi: Record<string, string> = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' }
  const suiHui2 = yun.wuxing === wuxingOfZhi[zhi]

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTab('chart')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">运气推演</button>
        <button onClick={() => setTab('learn')} className="px-4 py-1.5 bg-[#f0e7d8] text-[#5c4d3d] rounded text-sm hover:bg-[#e8dcc8]">学习知识</button>
      </div>

      {/* 年份选择 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <h3 className="text-base font-bold text-[#2c2416] mb-3">五运六气推演 · {year}年</h3>
        <p className="text-xs text-[#9a8b75] mb-3">以年干定五运（太过不及）、年支定六气（司天在泉），推当年运气格局。</p>
        <div className="flex items-center gap-2">
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28 px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]" />
          <span className="text-lg font-bold text-[#c0392b]">{gz}年</span>
        </div>
      </div>

      {/* 五运 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="text-sm font-bold text-[#2c2416] mb-2">五运（中运）</div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1.5 rounded bg-[#fdf8e8] border border-[#f0e0b8] text-sm font-bold text-[#b8860b]">{yun.yun} · {yun.guo}</span>
          <span className={`px-2 py-0.5 rounded text-white text-xs ${WX_COLOR[yun.wuxing]}`}>{yun.wuxing}</span>
          <span className="text-xs text-[#5c4d3d]">{gan}年干化{yun.wuxing}运，{yun.guo}</span>
        </div>
      </div>

      {/* 司天在泉 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <div className="text-sm font-bold text-[#2c2416] mb-2">司天（主上半年）</div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-white text-xs ${WX_COLOR[QI_BY_SEQ[s].wuxing]}`}>{QI_BY_SEQ[s].wuxing}</span>
            <span className="text-base font-bold text-[#c0392b]">{siTian.name}</span>
          </div>
          <p className="text-[11px] text-[#9a8b75] mt-2">三之气位 · {QI_BY_SEQ[s].note}</p>
        </div>
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <div className="text-sm font-bold text-[#2c2416] mb-2">在泉（主下半年）</div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-white text-xs ${WX_COLOR[QI_BY_SEQ[zaiQuan].wuxing]}`}>{QI_BY_SEQ[zaiQuan].wuxing}</span>
            <span className="text-base font-bold text-[#c0392b]">{QI_BY_SEQ[zaiQuan].name}</span>
          </div>
          <p className="text-[11px] text-[#9a8b75] mt-2">终之气位 · {QI_BY_SEQ[zaiQuan].note}</p>
        </div>
      </div>

      {/* 六步气 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="text-sm font-bold text-[#2c2416] mb-2">六步客气（加临主气）</div>
        <p className="text-[11px] text-[#9a8b75] mb-3">客气自初之气起按三阴三阳序排列，司天在三之气、在泉在终之气。</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {keQi.map((k, i) => {
            const zhu = QI_BY_SEQ[ZHU_QI[i].seq]
            const keInfo = QI_ORDER.find((q) => q.seq === k.seq)
            return (
              <div key={i} className={`border rounded p-2.5 text-center ${k.siTian ? 'border-2 border-[#c0392b] bg-[#fdf0ee]' : k.zaiQuan ? 'border-2 border-[#b8860b] bg-[#fdf8e8]' : 'border-[#e8dcc8] bg-[#fdfaf3]'}`}>
                <div className="text-[10px] text-[#9a8b75]">{k.step}{k.siTian ? '（司天）' : k.zaiQuan ? '（在泉）' : ''}</div>
                <div className="text-sm font-bold text-[#2c2416]">{k.name}</div>
                <div className="text-[10px] text-[#b8860b] mt-0.5">客气{keInfo?.yinyang}</div>
                <div className="text-[10px] text-[#9a8b75] mt-0.5">主气 {zhu.name}</div>
                <div className="text-[10px] text-[#5c4d3d] mt-0.5">{ZHU_QI[i].range}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 运气简析 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="text-sm font-bold text-[#2c2416] mb-2">运气简析</div>
        <div className="space-y-2 text-xs text-[#5c4d3d] leading-relaxed">
          <p>① 岁运：<b className="text-[#c0392b]">{yun.yun}{yun.guo}</b>——{yun.guo === '太过' ? '本气偏盛，所胜之脏腑受克，防其亢而为害' : '本气不足，所不胜之气易乘，宜扶助本气'}。</p>
          <p>② 司天在泉：<b className="text-[#c0392b]">{siTian.name}</b>司天（上半年）、<b className="text-[#c0392b]">{QI_BY_SEQ[zaiQuan].name}</b>在泉（下半年）——{QI_BY_SEQ[s].note}、{QI_BY_SEQ[zaiQuan].note}。</p>
          <p>③ {tianFu ? <b className="text-[#c0392b]">中运与司天同气，为"天符"之年，气化偏盛而专一。</b> : <b>中运与司天不同气</b>}{suiHui2 ? <>；中运与岁支同气，为<b className="text-[#c0392b]">"岁会"</b>之年。</> : ''}</p>
          <p>④ 客主加临：{keQi.map((k) => `${k.step}${k.name}`).join(' / ')}——以客气加临主气，同气相得为顺，客主相克处防其气变（简析口径）。</p>
        </div>
        <p className="text-[10px] text-[#b8a98f] mt-3">注：此为《素问》通行推法，运气学理尚有南北政、五运三纪、六气胜复诸说，供研习验证。</p>
      </div>
    </div>
  )
}
