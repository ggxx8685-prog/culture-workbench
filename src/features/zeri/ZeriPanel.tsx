import { useState, useMemo, useEffect } from 'react'
// @ts-ignore - lunar-javascript 类型声明不完善
import { Solar } from 'lunar-javascript'
import { ZeriLearnPanel } from './ZeriLearnPanel'
import { zeriTerms } from './zeriTerms'

// 常见择日事项
const events = [
  { value: '', label: '全部（不筛选）' },
  { value: '嫁娶', label: '结婚嫁娶' },
  { value: '入宅', label: '搬家入宅' },
  { value: '开市', label: '开业开张' },
  { value: '出行', label: '出行远行' },
  { value: '动土', label: '动土修造' },
  { value: '安葬', label: '安葬入土' },
  { value: '祈福', label: '祈福许愿' },
  { value: '求嗣', label: '求嗣生子' },
]

// 生肖列表
const shengxiaoList = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

// 天干五合
const ganHe: Record<string, string> = {
  '甲': '己', '己': '甲',
  '乙': '庚', '庚': '乙',
  '丙': '辛', '辛': '丙',
  '丁': '壬', '壬': '丁',
  '戊': '癸', '癸': '戊',
}

// 地支六冲
const zhiChong: Record<string, string> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
}

// 天干相克（阳克阳、阴克阴）
const ganKe: Record<string, string> = {
  '甲': '戊', '乙': '己',
  '丙': '庚', '丁': '辛',
  '戊': '壬', '己': '癸',
  '庚': '甲', '辛': '乙',
  '壬': '丙', '癸': '丁',
}

// 天干五行
const ganWuXing: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
}

// 地支五行
const zhiWuXing: Record<string, string> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
}

// 择日偏好存储
const PREFS_KEY = 'zeri-preferences'
// 择日验证笔记存储
const NOTES_KEY = 'zeri-notes'

// 建除十二神 → 黄黑道映射（口诀：建满平收黑，除危定执黄，成开皆可用，闭破不相当）
const HUANGDAO = ['除', '危', '定', '执', '成', '开']
const HEIDAO = ['建', '满', '平', '收', '破', '闭']

// lunar-javascript 部分版本 getDayYi/getDayJi/getDayJiShen/getDayXiongSha 返回数组，部分版本返回字符串，统一转为词列表
const toWordList = (v: unknown): string[] => {
  if (Array.isArray(v)) return v as string[]
  if (typeof v === 'string') return (v as string).split(/[\s、,，]+/).filter(Boolean)
  return []
}
const toText = (v: unknown): string => toWordList(v).join(' ')

interface ZeriNote {
  event: string
  result: 'good' | 'normal' | 'bad'
  note: string
  time: number
}

const loadNotes = (): Record<string, ZeriNote> => {
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    if (raw) return JSON.parse(raw) as Record<string, ZeriNote>
  } catch {
    // 忽略损坏数据
  }
  return {}
}

interface ZeriPrefs {
  myShengxiao?: string
  myBirthYear?: number
  myBirthMonth?: number
  myBirthDay?: number
  myBirthHour?: number
  myXiYong?: string[]
  filterEvent?: string
  customKeyword?: string
}

const loadPrefs = (): ZeriPrefs => {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return JSON.parse(raw) as ZeriPrefs
  } catch {
    // 忽略损坏数据
  }
  return {}
}

export function ZeriPanel() {
  const prefs = useMemo(loadPrefs, [])
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [filterEvent, setFilterEvent] = useState(prefs.filterEvent || '')
  const [customKeyword, setCustomKeyword] = useState(prefs.customKeyword || '')
  const [myShengxiao, setMyShengxiao] = useState(prefs.myShengxiao || '')
  const [avoidChong] = useState(true)
  const [showBaziInput, setShowBaziInput] = useState(false)
  const [myBirthYear, setMyBirthYear] = useState(prefs.myBirthYear || 1990)
  const [myBirthMonth, setMyBirthMonth] = useState(prefs.myBirthMonth || 1)
  const [myBirthDay, setMyBirthDay] = useState(prefs.myBirthDay || 1)
  const [myBirthHour, setMyBirthHour] = useState(prefs.myBirthHour ?? 0) // 0-11 对应十二时辰
  const [myXiYong, setMyXiYong] = useState<string[]>(prefs.myXiYong || [])
  const [exportMsg, setExportMsg] = useState('')
  const [showQuickSearch, setShowQuickSearch] = useState(false)
  const [rangeDays, setRangeDays] = useState(60)
  const [learnMode, setLearnMode] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [selectedHour, setSelectedHour] = useState<any>(null)
  const [notes, setNotes] = useState<Record<string, ZeriNote>>(loadNotes)
  const [noteEvent, setNoteEvent] = useState('')
  const [noteResult, setNoteResult] = useState<'good' | 'normal' | 'bad'>('good')
  const [noteText, setNoteText] = useState('')

  // 保存笔记
  const saveNote = () => {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    const updated = {
      ...notes,
      [dateKey]: {
        event: noteEvent || '（未填写事项）',
        result: noteResult,
        note: noteText,
        time: Date.now(),
      },
    }
    setNotes(updated)
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(updated))
    } catch {}
    setNoteEvent('')
    setNoteText('')
  }

  const deleteNote = (dateKey: string) => {
    const updated = { ...notes }
    delete updated[dateKey]
    setNotes(updated)
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(updated))
    } catch {}
  }

  // 偏好自动保存
  useEffect(() => {
    const save: ZeriPrefs = {
      myShengxiao: myShengxiao || undefined,
      myBirthYear: myBirthYear !== 1990 ? myBirthYear : undefined,
      myBirthMonth: myBirthMonth !== 1 ? myBirthMonth : undefined,
      myBirthDay: myBirthDay !== 1 ? myBirthDay : undefined,
      myBirthHour: myBirthHour !== 0 ? myBirthHour : undefined,
      myXiYong: myXiYong.length > 0 ? myXiYong : undefined,
      filterEvent: filterEvent || undefined,
      customKeyword: customKeyword || undefined,
    }
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(save))
    } catch {
      // 忽略存储失败
    }
  }, [myShengxiao, myBirthYear, myBirthMonth, myBirthDay, myBirthHour, myXiYong, filterEvent, customKeyword])

  // 当月天数
  const daysInMonth = new Date(year, month, 0).getDate()
  // 当月第一天是星期几（0=周日）
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

  // 获取某天的农历数据
  const getDayLunar = (y: number, m: number, d: number) => {
    try {
      const solar = Solar.fromYmd(y, m, d)
      return { solar, lunar: solar.getLunar() }
    } catch {
      return null
    }
  }

  // 获取节日名称
  const getFestivals = (y: number, m: number, d: number) => {
    const data = getDayLunar(y, m, d)
    if (!data) return []
    const festivals: string[] = []
    try {
      const solarFestivals = data.solar.getFestivals() || []
      festivals.push(...solarFestivals)
      const lunarFestivals = data.lunar.getFestivals() || []
      festivals.push(...lunarFestivals)
    } catch (e) {
      // 忽略错误
    }
    return festivals
  }

  // 命主日柱干支
  const myDayGanZhi = useMemo(() => {
    try {
      const solar = Solar.fromYmd(myBirthYear, myBirthMonth, myBirthDay)
      const lunar = solar.getLunar()
      const dayGanZhi = lunar.getDayInGanZhi()
      return {
        gan: dayGanZhi[0],
        zhi: dayGanZhi[1],
        full: dayGanZhi,
      }
    } catch {
      return null
    }
  }, [myBirthYear, myBirthMonth, myBirthDay])

  // 判断某天是否与命主日柱天克地冲
  const isTianKeDiChong = (y: number, m: number, d: number) => {
    if (!myDayGanZhi) return false
    const data = getDayLunar(y, m, d)
    if (!data?.lunar) return false
    const dayGanZhi = data.lunar.getDayInGanZhi()
    if (!dayGanZhi || dayGanZhi.length < 2) return false

    const dayGan = dayGanZhi[0]
    const dayZhi = dayGanZhi[1]

    // 天干相克 + 地支相冲 = 天克地冲
    const ganKeMe = ganKe[myDayGanZhi.gan] === dayGan || ganKe[dayGan] === myDayGanZhi.gan
    const zhiChongMe = zhiChong[myDayGanZhi.zhi] === dayZhi

    return ganKeMe && zhiChongMe
  }

  // 判断某天是否与命主日柱天合地合
  const isTianHeDiHe = (y: number, m: number, d: number) => {
    if (!myDayGanZhi) return false
    const data = getDayLunar(y, m, d)
    if (!data?.lunar) return false
    const dayGanZhi = data.lunar.getDayInGanZhi()
    if (!dayGanZhi || dayGanZhi.length < 2) return false

    const dayGan = dayGanZhi[0]

    const ganHeMe = ganHe[myDayGanZhi.gan] === dayGan
    return ganHeMe
  }

  // 判断某天五行是否符合喜用神
  const isXiYongDay = (y: number, m: number, d: number) => {
    if (myXiYong.length === 0) return false
    const data = getDayLunar(y, m, d)
    if (!data?.lunar) return false
    const dayGanZhi = data.lunar.getDayInGanZhi()
    if (!dayGanZhi || dayGanZhi.length < 2) return false

    const dayGan = dayGanZhi[0]
    const dayZhi = dayGanZhi[1]

    const ganWX = ganWuXing[dayGan]
    const zhiWX = zhiWuXing[dayZhi]

    // 天干或地支五行符合喜用神就算
    return myXiYong.includes(ganWX) || myXiYong.includes(zhiWX)
  }

  // 判断某天是否冲指定生肖
  const isChongShengxiao = (y: number, m: number, d: number, sx: string) => {
    if (!sx) return false
    const data = getDayLunar(y, m, d)
    if (!data?.lunar) return false
    const chongDesc = data.lunar.getChongDesc() || ''
    return chongDesc.includes(sx)
  }

  // 判断某天是否是吉日（符合筛选条件）
  const isGoodDay = (y: number, m: number, d: number) => {
    const data = getDayLunar(y, m, d)
    if (!data?.lunar) return false
    const yi = toWordList(data.lunar.getDayYi())

    // 先判断是否符合事项/关键词
    let match = false
    if (filterEvent && yi.includes(filterEvent)) match = true
    if (customKeyword.trim() && yi.includes(customKeyword.trim())) match = true
    if (!match) return false

    // 如果开启了排除冲煞日，冲命主生肖的日子不算吉日
    if (myShengxiao && avoidChong && isChongShengxiao(y, m, d, myShengxiao)) {
      return false
    }

    // 如果有八字，排除天克地冲的日子
    if (myDayGanZhi && avoidChong && isTianKeDiChong(y, m, d)) {
      return false
    }

    return true
  }

  // 生成月历格子
  const calendarDays = useMemo(() => {
    const days: {
      day: number | null
      lunar: any
      solar: any
      isGood: boolean
      festivals: string[]
    }[] = []

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, lunar: null, solar: null, isGood: false, festivals: [] })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const data = getDayLunar(year, month, d)
      if (!data) {
        days.push({ day: d, lunar: null, solar: null, isGood: false, festivals: [] })
        continue
      }
      const { lunar, solar } = data
      days.push({
        day: d,
        lunar,
        solar,
        isGood: isGoodDay(year, month, d),
        festivals: getFestivals(year, month, d),
      })
    }

    return days
  }, [year, month, filterEvent, customKeyword, daysInMonth, firstDayOfWeek])

  // 选中日的详情
  const selectedLunar = useMemo(() => {
    try {
      return Solar.fromYmd(year, month, selectedDay).getLunar()
    } catch {
      return null
    }
  }, [year, month, selectedDay])

  // 当日综合评级
  const dayRating = useMemo(() => {
    if (!selectedLunar) return null
    let score = 0

    // 建除十二神
    const zhixing = selectedLunar.getZhiXing()
    if (HUANGDAO.includes(zhixing)) score += 2
    if (HEIDAO.includes(zhixing)) score -= 2

    // 吉神数量
    const jiShen = toWordList(selectedLunar.getDayJiShen())
    score += Math.min(jiShen.length, 4)
    const xiongSha = toWordList(selectedLunar.getDayXiongSha())
    score -= Math.min(xiongSha.length, 4)

    let level: { label: string; color: string; stars: string } 
    if (score >= 4) {
      level = { label: '上等吉日', color: 'bg-[#b8860b] text-white', stars: '★★★' }
    } else if (score >= 2) {
      level = { label: '吉日', color: 'bg-[#fdf8e8] text-[#b8860b] border border-[#b8860b]', stars: '★★' }
    } else if (score >= 0) {
      level = { label: '平日', color: 'bg-[#f8f4ea] text-[#8a7d6a] border border-[#e8dcc8]', stars: '★' }
    } else {
      level = { label: '凶日', color: 'bg-[#fdf0ee] text-[#c0392b] border border-[#c0392b]', stars: '☆' }
    }
    return { score, level }
  }, [selectedLunar])

  // 当月总结信息
  const monthSummary = useMemo(() => {
    const festivals: { day: number; name: string }[] = []
    const jieqis: { day: number; name: string }[] = []
    let goodCount = 0

    for (let d = 1; d <= daysInMonth; d++) {
      const data = getDayLunar(year, month, d)
      if (!data?.lunar) continue

      // 节日
      const f = getFestivals(year, month, d)
      if (f.length > 0) {
        festivals.push({ day: d, name: f[0] })
      }

      // 节气
      try {
        const jq = data.lunar.getJieQi()
        if (jq) {
          jieqis.push({ day: d, name: jq })
        }
      } catch {}

      // 吉日计数
      if (isGoodDay(year, month, d)) {
        goodCount++
      }
    }

    return { festivals, jieqis, goodCount }
  }, [year, month, filterEvent, customKeyword, daysInMonth])

  // 当日十二时辰
  const dayHours = useMemo(() => {
    if (!selectedLunar) return []
    try {
      // 兼容不同版本 lunar-javascript：旧版 getHours() / 新版 getTimes()
      const lunar = selectedLunar as any
      const hours = typeof lunar.getHours === 'function' ? lunar.getHours() : lunar.getTimes()
      return hours || []
    } catch {
      return []
    }
  }, [selectedLunar])

  const prevMonth = () => {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else {
      setMonth(month - 1)
    }
    setSelectedDay(1)
  }

  const nextMonth = () => {
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else {
      setMonth(month + 1)
    }
    setSelectedDay(1)
  }

  // 吉日速查：从今天起 rangeDays 天内所有符合条件的吉日，按综合评分排序
  const quickSearchDays = useMemo(() => {
    if (!showQuickSearch) return []
    const results: {
      date: Date
      y: number
      m: number
      d: number
      lunar: any
      score: number
      flags: string[]
    }[] = []

    const start = new Date()
    start.setHours(0, 0, 0, 0)

    for (let i = 0; i < rangeDays; i++) {
      const dt = new Date(start)
      dt.setDate(start.getDate() + i)
      const y = dt.getFullYear()
      const m = dt.getMonth() + 1
      const d = dt.getDate()

      if (!isGoodDay(y, m, d)) continue

      const data = getDayLunar(y, m, d)
      if (!data?.lunar) continue

      let score = 1
      const flags: string[] = []

      // 加分：天干相合
      if (isTianHeDiHe(y, m, d)) {
        score += 1
        flags.push('💫天干相合')
      }
      // 加分：五行合喜用
      if (isXiYongDay(y, m, d)) {
        score += 1
        flags.push('🌿合喜用')
      }
      // 加分：节假日
      const fs = getFestivals(y, m, d)
      if (fs.length > 0) {
        score += 0.5
        flags.push(`🎊${fs[0]}`)
      }

      results.push({
        date: dt,
        y,
        m,
        d,
        lunar: data.lunar,
        score,
        flags,
      })
    }

    // 按分数降序，同分按日期升序
    results.sort((a, b) => b.score - a.score || a.date.getTime() - b.date.getTime())
    return results
  }, [showQuickSearch, rangeDays, filterEvent, customKeyword, myShengxiao, myDayGanZhi, myXiYong])

  // 导出吉日清单
  const exportGoodDays = async () => {
    // 收集当月所有吉日
    const goodDays: { date: string; lunar: string; yi: string }[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      if (isGoodDay(year, month, d)) {
        const data = getDayLunar(year, month, d)
        if (data?.lunar) {
          goodDays.push({
            date: `${year}年${month}月${d}日`,
            lunar: `农历${data.lunar.getMonthInChinese()}月${data.lunar.getDayInChinese()}`,
            yi: toText(data.lunar.getDayYi()),
          })
        }
      }
    }

    if (goodDays.length === 0) {
      setExportMsg('当月没有符合条件的吉日')
      setTimeout(() => setExportMsg(''), 2000)
      return
    }

    // 生成文本
    const eventLabel = events.find(e => e.value === filterEvent)?.label || customKeyword || '择日'
    let text = `【${year}年${month}月 吉日清单】\n`
    text += `筛选条件：${eventLabel}\n`
    text += `共 ${goodDays.length} 天\n`
    text += '='.repeat(30) + '\n\n'
    goodDays.forEach((d, i) => {
      text += `${i + 1}. ${d.date}（${d.lunar}）\n`
      text += `   宜：${d.yi}\n\n`
    })

    // 复制到剪贴板
    try {
      await navigator.clipboard.writeText(text)
      setExportMsg(`已复制 ${goodDays.length} 个吉日到剪贴板`)
      setTimeout(() => setExportMsg(''), 2000)
    } catch (e) {
      // 降级：创建下载
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${year}年${month}月吉日清单.txt`
      a.click()
      setExportMsg('已下载吉日清单文件')
      setTimeout(() => setExportMsg(''), 2000)
    }
  }

  // 导出吉日速查结果
  const exportQuickSearch = async () => {
    if (quickSearchDays.length === 0) return
    const eventLabel = events.find(e => e.value === filterEvent)?.label || customKeyword || '择日'
    let text = `【吉日速查清单】\n`
    text += `筛选条件：${eventLabel}\n`
    text += `范围：未来 ${rangeDays} 天\n`
    text += `共 ${quickSearchDays.length} 个吉日（按综合评分排序）\n`
    text += '='.repeat(30) + '\n\n'

    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    quickSearchDays.forEach((item, i) => {
      const level = item.score >= 3 ? '上等' : item.score >= 2 ? '良好' : '可用'
      text += `${i + 1}. ${item.y}年${item.m}月${item.d}日（周${weekdays[item.date.getDay()]}）`
      text += `  ${level}（评分${item.score}）\n`
      text += `   农历${item.lunar.getMonthInChinese()}月${item.lunar.getDayInChinese()} · `
      text += `干支${item.lunar.getDayInGanZhi()} · 建除${item.lunar.getZhiXing()}\n`
      if (item.flags.length > 0) {
        text += `   ${item.flags.join(' ')}\n`
      }
      text += `   宜：${toText(item.lunar.getDayYi())}\n\n`
    })

    try {
      await navigator.clipboard.writeText(text)
      setExportMsg(`已复制 ${quickSearchDays.length} 个速查吉日到剪贴板`)
      setTimeout(() => setExportMsg(''), 2000)
    } catch (e) {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `吉日速查清单.txt`
      a.click()
      setExportMsg('已下载速查吉日清单文件')
      setTimeout(() => setExportMsg(''), 2000)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2c2416]">择日</h1>
          <p className="text-sm text-[#5c4d3d] mt-1">
            {learnMode ? '学习板块 · 参考《玉匣记》等传统典籍' : '择吉避凶 · 每日宜忌 · 吉神凶煞'}
          </p>
        </div>

        {/* 查询 / 学习 标签切换 */}
        <div className="flex bg-white border border-[#d4c9b8] rounded-md overflow-hidden">
          <button
            onClick={() => setLearnMode(false)}
            className={`px-4 py-1.5 text-sm ${
              !learnMode ? 'bg-[#c0392b] text-white' : 'text-[#5c4d3d] hover:bg-[#f5efe0]'
            }`}
          >
            查询吉日
          </button>
          <button
            onClick={() => setLearnMode(true)}
            className={`px-4 py-1.5 text-sm ${
              learnMode ? 'bg-[#c0392b] text-white' : 'text-[#5c4d3d] hover:bg-[#f5efe0]'
            }`}
          >
            学习知识
          </button>
        </div>
      </div>

      {learnMode ? (
        <ZeriLearnPanel embedded />
      ) : (
        <>
          {/* 顶部工具栏 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        {/* 月份切换 */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded bg-white border border-[#d4c9b8] hover:bg-[#f5efe0] text-[#5c4d3d]"
          >
            ‹
          </button>
          <h2 className="text-lg font-bold text-[#2c2416] min-w-32 text-center">
            {year}年{month}月
          </h2>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded bg-white border border-[#d4c9b8] hover:bg-[#f5efe0] text-[#5c4d3d]"
          >
            ›
          </button>
          <button
            onClick={() => {
              const t = new Date()
              setYear(t.getFullYear())
              setMonth(t.getMonth() + 1)
              setSelectedDay(t.getDate())
            }}
            className="ml-2 px-3 py-1 text-sm bg-white border border-[#d4c9b8] rounded hover:bg-[#f5efe0] text-[#5c4d3d]"
          >
            今天
          </button>
        </div>

        {/* 筛选区 */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#5c4d3d]">事项：</span>
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="px-3 py-1.5 border border-[#d4c9b8] rounded bg-white text-sm text-[#2c2416] focus:outline-none focus:border-[#c0392b]"
            >
              {events.map(ev => (
                <option key={ev.value} value={ev.value}>{ev.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#5c4d3d]">关键词：</span>
            <input
              type="text"
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              placeholder="如：搬家、动土..."
              className="w-28 px-3 py-1.5 border border-[#d4c9b8] rounded bg-white text-sm text-[#2c2416] focus:outline-none focus:border-[#c0392b]"
            />
          </div>

          {/* 命主生肖 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#5c4d3d]">我的生肖：</span>
            <select
              value={myShengxiao}
              onChange={(e) => setMyShengxiao(e.target.value)}
              className="px-3 py-1.5 border border-[#d4c9b8] rounded bg-white text-sm text-[#2c2416] focus:outline-none focus:border-[#c0392b]"
            >
              <option value="">未选择</option>
              {shengxiaoList.map(sx => (
                <option key={sx} value={sx}>{sx}</option>
              ))}
            </select>
          </div>

          {/* 八字输入按钮 */}
          <button
            onClick={() => setShowBaziInput(!showBaziInput)}
            className={`px-3 py-1.5 text-sm rounded border ${
              myDayGanZhi
                ? 'bg-[#b8860b] text-white border-[#b8860b]'
                : 'bg-white border-[#d4c9b8] text-[#5c4d3d] hover:bg-[#f5efe0]'
            }`}
          >
            {myDayGanZhi ? `日柱：${myDayGanZhi.full}` : '设置八字'}
          </button>

          {/* 吉日速查按钮 */}
          <button
            onClick={() => setShowQuickSearch(!showQuickSearch)}
            className={`px-3 py-1.5 text-sm rounded border ${
              showQuickSearch
                ? 'bg-[#c0392b] text-white border-[#c0392b]'
                : 'bg-white border-[#d4c9b8] text-[#5c4d3d] hover:bg-[#f5efe0]'
            }`}
          >
            吉日速查
          </button>

          {/* 导出按钮 */}
          <button
            onClick={exportGoodDays}
            className="px-3 py-1.5 text-sm bg-[#b8860b] text-white rounded hover:bg-[#a0760a]"
          >
            导出吉日
          </button>
          {exportMsg && (
            <span className="text-xs text-[#b8860b]">{exportMsg}</span>
          )}
        </div>
      </div>

      {/* 八字输入面板 */}
      {showBaziInput && (
        <div className="mb-4 bg-white rounded-lg border border-[#d4c9b8] p-4">
          <h3 className="text-sm font-bold text-[#2c2416] mb-3">我的八字（用于人命择日）</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#5c4d3d]">出生年：</span>
              <input
                type="number"
                value={myBirthYear}
                onChange={(e) => setMyBirthYear(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-[#d4c9b8] rounded text-sm"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#5c4d3d]">月：</span>
              <select
                value={myBirthMonth}
                onChange={(e) => setMyBirthMonth(Number(e.target.value))}
                className="px-2 py-1 border border-[#d4c9b8] rounded text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#5c4d3d]">日：</span>
              <select
                value={myBirthDay}
                onChange={(e) => setMyBirthDay(Number(e.target.value))}
                className="px-2 py-1 border border-[#d4c9b8] rounded text-sm"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}日</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#5c4d3d]">时辰：</span>
              <select
                value={myBirthHour}
                onChange={(e) => setMyBirthHour(Number(e.target.value))}
                className="px-2 py-1 border border-[#d4c9b8] rounded text-sm"
              >
                {['子时(23-1点)', '丑时(1-3点)', '寅时(3-5点)', '卯时(5-7点)', '辰时(7-9点)', '巳时(9-11点)',
                  '午时(11-13点)', '未时(13-15点)', '申时(15-17点)', '酉时(17-19点)', '戌时(19-21点)', '亥时(21-23点)'].map((h, i) => (
                  <option key={i} value={i}>{h}</option>
                ))}
              </select>
            </div>
            {myDayGanZhi && (
              <span className="text-xs text-[#b8860b]">
                日柱：{myDayGanZhi.full}（{myDayGanZhi.gan}{myDayGanZhi.zhi}）
              </span>
            )}
          </div>

          {/* 喜用神选择 */}
          <div className="mt-3 pt-3 border-t border-[#e8dcc8]">
            <div className="text-xs text-[#5c4d3d] mb-2">我的喜用神（可多选）：</div>
            <div className="flex gap-2">
              {['木', '火', '土', '金', '水'].map(wx => (
                <button
                  key={wx}
                  onClick={() => {
                    setMyXiYong(prev =>
                      prev.includes(wx) ? prev.filter(w => w !== wx) : [...prev, wx]
                    )
                  }}
                  className={`px-3 py-1 text-xs rounded border ${
                    myXiYong.includes(wx)
                      ? 'bg-[#b8860b] text-white border-[#b8860b]'
                      : 'bg-white border-[#d4c9b8] text-[#5c4d3d] hover:bg-[#f5efe0]'
                  }`}
                >
                  {wx}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#9a8b75] mt-2">
            设置八字后，自动排除与你日柱天克地冲的日子；设置喜用神后，标出当日五行符合你喜用的吉日
          </p>
        </div>
      )}

      <div className="flex gap-6 items-start">
        {/* 左侧：主视图 */}
        <div className="flex-1 bg-white rounded-lg border border-[#d4c9b8] p-4">
          {/* 月视图 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-center text-xs text-[#9a8b75] py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              if (!item.day) {
                return <div key={idx} className="aspect-square" />
              }

              const isSelected = item.day === selectedDay
              const isToday = item.day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear()
              const lunarDay = item.lunar?.getDayInChinese() || ''
              const lunarMonth = item.lunar?.getDay() === 1 ? item.lunar.getMonthInChinese() + '月' : ''
              const hasFestival = item.festivals.length > 0
              const isChongMe = myShengxiao && isChongShengxiao(year, month, item.day!, myShengxiao)
              const isTianKeDiChongDay = myDayGanZhi && isTianKeDiChong(year, month, item.day!)
              const isTianHeDiHeDay = myDayGanZhi && isTianHeDiHe(year, month, item.day!)
              const isXiYong = isXiYongDay(year, month, item.day!)
              const noteKey = `${year}-${String(month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`
              const hasNote = Boolean(notes[noteKey])

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(item.day!)}
                  className={`aspect-square border rounded p-1 text-left transition-colors flex flex-col ${
                    isSelected
                      ? 'border-[#c0392b] bg-[#fdf0ee]'
                      : isTianKeDiChongDay
                        ? 'border-[#c0392b] bg-[#fdf0ee] opacity-80'
                        : isChongMe
                          ? 'border-[#9a8b75] bg-[#f0ede6] opacity-70'
                          : item.isGood && isXiYong
                            ? 'border-[#b8860b] bg-[#fdf8e8] hover:bg-[#faf0d8] ring-1 ring-[#b8860b]'
                            : item.isGood
                              ? 'border-[#b8860b] bg-[#fdf8e8] hover:bg-[#faf0d8]'
                              : isToday
                                ? 'border-[#c0392b] bg-[#fff5f3]'
                                : 'border-[#e8dcc8] bg-[#fdfaf3] hover:bg-[#f5efe0]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-sm font-medium ${
                      isSelected ? 'text-[#c0392b]' : 'text-[#2c2416]'
                    }`}>
                      {item.day}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {hasFestival && (
                        <span className="text-[#c0392b] text-xs">🎊</span>
                      )}
                      {isXiYong && (
                        <span className="text-[#2e7d32] text-xs" title="五行符合喜用神">🌿</span>
                      )}
                      {isTianHeDiHeDay && (
                        <span className="text-[#b8860b] text-xs" title="与你日柱天干相合">💫</span>
                      )}
                      {isChongMe && (
                        <span className="text-[#9a8b75] text-xs" title={`冲${myShengxiao}`}>⚡</span>
                      )}
                      {isTianKeDiChongDay && (
                        <span className="text-[#c0392b] text-xs" title="天克地冲，大凶">✖</span>
                      )}
                      {item.isGood && (
                        <span className="text-[#b8860b] text-xs">★</span>
                      )}
                      {hasNote && (
                        <span className="text-[#c0392b] text-xs" title="有择日验证记录">●</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-[#9a8b75] mt-0.5 leading-tight truncate">
                    {hasFestival ? item.festivals[0] : lunarMonth || lunarDay}
                  </div>
                  <div className="text-[10px] text-[#c0392b] leading-tight truncate">
                    {item.lunar?.getZhiXing() || ''}
                  </div>
                </button>
              )
            })}
          </div>

          {/* 月运总结 */}
          <div className="mt-4 pt-3 border-t border-[#e8dcc8]">
            <h4 className="text-sm font-bold text-[#2c2416] mb-2">本月概览</h4>
            <div className="grid grid-cols-3 gap-3 text-xs text-[#5c4d3d]">
              <div>
                <span className="text-[#9a8b75]">节气：</span>
                {monthSummary.jieqis.length > 0
                  ? monthSummary.jieqis.map(jq => `${jq.day}日 ${jq.name}`).join('、')
                  : '无'}
              </div>
              <div>
                <span className="text-[#9a8b75]">节日：</span>
                {monthSummary.festivals.length > 0
                  ? monthSummary.festivals.map(f => `${f.day}日 ${f.name}`).join('、')
                  : '无'}
              </div>
              <div>
                <span className="text-[#9a8b75]">吉日：</span>
                <span className="text-[#b8860b] font-medium">{monthSummary.goodCount} 天</span>
              </div>
            </div>
          </div>

          {/* 图例 */}
          <div className="mt-4 pt-3 border-t border-[#e8dcc8] flex items-center gap-4 text-xs text-[#9a8b75] flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#fdf8e8] border border-[#b8860b] rounded inline-block" />
              吉日
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#fff5f3] border border-[#c0392b] rounded inline-block" />
              今天
            </span>
            <span className="flex items-center gap-1">
              <span className="text-[#c0392b]">🎊</span>
              节假日
            </span>
            {myDayGanZhi && (
              <>
                <span className="flex items-center gap-1">
                  <span className="text-[#c0392b]">✖</span>
                  天克地冲（大凶）
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-[#b8860b]">💫</span>
                  天干相合（吉）
                </span>
              </>
            )}
            {myXiYong.length > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-[#2e7d32]">🌿</span>
                五行合喜用
              </span>
            )}
            {myShengxiao && (
              <span className="flex items-center gap-1">
                <span className="text-[#9a8b75]">⚡</span>
                冲{myShengxiao}（避忌）
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="text-[#c0392b]">●</span>
              有验证记录
            </span>
          </div>

          {/* 吉日速查面板 */}
          {showQuickSearch && (
            <div className="mt-4 pt-3 border-t border-[#e8dcc8]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-[#2c2416]">吉日速查</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#9a8b75]">范围：</span>
                  {[30, 60, 90].map(r => (
                    <button
                      key={r}
                      onClick={() => setRangeDays(r)}
                      className={`px-2.5 py-1 text-xs rounded border ${
                        rangeDays === r
                          ? 'bg-[#c0392b] text-white border-[#c0392b]'
                          : 'bg-white border-[#d4c9b8] text-[#5c4d3d] hover:bg-[#f5efe0]'
                      }`}
                    >
                      {r}天
                    </button>
                  ))}
                  <button
                    onClick={exportQuickSearch}
                    disabled={quickSearchDays.length === 0}
                    className="px-2.5 py-1 text-xs rounded bg-[#b8860b] text-white hover:bg-[#a0760a] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    导出
                  </button>
                </div>
              </div>

              {quickSearchDays.length === 0 ? (
                <div className="text-center text-xs text-[#9a8b75] py-6 bg-[#f8f4ea] rounded">
                  所选范围内没有符合条件的吉日
                  <br />
                  <span className="text-[#b8a98f]">试试换一个事项、关键词，或扩大时间范围</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-[#9a8b75]">
                    共找到 <span className="text-[#b8860b] font-medium">{quickSearchDays.length}</span> 个吉日，按综合评分排序：
                  </div>
                  {quickSearchDays.map((item, idx) => {
                    const level =
                      item.score >= 3
                        ? '上等'
                        : item.score >= 2
                          ? '良好'
                          : '可用'
                    const levelColor =
                      item.score >= 3
                        ? 'bg-[#fdf8e8] border-[#b8860b]'
                        : item.score >= 2
                          ? 'bg-[#fdfaf3] border-[#d4c9b8]'
                          : 'bg-white border-[#e8dcc8]'
                    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
                    return (
                      <div
                        key={idx}
                        className={`border rounded p-3 ${levelColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#2c2416]">
                              {item.m}月{item.d}日
                            </span>
                            <span className="text-xs text-[#9a8b75]">
                              周{weekdays[item.date.getDay()]}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              item.score >= 3
                                ? 'bg-[#b8860b] text-white'
                                : item.score >= 2
                                  ? 'bg-[#e8dcc8] text-[#5c4d3d]'
                                  : 'bg-[#f5f0e8] text-[#9a8b75]'
                            }`}>
                              {level}
                            </span>
                          </div>
                          <div className="text-xs text-[#9a8b75]">
                            评分：<span className="text-[#b8860b] font-medium">{item.score}</span>
                          </div>
                        </div>
                        <div className="text-xs text-[#5c4d3d] mt-1">
                          <span className="text-[#9a8b75]">农历：</span>
                          {item.lunar.getMonthInChinese()}月{item.lunar.getDayInChinese()} ·{' '}
                          <span className="text-[#9a8b75]">干支：</span>
                          {item.lunar.getDayInGanZhi()} ·{' '}
                          <span className="text-[#9a8b75]">建除：</span>
                          <span className="text-[#c0392b]">{item.lunar.getZhiXing()}</span>
                        </div>
                        {item.flags.length > 0 && (
                          <div className="text-xs text-[#b8860b] mt-1">
                            {item.flags.join(' ')}
                          </div>
                        )}
                        <div className="text-xs text-[#2c2416] mt-1.5">
                          <span className="text-[#c0392b]">宜：</span>{toText(item.lunar.getDayYi())}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 右侧：当日详情 */}
        <div className="w-80 shrink-0 space-y-4">
          {selectedLunar && (
            <>
              {/* 日期基本信息 */}
              <div className="bg-white rounded-lg border border-[#d4c9b8] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-[#2c2416]">
                    {year}年{month}月{selectedDay}日
                  </h3>
                  {dayRating && (
                    <span className={`text-xs px-2 py-1 rounded ${dayRating.level.color}`}>
                      {dayRating.level.stars} {dayRating.level.label}
                    </span>
                  )}
                </div>
                {dayRating && (
                  <p className="text-[10px] text-[#9a8b75] mb-2">
                    综合评分 {dayRating.score}（建除黄黑道 + 吉神凶煞）
                  </p>
                )}
                <div className="text-sm text-[#5c4d3d] space-y-1">
                  <div>农历：{selectedLunar.getMonthInChinese()}月{selectedLunar.getDayInChinese()}</div>
                  <div>干支：{selectedLunar.getDayInGanZhi()}</div>
                </div>
                {(() => {
                  const festivals: string[] = []
                  try {
                    const solarData = Solar.fromYmd(year, month, selectedDay)
                    festivals.push(...(solarData.getFestivals() || []))
                    festivals.push(...(selectedLunar.getFestivals() || []))
                  } catch {}
                  if (festivals.length === 0) return null
                  return (
                    <div className="mt-2 pt-2 border-t border-[#e8dcc8]">
                      <span className="text-xs text-[#c0392b] font-medium">🎊 {festivals.join('、')}</span>
                    </div>
                  )
                })()}
              </div>

              {/* 择日验证笔记 */}
              <div className="bg-white rounded-lg border border-[#d4c9b8] p-4">
                <h4 className="text-sm font-bold text-[#2c2416] mb-2">择日验证</h4>
                {(() => {
                  const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
                  const note = notes[dateKey]
                  if (note) {
                    const resultLabel = { good: '顺利 ✅', normal: '一般 ⚪', bad: '不顺 ⚠️' }[note.result]
                    const resultColor = { good: 'text-[#2e7d32]', normal: 'text-[#9a8b75]', bad: 'text-[#c0392b]' }[note.result]
                    return (
                      <div className="bg-[#f8f4ea] rounded p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#2c2416] font-medium">{note.event}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${resultColor}`}>{resultLabel}</span>
                            <button
                              onClick={() => deleteNote(dateKey)}
                              className="text-[10px] text-[#9a8b75] hover:text-[#c0392b]"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                        {note.note && (
                          <p className="text-xs text-[#5c4d3d] mt-1.5 leading-relaxed">{note.note}</p>
                        )}
                        <p className="text-[10px] text-[#b8a98f] mt-1.5">
                          记录于 {new Date(note.time).toLocaleDateString()} {new Date(note.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )
                  }
                  return (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={noteEvent}
                        onChange={(e) => setNoteEvent(e.target.value)}
                        placeholder="今天做了什么？（如：搬家、签约）"
                        className="w-full px-2.5 py-1.5 border border-[#d4c9b8] rounded text-xs bg-[#fdfaf3] focus:outline-none focus:border-[#c0392b]"
                      />
                      <div className="flex gap-1.5">
                        {([
                          { value: 'good', label: '顺利' },
                          { value: 'normal', label: '一般' },
                          { value: 'bad', label: '不顺' },
                        ] as const).map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setNoteResult(opt.value)}
                            className={`flex-1 py-1.5 text-xs rounded border ${
                              noteResult === opt.value
                                ? opt.value === 'good'
                                  ? 'bg-[#2e7d32] text-white border-[#2e7d32]'
                                  : opt.value === 'normal'
                                    ? 'bg-[#9a8b75] text-white border-[#9a8b75]'
                                    : 'bg-[#c0392b] text-white border-[#c0392b]'
                                : 'bg-white border-[#d4c9b8] text-[#5c4d3d] hover:bg-[#f5efe0]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="备注（可选）：如：当天诸事顺利"
                        className="w-full px-2.5 py-1.5 border border-[#d4c9b8] rounded text-xs bg-[#fdfaf3] focus:outline-none focus:border-[#c0392b]"
                      />
                      <button
                        onClick={saveNote}
                        className="w-full py-1.5 text-xs bg-[#b8860b] text-white rounded hover:bg-[#a0760a]"
                      >
                        保存验证记录
                      </button>
                      <p className="text-[10px] text-[#b8a98f]">
                        记录当天实际结果，日积月累验证择日理论
                      </p>
                    </div>
                  )
                })()}
              </div>

              {/* 宜忌 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border border-[#d4c9b8] p-3">
                  <h4 className="text-sm font-bold text-[#c0392b] mb-2">宜</h4>
                  <div className="flex flex-wrap gap-1">
                    {toWordList(selectedLunar.getDayYi()).map((w: string, i: number) => {
                      const info = zeriTerms[w]
                      return info ? (
                        <button
                          key={i}
                          onClick={() => setSelectedTerm(w)}
                          className="text-xs text-[#c0392b] underline underline-offset-2 decoration-dotted cursor-pointer hover:text-[#b8860b]"
                        >
                          {w}
                        </button>
                      ) : (
                        <span key={i} className="text-xs text-[#2c2416]">{w}</span>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-[#b8a98f] mt-1.5">红色词可点击查看解释</p>
                </div>
                <div className="bg-white rounded-lg border border-[#d4c9b8] p-3">
                  <h4 className="text-sm font-bold text-[#5c4d3d] mb-2">忌</h4>
                  <div className="flex flex-wrap gap-1">
                    {toWordList(selectedLunar.getDayJi()).map((w: string, i: number) => {
                      const info = zeriTerms[w]
                      return info ? (
                        <button
                          key={i}
                          onClick={() => setSelectedTerm(w)}
                          className="text-xs text-[#c0392b] underline underline-offset-2 decoration-dotted cursor-pointer hover:text-[#b8860b]"
                        >
                          {w}
                        </button>
                      ) : (
                        <span key={i} className="text-xs text-[#2c2416]">{w}</span>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-[#b8a98f] mt-1.5">红色词可点击查看解释</p>
                </div>
              </div>

              {/* 宜忌词解释弹窗 */}
              {selectedTerm && zeriTerms[selectedTerm] && (
                <div className="bg-[#fdf8e8] border border-[#b8860b] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#b8860b]">{selectedTerm}</span>
                    <button
                      onClick={() => setSelectedTerm(null)}
                      className="text-xs text-[#9a8b75] hover:text-[#c0392b]"
                    >
                      ✕ 关闭
                    </button>
                  </div>
                  <p className="text-xs text-[#5c4d3d] leading-relaxed">
                    {zeriTerms[selectedTerm].meaning}
                  </p>
                </div>
              )}

              {/* 其他信息 */}
              <div className="bg-white rounded-lg border border-[#d4c9b8] p-4 text-xs text-[#5c4d3d] space-y-2">
                <div>
                  <span className="text-[#9a8b75]">建除：</span>
                  <span className="text-[#c0392b] font-medium">{selectedLunar.getZhiXing()}</span>
                </div>
                <div>
                  <span className="text-[#9a8b75]">冲煞：</span>
                  {selectedLunar.getChongDesc()} 冲 {selectedLunar.getSha()}
                </div>
                <div>
                  <span className="text-[#9a8b75]">吉神：</span>
                  {toText(selectedLunar.getDayJiShen())}
                </div>
                <div>
                  <span className="text-[#9a8b75]">彭祖百忌：</span>
                  {selectedLunar.getPengZuGan()}，{selectedLunar.getPengZuZhi()}
                </div>
              </div>

              {/* 每日吉时 */}
              {dayHours.length > 0 && (
                <div className="bg-white rounded-lg border border-[#d4c9b8] p-4">
                  <h4 className="text-sm font-bold text-[#2c2416] mb-1">当日吉时</h4>
                  <p className="text-xs text-[#9a8b75] mb-3">点击时辰查看详解</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {dayHours.map((hour: any, i: number) => {
                      const isGood = typeof hour.isGood === 'function'
                        ? hour.isGood()
                        : typeof hour.getTianShenLuck === 'function'
                          ? hour.getTianShenLuck() === '吉'
                          : false
                      const name = typeof hour.getName === 'function'
                        ? hour.getName()
                        : `${hour.getZhi()}时`
                      const range = typeof hour.getMinHour === 'function'
                        ? `${hour.getMinHour()}-${hour.getMaxHour()}点`
                        : `${hour.getMinHm()}-${hour.getMaxHm()}`
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedHour(hour)}
                          className={`text-center py-1.5 rounded text-xs cursor-pointer transition-colors ${
                            isGood
                              ? 'bg-[#fdf8e8] text-[#b8860b] hover:bg-[#faf0d8]'
                              : 'bg-[#f5f0e8] text-[#9a8b75] hover:bg-[#efe9df]'
                          }`}
                        >
                          <div className="font-medium">{name}</div>
                          <div className="text-[10px] opacity-80">{range}</div>
                          <div className="text-[10px] opacity-70">{hour.getGanZhi()}</div>
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-2 text-[10px] text-[#9a8b75] text-center">
                    金色为吉时 · 灰色为凶时
                  </div>
                </div>
              )}

              {/* 时辰详解弹窗 */}
              {selectedHour && (
                <div className="bg-[#fdf8e8] border border-[#b8860b] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#b8860b]">
                      {typeof selectedHour.getName === 'function' ? selectedHour.getName() : `${selectedHour.getZhi()}时`}
                      <span className="text-xs font-normal text-[#9a8b75] ml-2">
                        {typeof selectedHour.getMinHour === 'function'
                          ? `${selectedHour.getMinHour()}-${selectedHour.getMaxHour()}点`
                          : `${selectedHour.getMinHm()}-${selectedHour.getMaxHm()}`}
                      </span>
                    </span>
                    <button
                      onClick={() => setSelectedHour(null)}
                      className="text-xs text-[#9a8b75] hover:text-[#c0392b]"
                    >
                      ✕ 关闭
                    </button>
                  </div>
                  <div className="text-xs text-[#5c4d3d] space-y-1.5">
                    <div>
                      <span className="text-[#9a8b75]">时干支：</span>
                      <span className="text-[#b8860b] font-medium">{selectedHour.getGanZhi()}</span>
                      {(() => {
                        try {
                          const nayin = selectedHour.getNaYin()
                          return nayin ? <span className="text-[#5c4d3d]">（{nayin}）</span> : null
                        } catch { return null }
                      })()}
                    </div>
                    <div>
                      <span className="text-[#c0392b]">此时辰宜：</span>
                      {toText(selectedHour.getYi()) || '—'}
                    </div>
                    <div>
                      <span className="text-[#5c4d3d]">此时辰忌：</span>
                      {toText(selectedHour.getJi()) || '—'}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  )
}
