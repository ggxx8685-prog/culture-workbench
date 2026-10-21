import { useEffect, useState } from 'react'
import { MEMO_CARDS, MEMO_CATEGORIES } from './ziweiMemo'
import type { MemoCard } from './ziweiMemo'

const LS_KEY = 'ziwei-memo-progress'

// 熟悉卡 id 集合（localStorage 持久化）
function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

const CAT_STYLE: Record<string, string> = {
  安星口诀: 'bg-[#c0392b] text-white',
  四化表: 'bg-[#b8860b] text-white',
  星曜性质: 'bg-[#5c8a8a] text-white',
  术语速记: 'bg-[#7a5c8a] text-white',
}

export function MemoCardPanel() {
  const [filter, setFilter] = useState<string | null>(null)
  const [order, setOrder] = useState<MemoCard[]>(MEMO_CARDS)
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Set<string>>(loadProgress)
  const [done, setDone] = useState(false)

  // 只看未熟悉卡片
  const remaining = order.filter((c) => !known.has(c.id))
  const current = remaining[pos]

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([...known]))
    } catch { /* ignore */ }
  }, [known])

  const changeFilter = (cat: string | null) => {
    setFilter(cat)
    setPos(0)
    setFlipped(false)
    setDone(false)
  }

  const markKnown = () => {
    if (!current) return
    setKnown((prev) => new Set(prev).add(current.id))
    setFlipped(false)
    if (pos + 1 >= remaining.length) {
      setDone(true)
    } else {
      setPos(pos + 1)
    }
  }

  const markAgain = () => {
    // 再记：跳过当前卡，放到本轮末尾继续练
    if (!current) return
    setFlipped(false)
    if (pos + 1 >= remaining.length) {
      setPos(0)
    } else {
      setPos(pos + 1)
    }
  }

  const resetAll = () => {
    setKnown(new Set())
    setPos(0)
    setFlipped(false)
    setDone(false)
  }

  const reshuffle = () => {
    const arr = [...MEMO_CARDS]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setOrder(arr)
    setPos(0)
    setFlipped(false)
    setDone(false)
  }

  const shownCards = filter ? order.filter((c) => c.category === filter) : order
  const shownRemaining = shownCards.filter((c) => !known.has(c.id))
  const cur = shownRemaining[pos]
  const totalKnown = known.size

  // 全部背熟
  if (done) {
    return (
      <div className="space-y-4">
        <div className="bg-[#f8f4ea] border border-[#e8dcc8] rounded-lg p-6 text-center">
          <div className="text-sm text-[#2c2416] font-bold">本轮全部背熟 🎉</div>
          <div className="text-xs text-[#5c4d3d] mt-2">
            已掌握 {totalKnown} / {MEMO_CARDS.length} 张卡片
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={reshuffle} className="px-4 py-1.5 text-sm bg-[#c0392b] text-white rounded hover:bg-[#a83227]">
              洗牌再练
            </button>
            <button onClick={resetAll} className="px-4 py-1.5 text-sm border border-[#e8dcc8] text-[#5c4d3d] bg-white rounded hover:bg-[#f5efe0]">
              重置全部进度
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!cur) {
    // 该分类全熟或无卡
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => changeFilter(null)}
            className={`text-[11px] px-2 py-1 rounded ${filter === null ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'}`}>
            全部（{MEMO_CARDS.length}）
          </button>
          {MEMO_CATEGORIES.map((cat) => {
            const n = MEMO_CARDS.filter((c) => c.category === cat).length
            return (
              <button key={cat} onClick={() => changeFilter(cat)}
                className={`text-[11px] px-2 py-1 rounded ${filter === cat ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'}`}>
                {cat}（{n}）
              </button>
            )
          })}
        </div>
        <div className="text-center py-8 text-sm text-[#5c4d3d] bg-white border border-[#e8dcc8] rounded-lg">
          {shownCards.length > 0 && shownRemaining.length === 0
            ? '该分类卡片已全部背熟 🎉 点击"全部"或重置进度继续'
            : '暂无可练卡片'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 分类 + 进度 */}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => changeFilter(null)}
          className={`text-[11px] px-2 py-1 rounded ${filter === null ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'}`}>
          全部（{MEMO_CARDS.length}）
        </button>
        {MEMO_CATEGORIES.map((cat) => {
          const n = MEMO_CARDS.filter((c) => c.category === cat).length
          return (
            <button key={cat} onClick={() => changeFilter(cat)}
              className={`text-[11px] px-2 py-1 rounded ${filter === cat ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'}`}>
              {cat}（{n}）
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-[#9a8b75]">
        <span>第 {pos + 1} / {shownRemaining.length} 张（未背熟）</span>
        <span>已掌握 {totalKnown} / {MEMO_CARDS.length}</span>
      </div>
      <div className="h-1 bg-[#f0e7d8] rounded overflow-hidden">
        <div className="h-full bg-[#b8860b] transition-all" style={{ width: `${(totalKnown / MEMO_CARDS.length) * 100}%` }} />
      </div>

      {/* 卡片（点击翻面） */}
      <div className="bg-white border border-[#e8dcc8] rounded-xl p-6 min-h-[180px] flex flex-col cursor-pointer hover:border-[#b8860b] transition-colors select-none"
        onClick={() => setFlipped(!flipped)}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${CAT_STYLE[cur.category] ?? 'bg-gray-400 text-white'}`}>
            {cur.category}
          </span>
          <span className="text-[10px] text-[#9a8b75]">{flipped ? '点击翻回问题' : '点击查看答案'}</span>
        </div>
        {!flipped ? (
          <div className="flex-1 flex items-center justify-center text-center text-lg text-[#2c2416] font-medium leading-relaxed">
            {cur.front}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-sm text-[#5c4d3d] leading-relaxed">
            {cur.back}
          </div>
        )}
      </div>

      {/* 操作 */}
      <div className="flex justify-center gap-2">
        <button onClick={markAgain}
          className="px-4 py-1.5 text-sm border border-[#e8dcc8] text-[#5c4d3d] bg-white rounded hover:bg-[#f5efe0]">
          再记一下
        </button>
        <button onClick={markKnown}
          className="px-6 py-1.5 text-sm bg-[#b8860b] text-white rounded hover:bg-[#a07009]">
          已背熟 ✓
        </button>
      </div>

      <div className="flex justify-between">
        <button onClick={reshuffle} className="text-xs text-[#9a8b75] hover:text-[#c0392b]">
          🔀 洗牌
        </button>
        <button onClick={resetAll} className="text-xs text-[#9a8b75] hover:text-[#c0392b]">
          ↺ 重置全部进度
        </button>
      </div>
    </div>
  )
}
