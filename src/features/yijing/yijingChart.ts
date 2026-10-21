// 易经推命：三卦起法（参考四柱推命"先天卦 / 后天卦 / 流年卦"通行口径）
//  先天卦：生年支序 + 农历月 + 日 → 上卦；+ 时支序 → 下卦与动爻（重年支，命之体）
//  后天卦：农历月 + 日（去年支）→ 上卦；+ 时支序 → 下卦与动爻（重日柱，运之用）
//  流年卦：以流年支序替换年支，其余同先天法（逐年一卦，当年之运）
// @ts-ignore lunar-javascript 无类型声明
import { Solar } from 'lunar-javascript'
import { findHexagram, NUM_TO_GUA } from './yijingHexagram'
import type { Hexagram } from './yijingHexagram'

const ZHI_NUM: Record<string, number> = {
  子: 1, 丑: 2, 寅: 3, 卯: 4, 辰: 5, 巳: 6, 午: 7, 未: 8, 申: 9, 酉: 10, 戌: 11, 亥: 12,
}

// 八卦三爻（从下到上，1=阳 0=阴）：乾111 兑110 离101 震100 巽011 坎010 艮001 坤000
const TRIGRAM_LINES: Record<string, [number, number, number]> = {
  乾: [1, 1, 1], 兑: [1, 1, 0], 离: [1, 0, 1], 震: [1, 0, 0],
  巽: [0, 1, 1], 坎: [0, 1, 0], 艮: [0, 0, 1], 坤: [0, 0, 0],
}

function linesToGua(lines: [number, number, number]): string {
  const key = lines.join('')
  for (const [name, l] of Object.entries(TRIGRAM_LINES)) {
    if (l.join('') === key) return name
  }
  return '乾'
}

export interface YiChart {
  yearZhi: string
  lunarMonth: number
  lunarDay: number
  hourZhi: string
  upperNum: number
  lowerNum: number
  movingYao: number // 1-6（初爻至 上爻）
  upperGua: string
  lowerGua: string
  benGua: Hexagram | undefined
  bianGua: Hexagram | undefined
  huGua: Hexagram | undefined
  benLines: number[]  // 本卦六爻（从下到上）
  bianLines: number[] // 变卦六爻
}

// opts.yearBranchSeq 指定年支序（流年卦用）；opts.includeYear=false 为后天卦（去年支）
export function buildYiChart(
  solar: { year: number; month: number; day: number; hourIndex: number },
  opts?: { yearBranchSeq?: number; includeYear?: boolean },
): YiChart | null {
  try {
    const lunar = Solar.fromYmdHms(solar.year, solar.month, solar.day, 0, 0, 0).getLunar()
    // 时辰地支：hourIndex 0=子(23-01)...11=亥(21-23)，晚子时归当日
    const hourZhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    const yearZhi = lunar.getYearZhi()
    const month = lunar.getMonth()
    const day = lunar.getDay()
    const hourZhi = hourZhiList[solar.hourIndex]
    const yearNum = opts?.yearBranchSeq ?? ZHI_NUM[yearZhi] ?? 1
    const hourNum = ZHI_NUM[hourZhi] ?? 1
    const includeYear = opts?.includeYear ?? true

    const base = (includeYear ? yearNum : 0) + month + day
    const upperNum = base % 8 === 0 ? 8 : base % 8
    const lowerNum = (base + hourNum) % 8 === 0 ? 8 : (base + hourNum) % 8
    const movingYao = (base + hourNum) % 6 === 0 ? 6 : (base + hourNum) % 6

    const upperGua = NUM_TO_GUA[upperNum]
    const lowerGua = NUM_TO_GUA[lowerNum]

    const benGua = findHexagram(upperGua, lowerGua)

    // 本卦六爻
    const benLines: number[] = [...TRIGRAM_LINES[lowerGua], ...TRIGRAM_LINES[upperGua]]
    // 变卦：动爻翻转
    const bianLines = benLines.map((v, i) => (i === movingYao - 1 ? (v === 1 ? 0 : 1) : v))
    const bianUpper = linesToGua([bianLines[3], bianLines[4], bianLines[5]])
    const bianLower = linesToGua([bianLines[0], bianLines[1], bianLines[2]])
    const bianGua = findHexagram(bianUpper, bianLower)

    // 互卦：二三四爻为下互、三四五爻为上互
    const huLower = linesToGua([benLines[1], benLines[2], benLines[3]])
    const huUpper = linesToGua([benLines[2], benLines[3], benLines[4]])
    const huGua = findHexagram(huUpper, huLower)

    return {
      yearZhi, lunarMonth: month, lunarDay: day, hourZhi,
      upperNum, lowerNum, movingYao,
      upperGua, lowerGua,
      benGua, bianGua, huGua,
      benLines, bianLines,
    }
  } catch (e) {
    return null
  }
}

export { ZHI_NUM }
