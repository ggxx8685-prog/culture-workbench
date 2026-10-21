import { useState, useMemo } from 'react'
import { zeriKnowledge } from './zeriKnowledge'
import type { KnowledgeSection } from './zeriKnowledge'
import { JianchuDemo } from './JianchuDemo'

export function ZeriLearnPanel({ embedded = false }: { embedded?: boolean }) {
  const [activeSection, setActiveSection] = useState(zeriKnowledge[0].id)
  const [activeChapter, setActiveChapter] = useState(zeriKnowledge[0].chapters[0].id)
  const [searchQuery, setSearchQuery] = useState('')

  const currentSection = zeriKnowledge.find(s => s.id === activeSection)!
  const currentChapter = currentSection.chapters.find(c => c.id === activeChapter) ?? currentSection.chapters[0]

  // 搜索过滤
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return zeriKnowledge
    const q = searchQuery.trim()
    return zeriKnowledge
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

      {/* 建除十二神演示（交互工具） */}
      {chapter.id === 'jianchu-demo' && (
        <JianchuDemo />
      )}

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
    </div>
  )

  return (
    <div className={embedded ? '' : 'p-8'}>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2c2416]">择日学习</h1>
          <p className="text-sm text-[#5c4d3d] mt-1">
            参考《玉匣记》《协纪辨方书》等传统择日典籍整理 · 择吉避凶之道
          </p>
        </div>
      )}

      {/* 搜索框 */}
      <div className="mb-5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索知识：如 建除、天德、嫁娶、彭祖百忌..."
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
              <span className="text-xs text-[#b8a98f]">换个关键词试试，如：成日、六合、四离、开市</span>
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
                    const secIdx = zeriKnowledge.findIndex(s => s.id === activeSection)
                    const chapIdx = currentSection.chapters.findIndex(c => c.id === activeChapter)
                    if (chapIdx > 0) {
                      setActiveChapter(currentSection.chapters[chapIdx - 1].id)
                    } else if (secIdx > 0) {
                      const prev = zeriKnowledge[secIdx - 1]
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
                    const secIdx = zeriKnowledge.findIndex(s => s.id === activeSection)
                    const chapIdx = currentSection.chapters.findIndex(c => c.id === activeChapter)
                    if (chapIdx < currentSection.chapters.length - 1) {
                      setActiveChapter(currentSection.chapters[chapIdx + 1].id)
                    } else if (secIdx < zeriKnowledge.length - 1) {
                      const next = zeriKnowledge[secIdx + 1]
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
