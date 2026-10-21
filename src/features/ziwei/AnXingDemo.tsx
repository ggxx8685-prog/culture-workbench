import { useState } from 'react'
// @ts-ignore - iztro 类型声明可能不完善
import { astro } from 'iztro'

// 十二时辰选项
const HOURS = [
  '子时（23:00-01:00）', '丑时（01:00-03:00）', '寅时（03:00-05:00）',
  '卯时（05:00-07:00）', '辰时（07:00-09:00）', '巳时（09:00-11:00）',
  '午时（11:00-13:00）', '未时（13:00-15:00）', '申时（15:00-17:00）',
  '酉时（17:00-19:00）', '戌时（19:00-21:00）', '亥时（21:00-23:00）',
]

// 步骤卡片组件
function StepCard({ step, title, formula, children }: {
  step: number
  title: string
  formula: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(step === 1)
  return (
    <div className={`border rounded-lg overflow-hidden ${open ? 'border-[#c0392b]' : 'border-[#e8dcc8]'}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-3 flex items-center justify-between text-left ${
          open ? 'bg-[#fdf0ee]' : 'bg-[#fdfaf3] hover:bg-[#f5efe0]'
        }`}
      >
        <span className="text-sm font-bold text-[#2c2416]">
          <span className="text-[#c0392b] mr-2">第{step}步</span>{title}
        </span>
        <span className="text-xs text-[#9a8b75]">{open ? '▴ 收起' : '▾ 展开'}</span>
      </button>
      {open && (
        <div className="px-4 py-3 bg-white space-y-2">
          <p className="text-xs text-[#9a8b75] border-l-2 border-[#b8860b] pl-2 leading-relaxed">
            {formula}
          </p>
          {children}
        </div>
      )}
    </div>
  )
}

// 宫位结果展示（一行：宫名 + 内容）
function PalaceRow({ name, content, highlight }: { name: string; content: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${highlight ? 'text-[#c0392b] font-medium' : 'text-[#5c4d3d]'}`}>
      <span className="w-12 shrink-0 text-[#9a8b75]">{name}</span>
      <span>{content || '—'}</span>
      {highlight && <span className="text-[10px] bg-[#c0392b] text-white px-1 rounded">目标</span>}
    </div>
  )
}

export function AnXingDemo() {
  const [date, setDate] = useState('1990-01-01')
  const [timeIndex, setTimeIndex] = useState(0)
  const [gender, setGender] = useState<'男' | '女'>('男')
  const [chart, setChart] = useState<any>(null)

  const doCalculate = () => {
    try {
      const astrolabe = astro.bySolar(date, timeIndex, gender)
      setChart(astrolabe)
    } catch (e) {
      console.error('排盘失败:', e)
      alert('排盘失败，请检查输入')
    }
  }

  // 从命盘提取数据
  const soulBranch = chart?.earthlyBranchOfSoulPalace || ''
  const bodyBranch = chart?.earthlyBranchOfBodyPalace || ''
  const fiveElementsClass = chart?.fiveElementsClass || ''

  const palaceOfStar = (starName: string) => {
    if (!chart) return ''
    const p = chart.palaces.find((p: any) =>
      p.majorStars.some((s: any) => s.name === starName) ||
      p.minorStars.some((s: any) => s.name === starName)
    )
    return p ? `${p.name}${p.earthlyBranch}` : ''
  }

  // 十四主星
  const MAJORS = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军']
  // 六吉六煞
  const SIX_GOOD = ['左辅', '右弼', '文昌', '文曲', '天魁', '天钺']
  const SIX_BAD = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫']

  return (
    <div className="space-y-5">
      <div className="text-sm text-[#2c2416] leading-relaxed">
        一张命盘是怎么排出来的？输入生辰，按传统安星法五步，一步步看每颗星的落宫原理（结果由排盘引擎 iztro 验证）。
      </div>

      {/* 输入区 */}
      <div className="bg-[#f8f4ea] border border-[#e8dcc8] rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">出生日期（阳历）</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#d4c9b8] rounded text-sm bg-white focus:outline-none focus:border-[#c0392b]"
            />
          </div>
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">出生时辰</div>
            <select
              value={timeIndex}
              onChange={(e) => setTimeIndex(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-[#d4c9b8] rounded text-sm bg-white focus:outline-none focus:border-[#c0392b]"
            >
              {HOURS.map((h, i) => <option key={i} value={i}>{h}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-[#d4c9b8] rounded overflow-hidden">
            {(['男', '女'] as const).map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-4 py-1.5 text-sm ${gender === g ? 'bg-[#c0392b] text-white' : 'text-[#5c4d3d] hover:bg-[#f5efe0]'}`}
              >
                {g}
              </button>
            ))}
          </div>
          <button
            onClick={doCalculate}
            className="px-5 py-1.5 text-sm bg-[#b8860b] text-white rounded hover:bg-[#a0760a]"
          >
            开始演示
          </button>
        </div>
      </div>

      {chart && (
        <div className="space-y-3">
          {/* 第1步：命宫身宫 */}
          <StepCard
            step={1}
            title="定命宫 · 身宫"
            formula="定命宫：从寅宫起正月，顺数至生月之宫；再从该宫起子时，逆数至生时，所到之宫即命宫。定身宫同理，但顺数生时。"
          >
            <PalaceRow name="命宫" content={`在${soulBranch}宫`} highlight />
            <PalaceRow name="身宫" content={`在${bodyBranch}宫`} />
            <p className="text-xs text-[#9a8b75]">
              命宫地支决定十二宫的位置排布：由命宫起，依次为兄弟、夫妻、子女、财帛、疾厄、迁移、仆役、官禄、田宅、福德、父母。
            </p>
          </StepCard>

          {/* 第2步：五行局 */}
          <StepCard
            step={2}
            title="推五行局"
            formula="用五虎遁推出命宫天干，查命宫干支纳音：金四局、木三局、水二局、火六局、土五局。局数同时决定大限起运岁数（每十年一运）。"
          >
            <PalaceRow name="五行局" content={fiveElementsClass} highlight />
            <p className="text-xs text-[#9a8b75]">
              如命宫在{soulBranch}宫，经五虎遁得命宫干支，其纳音五行对应{fiveElementsClass}。
            </p>
          </StepCard>

          {/* 第3步：定紫微 */}
          <StepCard
            step={3}
            title="定紫微星"
            formula="由五行局与农历生日查表：局数即几日进一宫，从固定起点按生日顺推，得紫微所在宫位。"
          >
            <PalaceRow name="紫微星" content={`在${palaceOfStar('紫微')}宫`} highlight />
            <p className="text-xs text-[#9a8b75]">
              紫微定位后，其余十三颗主星依口诀顺逆安放（见第4步）。
            </p>
          </StepCard>

          {/* 第4步：安十四主星 */}
          <StepCard
            step={4}
            title="安十四主星"
            formula="紫微逆去天机星，隔一太阳武曲辰，天同隔二是廉贞。天府顺行太阴临，贪狼巨门天相侵，天梁七杀破军寻。"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
              {MAJORS.map((star) => (
                <PalaceRow key={star} name={star} content={`在${palaceOfStar(star)}宫`} highlight={star === '紫微'} />
              ))}
            </div>
          </StepCard>

          {/* 第5步：安辅星煞星 */}
          <StepCard
            step={5}
            title="安辅星 · 煞星"
            formula="左辅辰宫顺寻、右弼戌宫逆寻；文昌戌宫顺行、文曲辰宫逆行；天魁天钺依年干贵人口诀；禄存依年干禄位，擎羊在禄存前、陀罗在禄存后；天马依年支驿马口诀。"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
              {SIX_GOOD.map((star) => (
                <PalaceRow key={star} name={star} content={`在${palaceOfStar(star)}宫`} />
              ))}
              {SIX_BAD.map((star) => (
                <PalaceRow key={star} name={star} content={`在${palaceOfStar(star)}宫`} />
              ))}
            </div>
          </StepCard>

          {/* 全盘总览 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-[#f5efe0] text-sm font-bold text-[#2c2416]">
              全盘总览
              <span className="text-xs font-normal text-[#9a8b75] ml-2">
                {chart.solarDate} {gender}命 · {fiveElementsClass} · 命主{chart.soul} 身主{chart.body}
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#fdfaf3]">
                  <th className="px-3 py-2 text-left text-[#5c4d3d] font-medium">宫位</th>
                  <th className="px-3 py-2 text-left text-[#5c4d3d] font-medium">主星</th>
                  <th className="px-3 py-2 text-left text-[#5c4d3d] font-medium">辅星 · 杂曜</th>
                </tr>
              </thead>
              <tbody>
                {chart.palaces.map((p: any, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-[#fdfaf3]' : 'bg-white'}>
                    <td className="px-3 py-2 border-t border-[#e8dcc8] whitespace-nowrap">
                      <span className="font-medium text-[#2c2416]">{p.name}</span>
                      <span className="text-[#9a8b75] text-xs ml-1">{p.heavenlyStem}{p.earthlyBranch}</span>
                      {p.isBodyPalace && <span className="text-[10px] bg-[#b8860b] text-white px-1 ml-1 rounded">身宫</span>}
                      {p.index === chart.palaces.findIndex((x: any) => x.index === 11) && null}
                    </td>
                    <td className="px-3 py-2 border-t border-[#e8dcc8] text-[#c0392b]">
                      {p.majorStars.map((s: any) => s.name + (s.brightness ? `(${s.brightness})` : '')).join(' ') || '—'}
                    </td>
                    <td className="px-3 py-2 border-t border-[#e8dcc8] text-[#5c4d3d] text-xs">
                      {[...p.minorStars, ...p.adjectiveStars].map((s: any) => s.name).join(' ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
