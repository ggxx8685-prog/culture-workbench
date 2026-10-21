// 命盘自动解读（规则式：基于星曜知识库与格局，供研习参考，不作决策依据）
import { starKnowledge } from './starKnowledge'
import { detectPatterns } from './palacePatterns'

export interface ReadingSection {
  title: string
  icon: string
  items: string[] // 每条解读文本
}

// 取宫位主星名（最多前2颗）
const majorNames = (palace: any): string[] => {
  if (!palace) return []
  return palace.majorStars.map((s: any) => s.name)
}

// 星曜解读（描述 + 关键词）
const starReading = (name: string, fallback: string): string => {
  const k = starKnowledge[name]
  if (!k) return fallback
  const keywords = k.keywords.slice(0, 4).join('、')
  return `${name}：${k.description}（关键词：${keywords}）`
}

export function buildChartReading(chartData: any): ReadingSection[] {
  if (!chartData || !chartData.palaces) return []

  const get = (name: string) => chartData.palaces.find((p: any) => p.name === name)
  const life = get('命宫')
  const body = chartData.palaces.find((p: any) => p.isBodyPalace)
  const guanlu = get('官禄')
  const caibo = get('财帛')
  const fuqi = get('夫妻')
  const jie = get('疾厄')
  const qianyi = get('迁移')
  const tianzhai = get('田宅')

  const lifeStars = majorNames(life)
  const bodyStars = majorNames(body)
  const guanluStars = majorNames(guanlu)
  const caiboStars = majorNames(caibo)
  const fuqiStars = majorNames(fuqi)
  const jieStars = majorNames(jie)
  const qianyiStars = majorNames(qianyi)
  const tianzhaiStars = majorNames(tianzhai)

  const sections: ReadingSection[] = []

  // 1. 性格特质
  if (lifeStars.length > 0) {
    sections.push({
      title: '性格特质（命宫）',
      icon: '🧭',
      items: lifeStars.map((s) => starReading(s, `${s}为命宫主星`)),
    })
  } else {
    sections.push({
      title: '性格特质（命宫）',
      icon: '🧭',
      items: ['命宫无主星，性格多受三方四正影响，宜兼看迁移、财帛、官禄宫主星。'],
    })
  }

  // 2. 后天努力（身宫）
  if (body && bodyStars.length > 0) {
    sections.push({
      title: '后天努力方向（身宫）',
      icon: '🌱',
      items: bodyStars.map((s) => starReading(s, `${s}为身宫主星`)),
    })
  }

  // 3. 事业方向
  sections.push({
    title: '事业方向（官禄宫）',
    icon: '💼',
    items: guanluStars.length > 0
      ? guanluStars.map((s) => starReading(s, `${s}为官禄宫主星`))
      : ['官禄宫无主星，事业方向宜借对宫（夫妻宫）与三方星曜综合参考，或从格局与四化中取象。'],
  })

  // 4. 财运特质
  sections.push({
    title: '财运特质（财帛宫）',
    icon: '💰',
    items: caiboStars.length > 0
      ? caiboStars.map((s) => starReading(s, `${s}为财帛宫主星`))
      : ['财帛宫无主星，聚散看对宫福德宫与三方，可结合禄存、武曲等财星所在宫位判断。'],
  })

  // 5. 感情婚姻
  sections.push({
    title: '感情婚姻（夫妻宫）',
    icon: '💞',
    items: fuqiStars.length > 0
      ? fuqiStars.map((s) => starReading(s, `${s}为夫妻宫主星`))
      : ['夫妻宫无主星，感情观受对宫官禄宫与三方影响，宜结合四化与流年大限看应期。'],
  })

  // 6. 健康提示
  sections.push({
    title: '健康提示（疾厄宫）',
    icon: '🍃',
    items: jieStars.length > 0
      ? jieStars.map((s) => starReading(s, `${s}为疾厄宫主星`))
      : ['疾厄宫无主星，健康议题宜看对宫父母宫与三方，并留意煞星所在宫位。'],
  })

  // 7. 迁移与田宅
  const travelItems: string[] = []
  if (qianyiStars.length > 0) {
    travelItems.push(qianyiStars.map((s) => starReading(s, `${s}为迁移宫主星`)).join('\n'))
  }
  if (tianzhaiStars.length > 0) {
    travelItems.push(tianzhaiStars.map((s) => starReading(s, `${s}为田宅宫主星`)).join('\n'))
  }
  if (travelItems.length > 0) {
    sections.push({ title: '外出际遇 · 家宅（迁移 / 田宅）', icon: '🏠', items: travelItems })
  }

  // 8. 四化重点
  const mList: { palace: string; star: string; mg: string }[] = []
  const MG_DESC: Record<string, string> = {
    禄: '化禄：该领域得财、顺畅，机会增多',
    权: '化权：该领域掌握主动、有掌控力',
    科: '化科：该领域有声名、贵人提携',
    忌: '化忌：该领域易有困扰、需多用心',
  }
  chartData.palaces.forEach((p: any) => {
    p.majorStars.forEach((s: any) => {
      if (s.mutagen) mList.push({ palace: p.name, star: s.name, mg: s.mutagen })
    })
  })
  if (mList.length > 0) {
    sections.push({
      title: '四化流转重点',
      icon: '🔄',
      items: mList.map((m) => `${m.palace}宫 · ${m.star}${m.mg} — ${MG_DESC[m.mg] ?? m.mg}`),
    })
  } else {
    sections.push({
      title: '四化流转重点',
      icon: '🔄',
      items: ['本命盘四化较平（原局无四化者罕见，多半落在辅星层面），宜结合大限流年盘观察四化的动态流转。'],
    })
  }

  // 9. 格局加持
  const patterns = detectPatterns(chartData)
  if (patterns.length > 0) {
    sections.push({
      title: '格局加持',
      icon: '🏛',
      items: patterns.map((p) => `${p.name}（${p.result}格）— ${p.desc.slice(0, 50)}…`),
    })
  }

  return sections
}
