// 六十甲子纳音与五行局速查（标准纳音表，每两组一纳音）
export interface NayinEntry {
  ganZhi: string   // 干支，如 甲子
  nayin: string    // 纳音，如 海中金
  element: '金' | '木' | '水' | '火' | '土'
  ju: number       // 五行局数
  juName: string   // 局名，如 金四局
}

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 30 组纳音（每组对应相邻两组干支）
const NAYIN_PAIRS: { nayin: string; element: '金' | '木' | '水' | '火' | '土'; zhi: [number, number] }[] = [
  { nayin: '海中金', element: '金', zhi: [0, 1] },   // 甲子 乙丑
  { nayin: '炉中火', element: '火', zhi: [2, 3] },   // 丙寅 丁卯
  { nayin: '大林木', element: '木', zhi: [4, 5] },   // 戊辰 己巳
  { nayin: '路旁土', element: '土', zhi: [6, 7] },   // 庚午 辛未
  { nayin: '剑锋金', element: '金', zhi: [8, 9] },   // 壬申 癸酉
  { nayin: '山头火', element: '火', zhi: [10, 11] }, // 甲戌 乙亥
  { nayin: '涧下水', element: '水', zhi: [0, 1] },   // 丙子 丁丑
  { nayin: '城头土', element: '土', zhi: [2, 3] },   // 戊寅 己卯
  { nayin: '白蜡金', element: '金', zhi: [4, 5] },   // 庚辰 辛巳
  { nayin: '杨柳木', element: '木', zhi: [6, 7] },   // 壬午 癸未
  { nayin: '泉中水', element: '水', zhi: [8, 9] },   // 甲申 乙酉
  { nayin: '屋上土', element: '土', zhi: [10, 11] }, // 丙戌 丁亥
  { nayin: '霹雳火', element: '火', zhi: [0, 1] },   // 戊子 己丑
  { nayin: '松柏木', element: '木', zhi: [2, 3] },   // 庚寅 辛卯
  { nayin: '长流水', element: '水', zhi: [4, 5] },   // 壬辰 癸巳
  { nayin: '砂中金', element: '金', zhi: [6, 7] },   // 甲午 乙未
  { nayin: '山下火', element: '火', zhi: [8, 9] },   // 丙申 丁酉
  { nayin: '平地木', element: '木', zhi: [10, 11] }, // 戊戌 己亥
  { nayin: '壁上土', element: '土', zhi: [0, 1] },   // 庚子 辛丑
  { nayin: '金箔金', element: '金', zhi: [2, 3] },   // 壬寅 癸卯
  { nayin: '覆灯火', element: '火', zhi: [4, 5] },   // 甲辰 乙巳
  { nayin: '天河水', element: '水', zhi: [6, 7] },   // 丙午 丁未
  { nayin: '大驿土', element: '土', zhi: [8, 9] },   // 戊申 己酉
  { nayin: '钗钏金', element: '金', zhi: [10, 11] }, // 庚戌 辛亥
  { nayin: '桑柘木', element: '木', zhi: [0, 1] },   // 壬子 癸丑
  { nayin: '大溪水', element: '水', zhi: [2, 3] },   // 甲寅 乙卯
  { nayin: '沙中土', element: '土', zhi: [4, 5] },   // 丙辰 丁巳
  { nayin: '天上火', element: '火', zhi: [6, 7] },   // 戊午 己未
  { nayin: '石榴木', element: '木', zhi: [8, 9] },   // 庚申 辛酉
  { nayin: '大海水', element: '水', zhi: [10, 11] }, // 壬戌 癸亥
]

const JU_NAME: Record<string, string> = {
  金: '金四局', 木: '木三局', 水: '水二局', 火: '火六局', 土: '土五局',
}

// 生成完整六十甲子纳音表（按六十甲子顺序）
export const NAYIN_TABLE: NayinEntry[] = (() => {
  const result: NayinEntry[] = []
  for (let n = 0; n < 60; n++) {
    const gan = TIAN_GAN[n % 10]
    const zhi = DI_ZHI[n % 12]
    // 纳音组索引：每 2 组干支为一纳音，共 30 组；组内第 1 个干支的纳音 = 该组
    const pairIdx = Math.floor(n / 2)
    const pair = NAYIN_PAIRS[pairIdx]
    const element = pair.element
    result.push({
      ganZhi: gan + zhi,
      nayin: pair.nayin,
      element,
      ju: element === '金' ? 4 : element === '木' ? 3 : element === '水' ? 2 : element === '火' ? 6 : 5,
      juName: JU_NAME[element],
    })
  }
  return result
})()

// 查找指定干支的纳音与五行局
export function lookupNayin(ganZhi: string): NayinEntry | null {
  return NAYIN_TABLE.find((e) => e.ganZhi === ganZhi) ?? null
}

export const ELEMENT_STYLE: Record<string, string> = {
  金: 'text-[#b8860b] bg-[#f8f0dd]',
  木: 'text-[#5c8a5c] bg-[#eef6ee]',
  水: 'text-[#5c7a8a] bg-[#eef4f8]',
  火: 'text-[#c0392b] bg-[#fdf0ee]',
  土: 'text-[#8a6e4a] bg-[#f6f0e8]',
}
