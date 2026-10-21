import { useState } from 'react'
import { GUA_POSITION, CLOCKWISE, NUM_TO_GUA, STAR_INFO, YOU_NIAN_TABLE, BA_ZHAI, BAZHAI_KNOWLEDGE } from './bazhaiKnowledge'

// 命卦（三元命）：男命 (100-年)%9，女命 (年-4)%9，余0作9
function calcMingGua(year: number, gender: '男' | '女'): { num: number; gua: string; name: string; wuxing: string; eastWest: '东四' | '西四'; note: string } {
  const y = year % 100
  let num = gender === '男' ? (100 - y) % 9 : ((y - 4) % 9 + 9) % 9
  if (num === 0) num = 9
  const info = NUM_TO_GUA[num]
  const gua = info.gua || (gender === '男' ? '坤' : '艮')
  const name = gua + '命'
  return { num, gua, name, wuxing: info.wuxing, eastWest: info.eastWest, note: num === 5 ? `中宫五黄，${gender}命寄${gua}（${info.eastWest}）` : `${info.guaName}，${info.eastWest}命` }
}

// 游年布星：伏位卦（命卦/坐山）→ 8 方位吉凶星（查表）
function youNian(gua: string): { gua: string; pos: string; star: string; ji: '吉' | '凶'; wuxing: string; note: string }[] {
  const row = YOU_NIAN_TABLE[gua + '宅']
  return CLOCKWISE.map((g) => {
    const star = row[g]
    return { gua: g, pos: GUA_POSITION[g], star, ji: STAR_INFO[star].ji, wuxing: STAR_INFO[star].wuxing, note: STAR_INFO[star].note }
  })
}

const JI_COLOR: Record<string, string> = {
  吉: 'bg-[#e3f0e6] border-[#b5d6bd] text-[#2f6b4f]',
  凶: 'bg-[#fdeaea] border-[#e8b8b8] text-[#c0392b]',
}

export function BazhaiPanel() {
  const [tab, setTab] = useState<'chart' | 'learn'>('chart')
  const [year, setYear] = useState(1990)
  const [gender, setGender] = useState<'男' | '女'>('男')
  const [zhai, setZhai] = useState('乾宅')

  if (tab === 'learn') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setTab('chart')} className="px-4 py-1.5 bg-[#f0e7d8] text-[#5c4d3d] rounded text-sm hover:bg-[#e8dcc8]">宅命推算</button>
          <button onClick={() => setTab('learn')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">学习知识</button>
        </div>
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h3 className="text-base font-bold text-[#2c2416] mb-3">八宅明镜 · 基础知识</h3>
          <div className="space-y-2.5">
            {BAZHAI_KNOWLEDGE.map((k, i) => (
              <div key={i} className="border border-[#e8dcc8] rounded p-3 bg-[#fdfaf3]">
                <div className="text-sm font-bold text-[#c0392b]">{k.title}</div>
                <p className="text-xs text-[#5c4d3d] mt-1 leading-relaxed">{k.content}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">注：八宅各家算法略有差异（命卦取岁/取年支、中宫寄宫），此处取通行口径，供研习验证。</p>
        </div>
      </div>
    )
  }

  const ming = calcMingGua(year, gender)
  const mingStars = youNian(ming.gua)
  const zhaiInfo = BA_ZHAI[zhai]
  const zhaiStars = youNian(zhai[0])

  // 3x3 方位图布局
  const gridMap: Record<string, { g: string; star: string } | null> = {
    '0,0': { g: '乾', star: '' }, '0,1': { g: '坎', star: '' }, '0,2': { g: '艮', star: '' },
    '1,0': { g: '兑', star: '' }, '1,1': null, '1,2': { g: '震', star: '' },
    '2,0': { g: '坤', star: '' }, '2,1': { g: '离', star: '' }, '2,2': { g: '巽', star: '' },
  }
  mingStars.forEach((m) => {
    const [row, col] = (Object.entries(gridMap).find(([, v]) => v && v.g === m.gua)?.[0] || '').split(',').map(Number)
    if (gridMap[`${row},${col}`]) gridMap[`${row},${col}`]!.star = m.star
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTab('chart')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">宅命推算</button>
        <button onClick={() => setTab('learn')} className="px-4 py-1.5 bg-[#f0e7d8] text-[#5c4d3d] rounded text-sm hover:bg-[#e8dcc8]">学习知识</button>
      </div>

      {/* 表单 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <h3 className="text-base font-bold text-[#2c2416] mb-3">宅命推算（八宅明镜）</h3>
        <p className="text-xs text-[#9a8b75] mb-3">出生年定命卦（东四/西四命），坐向定宅卦（东四/西四宅），宅命相配论吉凶。</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">出生年</div>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28 px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]" />
          </div>
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">性别</div>
            <div className="flex gap-2">
              {(['男', '女'] as const).map((g) => (
                <button key={g} onClick={() => setGender(g)} className={`px-4 py-1.5 rounded text-sm ${gender === g ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d]'}`}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">宅坐向</div>
            <select value={zhai} onChange={(e) => setZhai(e.target.value)} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]">
              {Object.entries(BA_ZHAI).map(([k, v]) => <option key={k} value={k}>{k}（{v.zuo}{v.chao}·{v.eastWest}）</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 命卦 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="text-sm font-bold text-[#2c2416] mb-2">命卦（三元命）</div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl font-bold text-[#c0392b]">{ming.name}</span>
          <span className={`px-2.5 py-1 rounded text-white text-sm ${ming.eastWest === '东四' ? 'bg-[#2f6b4f]' : 'bg-[#8a6d3b]'}`}>{ming.eastWest}命</span>
          <span className="text-xs text-[#5c4d3d]">命卦数 {ming.num} · 五行{ming.wuxing} · {ming.note}</span>
        </div>
        <p className="text-[11px] text-[#9a8b75] mt-2">
          宜配{ming.eastWest === '东四' ? '坎离震巽' : '乾坤艮兑'}宅（{ming.eastWest}宅），吉方为{ming.eastWest === '东四' ? '北、南、东、东南' : '西北、西南、东北、西'}。
        </p>
      </div>

      {/* 命卦吉凶方位图 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="text-sm font-bold text-[#2c2416] mb-2">命卦吉凶方位图（{ming.name}）</div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="grid grid-cols-3 gap-1.5 w-full md:w-72 shrink-0">
            {[0, 1, 2].map((r) => [0, 1, 2].map((c) => {
              const cell = gridMap[`${r},${c}`]
              if (!cell) return <div key={`${r}${c}`} className="flex items-center justify-center rounded bg-[#fdfaf3] border border-[#e8dcc8] text-lg font-bold text-[#2c2416] py-6">宅心</div>
              const info = STAR_INFO[cell.star]
              return (
                <div key={`${r}${c}`} className={`rounded border p-1.5 text-center ${info ? JI_COLOR[info.ji] : 'bg-[#fdfaf3] border-[#e8dcc8]'}`}>
                  <div className="text-[10px] text-[#9a8b75]">{GUA_POSITION[cell.g]}·{cell.g}</div>
                  <div className="text-sm font-bold text-[#2c2416]">{cell.star}</div>
                  <div className="text-[9px] text-[#9a8b75]">{info ? `${info.star}${info.wuxing}星` : ''}</div>
                </div>
              )
            }))}
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2 content-start">
            {mingStars.map((m, i) => {
              const info = STAR_INFO[m.star]
              return (
                <div key={i} className={`rounded border p-2 ${JI_COLOR[info.ji]}`}>
                  <div className="text-xs font-bold text-[#2c2416]">{m.pos}·{m.gua} · <span className={info.ji === '吉' ? 'text-[#2f6b4f]' : 'text-[#c0392b]'}>{m.star}</span></div>
                  <div className="text-[10px] text-[#5c4d3d] mt-0.5">{info.star}（{info.wuxing}）· {info.note}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 宅卦吉凶 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="text-sm font-bold text-[#2c2416] mb-2">宅卦吉凶（{zhai} · {zhaiInfo.zuo}{zhaiInfo.chao} · {zhaiInfo.eastWest}宅）</div>
        <div className={`px-3 py-2 rounded text-sm mb-3 ${ming.eastWest === zhaiInfo.eastWest ? 'bg-[#e3f0e6] text-[#2f6b4f]' : 'bg-[#fdeaea] text-[#c0392b]'}`}>
          {ming.eastWest === zhaiInfo.eastWest ? `宅命相配（${ming.eastWest}命配${zhaiInfo.eastWest}宅）——相合为吉，宜居。` : `宅命不配（${ming.eastWest}命配${zhaiInfo.eastWest}宅）——宜取宅之吉方为用，或改门向调之。`}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {zhaiStars.map((m, i) => {
            const info = STAR_INFO[m.star]
            return (
              <div key={i} className={`rounded border p-2 ${JI_COLOR[info.ji]}`}>
                <div className="text-xs font-bold text-[#2c2416]">{m.pos}·{m.star}</div>
                <div className="text-[10px] text-[#5c4d3d] mt-0.5">{info.star}{info.wuxing} · {info.note}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 八宅游年速查 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4 overflow-x-auto">
        <div className="text-sm font-bold text-[#2c2416] mb-2">八宅游年速查表（坐山 → 八卦方位吉凶星）</div>
        <table className="w-full text-xs border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-[#f0e7d8]">
              <th className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">宅</th>
              {CLOCKWISE.map((g) => <th key={g} className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">{GUA_POSITION[g]}·{g}</th>)}
            </tr>
          </thead>
          <tbody>
            {['乾宅', '坎宅', '艮宅', '震宅', '巽宅', '离宅', '坤宅', '兑宅'].map((z) => {
              const stars = youNian(z[0])
              return (
                <tr key={z} className={z === zhai ? 'bg-[#fdf0ee]' : 'bg-white'}>
                  <td className="border border-[#e8dcc8] px-2 py-1.5 font-bold text-[#c0392b]">{z}</td>
                  {stars.map((s, i) => (
                    <td key={i} className={`border border-[#e8dcc8] px-2 py-1.5 text-center ${STAR_INFO[s.star].ji === '吉' ? 'text-[#2f6b4f]' : 'text-[#c0392b]'}`}>{s.star}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="text-[10px] text-[#b8a98f] mt-2">歌诀：乾六天五祸绝延生 · 坎五天生延绝祸六 · 艮六绝祸生延天五 · 震延生祸绝五天六 · 巽天五六祸生绝延 · 离六五绝延祸生天 · 坤天延绝生祸五六 · 兑生祸延绝六五天</p>
      </div>
    </div>
  )
}
