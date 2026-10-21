import { useState } from 'react'
// @ts-ignore lunar-javascript 无类型声明
import { Solar } from 'lunar-javascript'
import { GAN_DATA, ZHI_DATA, WUXING_SHENG_KE, SHI_SHEN_DATA, CANG_GAN, DAYUN_METHOD, QIANG_RUO, YONG_SHEN, yongShenDirection, SHEN_SHA_RULES, GUI_REN, WEN_CHANG, YANG_REN, LU_SHEN, SHEN_SHA_MEANING, GAN_HE, ZHI_LIUHE, ZHI_CHONG, ZHI_HAI, ZHI_SANHE, ZHI_XING, changSheng, CHANG_SHENG_STATES, NAYIN_TABLE, NAYIN_WX, GE_JU, ZU_HE, SHI_SHEN_SHENG, SHI_SHEN_KE, SHI_SHEN_CIRCLE, WU_HU_DUN, MONTH_ZHI } from './baziKnowledge'
import { setSharedProfile, navTo } from '../../shared/profile'
import { YEAR_WEIGHT, MONTH_WEIGHT, DAY_WEIGHT, HOUR_WEIGHT, CHENG_GU_POEM, liangText } from './chengGu'

const HOURS = [
  '子时（23:00-01:00）', '丑时（01:00-03:00）', '寅时（03:00-05:00）', '卯时（05:00-07:00）',
  '辰时（07:00-09:00）', '巳时（09:00-11:00）', '午时（11:00-13:00）', '未时（13:00-15:00）',
  '申时（15:00-17:00）', '酉时（17:00-19:00）', '戌时（19:00-21:00）', '亥时（21:00-23:00）',
]

const GAN_WX: Record<string, string> = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' }
const GAN_YY: Record<string, string> = { 甲: '阳', 乙: '阴', 丙: '阳', 丁: '阴', 戊: '阳', 己: '阴', 庚: '阳', 辛: '阴', 壬: '阳', 癸: '阴' }
const ZHI_WX: Record<string, string> = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' }

// 大运细批：天干相克/地支冲合
const GAN_KE_MAP: Record<string, string> = { 甲: '戊', 乙: '己', 丙: '庚', 丁: '辛', 戊: '壬', 己: '癸', 庚: '甲', 辛: '乙', 壬: '丙', 癸: '丁' }
const GAN_HE_MAP2: Record<string, string> = { 甲: '己', 乙: '庚', 丙: '辛', 丁: '壬', 戊: '癸', 己: '甲', 庚: '乙', 辛: '丙', 壬: '丁', 癸: '戊' }
const ZHI_CHONG_MAP: Record<string, string> = { 子: '午', 丑: '未', 寅: '申', 卯: '酉', 辰: '戌', 巳: '亥', 午: '子', 未: '丑', 申: '寅', 酉: '卯', 戌: '辰', 亥: '巳' }
const ZHI_HE_MAP: Record<string, string> = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' }

// 大运主题（按大运天干十神）
const DYUN_THEME: Record<string, string> = {
  正官: '事业晋升、名誉地位之运：宜守正职守，利公职管理，忌与官非纠缠。',
  七杀: '压力挑战、磨砺突破之运：宜勇担重任、化压力为动力，防口舌是非。',
  正财: '财星当运，财运稳健：宜务实求财、正业积累，忌投机冒进。',
  偏财: '财来财去，机遇偏财：宜灵活经营、把握时机，防破耗虚掷。',
  正印: '印星护身，学业贵人之运：宜进修充电、文书签约，多得提携。',
  偏印: '偏印生身亦夺食：宜钻研技艺、独辟蹊径，防思虑过度。',
  食神: '食神生财，才华展露：宜技艺谋生、口福人缘，忌过度安逸。',
  伤官: '伤官泄秀，锋芒外露：宜创意表达、自由职业，防恃才傲物、犯上。',
  比肩: '比肩帮身亦分财：宜合伙创业、广结人脉，防竞争失和。',
  劫财: '劫财夺财，破耗争竞：宜谨慎理财、防小人劫夺，合作宜明算账。',
}

// 五行配色
const WX_COLOR: Record<string, string> = {
  木: 'bg-[#2f6b4f]', 火: 'bg-[#c0392b]', 土: 'bg-[#b8860b]', 金: 'bg-[#8a6d3b]', 水: 'bg-[#2c5f8a]',
}

// 十神：以日干论（同我比肩/劫财、生我印、我生食伤、克我官杀、我克财）
function shiShen(dayGan: string, otherGan: string): string {
  if (otherGan === dayGan) return '比肩'
  const dw = GAN_WX[dayGan], ow = GAN_WX[otherGan]
  const dSame = GAN_YY[dayGan] === GAN_YY[otherGan]
  const sheng: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
  const ke: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }
  if (ow === dw) return dSame ? '比肩' : '劫财'
  if (sheng[dw] === ow) return dSame ? '食神' : '伤官'
  if (sheng[ow] === dw) return dSame ? '偏印' : '正印'
  if (ke[ow] === dw) return dSame ? '七杀' : '正官'
  if (ke[dw] === ow) return dSame ? '偏财' : '正财'
  return '比肩'
}

// 流年干支（公元年份 → 干支）
function yearGanZhi(year: number): string {
  const gan = '甲乙丙丁戊己庚辛壬癸'[(year - 4) % 10]
  const zhi = '子丑寅卯辰巳午未申酉戌亥'[(year - 4) % 12]
  return gan + zhi
}

// 干支 → 纳音（六十甲子序号 → 纳音表）
function nayinByGanZhi(ganZhi: string): string {
  const ganIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(ganZhi[0])
  const zhiIdx = '子丑寅卯辰巳午未申酉戌亥'.indexOf(ganZhi[1])
  const seq = (ganIdx * 6 - zhiIdx * 5 + 60) % 60
  const row = Math.floor(seq / 10) * 2 + 1
  const col = seq % 10
  return NAYIN_TABLE[row][col]
}

interface ArchiveItem {
  name: string
  date: string
  hourIndex: number
  gender: 'male' | 'female'
  savedAt: string
}

interface BaziData {
  pillars: { label: string; gan: string; zhi: string; hideGan: string[]; ganShiShen: string; zhiShiShen: string[]; nayin: string }[]
  dayGan: string
  dayGanWx: string
  taiYuan: string
  mingGong: string
  shenGong: string
  daYun: { ganZhi: string; startAge: number; endAge: number }[]
  qiyunAge: number
  chengGu: { yearGz: string; yearW: number; month: number; monthW: number; day: number; dayW: number; hourZhi: string; hourW: number; total: number } | null
}

export function BaziPanel() {
  const [date, setDate] = useState('1990-01-01')
  const [hourIndex, setHourIndex] = useState(0)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [data, setData] = useState<BaziData | null>(null)
  const [liuNian, setLiuNian] = useState(2026)
  const [tab, setTab] = useState<'chart' | 'learn'>('chart')
  const [archives, setArchives] = useState<ArchiveItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('baziArchives') || '[]') as ArchiveItem[] } catch { return [] }
  })
  const [archiveName, setArchiveName] = useState('')
  const [nayinYear, setNayinYear] = useState(2026)
  const [nayinPick, setNayinPick] = useState('甲子')
  const [flowMonthYear, setFlowMonthYear] = useState(2026)
  const [flowDay, setFlowDay] = useState('2026-10-19')
  const [dyDetail, setDyDetail] = useState<{ ganZhi: string; startAge: number; endAge: number; liuNian: { year: number; gz: string }[] }[]>([])

  const saveArchive = () => {
    const name = archiveName.trim() || `${date} ${HOURS[hourIndex].slice(0, 2)}${gender === 'male' ? '男' : '女'}`
    const item: ArchiveItem = { name, date, hourIndex, gender, savedAt: new Date().toISOString().slice(0, 10) }
    const next = [item, ...archives.filter((a) => a.name !== name)]
    setArchives(next)
    localStorage.setItem('baziArchives', JSON.stringify(next))
    setArchiveName('')
  }

  const loadArchive = (a: ArchiveItem) => {
    setDate(a.date)
    setHourIndex(a.hourIndex)
    setGender(a.gender)
    setTimeout(() => { /* 排盘在下一渲染后自动触发展示由用户点排盘 */ }, 0)
  }

  const deleteArchive = (name: string) => {
    const next = archives.filter((a) => a.name !== name)
    setArchives(next)
    localStorage.setItem('baziArchives', JSON.stringify(next))
  }

  const runChart = () => {
    const [y, m, d] = date.split('-').map(Number)
    // 时辰 → 小时（子=0 丑=2 … 午=12 … 亥=22），时柱随时辰变化
    const hour = hourIndex * 2
    const lunar = Solar.fromYmdHms(y, m, d, hour, 0, 0).getLunar()
    const ec = lunar.getEightChar()
    const pillars = [
      { label: '年柱', gan: ec.getYear()[0], zhi: ec.getYear()[1], hide: ec.getYearHideGan() as string[], nayin: ec.getYearNaYin() },
      { label: '月柱', gan: ec.getMonth()[0], zhi: ec.getMonth()[1], hide: ec.getMonthHideGan() as string[], nayin: ec.getMonthNaYin() },
      { label: '日柱', gan: ec.getDay()[0], zhi: ec.getDay()[1], hide: ec.getDayHideGan() as string[], nayin: ec.getDayNaYin() },
      { label: '时柱', gan: ec.getTime()[0], zhi: ec.getTime()[1], hide: ec.getTimeHideGan() as string[], nayin: ec.getTimeNaYin() },
    ].map((p) => ({
      label: p.label,
      gan: p.gan, zhi: p.zhi, hideGan: p.hide,
      ganShiShen: p.label === '日柱' ? '日主' : shiShen(ec.getDay()[0], p.gan),
      zhiShiShen: p.hide.map((g) => shiShen(ec.getDay()[0], g)),
      nayin: p.nayin,
    }))
    const dayGan = ec.getDay()[0]
    // 大运
    const yun = ec.getYun(gender === 'male' ? 1 : 0)
    const dy = yun.getDaYun() as { getGanZhi(): string; getStartAge(): number; getEndAge(): number }[]
    const daYun = dy.map((d2) => ({ ganZhi: d2.getGanZhi(), startAge: d2.getStartAge(), endAge: d2.getEndAge() }))
    const qiyunAge = dy.length > 0 ? dy[0].getStartAge() : 1
    // 大运逐年流年细批
    const dyDetailData = dy.map((d2) => {
      const ln = ((d2 as unknown as { getLiuNian?: () => { getYear(): number; getGanZhi(): string }[] }).getLiuNian?.()) || []
      return { ganZhi: d2.getGanZhi(), startAge: d2.getStartAge(), endAge: d2.getEndAge(), liuNian: ln.map((x) => ({ year: x.getYear(), gz: x.getGanZhi() })) }
    })
    setDyDetail(dyDetailData)
    // 袁天罡称骨：农历年月日时重量
    const yearGz = lunar.getYearInGanZhi()
    const lMonth = lunar.getMonth()
    const lDay = lunar.getDay()
    const hourZhi = '子丑寅卯辰巳午未申酉戌亥'[hourIndex]
    const yearW = YEAR_WEIGHT[yearGz] ?? 0
    const monthW = MONTH_WEIGHT[lMonth] ?? 0
    const dayW = DAY_WEIGHT[lDay] ?? 0
    const hourW = HOUR_WEIGHT[hourIndex] ?? 0
    const total = yearW + monthW + dayW + hourW
    setData({
      pillars,
      dayGan,
      dayGanWx: GAN_WX[dayGan],
      taiYuan: ec.getTaiYuan(),
      mingGong: ec.getMingGong(),
      shenGong: ec.getShenGong(),
      daYun,
      qiyunAge,
      chengGu: { yearGz, yearW, month: lMonth, monthW, day: lDay, dayW, hourZhi, hourW, total },
    })
    // 写入跨模块共享档案（紫微/易经联动）
    setSharedProfile({ date, timeIndex: hourIndex, gender: gender === 'male' ? '男' : '女', name: '四柱命盘' })
  }

  if (tab === 'learn') {
    return <BaziLearnTab setTab={setTab} />
  }

  // 五行统计
  const wxCount: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  const ganList: string[] = []
  const zhiList: string[] = []
  if (data) {
    data.pillars.forEach((p) => {
      ganList.push(p.gan)
      zhiList.push(p.zhi)
      wxCount[GAN_WX[p.gan]] += 1
      wxCount[ZHI_WX[p.zhi]] += 0.5
      p.hideGan.forEach((g) => { wxCount[GAN_WX[g]] += 0.5 })
    })
  }

  // 日主强弱简判
  let strength: { label: string; hint: string } | null = null
  if (data) {
    const dayWx = data.dayGanWx
    const shengMap: Record<string, string> = { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' }
    const monthZhi = data.pillars[1].zhi
    const deLing = ZHI_WX[monthZhi] === dayWx || shengMap[dayWx] === ZHI_WX[monthZhi]
    const zhiScore = data.pillars.reduce((s, p) => s + (ZHI_WX[p.zhi] === dayWx || shengMap[dayWx] === ZHI_WX[p.zhi] ? 1 : 0), 0)
    const ganScore = data.pillars.filter((p) => p.gan !== data.dayGan).reduce((s, p) => s + (GAN_WX[p.gan] === dayWx || shengMap[dayWx] === GAN_WX[p.gan] ? 1 : 0), 0)
    const total = 3 + (deLing ? 2 : 0) + zhiScore + ganScore
    if (total >= 8) strength = { label: '日主偏强', hint: '旺则喜克泄耗：官杀、财星、食伤为用，宜进取开拓。' }
    else if (total <= 4) strength = { label: '日主偏弱', hint: '弱则喜生扶：印星、比劫为用，宜积累贵人。' }
    else strength = { label: '日主中和', hint: '中和之命，五行流转平衡，顺势而为即可。' }
  }

  // 本局出现的十神概览（去重）
  const appearSS: { name: string; count: number }[] = []
  if (data) {
    const m: Record<string, number> = {}
    data.pillars.forEach((p) => {
      m[p.ganShiShen] = (m[p.ganShiShen] || 0) + 1
      p.zhiShiShen.forEach((s) => { m[s] = (m[s] || 0) + 0.5 })
    })
    Object.entries(m).forEach(([k, v]) => { if (k !== '日主') appearSS.push({ name: k, count: v }) })
    appearSS.sort((a, b) => b.count - a.count)
  }

  // 神煞：年支法 + 日干法
  const shenShaList: { pillar: string; name: string; meaning: string }[] = []
  if (data) {
    const yearZhi = data.pillars[0].zhi
    const dayGan = data.dayGan
    const groups: Record<string, [string, string][]> = {
      申子辰: [['驿马', '寅'], ['桃花', '酉'], ['华盖', '辰'], ['将星', '子']],
      寅午戌: [['驿马', '申'], ['桃花', '卯'], ['华盖', '戌'], ['将星', '午']],
      巳酉丑: [['驿马', '亥'], ['桃花', '午'], ['华盖', '丑'], ['将星', '酉']],
      亥卯未: [['驿马', '巳'], ['桃花', '子'], ['华盖', '未'], ['将星', '卯']],
    }
    const group = Object.keys(groups).find((g) => g.includes(yearZhi))
    if (group) {
      groups[group].forEach(([name, zhi]) => {
        data.pillars.forEach((p, i) => {
          if (p.zhi === zhi) shenShaList.push({ pillar: data.pillars[i].label, name, meaning: SHEN_SHA_RULES[name] })
        })
      })
    }
    // 红鸾天喜（年支）
    const hongluanOrder = ['卯', '寅', '丑', '子', '亥', '戌', '酉', '申', '未', '午', '巳', '辰']
    const yzIdx = '子丑寅卯辰巳午未申酉戌亥'.indexOf(yearZhi)
    const hl = hongluanOrder[yzIdx]
    const tx = ZHI_CHONG[hl]
    data.pillars.forEach((p, i) => {
      if (p.zhi === hl) shenShaList.push({ pillar: data.pillars[i].label, name: '红鸾', meaning: SHEN_SHA_RULES['红鸾'] })
      if (p.zhi === tx) shenShaList.push({ pillar: data.pillars[i].label, name: '天喜', meaning: SHEN_SHA_RULES['天喜'] })
    })
    // 日干法
    const dayRules: [string, Record<string, string>][] = [
      ['天乙贵人', GUI_REN],
      ['文昌贵人', WEN_CHANG],
      ['羊刃', YANG_REN],
      ['禄神', LU_SHEN],
    ]
    dayRules.forEach(([name, table]) => {
      const target = table[dayGan]
      if (!target) return
      data.pillars.forEach((p, i) => {
        if (target.includes(p.zhi)) shenShaList.push({ pillar: data.pillars[i].label, name, meaning: SHEN_SHA_MEANING[name] })
      })
    })
  }

  // 合冲刑害
  const heChongList: { text: string; type: string }[] = []
  if (data) {
    const gans = data.pillars.map((p) => p.gan)
    const zhis = data.pillars.map((p) => p.zhi)
    // 天干五合（相邻柱）
    for (let i = 0; i < 3; i++) {
      if (GAN_HE[gans[i]] === gans[i + 1] || GAN_HE[gans[i + 1]] === gans[i]) {
        heChongList.push({ text: `${data.pillars[i].label} ${gans[i]} · ${data.pillars[i + 1].label} ${gans[i + 1]}：天干五合`, type: 'he' })
      }
    }
    // 地支关系（四柱两两）
    const labels = data.pillars.map((p) => p.label)
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const a = zhis[i], b = zhis[j]
        if (ZHI_LIUHE[a] === b) heChongList.push({ text: `${labels[i]}${a} · ${labels[j]}${b}：地支六合`, type: 'he' })
        if (ZHI_CHONG[a] === b) heChongList.push({ text: `${labels[i]}${a} · ${labels[j]}${b}：地支六冲`, type: 'chong' })
        if (ZHI_HAI[a] === b) heChongList.push({ text: `${labels[i]}${a} · ${labels[j]}${b}：地支六害`, type: 'hai' })
        if (ZHI_XING[a]?.includes(b)) heChongList.push({ text: `${labels[i]}${a} · ${labels[j]}${b}：地支相刑`, type: 'xing' })
        if (ZHI_SANHE[a]?.includes(b)) {
          const third = ZHI_SANHE[a].find((z) => z !== b)
          if (third && zhis.includes(third)) {
            heChongList.push({ text: `${labels[i]}${a} · ${labels[j]}${b} · ${labels[zhis.indexOf(third)]}${third}：三合局`, type: 'he' })
          }
        }
      }
    }
  }

  // 十二长生（日干）
  const changShengRows: { pillar: string; zhi: string; state: string }[] = []
  if (data) {
    data.pillars.forEach((p) => {
      changShengRows.push({ pillar: p.label, zhi: p.zhi, state: changSheng(data.dayGan, p.zhi) })
    })
  }

  // 格局（月令取格）
  let geJu: { name: string; like: string; dis: string } | null = null
  if (data) {
    const monthZhi = data.pillars[1].zhi
    const benQi = CANG_GAN[monthZhi].main
    const ss = shiShen(data.dayGan, benQi)
    const geMap: Record<string, string> = { 正官: '正官格', 七杀: '七杀格', 正财: '正财格', 偏财: '偏财格', 正印: '正印格', 偏印: '偏印格', 食神: '食神格', 伤官: '伤官格', 比肩: '建禄格', 劫财: '阳刃格' }
    const geName = geMap[ss]
    if (geName) {
      geJu = GE_JU.find((g) => g.name === geName) || null
    }
  }

  // 纳音互参
  const nayinRows: { label: string; nayin: string; wx: string }[] = []
  if (data) {
    data.pillars.forEach((p) => {
      nayinRows.push({ label: p.label, nayin: p.nayin, wx: NAYIN_WX[p.nayin] || '' })
    })
  }

  // 流年大运合参
  const birthYear = Number(date.split('-')[0])
  const ageAt = liuNian - birthYear
  const currentDayun = data ? data.daYun.find((d) => ageAt >= d.startAge && ageAt <= d.endAge && d.ganZhi) : null
  const zhuHe: { dss: string; lss: string; note: string } | null = (() => {
    if (!data || !currentDayun) return null
    const gz = yearGanZhi(liuNian)
    const dss = shiShen(data.dayGan, currentDayun.ganZhi[0])
    const lss = shiShen(data.dayGan, gz[0])
    const group = (s: string) => s === '比肩' || s === '劫财' ? '比劫' : s === '食神' || s === '伤官' ? '食伤' : s === '正官' || s === '七杀' ? '官杀' : s === '正财' || s === '偏财' ? '财' : '印'
    const c1 = ZU_HE.find((z) => z.combo.includes(group(dss)) && z.combo.includes(group(lss)))
    return c1 ? { dss, lss, note: c1.note } : null
  })()

  return (
    <div className="space-y-4">
      {/* Tab */}
      <div className="flex gap-2">
        <button onClick={() => setTab('chart')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">排盘推算</button>
        <button onClick={() => setTab('learn')} className="px-4 py-1.5 bg-[#f0e7d8] text-[#5c4d3d] rounded text-sm hover:bg-[#e8dcc8]">学习知识</button>
      </div>

      {/* 表单 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <h3 className="text-base font-bold text-[#2c2416] mb-3">八字排盘 · 五行十神</h3>
        <p className="text-xs text-[#9a8b75] mb-3">输入出生信息排出四柱，含藏干、十神、纳音、五行统计、大运流年与日主强弱简判。</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">出生日期（阳历）</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]" />
          </div>
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">出生时辰</div>
            <select value={hourIndex} onChange={(e) => setHourIndex(Number(e.target.value))} className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]">
              {HOURS.map((h, i) => <option key={h} value={i}>{h}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">性别</div>
            <div className="flex gap-1.5">
              {(['male', 'female'] as const).map((g) => (
                <button key={g} onClick={() => setGender(g)} className={`px-3 py-1.5 rounded text-sm ${gender === g ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d]'}`}>
                  {g === 'male' ? '男' : '女'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={runChart} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm hover:bg-[#a93226]">排盘</button>
          {data && (
            <div className="flex items-center gap-1.5">
              <input value={archiveName} onChange={(e) => setArchiveName(e.target.value)} placeholder="档案名（可留空）" className="w-32 px-2 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]" />
              <button onClick={saveArchive} className="px-3 py-1.5 bg-[#fdf8e8] border border-[#f0e0b8] text-[#b8860b] rounded text-sm hover:bg-[#f8eed4]">存档案</button>
            </div>
          )}
        </div>
        {archives.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#f0e7d8]">
            <div className="text-xs font-bold text-[#2c2416] mb-2">已存命盘（{archives.length}）</div>
            <div className="flex flex-wrap gap-2">
              {archives.map((a) => (
                <div key={a.name} className="flex items-center gap-1.5 border border-[#e8dcc8] rounded px-2.5 py-1.5 bg-[#fdfaf3]">
                  <span className="text-xs text-[#2c2416]">{a.name}</span>
                  <span className="text-[10px] text-[#9a8b75]">{a.date} {HOURS[a.hourIndex].slice(0, 2)} {a.gender === 'male' ? '男' : '女'}</span>
                  <button onClick={() => loadArchive(a)} className="text-[10px] text-[#c0392b] hover:underline">载入</button>
                  <button onClick={() => deleteArchive(a.name)} className="text-[10px] text-[#b8a98f] hover:text-[#c0392b]">删</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* 跨模块联动（不依赖排盘结果） */}
        <div className="mt-3 pt-3 border-t border-[#f0e7d8]">
          <div className="text-xs font-bold text-[#2c2416] mb-1.5">跨模块联动（{date} {HOURS[hourIndex].slice(0, 2)} · {gender === 'male' ? '男' : '女'}）</div>
          <p className="text-[11px] text-[#9a8b75] mb-2">同生辰一键排盘，各模块互相验证：</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSharedProfile({ date, timeIndex: hourIndex, gender: gender === 'male' ? '男' : '女', name: '四柱命盘' }); navTo('ziwei') }}
              className="px-3 py-1.5 bg-[#c0392b] text-white rounded text-sm hover:bg-[#a93226]"
            >紫微斗数排盘 →</button>
            <button
              onClick={() => { setSharedProfile({ date, timeIndex: hourIndex, gender: gender === 'male' ? '男' : '女', name: '四柱命盘' }); navTo('yijing') }}
              className="px-3 py-1.5 bg-[#fdf8e8] border border-[#f0e0b8] text-[#b8860b] rounded text-sm hover:bg-[#f8eed4]"
            >易经三卦推命 →</button>
            <button
              onClick={() => navTo('zeri')}
              className="px-3 py-1.5 bg-[#f5efe0] border border-[#e8dcc8] text-[#5c4d3d] rounded text-sm hover:bg-[#efe5d2]"
            >择日（人命择日）→</button>
          </div>
        </div>
      </div>

      {data && (
        <div className="space-y-4">
          {/* 四柱表 */}
          <div className="grid grid-cols-4 gap-2.5">
            {data.pillars.map((p) => (
              <div key={p.label} className={`bg-white border rounded-lg p-3 text-center ${p.label === '日柱' ? 'border-2 border-[#c0392b]' : 'border-[#e8dcc8]'}`}>
                <div className="text-xs text-[#9a8b75] mb-1.5">{p.label}{p.label === '日柱' ? '（日主）' : ''}</div>
                <div className="text-xl font-bold text-[#2c2416]">{p.gan}</div>
                <div className="text-[10px] text-[#b8860b] mb-1">{p.ganShiShen}</div>
                <div className="text-lg font-bold text-[#2c2416]">{p.zhi}</div>
                <div className="text-[10px] text-[#9a8b75] mb-1">{p.zhiShiShen.join(' ')}</div>
                <div className="text-[10px] text-[#9a8b75]">藏干 {p.hideGan.join(' ')}</div>
                <div className="text-[10px] text-[#b8a98f] mt-0.5">{p.nayin}</div>
              </div>
            ))}
          </div>

          {/* 五行统计 + 日主强弱 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
              <div className="text-sm font-bold text-[#2c2416] mb-3">五行分布（天干 1 计 / 地支与藏干 0.5 计）</div>
              <div className="space-y-2">
                {Object.entries(wxCount).map(([wx, n]) => (
                  <div key={wx} className="flex items-center gap-2">
                    <span className="w-6 text-sm text-[#2c2416] font-medium">{wx}</span>
                    <div className="flex-1 h-3 bg-[#f5efe0] rounded overflow-hidden">
                      <div className={`h-full rounded ${WX_COLOR[wx]}`} style={{ width: `${Math.min(100, (n / 8) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-[#9a8b75] w-8 text-right">{n}</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-[#b8a98f] mt-2">天干：{ganList.join(' ')} · 地支：{zhiList.join(' ')}</div>
              <div className="mt-3 pt-3 border-t border-[#f0e7d8]">
                <div className="text-xs font-bold text-[#2c2416] mb-2">本局十神概览</div>
                <div className="flex flex-wrap gap-1.5">
                  {appearSS.map((s) => (
                    <span key={s.name} className="px-2 py-0.5 rounded bg-[#f5efe0] text-[11px] text-[#5c4d3d]">{s.name} <b className="text-[#b8860b]">{s.count}</b></span>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
              <div className="text-sm font-bold text-[#2c2416] mb-2">日主强弱简判 · 用神简取</div>
              <p className="text-sm text-[#2c2416] mb-2">
                日主 <b>{data.dayGan}</b>（{data.dayGanWx}） · <span className="text-[#c0392b] font-medium">{strength?.label}</span>
              </p>
              <p className="text-xs text-[#5c4d3d] leading-relaxed">{strength?.hint}</p>
              {strength && (
                <div className="mt-2.5 bg-[#fdf8e8] border border-[#f0e0b8] rounded p-2.5">
                  <div className="text-xs font-bold text-[#b8860b] mb-1">喜用 · 忌讳（扶抑法入门）</div>
                  {(() => {
                    const d = yongShenDirection(data.dayGanWx, strength!.label.includes('强') ? '强' : strength!.label.includes('弱') ? '弱' : '中')
                    return (
                      <>
                        <p className="text-xs text-[#2c2416]"><b>喜用：</b>{d.xi}</p>
                        <p className="text-xs text-[#9a8b75]"><b>忌讳：</b>{d.ji}</p>
                      </>
                    )
                  })()}
                  <p className="text-[10px] text-[#b8a98f] mt-1">注：用神取用尚有调候、格局、通关诸法，此为入门简取，供研习验证。</p>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-[#f0e7d8] text-xs text-[#9a8b75] space-y-1">
                <p>胎元 {data.taiYuan} · 命宫 {data.mingGong} · 身宫 {data.shenGong}</p>
                <p>注：强弱为入门简判（得令/得地/得势），精细论命需看刑冲合会，供研习验证。</p>
              </div>
            </div>
          </div>

          {/* 称骨歌 */}
          {data.chengGu && (
            <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
              <div className="text-sm font-bold text-[#2c2416] mb-1">袁天罡称骨歌</div>
              <p className="text-[11px] text-[#9a8b75] mb-2">以农历年月日时之重相加论命（重量以钱计，10钱=1两）：</p>
              <div className="flex flex-wrap gap-2 mb-2.5">
                <div className="px-3 py-1.5 rounded border border-[#e8dcc8] bg-[#fdfaf3] text-center">
                  <div className="text-[11px] text-[#9a8b75]">{data.chengGu.yearGz}年</div>
                  <div className="text-sm font-bold text-[#2c2416]">{liangText(data.chengGu.yearW)}</div>
                </div>
                <div className="px-3 py-1.5 rounded border border-[#e8dcc8] bg-[#fdfaf3] text-center">
                  <div className="text-[11px] text-[#9a8b75]">农历{data.chengGu.month}月</div>
                  <div className="text-sm font-bold text-[#2c2416]">{liangText(data.chengGu.monthW)}</div>
                </div>
                <div className="px-3 py-1.5 rounded border border-[#e8dcc8] bg-[#fdfaf3] text-center">
                  <div className="text-[11px] text-[#9a8b75]">农历{data.chengGu.day}日</div>
                  <div className="text-sm font-bold text-[#2c2416]">{liangText(data.chengGu.dayW)}</div>
                </div>
                <div className="px-3 py-1.5 rounded border border-[#e8dcc8] bg-[#fdfaf3] text-center">
                  <div className="text-[11px] text-[#9a8b75]">{data.chengGu.hourZhi}时</div>
                  <div className="text-sm font-bold text-[#2c2416]">{liangText(data.chengGu.hourW)}</div>
                </div>
                <div className="px-4 py-1.5 rounded bg-[#fdf8e8] border border-[#f0e0b8] text-center">
                  <div className="text-[11px] text-[#b8860b]">骨重合计</div>
                  <div className="text-base font-bold text-[#c0392b]">{liangText(data.chengGu.total)}</div>
                </div>
              </div>
              <div className="bg-[#fdfaf3] border border-[#f0e7d8] rounded p-3">
                <div className="text-xs font-bold text-[#b8860b] mb-1">称骨歌曰</div>
                <p className="text-sm text-[#2c2416] leading-relaxed">{CHENG_GU_POEM[data.chengGu.total] || '（此重无对应批注，供研习补遗）'}</p>
              </div>
              <p className="text-[10px] text-[#b8a98f] mt-2">注：称骨为古法简易论命，与八字/紫微可互参；各版本重量与批注有细微差异，供研习验证。</p>
            </div>
          )}

          {/* 流月流日 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="text-sm font-bold text-[#2c2416] mb-1">流月流日速断</div>
            <p className="text-[11px] text-[#9a8b75] mb-3">五虎遁起流月（以节气月分界），流日干支以日柱论十神，皆与日主相较。</p>
            {/* 流月 */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[#9a8b75]">流月（{flowMonthYear}年 · {yearGanZhi(flowMonthYear)}）</span>
              <select value={flowMonthYear} onChange={(e) => setFlowMonthYear(Number(e.target.value))} className="px-2 py-1 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-xs">
                {Array.from({ length: 41 }, (_, i) => 2000 + i).map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {(() => {
              if (!data) return null
              const ygz = yearGanZhi(flowMonthYear)
              const firstIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(WU_HU_DUN[ygz[0]])
              const group = (s: string) => s === '比肩' || s === '劫财' ? '比劫' : s === '食神' || s === '伤官' ? '食伤' : s === '正官' || s === '七杀' ? '官杀' : s === '正财' || s === '偏财' ? '财' : '印'
              const yGroup = group(shiShen(data.dayGan, ygz[0]))
              return (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {MONTH_ZHI.map((zhi, i) => {
                    const gan = '甲乙丙丁戊己庚辛壬癸'[(firstIdx + i) % 10]
                    const ss = shiShen(data.dayGan, gan)
                    const combo = SHI_SHEN_CIRCLE.find((c) => c.combo.includes(group(ss)) && c.combo.includes(yGroup))
                    return (
                      <div key={zhi} className={`px-2 py-1 rounded border text-center ${combo ? 'border-[#c0392b] bg-[#fdf0ee]' : 'border-[#e8dcc8] bg-[#fdfaf3]'}`} title={combo?.note}>
                        <div className="text-xs font-bold text-[#2c2416]">{gan}{zhi}</div>
                        <div className="text-[10px] text-[#b8860b]">{ss}</div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
            {/* 流日 */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f0e7d8]">
              <span className="text-xs text-[#9a8b75]">流日</span>
              <input type="date" value={flowDay} onChange={(e) => setFlowDay(e.target.value)} className="px-2 py-1 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-xs" />
              {data && (() => {
                const [fy, fm, fd] = flowDay.split('-').map(Number)
                const dgz = Solar.fromYmdHms(fy, fm, fd, 12, 0, 0).getLunar().getDayInGanZhi()
                const dss = shiShen(data.dayGan, dgz[0])
                const dNote = SHI_SHEN_DATA.find((s) => s.name === dss)
                return (
                  <span className="px-2.5 py-1 bg-[#fdf8e8] border border-[#f0e0b8] rounded text-xs">
                    {dgz} · <b className="text-[#c0392b]">{dss}</b> {dNote ? `—— ${dNote.meets.replace('流年', '此日')}` : ''}
                  </span>
                )
              })()}
            </div>
          </div>

          {/* 大运 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="text-sm font-bold text-[#2c2416] mb-2">大运（{gender === 'male' ? '男' : '女'} · 约 {data.qiyunAge} 岁起运）</div>
            <div className="flex flex-wrap gap-2">
              {data.daYun.map((d, i) => {
                const fav = d.ganZhi ? (() => {
                  const shengMap: Record<string, string> = { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' }
                  const wx = GAN_WX[d.ganZhi[0]]
                  const strong = strength?.label.includes('强')
                  if (wx === data.dayGanWx || shengMap[data.dayGanWx] === wx) return strong ? { t: '忌', c: 'bg-[#f0e0b8] text-[#b8860b]' } : { t: '喜', c: 'bg-[#e3f0e6] text-[#2f6b4f]' }
                  return { t: '平', c: 'bg-[#f5efe0] text-[#9a8b75]' }
                })() : null
                return (
                <div key={i} className={`px-2.5 py-1.5 rounded border text-center ${d.ganZhi ? 'border-[#e8dcc8] bg-[#fdfaf3]' : 'border-[#f0e7d8] bg-[#f5f0e8]'}`}>
                  {d.ganZhi ? (
                    <>
                      <div className="text-sm font-bold text-[#2c2416]">{d.ganZhi}</div>
                      <div className="text-[10px] text-[#9a8b75]">{d.startAge}-{d.endAge}岁</div>
                      <div className="text-[10px] text-[#b8860b]">{shiShen(data.dayGan, d.ganZhi[0])}</div>
                      {fav && <div className={`text-[10px] rounded mt-0.5 px-1 ${fav.c}`}>{fav.t}</div>}
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-[#b8a98f]">起运前</div>
                      <div className="text-[10px] text-[#b8a98f]">{d.startAge}-{d.endAge}岁</div>
                    </>
                  )}
                </div>
                )
              })}
            </div>
            <p className="text-[10px] text-[#b8a98f] mt-2">喜/忌/平：大运天干五行相对日主为生扶（喜于弱）或克泄耗（喜于强）的简标。</p>
          </div>

          {/* 大运细批 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="text-sm font-bold text-[#2c2416] mb-1">大运细批（逐年 + 岁运专题）</div>
            <p className="text-[11px] text-[#9a8b75] mb-3">每步大运十年流年逐年标注：岁运并临（流年=大运，吉凶加倍）、天克地冲（大变动年）、天干五合/地支六合（缓化）、地支六冲（动荡）。</p>
            {/* 大运主题 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {dyDetail.map((dd, i) => {
                if (!dd.ganZhi) return null
                const ss = shiShen(data.dayGan, dd.ganZhi[0])
                const theme = DYUN_THEME[ss] || ''
                return (
                  <div key={i} className="flex-1 min-w-[200px] border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                    <div className="text-xs font-bold text-[#c0392b]">{dd.ganZhi}（{dd.startAge}-{dd.endAge}岁 · {ss}运）</div>
                    <p className="text-[11px] text-[#5c4d3d] mt-1 leading-relaxed">{theme}</p>
                  </div>
                )
              })}
            </div>
            {/* 逐年细批表 */}
            <div className="space-y-3">
              {dyDetail.map((dd, i) => {
                if (!dd.ganZhi || dd.liuNian.length === 0) return null
                return (
                  <div key={i} className="border border-[#e8dcc8] rounded p-2.5">
                    <div className="text-xs font-bold text-[#2c2416] mb-1.5">{dd.ganZhi}运（{dd.startAge}-{dd.endAge}岁）逐年流年</div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
                      {dd.liuNian.map((ln, j) => {
                        const ss = shiShen(data.dayGan, ln.gz[0])
                        const suiYun = ln.gz === dd.ganZhi
                        const tianKeDiChong = GAN_KE_MAP[dd.ganZhi[0]] === ln.gz[0] && ZHI_CHONG_MAP[dd.ganZhi[1]] === ln.gz[1]
                        const tianHe = GAN_HE_MAP2[dd.ganZhi[0]] === ln.gz[0]
                        const diHe = ZHI_HE_MAP[dd.ganZhi[1]] === ln.gz[1]
                        const diChong = ZHI_CHONG_MAP[dd.ganZhi[1]] === ln.gz[1]
                        // 喜忌（流年天干五行）
                        const strong2 = strength?.label.includes('强')
                        let fav: { t: string; c: string }
                        const shengMap2: Record<string, string> = { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' }
                        const wx = GAN_WX[ln.gz[0]]
                        if (wx === data.dayGanWx || shengMap2[data.dayGanWx] === wx) fav = strong2 ? { t: '忌', c: 'text-[#b8860b] bg-[#f0e0b8]' } : { t: '喜', c: 'text-[#2f6b4f] bg-[#e3f0e6]' }
                        else fav = { t: '平', c: 'text-[#9a8b75] bg-[#f5efe0]' }
                        const tags: { t: string; c: string }[] = []
                        if (suiYun) tags.push({ t: '岁运并临', c: 'text-[#a93226] bg-[#fdeaea] border-[#e8b8b8]' })
                        if (tianKeDiChong) tags.push({ t: '天克地冲', c: 'text-white bg-[#a93226]' })
                        if (tianHe) tags.push({ t: '干合', c: 'text-[#2f6b4f] bg-[#e3f0e6]' })
                        if (diHe) tags.push({ t: '支合', c: 'text-[#2f6b4f] bg-[#e3f0e6]' })
                        if (diChong && !tianKeDiChong) tags.push({ t: '支冲', c: 'text-[#c0392b] bg-[#fdeaea]' })
                        return (
                          <div key={j} className={`rounded border p-1.5 text-center ${suiYun || tianKeDiChong ? 'border-[#c0392b] bg-[#fdf0ee]' : 'border-[#e8dcc8] bg-[#fdfaf3]'}`}>
                            <div className="text-xs font-bold text-[#2c2416]">{ln.gz}</div>
                            <div className="text-[9px] text-[#9a8b75]">{ln.year}</div>
                            <div className="text-[10px] text-[#b8860b]">{ss}</div>
                            <div className={`mt-0.5 rounded text-[9px] px-0.5 ${fav.c}`}>{fav.t}</div>
                            {tags.length > 0 && (
                              <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                                {tags.map((tag, k) => <span key={k} className={`px-1 rounded text-[9px] border ${tag.c}`}>{tag.t}</span>)}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            {/* 岁运专题 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              <div className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdf0ee]">
                <div className="text-xs font-bold text-[#a93226]">岁运并临</div>
                <p className="text-[10px] text-[#5c4d3d] mt-1 leading-relaxed">流年干支与大运干支完全相同。古诀"岁运并临，灾殃立至"言其力量加倍；吉凶皆放大概率，须结合喜忌判断——喜则机遇加倍、忌则灾祸加倍。</p>
              </div>
              <div className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdf0ee]">
                <div className="text-xs font-bold text-[#a93226]">天克地冲</div>
                <p className="text-[10px] text-[#5c4d3d] mt-1 leading-relaxed">流年与大运天干相克、地支相冲，为岁运交战中变动最烈之象：主环境剧变、事业转轨、搬迁远行或健康波动，宜稳守防冲。</p>
              </div>
              <div className="border border-[#e8dcc8] rounded p-2.5 bg-[#e3f0e6]">
                <div className="text-xs font-bold text-[#2f6b4f]">天干五合 · 地支六合</div>
                <p className="text-[10px] text-[#5c4d3d] mt-1 leading-relaxed">流年与大运天干五合（甲己/乙庚/丙辛/丁壬/戊癸）或地支六合（子丑/寅亥/卯戌/辰酉/巳申/午未），主缓化交合：旧缘牵动、合作达成，亦能化解冲克之力。</p>
              </div>
              <div className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdeaea]">
                <div className="text-xs font-bold text-[#c0392b]">地支六冲</div>
                <p className="text-[10px] text-[#5c4d3d] mt-1 leading-relaxed">流年与大运地支相冲（子午/丑未/寅申/卯酉/辰戌/巳亥），主冲而动：变动搬家、换岗出行、关系波动，冲喜用则动中得机、冲忌神则动中见耗。</p>
              </div>
            </div>
            <p className="text-[10px] text-[#b8a98f] mt-2.5">注：岁运细批为命理推断口径，供研习验证，不作生活决策依据。</p>
          </div>

          {/* 神煞 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="text-sm font-bold text-[#2c2416] mb-1">神煞</div>
            <p className="text-[11px] text-[#9a8b75] mb-2">驿马/桃花/华盖/将星按年支查，红鸾天喜按年支，天乙/文昌/羊刃/禄神按日干查。</p>
            {shenShaList.length > 0 ? (
              <div className="space-y-1.5">
                {shenShaList.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="shrink-0 px-2 py-0.5 bg-[#fdf8e8] border border-[#f0e0b8] rounded text-[#b8860b] font-medium">{s.pillar} · {s.name}</span>
                    <span className="text-[#5c4d3d] leading-relaxed">{s.meaning}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#b8a98f]">本局未现上述主要神煞。</p>
            )}
          </div>

          {/* 合冲刑害 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="text-sm font-bold text-[#2c2416] mb-1">干支合冲刑害</div>
            <p className="text-[11px] text-[#9a8b75] mb-2">天干五合、地支六合/三合/六冲/六害/三刑，四柱内两两比对。</p>
            {heChongList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {heChongList.map((h, i) => (
                  <span key={i} className={`px-2 py-1 rounded text-[11px] ${h.type === 'he' ? 'bg-[#e3f0e6] text-[#2f6b4f]' : h.type === 'chong' ? 'bg-[#fdeaea] text-[#c0392b]' : h.type === 'xing' ? 'bg-[#fdf0ee] text-[#a93226]' : 'bg-[#f5efe0] text-[#9a8b75]'}`}>
                    {h.text}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#b8a98f]">四柱内未见明显合冲刑害关系。</p>
            )}
          </div>

          {/* 十二长生 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="text-sm font-bold text-[#2c2416] mb-2">日主十二长生（{data.dayGan} 在四支）</div>
            <div className="flex flex-wrap gap-2">
              {changShengRows.map((r, i) => (
                <div key={i} className={`px-3 py-1.5 rounded border text-center ${['长生', '临官', '帝旺'].includes(r.state) ? 'border-[#e3f0e6] bg-[#f2f9f3]' : ['墓', '绝', '死'].includes(r.state) ? 'border-[#f0e0b8] bg-[#fdf8e8]' : 'border-[#e8dcc8] bg-[#fdfaf3]'}`}>
                  <div className="text-[11px] text-[#9a8b75]">{r.pillar} {r.zhi}</div>
                  <div className={`text-sm font-bold ${['长生', '临官', '帝旺'].includes(r.state) ? 'text-[#2f6b4f]' : ['墓', '绝', '死'].includes(r.state) ? 'text-[#b8860b]' : 'text-[#2c2416]'}`}>{r.state}</div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#b8a98f] mt-2">长生/临官/帝旺为得气旺地，墓/绝/死为失气之地，余为平运（十二长生状态示意）。</p>
          </div>

          {/* 格局 */}
          {geJu && (
            <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
              <div className="text-sm font-bold text-[#2c2416] mb-1">格局（月令取格）</div>
              <p className="text-xs text-[#9a8b75] mb-2">以月支本气与日主十神定格局：{data.dayGan}日主 · 月支 {data.pillars[1].zhi}（本气 {CANG_GAN[data.pillars[1].zhi].main}）</p>
              <div className="bg-[#fdf8e8] border border-[#f0e0b8] rounded p-2.5">
                <div className="text-base font-bold text-[#c0392b]">{geJu.name}</div>
                <p className="text-xs text-[#2c2416] mt-1"><b>宜：</b>{geJu.like}</p>
                <p className="text-xs text-[#9a8b75] mt-0.5"><b>忌：</b>{geJu.dis}</p>
                <p className="text-[10px] text-[#b8a98f] mt-1.5">格局法为子平论命一大体系，此处取月令本气定格之入门口径，供研习验证。</p>
              </div>
            </div>
          )}

          {/* 纳音互参 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="text-sm font-bold text-[#2c2416] mb-2">纳音互参（古法以纳音论命）</div>
            <div className="flex flex-wrap gap-2">
              {nayinRows.map((n, i) => (
                <div key={i} className="px-3 py-1.5 rounded border border-[#e8dcc8] bg-[#fdfaf3] text-center">
                  <div className="text-[11px] text-[#9a8b75]">{n.label}</div>
                  <div className="text-sm font-bold text-[#2c2416]">{n.nayin}</div>
                  <div className="text-[10px] text-[#b8860b]">属{n.wx}</div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#b8a98f] mt-2">纳音论命古法以年命纳音为主（如大林木命），与正五行论法互补，各家用法不一，此处仅示四柱纳音属性。</p>
          </div>

          {/* 流年 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-sm font-bold text-[#2c2416]">流年</div>
              <select value={liuNian} onChange={(e) => setLiuNian(Number(e.target.value))} className="px-2.5 py-1 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm">
                {Array.from({ length: 41 }, (_, i) => 2000 + i).map((y) => <option key={y} value={y}>{y}年</option>)}
              </select>
            </div>
            {(() => {
              const gz = yearGanZhi(liuNian)
              const ganSS = shiShen(data.dayGan, gz[0])
              const zhiSS = shiShen(data.dayGan, gz[1])
              const ssDetail = SHI_SHEN_DATA.find((s) => s.name === ganSS)
              const zhiDetail = SHI_SHEN_DATA.find((s) => s.name === zhiSS)
              return (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1.5 bg-[#fdf0ee] border border-[#e8dcc8] rounded text-lg font-bold text-[#c0392b]">{gz}</span>
                    <span className="text-sm text-[#5c4d3d]">天干十神：<b className="text-[#b8860b]">{ganSS}</b> · 地支十神：<b className="text-[#b8860b]">{zhiSS}</b></span>
                    <span className="text-xs text-[#9a8b75]">与日主 {data.dayGan} 相较</span>
                  </div>
                  {ssDetail && <p className="text-xs text-[#5c4d3d] leading-relaxed"><b className="text-[#c0392b]">天干主事：</b>{ssDetail.meets}</p>}
                  {zhiDetail && <p className="text-xs text-[#9a8b75] leading-relaxed"><b className="text-[#b8860b]">地支藏神：</b>{zhiDetail.note}</p>}
                  {currentDayun && (
                    <div className="mt-2 pt-2 border-t border-[#f0e7d8]">
                      <p className="text-xs text-[#5c4d3d] mb-1">
                        <b className="text-[#2c2416]">大运合参：</b>{ageAt}岁行 {currentDayun.ganZhi} 大运（{currentDayun.startAge}-{currentDayun.endAge}岁 · {zhuHe ? shiShen(data.dayGan, currentDayun.ganZhi[0]) : ''}），与流年 {gz} 同看
                      </p>
                      {zhuHe && <p className="text-xs text-[#5c4d3d] bg-[#f5efe0] rounded p-2"><b className="text-[#c0392b]">十神组合：</b>大运{shiShen(data.dayGan, currentDayun.ganZhi[0])} × 流年{zhuHe.lss} —— {zhuHe.note}</p>}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>

          {/* 纳音速查 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="text-sm font-bold text-[#2c2416] mb-1">六十甲子纳音速查</div>
            <p className="text-[11px] text-[#9a8b75] mb-2">输入年份查年干支纳音，或手选任意干支查纳音五行。</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <input type="number" value={nayinYear} onChange={(e) => setNayinYear(Number(e.target.value))} className="w-24 px-2 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm" />
                <span className="text-sm text-[#2c2416]">{yearGanZhi(nayinYear)}</span>
                <span className="px-2 py-1 bg-[#fdf8e8] border border-[#f0e0b8] rounded text-sm text-[#b8860b] font-medium">{nayinByGanZhi(yearGanZhi(nayinYear))}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={nayinPick}
                  onChange={(e) => setNayinPick(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm"
                >
                  {(() => {
                    const opts: string[] = []
                    for (let s = 0; s < 60; s++) {
                      opts.push('甲乙丙丁戊己庚辛壬癸'[(s * 5) % 10] + '子丑寅卯辰巳午未申酉戌亥'[(s * 5) % 12])
                    }
                    return opts.map((gz) => (
                      <option key={gz} value={gz}>{gz} · {nayinByGanZhi(gz)}</option>
                    ))
                  })()}
                </select>
                <span className="px-2 py-1 bg-[#f5efe0] border border-[#e8dcc8] rounded text-sm text-[#5c4d3d] font-medium">{nayinPick} → {nayinByGanZhi(nayinPick)}（属{NAYIN_WX[nayinByGanZhi(nayinPick)]}）</span>
              </div>
            </div>
            <p className="text-[10px] text-[#b8a98f] mt-2">注：六十甲子序 = (天干序×6 − 地支序×5) mod 60，表中隔行即纳音。</p>
          </div>
        </div>
      )}
    </div>
  )
}

function BaziLearnTab({ setTab }: { setTab: (t: 'chart' | 'learn') => void }) {
  const [sec, setSec] = useState('gan')
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTab('chart')} className="px-4 py-1.5 bg-[#f0e7d8] text-[#5c4d3d] rounded text-sm hover:bg-[#e8dcc8]">排盘推算</button>
        <button onClick={() => setTab('learn')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">学习知识</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[['gan', '十天干'], ['zhi', '十二地支'], ['wuxing', '五行生克'], ['shishen', '十神'], ['shengsheng', '十神生克'], ['yongshen', '用神简取'], ['geju', '格局入门'], ['zuhe', '十神组合'], ['shensha', '神煞'], ['hechong', '合冲刑害'], ['changsheng', '十二长生'], ['nayin', '纳音表'], ['canggan', '藏干表'], ['dayun', '大运起法'], ['qiangruo', '强弱简判']].map(([k, v]) => (
          <button key={k} onClick={() => setSec(k)} className={`px-3 py-1.5 rounded text-sm ${sec === k ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'}`}>{v}</button>
        ))}
      </div>

      {sec === 'gan' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">十天干</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
            {GAN_DATA.map((g) => (
              <div key={g.gan} className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                <div className="text-lg font-bold text-[#2c2416]">{g.gan}<span className="text-xs text-[#9a8b75] ml-1">{g.yinYang}{g.wuxing}</span></div>
                <div className="text-[11px] text-[#b8860b] mt-1">{g.nature}</div>
                <div className="text-[11px] text-[#9a8b75] mt-0.5">{g.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {sec === 'zhi' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">十二地支</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {ZHI_DATA.map((z) => (
              <div key={z.zhi} className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                <div className="text-lg font-bold text-[#2c2416]">{z.zhi}<span className="text-xs text-[#9a8b75] ml-1">{z.wuxing} · {z.shengxiao}</span></div>
                <div className="text-[11px] text-[#9a8b75] mt-1">{z.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {sec === 'wuxing' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <h4 className="text-base font-bold text-[#2c2416] mb-3">五行相生</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {WUXING_SHENG_KE.sheng.map(([a, b, note], i) => (
                <div key={i} className="flex items-center gap-2 border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                  <span className="px-2 py-0.5 rounded bg-[#fdf8e8] text-[#b8860b] font-medium">{a} → {b}</span>
                  <span className="text-xs text-[#9a8b75]">{note}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <h4 className="text-base font-bold text-[#2c2416] mb-3">五行相克</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {WUXING_SHENG_KE.ke.map(([a, b, note], i) => (
                <div key={i} className="flex items-center gap-2 border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                  <span className="px-2 py-0.5 rounded bg-[#fdf0ee] text-[#c0392b] font-medium">{a} 克 {b}</span>
                  <span className="text-xs text-[#9a8b75]">{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {sec === 'shishen' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">十神详解（以日干为"我"）</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {SHI_SHEN_DATA.map((s) => (
              <div key={s.name} className="border border-[#e8dcc8] rounded p-3 bg-[#fdfaf3]">
                <div className="text-sm font-bold text-[#2c2416]">{s.name}<span className="text-xs text-[#9a8b75] ml-1.5">{s.relation}</span></div>
                <div className="text-xs text-[#5c4d3d] mt-1">{s.note}</div>
                <div className="text-[11px] text-[#9a8b75] mt-1.5 space-y-0.5">
                  <p><b className="text-[#b8860b]">性格：</b>{s.character}</p>
                  <p><b className="text-[#b8860b]">事业：</b>{s.career}</p>
                  <p><b className="text-[#b8860b]">六亲：</b>{s.family}</p>
                  <p><b className="text-[#c0392b]">流年：</b>{s.meets}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {sec === 'geju' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">格局入门（月令取格）</h4>
          <p className="text-xs text-[#5c4d3d] mb-3">格局以月令本气与日主关系定名，十格总览：</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {GE_JU.map((g) => (
              <div key={g.name} className="border border-[#e8dcc8] rounded p-3 bg-[#fdfaf3]">
                <div className="text-sm font-bold text-[#c0392b]">{g.name}</div>
                <div className="text-[11px] text-[#9a8b75] mt-0.5">{g.cond}</div>
                <div className="text-[11px] text-[#2c2416] mt-1"><b>宜：</b>{g.like}</div>
                <div className="text-[11px] text-[#9a8b75] mt-0.5"><b>忌：</b>{g.dis}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">格局尚有透干取格、会支取格、外格诸法，此处为月令本气定格入门，供研习逐步深入。</p>
        </div>
      )}
      {sec === 'zuhe' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">大运流年十神组合简断</h4>
          <div className="space-y-2">
            {ZU_HE.map((z, i) => (
              <div key={i} className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3] flex items-start gap-2">
                <span className="shrink-0 px-2 py-0.5 rounded bg-[#fdf8e8] text-[#b8860b] text-xs font-medium">{z.combo}</span>
                <span className="text-xs text-[#5c4d3d] leading-relaxed">{z.note}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">十神组合为流年断事速用之法，实际论运须结合大运地支、流年地支及命局喜忌，此处为入门速断，供研习验证。</p>
        </div>
      )}
      {sec === 'shensha' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">主要神煞</h4>
          <div className="space-y-2.5">
            {Object.entries(SHEN_SHA_RULES).map(([name, rule]) => (
              <div key={name} className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                <div className="text-sm font-bold text-[#c0392b]">{name}</div>
                <div className="text-xs text-[#5c4d3d] mt-1">{rule}</div>
              </div>
            ))}
            {Object.entries(SHEN_SHA_MEANING).map(([name, meaning]) => (
              <div key={name} className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                <div className="text-sm font-bold text-[#c0392b]">{name}</div>
                <div className="text-xs text-[#5c4d3d] mt-1">{meaning}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">神煞各家取法略有差异（年支法/日支法并用），此处取常见口径，供研习验证。</p>
        </div>
      )}
      {sec === 'hechong' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">合冲刑害关系</h4>
          <div className="space-y-2.5">
            <div className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
              <div className="text-sm font-bold text-[#2f6b4f]">天干五合</div>
              <div className="text-xs text-[#5c4d3d] mt-1">甲己合化土 · 乙庚合化金 · 丙辛合化水 · 丁壬合化木 · 戊癸合化火。合者情投意合，有牵绊亦有助力。</div>
            </div>
            <div className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
              <div className="text-sm font-bold text-[#2f6b4f]">地支六合</div>
              <div className="text-xs text-[#5c4d3d] mt-1">子丑合土 · 寅亥合木 · 卯戌合火 · 辰酉合金 · 巳申合水 · 午未合土。</div>
            </div>
            <div className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
              <div className="text-sm font-bold text-[#2f6b4f]">地支三合</div>
              <div className="text-xs text-[#5c4d3d] mt-1">申子辰合水 · 寅午戌合火 · 巳酉丑合金 · 亥卯未合木。三合成局，力量强旺。</div>
            </div>
            <div className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
              <div className="text-sm font-bold text-[#c0392b]">地支六冲</div>
              <div className="text-xs text-[#5c4d3d] mt-1">子午冲 · 丑未冲 · 寅申冲 · 卯酉冲 · 辰戌冲 · 巳亥冲。冲则动，主变动冲突。</div>
            </div>
            <div className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
              <div className="text-sm font-bold text-[#a93226]">地支六害</div>
              <div className="text-xs text-[#5c4d3d] mt-1">子未害 · 丑午害 · 寅巳害 · 卯辰害 · 申亥害 · 酉戌害。害主暗损不利。</div>
            </div>
            <div className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
              <div className="text-sm font-bold text-[#a93226]">地支三刑</div>
              <div className="text-xs text-[#5c4d3d] mt-1">寅巳申三刑 · 丑戌未三刑 · 子卯相刑 · 辰午酉亥自刑。刑主是非刑伤。</div>
            </div>
          </div>
        </div>
      )}
      {sec === 'changsheng' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">十二长生</h4>
          <p className="text-xs text-[#5c4d3d] mb-3">天干在十二地支的旺衰状态，从长生到养十二位，循环往复：长生（初生）、沐浴（成形）、冠带（渐长）、临官（当权）、帝旺（极盛）、衰、病、死、墓、绝、胎（受孕）、养（孕育）。</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#f5efe0] text-[#2c2416]">
                  <th className="p-2 border border-[#e8dcc8] text-left">日干</th>
                  {CHANG_SHENG_STATES.map((s) => <th key={s} className="p-2 border border-[#e8dcc8]">{s}</th>)}
                </tr>
              </thead>
              <tbody>
                {Object.entries({ 甲: '亥', 乙: '午', 丙: '寅', 丁: '酉', 戊: '寅', 己: '酉', 庚: '巳', 辛: '子', 壬: '申', 癸: '卯' }).map(([gan, start]) => (
                  <tr key={gan} className="bg-[#fdfaf3]">
                    <td className="p-2 border border-[#e8dcc8] font-bold text-[#c0392b]">{gan}</td>
                    {(() => {
                      const order = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
                      const yang = ['甲', '丙', '戊', '庚', '壬'].includes(gan)
                      const startIdx = order.indexOf(start)
                      const states: string[] = []
                      for (let k = 0; k < 12; k++) {
                        const zi = order[(startIdx + (yang ? k : -k + 12)) % 12]
                        states.push(changSheng(gan, zi) || '')
                      }
                      return states.map((s, k) => <td key={k} className="p-2 border border-[#e8dcc8] text-center">{s}</td>)
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">阳干顺行、阴干逆行，甲长生在亥、乙长生在午（阳生阴死之理），供研习记忆。</p>
        </div>
      )}
      {sec === 'nayin' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">六十甲子纳音</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <tbody>
                {NAYIN_TABLE.map((row, i) => (
                  <tr key={i} className="bg-[#fdfaf3]">
                    {row.map((c, j) => (
                      <td key={j} className={`p-1.5 border border-[#e8dcc8] text-center ${j % 2 === 0 ? 'font-bold text-[#2c2416]' : 'text-[#9a8b75]'}`}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">纳音以两干两支共一名（海中金、炉中火…），古法以纳音论命亦有专篇，此处仅列六十甲子纳音全表。</p>
        </div>
      )}
      {sec === 'canggan' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">十二地支藏干</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {Object.entries(CANG_GAN).map(([z, v]) => (
              <div key={z} className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                <div className="text-lg font-bold text-[#2c2416]">{z}</div>
                <div className="text-xs text-[#5c4d3d] mt-1">本气 <b className="text-[#c0392b]">{v.main}</b>{v.rest.length ? ` · 余气 ${v.rest.join(' ')}` : ''}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">地支藏干是看地支力量归属与十神的关键，如寅中藏甲（本气）、丙戊（余气）。</p>
        </div>
      )}
      {sec === 'dayun' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">大运起法</h4>
          <div className="space-y-2.5">
            {DAYUN_METHOD.map((d, i) => (
              <p key={i} className={`text-sm leading-relaxed ${i === 0 ? 'text-[#2c2416] font-medium' : 'text-[#5c4d3d]'}`}>{d}</p>
            ))}
          </div>
        </div>
      )}
      {sec === 'shengsheng' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <h4 className="text-base font-bold text-[#2c2416] mb-3">十神相生（以日主十神关系推衍）</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SHI_SHEN_SHENG.map((s, i) => (
                <div key={i} className="flex items-center gap-2 border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                  <span className="px-2 py-0.5 rounded bg-[#fdf8e8] text-[#b8860b] font-medium text-xs">{s.from} → {s.to}</span>
                  <span className="text-xs text-[#9a8b75]">{s.note}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <h4 className="text-base font-bold text-[#2c2416] mb-3">十神相克（经典口诀）</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SHI_SHEN_KE.map((s, i) => (
                <div key={i} className="flex items-center gap-2 border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                  <span className="px-2 py-0.5 rounded bg-[#fdf0ee] text-[#c0392b] font-medium text-xs">{s.from} 克 {s.to}</span>
                  <span className="text-xs text-[#9a8b75]">{s.note}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <h4 className="text-base font-bold text-[#2c2416] mb-3">经典组合断法</h4>
            <div className="space-y-2">
              {SHI_SHEN_CIRCLE.map((c, i) => (
                <div key={i} className="flex items-start gap-2 border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3]">
                  <span className="shrink-0 px-2 py-0.5 rounded bg-[#f5efe0] text-[#5c4d3d] text-xs font-medium">{c.combo}</span>
                  <span className="text-xs text-[#5c4d3d] leading-relaxed">{c.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {sec === 'yongshen' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">用神简取（扶抑法入门）</h4>
          <div className="space-y-2.5">
            {YONG_SHEN.map((y, i) => (
              <div key={i} className="border border-[#e8dcc8] rounded p-3 bg-[#fdfaf3]">
                <div className="text-sm font-bold text-[#2c2416]">{y.cond}</div>
                <div className="text-xs text-[#c0392b] mt-1">{y.use}</div>
                <div className="text-xs text-[#9a8b75] mt-0.5">{y.note}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">用神是八字论命的枢纽：先判日主强弱，再以扶抑、调候、通关、病药诸法取用，喜用行运则吉。此处仅入门，供研习逐步深入。</p>
        </div>
      )}
      {sec === 'qiangruo' && (
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h4 className="text-base font-bold text-[#2c2416] mb-3">日主强弱简判</h4>
          <div className="space-y-2.5">
            {QIANG_RUO.map((d, i) => (
              <p key={i} className={`text-sm leading-relaxed ${i === 0 ? 'text-[#2c2416] font-medium' : 'text-[#5c4d3d]'}`}>{d}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
