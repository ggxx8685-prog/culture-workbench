interface DecadalPanelProps {
  chartData: any
  currentYear: number | null
  birthYear: number
  onSelectDecadal: (year: number) => void
}

export function DecadalPanel({ chartData, currentYear, birthYear, onSelectDecadal }: DecadalPanelProps) {
  // 获取大限列表
  let decadalList: any[] = []
  try {
    decadalList = chartData.decadalList() || []
  } catch (e) {
    console.error('获取大限列表失败:', e)
  }

  if (decadalList.length === 0) return null

  // 找到当前年份对应的大限索引
  const age = currentYear ? currentYear - birthYear : 0
  let currentDecadalIndex = -1
  if (currentYear) {
    decadalList.forEach((d, i) => {
      if (age >= d.ageRange[0] && age <= d.ageRange[1]) {
        currentDecadalIndex = i
      }
    })
  }

  const handleClickDecadal = (decadal: any) => {
    // 跳转到该大限中间的年份
    const midYear = Math.floor((decadal.yearRange[0] + decadal.yearRange[1]) / 2)
    onSelectDecadal(midYear)
  }

  return (
    <div className="bg-white rounded-lg border border-[#d4c9b8] p-5">
      <h3 className="text-base font-bold text-[#2c2416] mb-1 border-b border-[#e8dcc8] pb-2">
        大限运势
        {currentYear && (
          <span className="text-sm font-normal text-[#9a8b75] ml-2">
            {currentYear}年 · {age}岁
          </span>
        )}
      </h3>
      <p className="text-xs text-[#9a8b75] mb-4">点击大限卡片可切换到该运限</p>

      {/* 大限列表 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {decadalList.map((decadal, index) => {
          const isActive = currentYear && index === currentDecadalIndex
          return (
            <button
              key={index}
              onClick={() => handleClickDecadal(decadal)}
              className={`border rounded-md p-2.5 text-center transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#c0392b] bg-[#fdf0ee]'
                  : 'border-[#e8dcc8] bg-[#fdfaf3] hover:bg-[#f5efe0] hover:border-[#c0392b]'
              }`}
            >
              <div className={`text-sm font-medium ${
                isActive ? 'text-[#c0392b]' : 'text-[#2c2416]'
              }`}>
                {decadal.palaceName}宫
              </div>
              <div className="text-xs text-[#9a8b75] mt-1">
                {decadal.ageRange[0]}-{decadal.ageRange[1]}岁
              </div>
              <div className="text-xs text-[#b8a98f]">
                {decadal.yearRange[0]}-{decadal.yearRange[1]}
              </div>
              <div className="text-xs text-[#5c4d3d] mt-1">
                {decadal.heavenlyStem}{decadal.earthlyBranch}
              </div>
            </button>
          )
        })}
      </div>

      {/* 当前大限四化 */}
      {currentYear && currentDecadalIndex >= 0 && decadalList[currentDecadalIndex] && (
        <div className="mt-4 pt-3 border-t border-[#e8dcc8]">
          <div className="text-xs text-[#9a8b75] mb-1.5">大限四化</div>
          <div className="text-sm text-[#2c2416]">
            禄：<span className="text-[#b8860b]">{decadalList[currentDecadalIndex].mutagen[0]}</span>
            <span className="mx-3">权：<span className="text-[#b8860b]">{decadalList[currentDecadalIndex].mutagen[1]}</span></span>
            <span className="mx-3">科：<span className="text-[#b8860b]">{decadalList[currentDecadalIndex].mutagen[2]}</span></span>
            <span className="mx-3">忌：<span className="text-[#c0392b]">{decadalList[currentDecadalIndex].mutagen[3]}</span></span>
          </div>
        </div>
      )}

      {/* 当前大限解读 */}
      {currentYear && currentDecadalIndex >= 0 && decadalList[currentDecadalIndex] && (
        <DecadalReading
          chartData={chartData}
          decadal={decadalList[currentDecadalIndex]}
        />
      )}
    </div>
  )
}

// 大限解读：大限宫位 + 三方四正 + 四化落宫
// 说明：大限盘 = 主盘本身，仅视角以大限宫为新命宫；
//       三方四正按大限宫地支三合/对冲计算，直接映射主盘 palaces（index 按地支 寅0...丑11）
function DecadalReading({ chartData, decadal }: { chartData: any; decadal: any }) {
  const idx = decadal.index ?? -1
  const palaces = chartData.palaces as any[]
  if (!palaces || idx < 0) return null

  // 宫位信息：直接用主盘 palaces（index 与地支固定对应）
  const palaceInfo = (i: number) => {
    const main = palaces[i]
    const stars = main ? main.majorStars.map((s: any) => s.name + (s.brightness ? ` ${s.brightness}` : '')).join('、') : ''
    const branch = main ? `${main.heavenlyStem}${main.earthlyBranch}` : ''
    return { name: main ? main.name : '—', branch, stars }
  }

  const info = palaceInfo(idx)
  const duigong = palaceInfo((idx + 6) % 12)
  const sanhe1 = palaceInfo((idx + 4) % 12)
  const sanhe2 = palaceInfo((idx + 8) % 12)

  // 四化星落宫（大限四化为主星，位置同原局盘）
  const mutagenInfo: { mg: string; star: string; palace: string }[] = []
  const MG = ['禄', '权', '科', '忌']
  decadal.mutagen.forEach((star: string, i: number) => {
    if (!star) return
    const p = palaces.find((x: any) =>
      x.majorStars.some((s: any) => s.name === star)
    )
    mutagenInfo.push({ mg: MG[i] ?? '', star, palace: p ? p.name : '—' })
  })

  const MG_DESC: Record<string, string> = {
    禄: '该限得财顺遂、机会增多',
    权: '该限主动进取、掌握局面',
    科: '该限名声渐起、贵人提携',
    忌: '该限多劳多耗、宜守不宜攻',
  }

  return (
    <div className="mt-4 pt-3 border-t border-[#e8dcc8]">
      <div className="text-xs text-[#9a8b75] mb-2">
        大限解读（本限十年以 <span className="text-[#c0392b] font-medium">{info.name}宫</span> 为主事宫）
      </div>

      {/* 主事宫 */}
      <div className="bg-[#fdfaf3] border border-[#f0e7d8] rounded px-3 py-2 mb-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#c0392b] font-bold">{info.name}宫</span>
          <span className="text-xs text-[#9a8b75]">{info.branch}</span>
          <span className="text-xs text-[#2c2416]">{info.stars || '无主星'}</span>
        </div>
      </div>

      {/* 三方四正 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-2">
        {[
          { label: '本宫', v: info },
          { label: '三合', v: sanhe1 },
          { label: '三合', v: sanhe2 },
          { label: '对宫', v: duigong },
        ].map((item, i) => (
          <div key={i} className="bg-[#fdfaf3] border border-[#f0e7d8] rounded px-2.5 py-1.5">
            <div className="text-[10px] text-[#9a8b75]">{item.label}</div>
            <div className="text-xs text-[#2c2416] font-medium">{item.v.name}宫</div>
            <div className="text-[11px] text-[#5c4d3d]">{item.v.stars || '无主星'}</div>
          </div>
        ))}
      </div>

      {/* 四化落宫 */}
      <div className="space-y-1">
        {mutagenInfo.map((m, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className={`w-5 shrink-0 text-center rounded ${m.mg === '忌' ? 'bg-[#c0392b] text-white' : 'bg-[#b8860b] text-white'}`}>
              {m.mg}
            </span>
            <span className="text-[#2c2416]">{m.star}化{m.mg}在{m.palace}宫</span>
            <span className="text-[#9a8b75]">— {MG_DESC[m.mg]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
