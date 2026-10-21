import { useState } from 'react'

// 十干四化（禄权科忌）：甲廉破武阳 · 乙机梁紫阴 · 丙同机昌廉 · 丁阴同机巨 · 戊贪阴弼机 · 己武贪梁曲 · 庚阳武阴同 · 辛巨阳曲昌 · 壬梁紫辅武 · 癸破巨阴贪
export const SIHUA_MAP: Record<string, { name: string; type: string }[]> = {
  甲: [{ name: '廉贞', type: '禄' }, { name: '破军', type: '权' }, { name: '武曲', type: '科' }, { name: '太阳', type: '忌' }],
  乙: [{ name: '天机', type: '禄' }, { name: '天梁', type: '权' }, { name: '紫微', type: '科' }, { name: '太阴', type: '忌' }],
  丙: [{ name: '天同', type: '禄' }, { name: '天机', type: '权' }, { name: '文昌', type: '科' }, { name: '廉贞', type: '忌' }],
  丁: [{ name: '太阴', type: '禄' }, { name: '天同', type: '权' }, { name: '天机', type: '科' }, { name: '巨门', type: '忌' }],
  戊: [{ name: '贪狼', type: '禄' }, { name: '太阴', type: '权' }, { name: '右弼', type: '科' }, { name: '天机', type: '忌' }],
  己: [{ name: '武曲', type: '禄' }, { name: '贪狼', type: '权' }, { name: '天梁', type: '科' }, { name: '文曲', type: '忌' }],
  庚: [{ name: '太阳', type: '禄' }, { name: '武曲', type: '权' }, { name: '太阴', type: '科' }, { name: '天同', type: '忌' }],
  辛: [{ name: '巨门', type: '禄' }, { name: '太阳', type: '权' }, { name: '文曲', type: '科' }, { name: '文昌', type: '忌' }],
  壬: [{ name: '天梁', type: '禄' }, { name: '紫微', type: '权' }, { name: '左辅', type: '科' }, { name: '武曲', type: '忌' }],
  癸: [{ name: '破军', type: '禄' }, { name: '巨门', type: '权' }, { name: '太阴', type: '科' }, { name: '贪狼', type: '忌' }],
}

const SIHUA_NOTE: Record<string, string> = {
  禄: '财禄机遇、吉庆进益', 权: '权力担当、积极进取', 科: '名誉文书、贵人提携', 忌: '损耗困扰、执着牵绊',
}
const TYPE_COLOR: Record<string, string> = {
  禄: 'bg-[#e3f0e6] text-[#2f6b4f]', 权: 'bg-[#f0e7d8] text-[#8a6d3b]', 科: 'bg-[#eef2f8] text-[#2c5f8a]', 忌: 'bg-[#fdeaea] text-[#c0392b]',
}

const ZHI_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function yearGanZhi(year: number): string {
  return '甲乙丙丁戊己庚辛壬癸'[(year - 4) % 10] + ZHI_ORDER[(year - 4) % 12]
}

interface Palace {
  name: string
  earthlyBranch: string
  heavenlyStem: string
  majorStars: { name: string; mutagen?: string }[]
  minorStars: { name: string; mutagen?: string }[]
}

export function LiuyuePanel({ astrolabe }: { astrolabe: any }) {
  const [liuNian, setLiuNian] = useState(2026)
  const [liuYue, setLiuYue] = useState(1)
  const [liuRi, setLiuRi] = useState(1)
  const [daXian, setDaXian] = useState(0)

  const palaces = astrolabe.palaces as Palace[]
  const gz = yearGanZhi(liuNian)
  const gan = gz[0]
  const zhi = gz[1]

  // 星 → 落宫
  const starPalace = (starName: string): string => {
    const p = palaces.find((x) => [...x.majorStars, ...x.minorStars].some((s) => s.name === starName))
    return p ? p.name : '未在盘'
  }

  // 生年四化（iztro v2：星对象 mutagen 字段，按农历年干定）
  const shengNian = palaces.flatMap((p) =>
    [...p.majorStars, ...p.minorStars]
      .filter((s) => s.mutagen)
      .map((s) => ({ name: s.name, type: s.mutagen as string, palace: p.name }))
  )

  // 大限四化：所选大限宫天干
  const dx = palaces[daXian]
  const dxGan = dx?.heavenlyStem || ''
  const dxSiHua = SIHUA_MAP[dxGan] || []

  // 流年四化
  const lnSiHua = SIHUA_MAP[gan] || []

  // 流年命宫（地支 === 流年地支）
  const lnMingPalace = palaces.find((x) => x.earthlyBranch === zhi)
  // 流月命宫：流年命宫地支起顺行（一月一宫）
  const yueZhi = ZHI_ORDER[(ZHI_ORDER.indexOf(zhi) + liuYue - 1) % 12]
  const yuePalace = palaces.find((x) => x.earthlyBranch === yueZhi)
  // 流日命宫：流月命宫地支起顺行（一日一宫）
  const riZhi = ZHI_ORDER[(ZHI_ORDER.indexOf(yueZhi) + liuRi - 1) % 12]
  const riPalace = palaces.find((x) => x.earthlyBranch === riZhi)

  const SihuaList = ({ items, title }: { items: { name: string; type: string; palace?: string }[]; title: string }) => (
    <div>
      <div className="text-xs font-bold text-[#2c2416] mb-1.5">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s, i) => (
          <div key={i} className="border border-[#e8dcc8] rounded p-2 bg-[#fdfaf3] min-w-[110px]">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#2c2416]">{s.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${TYPE_COLOR[s.type]}`}>{s.type}</span>
            </div>
            <div className="text-[10px] text-[#c0392b] mt-0.5">落 {s.palace || starPalace(s.name)}</div>
            <div className="text-[9px] text-[#9a8b75]">{SIHUA_NOTE[s.type]}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="bg-white border border-[#e8dcc8] rounded-lg p-4 space-y-4">
      <div className="text-sm font-bold text-[#2c2416]">流月流日 · 四化细推</div>
      <p className="text-[11px] text-[#9a8b75]">生年四化定本命倾向；大限四化主十年境遇；流年四化断当年得失；流月流日命宫按"流年命宫起正月、一月一宫、一日一宫"顺行（通行简法）。</p>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <div className="text-xs text-[#9a8b75] mb-1">流年</div>
          <input type="number" value={liuNian} onChange={(e) => setLiuNian(Number(e.target.value))} className="w-24 px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]" />
        </div>
        <div>
          <div className="text-xs text-[#9a8b75] mb-1">流月</div>
          <select value={liuYue} onChange={(e) => setLiuYue(Number(e.target.value))} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm">
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}月</option>)}
          </select>
        </div>
        <div>
          <div className="text-xs text-[#9a8b75] mb-1">流日</div>
          <select value={liuRi} onChange={(e) => setLiuRi(Number(e.target.value))} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm">
            {Array.from({ length: 30 }, (_, i) => <option key={i} value={i + 1}>{i + 1}日</option>)}
          </select>
        </div>
        <div>
          <div className="text-xs text-[#9a8b75] mb-1">大限宫（取该宫天干四化）</div>
          <select value={daXian} onChange={(e) => setDaXian(Number(e.target.value))} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm">
            {palaces.map((p, i) => <option key={i} value={i}>{p.name}（{p.earthlyBranch} · {p.heavenlyStem}）</option>)}
          </select>
        </div>
      </div>

      {/* 流年/流月/流日命宫 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded border border-[#c0392b] bg-[#fdf0ee] p-2.5 text-center">
          <div className="text-[10px] text-[#9a8b75]">流年命宫（{liuNian} {gz}年）</div>
          <div className="text-sm font-bold text-[#2c2416]">{lnMingPalace ? `${lnMingPalace.name}` : '—'}</div>
          <div className="text-[10px] text-[#c0392b]">地支{zhi}宫</div>
        </div>
        <div className="rounded border border-[#e8dcc8] bg-[#fdfaf3] p-2.5 text-center">
          <div className="text-[10px] text-[#9a8b75]">流月命宫（{liuYue}月）</div>
          <div className="text-sm font-bold text-[#2c2416]">{yuePalace ? yuePalace.name : '—'}</div>
          <div className="text-[10px] text-[#9a8b75]">地支{yueZhi}宫</div>
        </div>
        <div className="rounded border border-[#e8dcc8] bg-[#fdfaf3] p-2.5 text-center">
          <div className="text-[10px] text-[#9a8b75]">流日命宫（{liuRi}日）</div>
          <div className="text-sm font-bold text-[#2c2416]">{riPalace ? riPalace.name : '—'}</div>
          <div className="text-[10px] text-[#9a8b75]">地支{riZhi}宫</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SihuaList items={shengNian} title="生年四化（本命）" />
        <SihuaList items={dxSiHua} title={`大限四化（${dxGan}干）`} />
        <SihuaList items={lnSiHua} title={`流年四化（${gan}干 · ${gz}年）`} />
      </div>
    </div>
  )
}
