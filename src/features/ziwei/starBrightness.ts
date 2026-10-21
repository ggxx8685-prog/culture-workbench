// 星曜庙陷：亮度等级含义与命盘主星亮度提取
import { starKnowledge } from './starKnowledge'

export const MAJOR_STARS = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府',
  '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军',
]

// 亮度等级含义
export const BRIGHTNESS_INFO: Record<string, { level: number; label: string; desc: string }> = {
  庙: { level: 6, label: '庙', desc: '最旺。星曜力量完全发挥，优点尽显，吉星庙旺大吉，煞星庙旺也力强' },
  旺: { level: 5, label: '旺', desc: '次旺。力量强劲，主星正面特质充分显现，做事有冲劲' },
  得: { level: 4, label: '得', desc: '得地。力量正常发挥，中上水平，进退有度' },
  利: { level: 3, label: '利', desc: '有利。力量可发挥但打折扣，需要努力方能见效' },
  平: { level: 2, label: '平', desc: '平常。力量平平，吉不显、凶不烈，平淡之象' },
  陷: { level: 1, label: '陷', desc: '落陷。力量最弱，主星优点难发挥、缺点凸显，吉星落陷减力，煞星落陷反而不太凶' },
}

// 亮度徽章配色
export const BRIGHTNESS_STYLE: Record<string, string> = {
  庙: 'bg-[#c0392b] text-white',
  旺: 'bg-[#b8860b] text-white',
  得: 'bg-[#8a7a5f] text-white',
  利: 'bg-[#a98c6e] text-white',
  平: 'bg-[#b8a98f] text-white',
  陷: 'bg-[#4a5568] text-white',
}

export interface StarBrightness {
  name: string
  palace: string
  branch: string
  brightness: string
  nature: string // 星性
  keywords: string[] // 关键词
}

// 从命盘提取十四主星亮度
export function extractStarBrightness(chartData: any): StarBrightness[] {
  if (!chartData || !chartData.palaces) return []
  const list: StarBrightness[] = []
  MAJOR_STARS.forEach((name) => {
    const p = chartData.palaces.find((x: any) =>
      x.majorStars.some((s: any) => s.name === name)
    )
    if (!p) return
    const star = p.majorStars.find((s: any) => s.name === name)
    const k = starKnowledge[name]
    list.push({
      name,
      palace: p.name,
      branch: `${p.heavenlyStem}${p.earthlyBranch}`,
      brightness: star.brightness || '平',
      nature: k?.nature ?? '',
      keywords: k?.keywords ?? [],
    })
  })
  // 按亮度等级从强到弱排
  const level = (b: string) => BRIGHTNESS_INFO[b]?.level ?? 0
  list.sort((a, b) => level(b.brightness) - level(a.brightness))
  return list
}
