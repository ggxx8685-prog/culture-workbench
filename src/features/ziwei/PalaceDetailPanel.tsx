import { useState, useEffect } from 'react'
import { getStarKnowledge } from './starKnowledge'

// 三方四正组件
function ThreeFourDirection({ chartData, palaceIndex }: { chartData: any; palaceIndex: number }) {
  let surrounded: any = null
  try {
    surrounded = chartData.surroundedPalaces(palaceIndex)
  } catch (e) {
    console.error('获取三方四正失败:', e)
    return null
  }

  if (!surrounded) return null

  const { opposite, wealth, career } = surrounded

  const renderPalace = (palace: any, label: string) => {
    if (!palace) return null
    const majors = palace.majorStars || []
    return (
      <div className="flex-1">
        <div className="text-xs text-[#9a8b75] mb-0.5">{label}</div>
        <div className="text-xs font-medium text-[#2c2416]">{palace.name}</div>
        <div className="text-xs text-[#5c4d3d] mt-0.5">
          {majors.length > 0
            ? majors.map((s: any) => s.name).join('、')
            : '无主星'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f8f4ea] rounded p-2">
      <div className="text-xs text-[#9a8b75] mb-1.5">三方四正</div>
      <div className="flex gap-2 text-center">
        {renderPalace(career, '官禄宫')}
        {renderPalace(opposite, '对宫')}
        {renderPalace(wealth, '财帛宫')}
      </div>
    </div>
  )
}

interface PalaceDetailPanelProps {
  chartData: any
  onOpenLearnStar?: (starName: string) => void
}

// 从localStorage读取笔记
function getNote(chartKey: string, palaceName: string): string {
  try {
    const saved = localStorage.getItem(`ziwei_note_${chartKey}_${palaceName}`)
    return saved || ''
  } catch {
    return ''
  }
}

// 保存笔记到localStorage
function saveNote(chartKey: string, palaceName: string, note: string) {
  try {
    localStorage.setItem(`ziwei_note_${chartKey}_${palaceName}`, note)
  } catch (e) {
    console.error('保存笔记失败:', e)
  }
}

export function PalaceDetailPanel({ chartData, onOpenLearnStar }: PalaceDetailPanelProps) {
  const [openPalace, setOpenPalace] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [selectedStar, setSelectedStar] = useState<string | null>(null)

  const palaces = chartData.palaces || []
  const basicInfo = chartData.basicInfo || {}

  // 生成盘的唯一标识
  const chartKey = `${basicInfo.solarDate}_${basicInfo.time}_${basicInfo.gender}`

  // 命宫索引
  const soulIndex = basicInfo.soulIndex

  // 初始化加载笔记
  useEffect(() => {
    const loaded: Record<string, string> = {}
    palaces.forEach((p: any) => {
      loaded[p.name] = getNote(chartKey, p.name)
    })
    setNotes(loaded)
  }, [chartKey])

  const togglePalace = (name: string) => {
    setOpenPalace(openPalace === name ? null : name)
  }

  const handleNoteChange = (palaceName: string, value: string) => {
    setNotes(prev => ({ ...prev, [palaceName]: value }))
    saveNote(chartKey, palaceName, value)
  }

  const handleStarClick = (starName: string) => {
    setSelectedStar(selectedStar === starName ? null : starName)
  }

  const starInfo = selectedStar ? getStarKnowledge(selectedStar) : null

  return (
    <div className="bg-white rounded-lg border border-[#d4c9b8] p-5">
      <h3 className="text-base font-bold text-[#2c2416] mb-4 border-b border-[#e8dcc8] pb-2">
        宫位详情 & 学习笔记
        <span className="text-xs font-normal text-[#9a8b75] ml-2">
          （点主星名字看解释）
        </span>
      </h3>

      {/* 星曜知识库详情 */}
      {starInfo && (
        <div className="mb-4 p-4 bg-[#fdfaf3] border border-[#d4c9b8] rounded-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-bold text-[#c0392b]">{starInfo.name}</h4>
            <button
              onClick={() => setSelectedStar(null)}
              className="text-xs text-[#9a8b75] hover:text-[#2c2416]"
            >
              关闭 ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div><span className="text-[#9a8b75]">五行：</span>{starInfo.wuxing}</div>
            <div><span className="text-[#9a8b75]">星性：</span>{starInfo.nature}</div>
            <div><span className="text-[#9a8b75]">代表人物：</span>{starInfo.representative}</div>
            <div>
              <span className="text-[#9a8b75]">关键词：</span>
              {starInfo.keywords.join('、')}
            </div>
          </div>
          <p className="text-sm text-[#5c4d3d] leading-relaxed">{starInfo.description}</p>
          {onOpenLearnStar && (
            <button
              onClick={() => onOpenLearnStar(starInfo.name)}
              className="mt-3 text-xs px-3 py-1.5 bg-[#c0392b] text-white rounded hover:bg-[#a83226] transition-colors"
            >
              在学习板块中查看此星 →
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {palaces.map((palace: any, index: number) => {
          const majorStars = palace.majorStars || []
          const minorStars = palace.minorStars || []
          const adjectiveStars = palace.adjectiveStars || []

          const isSoulPalace = palace.index === soulIndex
          const isBodyPalace = palace.isBodyPalace

          const hasNote = notes[palace.name]?.length > 0
          const isOpen = openPalace === palace.name

          return (
            <div
              key={index}
              className={`border rounded-md overflow-hidden ${
                isSoulPalace || isBodyPalace
                  ? 'border-[#c0392b]'
                  : 'border-[#e8dcc8]'
              }`}
            >
              {/* 宫位头部（可点击展开） */}
              <button
                onClick={() => togglePalace(palace.name)}
                className="w-full px-3 py-2 bg-[#fdfaf3] hover:bg-[#f5efe0] flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#2c2416]">
                    {palace.name}
                  </span>
                  {isSoulPalace && (
                    <span className="text-xs bg-[#c0392b] text-white px-1.5 rounded">命宫</span>
                  )}
                  {isBodyPalace && (
                    <span className="text-xs bg-[#b8860b] text-white px-1.5 rounded">身宫</span>
                  )}
                  {hasNote && <span className="text-[#c0392b] text-xs">●</span>}
                </div>
                <span className="text-xs text-[#9a8b75]">
                  {palace.heavenlyStem}{palace.earthlyBranch} ▾
                </span>
              </button>

              {/* 展开的详情 */}
              {isOpen && (
                <div className="px-3 py-3 border-t border-[#e8dcc8] space-y-2">
                  {/* 三方四正 */}
                  <ThreeFourDirection chartData={chartData} palaceIndex={palace.index} />

                  {/* 本宫主星 */}
                  <div>
                    <div className="text-xs text-[#9a8b75] mb-1">本宫主星</div>
                    {majorStars.length > 0 ? (
                      <div className="space-y-0.5">
                        {majorStars.map((s: any, i: number) => (
                          <div key={i} className="text-sm flex items-center gap-1">
                            <button
                              onClick={() => handleStarClick(s.name)}
                              className={`font-medium underline underline-offset-2 decoration-dotted hover:decoration-solid cursor-pointer ${
                                s.brightness === '庙' ? 'text-[#c0392b]' :
                                s.brightness === '旺' ? 'text-[#b8860b]' :
                                'text-[#2c2416]'
                              } ${selectedStar === s.name ? 'bg-[#fdf0ee]' : ''}`}
                            >
                              {s.name}
                            </button>
                            {s.brightness && (
                              <span className="text-xs text-[#9a8b75]">{s.brightness}</span>
                            )}
                            {s.mutagen && (
                              <span className="text-xs text-[#b8860b]">({s.mutagen})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[#b8a98f] italic">无主星（借对宫）</div>
                    )}
                  </div>

                  {/* 辅星 */}
                  {minorStars.length > 0 && (
                    <div>
                      <div className="text-xs text-[#9a8b75] mb-1">辅星</div>
                      <div className="text-xs text-[#5c4d3d] leading-relaxed flex flex-wrap gap-1">
                        {minorStars.map((s: any, i: number) => {
                          const hasKnowledge = getStarKnowledge(s.name)
                          return (
                            <button
                              key={i}
                              onClick={() => hasKnowledge && handleStarClick(s.name)}
                              className={`underline underline-offset-2 decoration-dotted ${
                                hasKnowledge
                                  ? 'text-[#5c4d3d] hover:text-[#c0392b] cursor-pointer'
                                  : 'text-[#9a8b75] cursor-default no-underline'
                              } ${selectedStar === s.name ? 'bg-[#fdf0ee]' : ''}`}
                            >
                              {s.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* 杂曜 */}
                  {adjectiveStars.length > 0 && (
                    <div>
                      <div className="text-xs text-[#9a8b75] mb-1">杂曜 / 神煞</div>
                      <div className="text-xs text-[#5c4d3d] leading-relaxed flex flex-wrap gap-1">
                        {adjectiveStars.map((s: any, i: number) => {
                          const hasKnowledge = getStarKnowledge(s.name)
                          return (
                            <button
                              key={i}
                              onClick={() => hasKnowledge && handleStarClick(s.name)}
                              className={`underline underline-offset-2 decoration-dotted ${
                                hasKnowledge
                                  ? 'text-[#5c4d3d] hover:text-[#c0392b] cursor-pointer'
                                  : 'text-[#9a8b75] cursor-default no-underline'
                              } ${selectedStar === s.name ? 'bg-[#fdf0ee]' : ''}`}
                            >
                              {s.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* 长生十二神 */}
                  {(palace.changsheng12 || palace.boshi12) && (
                    <div>
                      <div className="text-xs text-[#9a8b75] mb-1">长生博士</div>
                      <div className="text-xs text-[#5c4d3d]">
                        {palace.changsheng12 && <span>{palace.changsheng12}</span>}
                        {palace.boshi12 && <span className="ml-2">{palace.boshi12}</span>}
                      </div>
                    </div>
                  )}

                  {/* 笔记输入 */}
                  <div>
                    <div className="text-xs text-[#9a8b75] mb-1">我的笔记</div>
                    <textarea
                      value={notes[palace.name] || ''}
                      onChange={(e) => handleNoteChange(palace.name, e.target.value)}
                      placeholder="记录你的观察、验证心得..."
                      rows={3}
                      className="w-full px-2 py-1.5 text-xs border border-[#e8dcc8] rounded bg-[#fdfaf3] focus:outline-none focus:border-[#c0392b] resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
