interface ChartDisplayProps {
  data: any
}

export function ChartDisplay({ data }: ChartDisplayProps) {
  if (!data) return null

  // 提取基本信息
  const basicInfo = data.basicInfo || {}
  const palaces = data.palaces || []

  return (
    <div className="space-y-6">
      {/* 基本信息卡片 */}
      <div className="bg-white rounded-lg border border-[#d4c9b8] p-5">
        <h3 className="text-base font-bold text-[#2c2416] mb-3 border-b border-[#e8dcc8] pb-2">
          命盘基本信息
        </h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <InfoItem label="阳历" value={basicInfo.solarDate || '-'} />
          <InfoItem label="农历" value={basicInfo.lunarDate || '-'} />
          <InfoItem label="性别" value={basicInfo.gender || '-'} />
          <InfoItem label="生肖" value={basicInfo.zodiac || '-'} />
          <InfoItem label="命主" value={basicInfo.soul || '-'} />
          <InfoItem label="身主" value={basicInfo.body || '-'} />
          <InfoItem label="命宫" value={basicInfo.earthlyBranchOfSoulPalace || '-'} />
          <InfoItem label="身宫" value={basicInfo.earthlyBranchOfBodyPalace || '-'} />
        </div>
      </div>

      {/* 十二宫位 */}
      <div className="bg-white rounded-lg border border-[#d4c9b8] p-5">
        <h3 className="text-base font-bold text-[#2c2416] mb-4 border-b border-[#e8dcc8] pb-2">
          十二宫位
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {palaces.map((palace: any, index: number) => (
            <PalaceCard key={index} palace={palace} />
          ))}
        </div>
      </div>

      {/* 调试：原始数据结构（开发期临时显示） */}
      <details className="bg-white rounded-lg border border-[#d4c9b8] p-4 text-xs text-[#5c4d3d]">
        <summary className="cursor-pointer font-medium">查看原始数据结构（调试用）</summary>
        <pre className="mt-3 overflow-auto max-h-96 bg-[#f8f4ea] p-3 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[#9a8b75] text-xs mb-0.5">{label}</div>
      <div className="text-[#2c2416] font-medium">{value}</div>
    </div>
  )
}

function PalaceCard({ palace }: { palace: any }) {
  const stars = palace.stars || []
  const majorStars = stars.filter((s: any) => s.type === 'major')
  const minorStars = stars.filter((s: any) => s.type === 'minor')
  const adStars = stars.filter((s: any) => s.type === 'adjective')

  const isMainPalace = palace.isSoulPalace || palace.isBodyPalace

  return (
    <div
      className={`border rounded-md p-3 ${
        isMainPalace
          ? 'border-[#c0392b] bg-[#fdf0ee]'
          : 'border-[#e8dcc8] bg-[#fdfaf3]'
      }`}
    >
      {/* 宫位头部 */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-sm text-[#2c2416]">
          {palace.name}
        </span>
        <span className="text-xs text-[#9a8b75]">
          {palace.heavenlyStem}{palace.earthlyBranch}
        </span>
      </div>

      {/* 主星 */}
      <div className="space-y-1 mb-2">
        {majorStars.map((star: any, i: number) => (
          <div key={i} className="text-sm">
            <span className={`font-medium ${
              star.brightness === '庙' ? 'text-[#c0392b]' :
              star.brightness === '旺' ? 'text-[#b8860b]' :
              'text-[#5c4d3d]'
            }`}>
              {star.name}
            </span>
            <span className="text-xs text-[#9a8b75] ml-1">{star.brightness}</span>
          </div>
        ))}
        {majorStars.length === 0 && (
          <div className="text-xs text-[#b8a98f] italic">无主星</div>
        )}
      </div>

      {/* 辅星 */}
      {minorStars.length > 0 && (
        <div className="text-xs text-[#7a6d5a] leading-relaxed">
          {minorStars.map((s: any) => s.name).join(' · ')}
        </div>
      )}

      {/* 长生十二神 */}
      {adStars.length > 0 && (
        <div className="text-xs text-[#9a8b75] mt-1">
          {adStars.map((s: any) => s.name).join(' · ')}
        </div>
      )}
    </div>
  )
}
