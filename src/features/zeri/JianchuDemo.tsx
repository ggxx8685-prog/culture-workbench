import { useMemo, useState } from 'react'
// @ts-ignore - lunar-javascript 类型声明不完善
import { Solar } from 'lunar-javascript'

// 建除十二神（与知识库"建除十二神"章节一致；黄黑道按口诀：除危定执黄，建满平收黑，成开皆可用，闭破不相当）
export const JIANCHU_SHEN: { name: string; huanghei: '黄道' | '黑道'; luck: string; yi: string; ji: string; meaning: string }[] = [
  { name: '建', huanghei: '黑道', luck: '凶多吉少', yi: '宜上书、赴任、出行', ji: '忌动土、开仓', meaning: '建者，岁君也，主始。此日多忌动土开仓，建日又称"兵凶日"。' },
  { name: '除', huanghei: '黄道', luck: '吉', yi: '宜除服、沐浴、扫舍', ji: '忌嫁娶、开市', meaning: '除者，去旧也。除旧布新、扫舍除服最宜；因"除"有去除之意，恐不聚财，故忌嫁娶开市。' },
  { name: '满', huanghei: '黑道', luck: '平吉', yi: '宜祈福、祭祀、纳财', ji: '忌服药、栽种', meaning: '满者，丰盈也。祭祀祈福、纳财入仓最宜；忌服药栽种，恐满则溢。' },
  { name: '平', huanghei: '黑道', luck: '平', yi: '宜修造、嫁娶、交易', ji: '忌开渠、放水', meaning: '平者，平顺也。万事平平，修造嫁娶交易皆可行，忌开渠放水。' },
  { name: '定', huanghei: '黄道', luck: '吉', yi: '宜定盟、纳采、入学', ji: '忌诉讼、远行', meaning: '定者，安定也。定盟、纳采、签约、入学最宜，忌诉讼远行。' },
  { name: '执', huanghei: '黄道', luck: '平吉', yi: '宜捕捉、诉讼、纳财', ji: '忌开市、嫁娶', meaning: '执者，执持也。捕捉、诉讼、纳财可用，忌开市嫁娶，主争执。' },
  { name: '破', huanghei: '黑道', luck: '凶', yi: '宜破屋、坏垣、治病', ji: '忌嫁娶、开市、出行', meaning: '破者，冲破也。此日只宜破屋坏垣、治病驱邪，其余大事皆忌。' },
  { name: '危', huanghei: '黄道', luck: '凶', yi: '宜登山、探险、安床', ji: '忌嫁娶、开市', meaning: '危者，危险也。黄道而不吉，忌嫁娶开市；宜登山探险、安床，取"危而后安"之意。' },
  { name: '成', huanghei: '黄道', luck: '大吉', yi: '宜开市、嫁娶、入学', ji: '忌诉讼、争财', meaning: '成者，成就也。开市嫁娶入学求财皆大吉，万事成就之日，唯忌诉讼。' },
  { name: '收', huanghei: '黄道', luck: '吉', yi: '宜收纳、进财、纳畜', ji: '忌开市、出行', meaning: '收者，收敛也。收纳进财纳畜最宜，忌开市出行，恐"收"则不前。' },
  { name: '开', huanghei: '黄道', luck: '大吉', yi: '宜开业、出行、动土', ji: '忌安葬、余事勿取', meaning: '开者，开张也。开业出行动土嫁娶皆吉，为"上吉"之日，唯忌安葬。' },
  { name: '闭', huanghei: '黑道', luck: '凶', yi: '宜安葬、筑堤、补垣', ji: '忌开市、出行、动土', meaning: '闭者，闭塞也。只宜安葬、筑堤、补垣，其余大事皆不宜。' },
]

const ORDER = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭']
const SHEN_MAP = Object.fromEntries(JIANCHU_SHEN.map((s) => [s.name, s]))

const HUANGHEI_STYLE: Record<string, string> = {
  黄道: 'bg-[#fdf8e8] text-[#b8860b] border-[#b8860b]',
  黑道: 'bg-[#f0ede6] text-[#5c4d3d] border-[#9a8b75]',
}

export function JianchuDemo() {
  const today = new Date()
  const [date, setDate] = useState(today)

  const info = useMemo(() => {
    try {
      const lunar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate()).getLunar()
      const zhixing = lunar.getZhiXing()?.replace('日', '') || ''
      const sh = SHEN_MAP[zhixing] || null
      const yi = Array.isArray(lunar.getDayYi()) ? lunar.getDayYi() : []
      const ji = Array.isArray(lunar.getDayJi()) ? lunar.getDayJi() : []
      return {
        lunar, zhixing, sh, yi, ji,
        jieqi: lunar.getJieQi() || '',
      }
    } catch (e) {
      return null
    }
  }, [date])

  const shift = (n: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + n)
    setDate(d)
  }

  const weekdays = ['日', '一', '二', '三', '四', '五', '六']

  if (!info) return null

  const curIdx = ORDER.indexOf(info.zhixing)

  return (
    <div className="space-y-4">
      {/* 日期控制 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => shift(-1)} className="px-3 py-1.5 text-sm border border-[#d4c9b8] rounded bg-white text-[#5c4d3d] hover:bg-[#f5efe0]">
            ← 前一天
          </button>
          <input
            type="date"
            value={`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m, d] = e.target.value.split('-').map(Number)
                setDate(new Date(y, m - 1, d))
              }
            }}
            className="px-3 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]"
          />
          <button onClick={() => shift(1)} className="px-3 py-1.5 text-sm border border-[#d4c9b8] rounded bg-white text-[#5c4d3d] hover:bg-[#f5efe0]">
            后一天 →
          </button>
          <button onClick={() => setDate(today)} className="px-3 py-1.5 text-sm border border-[#b8860b] text-[#b8860b] rounded bg-[#fdf8e8] hover:bg-[#faf0d8]">
            回到今天
          </button>
        </div>

        {/* 当日概要 */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="text-lg font-bold text-[#2c2416]">
            {date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日
            <span className="ml-2 text-sm text-[#9a8b75]">周{weekdays[date.getDay()]}</span>
          </div>
          {info.sh && (
            <span className={`px-2.5 py-1 rounded border text-sm font-medium ${HUANGHEI_STYLE[info.sh.huanghei]}`}>
              {info.sh.name}日 · {info.sh.huanghei} · {info.sh.luck}
            </span>
          )}
          {info.jieqi && (
            <span className="text-xs text-[#c0392b] bg-[#fdf0ee] rounded px-2 py-1">{info.jieqi}</span>
          )}
        </div>
        <div className="mt-1 text-sm text-[#5c4d3d] space-x-3">
          <span>农历：{info.lunar.getMonthInChinese()}月{info.lunar.getDayInChinese()}</span>
          <span>干支：{info.lunar.getDayInGanZhi()}</span>
          <span>冲煞：{info.lunar.getChongDesc()} 冲 {info.lunar.getSha()}</span>
        </div>
      </div>

      {/* 十二神顺序条 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="text-sm font-bold text-[#2c2416] mb-2">十二建星顺序（当前值神高亮）</div>
        <div className="flex flex-wrap gap-1.5">
          {ORDER.map((n, i) => {
            const s = SHEN_MAP[n]
            const isCur = i === curIdx
            return (
              <button
                key={n}
                onClick={() => { /* 仅展示 */ }}
                className={`px-2.5 py-1.5 rounded border text-sm transition-colors ${
                  isCur
                    ? 'bg-[#c0392b] text-white border-[#c0392b] shadow'
                    : s?.huanghei === '黄道'
                      ? 'bg-[#fdf8e8] text-[#b8860b] border-[#e8dcc8]'
                      : 'bg-[#f8f4ea] text-[#9a8b75] border-[#e8dcc8]'
                }`}
              >
                <span className="font-bold">{n}</span>
                <span className={`ml-1 text-[10px] ${isCur ? 'text-white/80' : s?.huanghei === '黄道' ? 'text-[#b8860b]' : 'text-[#b8a98f]'}`}>
                  {s?.huanghei}
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-[#9a8b75]">
          口诀：建满平收黑，除危定执黄，成开皆可用，闭破不相当。每月从月建之日"建"起依次轮转。
        </p>
      </div>

      {/* 当日建除详解 */}
      {info.sh && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base font-bold text-[#2c2416]">
              「{info.sh.name}」日详解
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded border ${HUANGHEI_STYLE[info.sh.huanghei]}`}>
                {info.sh.huanghei} · {info.sh.luck}
              </span>
            </h4>
          </div>
          <p className="text-sm text-[#5c4d3d] leading-relaxed">{info.sh.meaning}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#fdfaf3] border border-[#f0e7d8] rounded p-2.5">
              <span className="text-[#c0392b] font-medium">宜：</span>
              <span className="text-[#2c2416]">{info.sh.yi}</span>
            </div>
            <div className="bg-[#fdfaf3] border border-[#f0e7d8] rounded p-2.5">
              <span className="text-[#5c4d3d] font-medium">忌：</span>
              <span className="text-[#2c2416]">{info.sh.ji}</span>
            </div>
          </div>
          {info.yi.length > 0 && (
            <p className="mt-2 text-xs text-[#b8a98f]">
              本日黄历宜：{info.yi.join('、')}
            </p>
          )}
          {info.ji.length > 0 && (
            <p className="mt-1 text-xs text-[#b8a98f]">
              本日黄历忌：{info.ji.join('、')}
            </p>
          )}
        </div>
      )}

      {/* 十二神全表速查 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-[#f8f4ea]">
          <span className="text-sm font-bold text-[#2c2416]">十二神速查表</span>
          <span className="ml-2 text-xs text-[#9a8b75]">点击行可对照当日值神学习</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#f5efe0] text-[#5c4d3d]">
              <th className="px-3 py-2 text-left">值日</th>
              <th className="px-3 py-2 text-left">黄黑道</th>
              <th className="px-3 py-2 text-left">吉凶</th>
              <th className="px-3 py-2 text-left">宜</th>
              <th className="px-3 py-2 text-left">忌</th>
            </tr>
          </thead>
          <tbody>
            {JIANCHU_SHEN.map((s, i) => (
              <tr key={s.name}
                className={`${i % 2 === 0 ? 'bg-[#fdfaf3]' : 'bg-white'} ${s.name === info.zhixing ? 'bg-[#fdf0ee] font-medium' : ''}`}>
                <td className="px-3 py-1.5 font-bold text-[#c0392b]">{s.name}日</td>
                <td className="px-3 py-1.5">
                  <span className={`px-1.5 py-0.5 rounded border ${HUANGHEI_STYLE[s.huanghei]}`}>{s.huanghei}</span>
                </td>
                <td className="px-3 py-1.5 text-[#5c4d3d]">{s.luck}</td>
                <td className="px-3 py-1.5 text-[#2c2416]">{s.yi}</td>
                <td className="px-3 py-1.5 text-[#2c2416]">{s.ji}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
