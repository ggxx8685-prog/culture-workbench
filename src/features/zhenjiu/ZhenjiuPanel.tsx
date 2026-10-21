import { useState } from 'react'
import { MERIDIANS, REN_DU, WU_SHU, TE_DING, ZHENJIU_KNOWLEDGE } from './zhenjiuKnowledge'

const ALL_MERIDIANS = [...MERIDIANS, ...REN_DU]
const ALL_POINTS = ALL_MERIDIANS.flatMap((m) => m.points.map((p) => ({ ...p, meridian: m.name })))

export function ZhenjiuPanel() {
  const [tab, setTab] = useState<'meridian' | 'point' | 'teding' | 'learn'>('meridian')
  const [sel, setSel] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [searchResult, setSearchResult] = useState<null | { name: string; meridian: string; loc: string; zhu: string }[]>(null)

  if (tab === 'learn') {
    return (
      <div className="space-y-4">
        <TabBar tab={tab} setTab={setTab} />
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h3 className="text-base font-bold text-[#2c2416] mb-3">针灸 · 基础知识</h3>
          <div className="space-y-2.5">
            {ZHENJIU_KNOWLEDGE.map((k, i) => (
              <div key={i} className="border border-[#e8dcc8] rounded p-3 bg-[#fdfaf3]">
                <div className="text-sm font-bold text-[#c0392b]">{k.title}</div>
                <p className="text-xs text-[#5c4d3d] mt-1 leading-relaxed">{k.content}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">注：穴位定位与主治取针灸学通行教材口径，各家略有差异；针灸须专业医师操作，本内容仅供研习。定位文字示例含"蠹沟"，正确写法为"蠡沟"。</p>
        </div>
      </div>
    )
  }

  if (tab === 'teding') {
    return (
      <div className="space-y-4">
        <TabBar tab={tab} setTab={setTab} />
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h3 className="text-base font-bold text-[#2c2416] mb-3">特定穴速查</h3>
          <div className="space-y-3">
            {TE_DING.map((t, i) => (
              <div key={i} className="border border-[#e8dcc8] rounded p-3 bg-[#fdfaf3]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#c0392b] text-white text-xs">{t.title}</span>
                  <span className="text-[11px] text-[#9a8b75]">{t.note}</span>
                </div>
                <p className="text-xs text-[#5c4d3d] mt-1.5 leading-relaxed">{t.items}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 五输穴表 */}
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4 overflow-x-auto">
          <div className="text-sm font-bold text-[#2c2416] mb-2">五输穴全表（井·荥·输·经·合）</div>
          <p className="text-[11px] text-[#9a8b75] mb-2">阴经：井木→荥火→输土→经金→合水；阳经：井金→荥水→输木→经火→合土。</p>
          <table className="w-full text-xs border-collapse min-w-[520px]">
            <thead>
              <tr className="bg-[#f0e7d8]">
                <th className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">经脉</th>
                <th className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">井（木/金）</th>
                <th className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">荥（火/水）</th>
                <th className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">输（土/木）</th>
                <th className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">经（金/火）</th>
                <th className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">合（水/土）</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(WU_SHU).map(([jing, w]) => (
                <tr key={jing} className="bg-white">
                  <td className="border border-[#e8dcc8] px-2 py-1.5 font-bold text-[#c0392b]">{jing}经</td>
                  <td className="border border-[#e8dcc8] px-2 py-1.5 text-center">{w.jing}</td>
                  <td className="border border-[#e8dcc8] px-2 py-1.5 text-center">{w.rong}</td>
                  <td className="border border-[#e8dcc8] px-2 py-1.5 text-center">{w.shu}</td>
                  <td className="border border-[#e8dcc8] px-2 py-1.5 text-center">{w.jingx}</td>
                  <td className="border border-[#e8dcc8] px-2 py-1.5 text-center">{w.he}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (tab === 'point') {
    return (
      <div className="space-y-4">
        <TabBar tab={tab} setTab={setTab} />
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h3 className="text-base font-bold text-[#2c2416] mb-3">穴位速查</h3>
          <p className="text-xs text-[#9a8b75] mb-3">输入穴位名或关键词（如"三里""内关""腰背"）检索常用穴位。</p>
          <div className="flex items-center gap-2">
            <input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                const kw = e.target.value.trim()
                if (!kw) { setSearchResult(null); return }
                const hits = ALL_POINTS.filter((p) => p.name.includes(kw) || p.zhu.includes(kw) || p.meridian.includes(kw)).slice(0, 30)
                setSearchResult(hits)
              }}
              placeholder="搜索穴位…"
              className="flex-1 px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]"
            />
          </div>
          {searchResult && (
            <div className="mt-3 space-y-2">
              {searchResult.length === 0 && <p className="text-xs text-[#9a8b75]">未找到匹配穴位。</p>}
              {searchResult.map((p, i) => (
                <div key={i} className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                  <div className="text-sm font-bold text-[#2c2416]">{p.name} <span className="text-[11px] text-[#c0392b] font-normal">{p.meridian}</span></div>
                  <p className="text-[11px] text-[#5c4d3d] mt-1">定位：{p.loc}</p>
                  <p className="text-[11px] text-[#5c4d3d] mt-0.5">主治：{p.zhu}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const m = ALL_MERIDIANS[sel]
  return (
    <div className="space-y-4">
      <TabBar tab={tab} setTab={setTab} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-3">
          <div className="text-sm font-bold text-[#2c2416] mb-2">十四经脉</div>
          <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
            {ALL_MERIDIANS.map((md, i) => (
              <button
                key={i}
                onClick={() => setSel(i)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-sm ${sel === i ? 'bg-[#c0392b] text-white' : 'bg-[#fdfaf3] text-[#5c4d3d] hover:bg-[#f0e7d8]'}`}
              >
                {md.name}
                <span className={`text-[10px] ml-1 ${sel === i ? 'text-[#f5c9c4]' : 'text-[#9a8b75]'}`}>{md.wuxing}·{md.yinyang}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-3 space-y-3">
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-[#2c2416]">{m.name}</span>
              <span className="px-2 py-0.5 rounded bg-[#f0e7d8] text-xs text-[#5c4d3d]">{m.wuxing}</span>
              <span className="px-2 py-0.5 rounded bg-[#f0e7d8] text-xs text-[#5c4d3d]">{m.yinyang}经</span>
              <span className="px-2 py-0.5 rounded bg-[#fdf8e8] text-xs text-[#b8860b]">{m.shuzhi}</span>
            </div>
            <p className="text-xs text-[#5c4d3d] mt-2 leading-relaxed"><b className="text-[#c0392b]">循行：</b>{m.xunxing}</p>
            <p className="text-xs text-[#5c4d3d] mt-1 leading-relaxed"><b className="text-[#c0392b]">主治：</b>{m.zhu}</p>
          </div>
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="text-sm font-bold text-[#2c2416] mb-2">{m.name} · 常用穴位（{m.points.length}穴）</div>
            <div className="space-y-1.5">
              {m.points.map((p, i) => (
                <div key={i} className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                  <div className="text-sm font-bold text-[#2c2416]">{p.name}</div>
                  <p className="text-[11px] text-[#5c4d3d] mt-0.5">定位：{p.loc}</p>
                  <p className="text-[11px] text-[#5c4d3d] mt-0.5">主治：{p.zhu}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabBar({ tab, setTab }: { tab: string; setTab: (t: 'meridian' | 'point' | 'teding' | 'learn') => void }) {
  const tabs: [string, 'meridian' | 'point' | 'teding' | 'learn', string][] = [
    ['经络浏览', 'meridian', '经络'], ['穴位速查', 'point', '速查'], ['特定穴', 'teding', '特定穴'], ['学习知识', 'learn', '学习'],
  ]
  return (
    <div className="flex gap-2">
      {tabs.map(([label, key]) => (
        <button key={key} onClick={() => setTab(key)} className={`px-4 py-1.5 rounded text-sm ${tab === key ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'}`}>{label}</button>
      ))}
    </div>
  )
}
