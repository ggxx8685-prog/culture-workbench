import { useState } from 'react'
import { ZIWEI_QUIZ, QUIZ_CATEGORIES, quizScore } from './ziweiQuiz'

const CAT_STYLE: Record<string, string> = {
  入门基础: 'bg-[#c0392b] text-white',
  星曜知识: 'bg-[#b8860b] text-white',
  四化: 'bg-[#8a7a5f] text-white',
  安星法: 'bg-[#a98c6e] text-white',
  三方四正: 'bg-[#5c8a8a] text-white',
  格局: 'bg-[#7a5c8a] text-white',
  大限流年: 'bg-[#5c7a8a] text-white',
  庙陷: 'bg-[#8a6e5c] text-white',
}

export function QuizPanel() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(ZIWEI_QUIZ.length).fill(null))
  const [finished, setFinished] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)

  // 当前展示的题列表（含过滤）
  const shown = filter ? ZIWEI_QUIZ.filter((q) => q.category === filter) : ZIWEI_QUIZ
  const shownIndex = filter ? ZIWEI_QUIZ.findIndex((q) => q.id === shown[current]?.id) : current
  const q = shown[current]
  if (!q && !finished) {
    // 题被过滤后 current 越界时回退
    if (shown.length === 0) return null
  }

  const answered = answers[shownIndex] !== null
  const chosen = answers[shownIndex]

  const pick = (i: number) => {
    if (answered) return
    const next = [...answers]
    next[shownIndex] = i
    setAnswers(next)
  }

  const nextQ = () => {
    if (current + 1 < shown.length) {
      setCurrent(current + 1)
    } else {
      setFinished(true)
    }
  }

  const prevQ = () => {
    if (current > 0) setCurrent(current - 1)
  }

  const restart = () => {
    setAnswers(Array(ZIWEI_QUIZ.length).fill(null))
    setCurrent(0)
    setFinished(false)
    setFilter(null)
  }

  // ===== 结果页 =====
  if (finished) {
    const score = quizScore(answers)
    const wrong = ZIWEI_QUIZ.map((qq, i) => ({ qq, i })).filter(({ i, qq }) => answers[i] !== null && answers[i] !== qq.answer)
    return (
      <div className="space-y-4">
        <div className="bg-[#f8f4ea] border border-[#e8dcc8] rounded-lg p-4 text-center">
          <div className="text-sm text-[#2c2416] font-bold">答题完成</div>
          <div className="text-3xl font-bold my-2 text-[#c0392b]">{score.correct}/{score.total}</div>
          <div className="text-xs text-[#5c4d3d]">
            正确率 {score.rate}%
            {score.rate >= 90 ? ' · 功底扎实，可尝试安星演示验证排盘原理'
              : score.rate >= 70 ? ' · 掌握不错，重点复习错题即可'
              : ' · 建议回到对应章节复习，再战一轮'}
          </div>
          <button
            onClick={restart}
            className="mt-3 px-5 py-1.5 text-sm bg-[#c0392b] text-white rounded hover:bg-[#a83227]"
          >
            重新测验
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold text-[#2c2416]">错题回顾（{wrong.length} 题）</div>
          {wrong.length === 0 ? (
            <div className="text-sm text-[#5c4d3d] bg-[#fdfaf3] border border-[#f0e7d8] rounded p-3">
              全部答对！知识点掌握扎实。
            </div>
          ) : (
            wrong.map(({ qq }) => (
              <div key={qq.id} className="border border-[#e8dcc8] rounded-lg p-3 bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${CAT_STYLE[qq.category] ?? 'bg-gray-400 text-white'}`}>
                    {qq.category}
                  </span>
                  <span className="text-sm text-[#2c2416]">{qq.question}</span>
                </div>
                <div className="text-xs text-[#c0392b] mb-1">
                  你选：{qq.options[answers[ZIWEI_QUIZ.indexOf(qq)] ?? 0]}
                </div>
                <div className="text-xs text-[#5c4d3d] mb-1">正确答案：{qq.options[qq.answer]}</div>
                <div className="text-xs text-[#9a8b75] leading-relaxed">{qq.explain}</div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  if (!q) return null

  // ===== 答题页 =====
  return (
    <div className="space-y-4">
      {/* 分类过滤 */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => { setFilter(null); setCurrent(0) }}
          className={`text-[11px] px-2 py-1 rounded transition-colors ${
            filter === null ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'
          }`}
        >
          全部（{ZIWEI_QUIZ.length}）
        </button>
        {QUIZ_CATEGORIES.map((cat) => {
          const count = ZIWEI_QUIZ.filter((x) => x.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setCurrent(0) }}
              className={`text-[11px] px-2 py-1 rounded transition-colors ${
                filter === cat ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'
              }`}
            >
              {cat}（{count}）
            </button>
          )
        })}
      </div>

      {/* 进度 */}
      <div className="flex items-center justify-between text-xs text-[#9a8b75]">
        <span>第 {current + 1} / {shown.length} 题</span>
        <span>已答 {answers.filter((a) => a !== null).length} / {ZIWEI_QUIZ.length} 题</span>
      </div>
      <div className="h-1 bg-[#f0e7d8] rounded overflow-hidden">
        <div
          className="h-full bg-[#c0392b] transition-all"
          style={{ width: `${((answers.filter((a) => a !== null).length) / ZIWEI_QUIZ.length) * 100}%` }}
        />
      </div>

      {/* 题目 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${CAT_STYLE[q.category] ?? 'bg-gray-400 text-white'}`}>
            {q.category}
          </span>
          <span className="text-sm text-[#2c2416] font-medium">{q.question}</span>
        </div>
        <div className="space-y-1.5">
          {q.options.map((opt, i) => {
            const isChosen = chosen === i
            const isCorrect = i === q.answer
            let cls = 'border-[#e8dcc8] bg-[#fdfaf3] hover:border-[#c0392b] hover:bg-[#fdf0ee]'
            if (answered) {
              if (isCorrect) cls = 'border-[#b8860b] bg-[#f8f0dd] text-[#8a6e2a]'
              else if (isChosen) cls = 'border-[#c0392b] bg-[#fdf0ee] text-[#c0392b]'
              else cls = 'border-[#f0e7d8] bg-[#faf7f0] text-[#b8a98f]'
            }
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={answered}
                className={`w-full text-left text-xs px-3 py-2 rounded border transition-colors ${cls}`}
              >
                <span className="mr-1.5 font-bold">{String.fromCharCode(65 + i)}.</span>
                {opt}
                {answered && isCorrect && <span className="ml-1.5 text-[#b8860b]">✓</span>}
                {answered && isChosen && !isCorrect && <span className="ml-1.5 text-[#c0392b]">✗</span>}
              </button>
            )
          })}
        </div>

        {/* 解析 */}
        {answered && (
          <div className="mt-3 text-xs leading-relaxed bg-[#f8f4ea] border-l-2 border-[#b8860b] rounded px-3 py-2 text-[#5c4d3d]">
            <span className="text-[#c0392b] font-medium">解析：</span>{q.explain}
          </div>
        )}
      </div>

      {/* 导航 */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevQ}
          disabled={current === 0}
          className="px-4 py-1.5 text-sm border border-[#e8dcc8] rounded text-[#5c4d3d] bg-white hover:bg-[#f5efe0] disabled:opacity-40"
        >
          ← 上一题
        </button>
        {answered ? (
          <button
            onClick={nextQ}
            className="px-5 py-1.5 text-sm bg-[#c0392b] text-white rounded hover:bg-[#a83227]"
          >
            {current + 1 < shown.length ? '下一题 →' : '查看结果 →'}
          </button>
        ) : (
          <span className="text-xs text-[#9a8b75]">请选择一个答案</span>
        )}
      </div>
    </div>
  )
}
