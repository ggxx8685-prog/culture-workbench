// 五运六气知识库与推演数据

// 六气序（三阴三阳）：1 厥阴风木 2 少阴君火 3 太阴湿土 4 少阳相火 5 阳明燥金 6 太阳寒水
export const QI_ORDER: { seq: number; name: string; yinyang: string; wuxing: string; note: string }[] = [
  { seq: 1, name: '厥阴风木', yinyang: '一阴', wuxing: '木', note: '风为之本，主疏泄条达' },
  { seq: 2, name: '少阴君火', yinyang: '二阴', wuxing: '火', note: '君火以明，主神明温热' },
  { seq: 3, name: '太阴湿土', yinyang: '三阴', wuxing: '土', note: '湿为之本，主运化濡润' },
  { seq: 4, name: '少阳相火', yinyang: '一阳', wuxing: '火', note: '相火以位，主蒸腾枢转' },
  { seq: 5, name: '阳明燥金', yinyang: '二阳', wuxing: '金', note: '燥为之本，主收敛清肃' },
  { seq: 6, name: '太阳寒水', yinyang: '三阳', wuxing: '水', note: '寒为之本，主封藏闭固' },
]

export const QI_BY_SEQ: Record<number, { name: string; wuxing: string; note: string }> = {
  1: { name: '厥阴风木', wuxing: '木', note: '风为之本，主疏泄条达' },
  2: { name: '少阴君火', wuxing: '火', note: '君火以明，主神明温热' },
  3: { name: '太阴湿土', wuxing: '土', note: '湿为之本，主运化濡润' },
  4: { name: '少阳相火', wuxing: '火', note: '相火以位，主蒸腾枢转' },
  5: { name: '阳明燥金', wuxing: '金', note: '燥为之本，主收敛清肃' },
  6: { name: '太阳寒水', wuxing: '水', note: '寒为之本，主封藏闭固' },
}

// 中运（大运）：年干化运，阳干太过、阴干不及
export const GAN_YUN: Record<string, { yun: string; wuxing: string; guo: '太过' | '不及' }> = {
  甲: { yun: '土运', wuxing: '土', guo: '太过' }, 己: { yun: '土运', wuxing: '土', guo: '不及' },
  乙: { yun: '金运', wuxing: '金', guo: '不及' }, 庚: { yun: '金运', wuxing: '金', guo: '太过' },
  丙: { yun: '水运', wuxing: '水', guo: '太过' }, 辛: { yun: '水运', wuxing: '水', guo: '不及' },
  丁: { yun: '木运', wuxing: '木', guo: '不及' }, 壬: { yun: '木运', wuxing: '木', guo: '太过' },
  戊: { yun: '火运', wuxing: '火', guo: '太过' }, 癸: { yun: '火运', wuxing: '火', guo: '不及' },
}

// 司天：年支定
export const ZHI_SITIAN: Record<string, { name: string; seq: number }> = {
  子: { name: '少阴君火', seq: 2 }, 午: { name: '少阴君火', seq: 2 },
  丑: { name: '太阴湿土', seq: 3 }, 未: { name: '太阴湿土', seq: 3 },
  寅: { name: '少阳相火', seq: 4 }, 申: { name: '少阳相火', seq: 4 },
  卯: { name: '阳明燥金', seq: 5 }, 酉: { name: '阳明燥金', seq: 5 },
  辰: { name: '太阳寒水', seq: 6 }, 戌: { name: '太阳寒水', seq: 6 },
  巳: { name: '厥阴风木', seq: 1 }, 亥: { name: '厥阴风木', seq: 1 },
}

// 主气六步（固定，每气约 60 余日）：初之气大寒起
export const ZHU_QI: { step: string; range: string; seq: number }[] = [
  { step: '初之气', range: '大寒 → 春分', seq: 1 },
  { step: '二之气', range: '春分 → 小满', seq: 2 },
  { step: '三之气', range: '小满 → 大暑', seq: 4 },
  { step: '四之气', range: '大暑 → 秋分', seq: 3 },
  { step: '五之气', range: '秋分 → 小雪', seq: 5 },
  { step: '终之气', range: '小雪 → 大寒', seq: 6 },
]

// 客气公式：第 k 气（1-6）的客气序 = ((司天序 + k - 4) mod 6 + 6) mod 6 + 1

// 学习知识
export const WUQI_KNOWLEDGE = [
  { title: '五运', content: '木火土金水五运，依年干而定：甲己化土、乙庚化金、丙辛化水、丁壬化木、戊癸化火。阳干（甲丙戊庚壬）为太过，阴干（乙丁己辛癸）为不及。' },
  { title: '六气', content: '风热火湿燥寒六气，分三阴三阳：厥阴风木、少阴君火、太阴湿土、少阳相火、阳明燥金、太阳寒水。' },
  { title: '主气', content: '主气固定不变，一年六步：初之气厥阴风木（大寒起）、二之气少阴君火、三之气少阳相火、四之气太阴湿土、五之气阳明燥金、终之气太阳寒水，各主约两月。' },
  { title: '客气', content: '客气随年支变化，六年一周期：子午年少阴君火司天、丑未年太阴湿土、寅申年少阳相火、卯酉年阳明燥金、辰戌年太阳寒水、巳亥年厥阴风木。司天主上半年，在泉主下半年。' },
  { title: '司天与在泉', content: '司天居三之气位，在泉居终之气位（与司天相对）：少阴↔阳明、太阴↔太阳、少阳↔厥阴。客气自初之气起按三阴三阳序排列至终之气。' },
  { title: '运气相合', content: '中运与司天同气曰"天符"，中运与岁支五行同气曰"岁会"，皆主当年运气平和偏盛；中运太过而克司天为"乘"，不及而受克为"侮"（简化口径）。' },
  { title: '客主加临', content: '客气加临主气之上，气之相生为顺（平和），相克为逆（为病偏重），尤重三之气（司天）与终之气（在泉）两段。' },
  { title: '六淫致病', content: '风气通肝、火气通心、湿气通脾、燥气通肺、寒气通肾。某气太过之年，其气所主脏腑病候偏多，为运气防病所本。' },
  { title: '运气与养生', content: '岁运太过之年当抑其有余，不及之年当助其不足；司天在泉所主时段尤须顺时调摄，此为"天人相应"的应用。' },
]
