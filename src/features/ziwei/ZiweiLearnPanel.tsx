import { useState, useMemo, useEffect } from 'react'
import { ziweiKnowledge } from './ziweiKnowledge'
import type { KnowledgeSection } from './ziweiKnowledge'
import { starKnowledge } from './starKnowledge'
import { AnXingDemo } from './AnXingDemo'
import { QuizPanel } from './QuizPanel'
import { MemoCardPanel } from './MemoCardPanel'
import { FiveElementsPanel } from './FiveElementsPanel'
import { PalaceQuickPanel } from './PalaceQuickPanel'
import { StarComboPanel } from './StarComboPanel'

// 星曜 → 所属章节映射（用于从宫位详情跳转到学习板块）
const STAR_CHAPTER_MAP: Record<string, string> = {
  // 北斗星系
  '紫微': 'majors-north', '天机': 'majors-north', '太阳': 'majors-north',
  '武曲': 'majors-north', '天同': 'majors-north', '廉贞': 'majors-north',
  // 南斗星系
  '天府': 'majors-south', '太阴': 'majors-south', '贪狼': 'majors-south',
  '巨门': 'majors-south', '天相': 'majors-south', '天梁': 'majors-south',
  '七杀': 'majors-south',
  // 破军
  '破军': 'majors-pojun',
  // 六吉
  '左辅': 'six-auspicious', '右弼': 'six-auspicious', '文昌': 'six-auspicious',
  '文曲': 'six-auspicious', '天魁': 'six-auspicious', '天钺': 'six-auspicious',
  // 六煞
  '擎羊': 'six-ominous', '陀罗': 'six-ominous', '火星': 'six-ominous',
  '铃星': 'six-ominous', '地空': 'six-ominous', '地劫': 'six-ominous',
  // 禄存天马与杂曜
  '禄存': 'lux-tianma', '天马': 'lux-tianma', '红鸾': 'lux-tianma', '天喜': 'lux-tianma',
}

// 各星曜章节对应的星名列表
const CHAPTER_STARS: Record<string, string[]> = {
  'majors-north': ['紫微', '天机', '太阳', '武曲', '天同', '廉贞'],
  'majors-south': ['天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀'],
  'majors-pojun': ['破军'],
  'six-auspicious': ['左辅', '右弼', '文昌', '文曲', '天魁', '天钺'],
  'six-ominous': ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫'],
  'lux-tianma': ['禄存', '天马', '红鸾', '天喜'],
}

export function ZiweiLearnPanel({
  embedded = false,
  starName = null,
}: {
  embedded?: boolean
  starName?: string | null
}) {
  const [activeSection, setActiveSection] = useState(ziweiKnowledge[0].id)
  const [activeChapter, setActiveChapter] = useState(ziweiKnowledge[0].chapters[0].id)
  const [searchQuery, setSearchQuery] = useState('')

  // 当传入星名时，自动定位到对应章节（仅当当前不在搜索状态）
  useEffect(() => {
    if (!starName) return
    const chapterId = STAR_CHAPTER_MAP[starName]
    if (!chapterId) return
    const section = ziweiKnowledge.find(s =>
      s.chapters.some(c => c.id === chapterId)
    )
    if (section) {
      setActiveSection(section.id)
      setActiveChapter(chapterId)
      setSearchQuery('')
    }
  }, [starName])

  // 定位章节后，自动滚动到目标星的词条卡
  useEffect(() => {
    if (!starName) return
    const timer = setTimeout(() => {
      const el = document.getElementById(`star-card-${starName}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 250)
    return () => clearTimeout(timer)
  }, [starName, activeSection, activeChapter])

  const currentSection = ziweiKnowledge.find(s => s.id === activeSection)!
  const currentChapter = currentSection.chapters.find(c => c.id === activeChapter) ?? currentSection.chapters[0]

  // 搜索过滤
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return ziweiKnowledge
    const q = searchQuery.trim()
    return ziweiKnowledge
      .map(section => {
        const chapters = section.chapters.filter(chapter => {
          const haystack = [
            chapter.title,
            chapter.intro || '',
            ...(chapter.paragraphs || []),
            ...(chapter.list || []),
            ...(chapter.table?.headers || []),
            ...(chapter.table?.rows.flat() || []),
          ].join(' ')
          return haystack.includes(q)
        })
        if (chapters.length === 0) return null
        return { ...section, chapters }
      })
      .filter(Boolean) as KnowledgeSection[]
  }, [searchQuery])

  // 渲染章节内容
  const renderChapter = (chapter: typeof currentChapter) => (
    <div key={chapter.id} className="space-y-4">
      <h3 className="text-lg font-bold text-[#2c2416]">{chapter.title}</h3>
      {chapter.intro && (
        <p className="text-sm text-[#9a8b75] border-l-2 border-[#c0392b] pl-3 leading-relaxed">
          {chapter.intro}
        </p>
      )}
      {chapter.paragraphs && (
        <div className="space-y-2">
          {chapter.paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-[#2c2416] leading-relaxed">{p}</p>
          ))}
        </div>
      )}
      {chapter.table && (
        <div className="overflow-x-auto border border-[#e8dcc8] rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f5efe0]">
                {chapter.table.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left text-[#5c4d3d] font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chapter.table.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-[#fdfaf3]' : 'bg-white'}>
                  {row.map((cell, j) => (
                    <td key={j} className={`px-3 py-2 text-[#2c2416] border-t border-[#e8dcc8] whitespace-nowrap ${
                      j === 0 ? 'font-medium text-[#c0392b]' : ''
                    }`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {chapter.list && (
        <div className="bg-[#f8f4ea] rounded p-3 space-y-1">
          {chapter.list.map((item, i) => (
            <p key={i} className="text-sm text-[#5c4d3d] leading-relaxed">{item}</p>
          ))}
        </div>
      )}

      {/* 安星演示（交互工具） */}
      {chapter.id === 'anxing-demo' && (
        <AnXingDemo />
      )}

      {/* 研习自测（交互工具） */}
      {chapter.id === 'quiz-panel' && (
        <QuizPanel />
      )}

      {/* 背诵记忆卡（交互工具） */}
      {chapter.id === 'memo-panel' && (
        <MemoCardPanel />
      )}

      {/* 五行局速查（交互工具） */}
      {chapter.id === 'nayin-panel' && (
        <FiveElementsPanel />
      )}

      {/* 宫位速查（交互工具） */}
      {chapter.id === 'palace-quick' && (
        <PalaceQuickPanel />
      )}

      {/* 星曜组合速断（交互工具） */}
      {chapter.id === 'star-combo' && (
        <StarComboPanel />
      )}

      {/* 星曜词条卡（动态接入星曜知识库） */}
      {CHAPTER_STARS[chapter.id] && (
        <div className="pt-1">
          <h4 className="text-sm font-bold text-[#c0392b] mb-3 border-b border-[#e8dcc8] pb-2">
            星曜详解
            <span className="text-xs font-normal text-[#9a8b75] ml-2">
              点击星名查看完整词条
            </span>
          </h4>
          <div className="space-y-3">
            {CHAPTER_STARS[chapter.id].map(star => {
              const info = starKnowledge[star]
              if (!info) return null
              const isHighlight = starName === star
              return (
                <div
                  key={star}
                  id={`star-card-${star}`}
                  className={`rounded border p-3 ${
                    isHighlight
                      ? 'border-[#c0392b] bg-[#fdf0ee] ring-1 ring-[#c0392b]'
                      : 'border-[#e8dcc8] bg-[#fdfaf3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#2c2416]">{info.name}</span>
                    {isHighlight && (
                      <span className="text-xs bg-[#c0392b] text-white px-1.5 py-0.5 rounded">
                        当前查看
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#5c4d3d] mb-1.5">
                    <div><span className="text-[#9a8b75]">五行：</span>{info.wuxing}</div>
                    <div><span className="text-[#9a8b75]">星性：</span>{info.nature}</div>
                    <div><span className="text-[#9a8b75]">代表人物：</span>{info.representative}</div>
                    <div><span className="text-[#9a8b75]">关键词：</span>{info.keywords.join('、')}</div>
                  </div>
                  <p className="text-sm text-[#5c4d3d] leading-relaxed">{info.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className={embedded ? '' : 'p-8'}>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2c2416]">紫微斗数学习</h1>
          <p className="text-sm text-[#5c4d3d] mt-1">
            参考《紫微斗数全书》《紫微斗数讲义》等典籍整理 · 星盘研习与验证
          </p>
        </div>
      )}

      {/* 搜索框 */}
      <div className="mb-5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索知识：如 紫微、四化、三方四正、火贪格..."
          className="w-full max-w-xl px-4 py-2.5 border border-[#d4c9b8] rounded-lg bg-white text-sm text-[#2c2416] focus:outline-none focus:border-[#c0392b]"
        />
      </div>

      <div className="flex gap-6 items-start">
        {/* 左侧：章节导航 */}
        <div className="w-60 shrink-0 space-y-3">
          {filteredSections.map(section => (
            <div key={section.id} className="bg-white rounded-lg border border-[#d4c9b8] overflow-hidden">
              <button
                onClick={() => {
                  setActiveSection(section.id)
                  setActiveChapter(section.chapters[0].id)
                  setSearchQuery('')
                }}
                className={`w-full px-4 py-2.5 flex items-center gap-2 text-left ${
                  activeSection === section.id
                    ? 'bg-[#c0392b] text-white'
                    : 'bg-[#fdfaf3] hover:bg-[#f5efe0] text-[#2c2416]'
                }`}
              >
                <span>{section.icon}</span>
                <span className="text-sm font-bold">{section.title}</span>
              </button>
              {activeSection === section.id && (
                <div className="py-1.5 px-2 space-y-0.5">
                  {section.chapters.map(chapter => (
                    <button
                      key={chapter.id}
                      onClick={() => setActiveChapter(chapter.id)}
                      className={`w-full px-2.5 py-1.5 text-left text-sm rounded ${
                        activeChapter === chapter.id
                          ? 'bg-[#fdf0ee] text-[#c0392b] font-medium'
                          : 'text-[#5c4d3d] hover:bg-[#f5efe0]'
                      }`}
                    >
                      {chapter.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 右侧：内容区 */}
        <div className="flex-1 bg-white rounded-lg border border-[#d4c9b8] p-6 min-h-96">
          {filteredSections.length === 0 ? (
            <div className="text-center text-sm text-[#9a8b75] py-16">
              没有找到与「{searchQuery}」相关的知识
              <br />
              <span className="text-xs text-[#b8a98f]">换个关键词试试，如：命宫、化忌、火贪格、文昌</span>
            </div>
          ) : searchQuery.trim() ? (
            // 搜索结果：列出所有命中的章节
            <div className="space-y-6">
              {filteredSections.map(section => (
                <div key={section.id}>
                  <h3 className="text-base font-bold text-[#c0392b] mb-3 border-b border-[#e8dcc8] pb-2">
                    {section.icon} {section.title}
                  </h3>
                  <div className="space-y-5">
                    {section.chapters.map(chapter => renderChapter(chapter))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* 当前章节 */}
              {renderChapter(currentChapter)}

              {/* 章节底部提示 */}
              <div className="mt-6 pt-4 border-t border-[#e8dcc8] flex items-center justify-between text-xs text-[#9a8b75]">
                <button
                  onClick={() => {
                    const secIdx = ziweiKnowledge.findIndex(s => s.id === activeSection)
                    const chapIdx = currentSection.chapters.findIndex(c => c.id === activeChapter)
                    if (chapIdx > 0) {
                      setActiveChapter(currentSection.chapters[chapIdx - 1].id)
                    } else if (secIdx > 0) {
                      const prev = ziweiKnowledge[secIdx - 1]
                      setActiveSection(prev.id)
                      setActiveChapter(prev.chapters[prev.chapters.length - 1].id)
                    }
                  }}
                  className="px-3 py-1.5 border border-[#d4c9b8] rounded hover:bg-[#f5efe0]"
                >
                  ← 上一节
                </button>
                <span className="text-[#b8a98f]">
                  {currentSection.title} · {currentChapter.title}
                </span>
                <button
                  onClick={() => {
                    const secIdx = ziweiKnowledge.findIndex(s => s.id === activeSection)
                    const chapIdx = currentSection.chapters.findIndex(c => c.id === activeChapter)
                    if (chapIdx < currentSection.chapters.length - 1) {
                      setActiveChapter(currentSection.chapters[chapIdx + 1].id)
                    } else if (secIdx < ziweiKnowledge.length - 1) {
                      const next = ziweiKnowledge[secIdx + 1]
                      setActiveSection(next.id)
                      setActiveChapter(next.chapters[0].id)
                    }
                  }}
                  className="px-3 py-1.5 border border-[#d4c9b8] rounded hover:bg-[#f5efe0]"
                >
                  下一节 →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
