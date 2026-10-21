import { useMemo, useState } from 'react'
import { HEXAGRAMS, BA_GUA, BA_GUA_SYMBOL, yaoLabel } from './yijingHexagram'
import { TUAN, DETAIL } from './yijingTuan'

const BA_GUA_DATA = [
  { name: '乾', symbol: '☰', nature: '天', virtue: '健', desc: '刚健中正，自强不息，君之象' },
  { name: '兑', symbol: '☱', nature: '泽', virtue: '悦', desc: '喜悦和悦，朋友讲习，少女之象' },
  { name: '离', symbol: '☲', nature: '火', virtue: '明', desc: '光明附丽，文明照物，中女之象' },
  { name: '震', symbol: '☳', nature: '雷', virtue: '动', desc: '震动奋发，恐惧修省，长男之象' },
  { name: '巽', symbol: '☴', nature: '风', virtue: '入', desc: '顺入谦逊，申命行事，长女之象' },
  { name: '坎', symbol: '☵', nature: '水', virtue: '险', desc: '险陷习坎，常德行教，中男之象' },
  { name: '艮', symbol: '☶', nature: '山', virtue: '止', desc: '静止安止，思不出位，少男之象' },
  { name: '坤', symbol: '☷', nature: '地', virtue: '顺', desc: '柔顺承载，厚德载物，母之象' },
]

const XU_GUA_GE = '乾坤屯蒙需讼师，比小畜兮履泰否；同人大有谦豫随，蛊临观兮噬嗑贲；剥复无妄大畜颐，大过坎离三十备；咸恒遁兮及大壮，晋与明夷家人睽；蹇解损益夬姤萃，升困井革鼎震继；艮渐归妹丰旅巽，兑涣节兮中孚至；小过既济兼未济，是为下经三十四。'

const YAO_DATA = [
  { pos: '初爻', meaning: '根基 · 初始', note: '主早年根基、内在下层、事之开端' },
  { pos: '二爻', meaning: '时机 · 配合', note: '主发展中段、居中位、得助力' },
  { pos: '三爻', meaning: '过程 · 变动', note: '主多事之秋、内外交界、须历练' },
  { pos: '四爻', meaning: '转折 · 外援', note: '主近君之位、转折关口、得贵人' },
  { pos: '五爻', meaning: '核心 · 成就', note: '主君位中枢、鼎盛阶段、掌大局' },
  { pos: '上爻', meaning: '结局 · 归宿', note: '主事之结果、晚景归宿、高处须慎' },
]

export function YijingLearnPanel() {
  const [tab, setTab] = useState<'basic' | 'hexagrams'>('basic')
  const [query, setQuery] = useState('')
  const [openNum, setOpenNum] = useState<number | null>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return HEXAGRAMS
    const q = query.trim()
    return HEXAGRAMS.filter(
      (h) => h.name.includes(q) || h.gua.includes(q) || h.meaning.includes(q) || h.daXiang.includes(q),
    )
  }, [query])

  return (
    <div className="space-y-4">
      {/* Tab 切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('basic')}
          className={`px-4 py-1.5 rounded text-sm ${tab === 'basic' ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d]'}`}
        >
          易经基础
        </button>
        <button
          onClick={() => setTab('hexagrams')}
          className={`px-4 py-1.5 rounded text-sm ${tab === 'hexagrams' ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d]'}`}
        >
          六十四卦总览
        </button>
      </div>

      {tab === 'basic' && (
        <div className="space-y-4">
          {/* 八卦卦象 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <h4 className="text-base font-bold text-[#2c2416] mb-3">八卦卦象</h4>
            <div className="grid grid-cols-4 gap-2.5">
              {BA_GUA_DATA.map((g) => (
                <div key={g.name} className="border border-[#e8dcc8] rounded p-2.5 text-center bg-[#fdfaf3]">
                  <div className="text-2xl">{g.symbol}</div>
                  <div className="text-sm font-bold text-[#2c2416] mt-1">{g.name} · {g.nature}</div>
                  <div className="text-[11px] text-[#b8860b]">德性：{g.virtue}</div>
                  <div className="text-[11px] text-[#9a8b75] mt-0.5">{g.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 卦序 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <h4 className="text-base font-bold text-[#2c2416] mb-2">六十四卦卦序</h4>
            <p className="text-sm text-[#5c4d3d] leading-relaxed">{XU_GUA_GE}</p>
            <p className="text-xs text-[#9a8b75] mt-2">上经三十卦自乾坤始，下经三十四卦以咸恒为开、既济未济为终，明盛衰往复之道。</p>
          </div>

          {/* 爻位 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <h4 className="text-base font-bold text-[#2c2416] mb-3">爻位含义</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {YAO_DATA.map((y) => (
                <div key={y.pos} className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                  <div className="text-sm font-bold text-[#b8860b]">{y.pos} · {y.meaning}</div>
                  <div className="text-xs text-[#5c4d3d] mt-1">{y.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 起卦法 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <h4 className="text-base font-bold text-[#2c2416] mb-2">常见起卦法</h4>
            <div className="space-y-2 text-sm text-[#5c4d3d] leading-relaxed">
              <p><b className="text-[#2c2416]">年月日时法（本平台推命用）：</b>年支序 + 农历月 + 日，和除八余数定上卦；再加时支序除八定下卦；同和除六定动爻。</p>
              <p><b className="text-[#2c2416]">金钱卦法：</b>三枚铜钱掷六次，一背二背三背定爻之阴阳，三背为动爻；自下而上成卦。</p>
              <p><b className="text-[#2c2416]">数字起卦法：</b>任意两数除八定上下卦，两数和除六定动爻；亦可以笔画数、时间数起。</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'hexagrams' && (
        <div className="space-y-4">
          {/* 搜索 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索卦名 / 卦辞 / 大象，如 乾、元亨、自强不息…"
              className="w-full px-3 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416] focus:border-[#b8860b]"
            />
          </div>

          <div className="text-xs text-[#9a8b75]">共 {filtered.length} 卦</div>

          {/* 卦卡 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filtered.map((h) => (
              <div key={h.num} className="border border-[#e8dcc8] rounded-lg p-3 bg-white hover:border-[#b8860b] transition-colors cursor-pointer" onClick={() => setOpenNum(openNum === h.num ? null : h.num)}>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#9a8b75]">{h.num}.</span>
                  <span className="text-sm font-bold text-[#2c2416]">{h.name}卦</span>
                  <span className="text-sm">{BA_GUA_SYMBOL[h.upper]}{BA_GUA_SYMBOL[h.lower]}</span>
                </div>
                <div className="text-[11px] text-[#b8860b] mt-0.5">{h.meaning}</div>
                <div className="text-[11px] text-[#9a8b75] mt-1">{BA_GUA[h.upper]}上{BA_GUA[h.lower]}下</div>
                {openNum === h.num && (
                  <div className="mt-2 pt-2 border-t border-[#f0e7d8] text-xs text-[#5c4d3d] space-y-1.5">
                    <p><span className="text-[#b8860b] font-medium">卦辞：</span>{h.gua}</p>
                    <p><span className="text-[#b8860b] font-medium">彖传：</span>{TUAN[h.num - 1]}</p>
                    <p><span className="text-[#b8860b] font-medium">大象：</span>{h.daXiang}</p>
                    <p className="bg-[#fdfaf3] border border-[#f0e7d8] rounded p-2">
                      <span className="text-[#b8860b] font-medium">卦意详解：</span>{DETAIL[h.num - 1]}
                    </p>
                    <div className="mt-1.5 pt-1.5 border-t border-[#f5efe0]">
                      <div className="text-[#b8860b] font-medium mb-1">六爻爻辞</div>
                      {h.yaos.map((y, i) => {
                        const TRIGRAM: Record<string, [number, number, number]> = {
                          乾: [1, 1, 1], 兑: [1, 1, 0], 离: [1, 0, 1], 震: [1, 0, 0],
                          巽: [0, 1, 1], 坎: [0, 1, 0], 艮: [0, 0, 1], 坤: [0, 0, 0],
                        }
                        const lo = TRIGRAM[h.lower]
                        const up = TRIGRAM[h.upper]
                        const all = [...lo, ...up]
                        return (
                          <p key={i} className="leading-relaxed">
                            <span className="text-[#2c2416] font-medium">{yaoLabel(all, i)}：</span>{y}
                          </p>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
