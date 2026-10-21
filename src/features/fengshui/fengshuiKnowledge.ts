// 地理风水知识库（峦头 + 三元九运理气，通行口径）

// 三元九运（每运 20 年，180 年一大周期）
export const SAN_YUAN: { yun: string; yearStart: number; yearEnd: number; gua: string; wuxing: string; note: string }[] = [
  { yun: '一运', yearStart: 1864, yearEnd: 1883, gua: '坎', wuxing: '水', note: '上元甲子起，坎水一白' },
  { yun: '二运', yearStart: 1884, yearEnd: 1903, gua: '坤', wuxing: '土', note: '坤土二黑' },
  { yun: '三运', yearStart: 1904, yearEnd: 1923, gua: '震', wuxing: '木', note: '震木三碧' },
  { yun: '四运', yearStart: 1924, yearEnd: 1943, gua: '巽', wuxing: '木', note: '中元甲子起，巽木四绿' },
  { yun: '五运', yearStart: 1944, yearEnd: 1963, gua: '中', wuxing: '土', note: '中宫五黄寄坤艮' },
  { yun: '六运', yearStart: 1964, yearEnd: 1983, gua: '乾', wuxing: '金', note: '乾金六白' },
  { yun: '七运', yearStart: 1984, yearEnd: 2003, gua: '兑', wuxing: '金', note: '下元甲子起，兑金七赤' },
  { yun: '八运', yearStart: 2004, yearEnd: 2023, gua: '艮', wuxing: '土', note: '艮土八白（土运旺）' },
  { yun: '九运', yearStart: 2024, yearEnd: 2043, gua: '离', wuxing: '火', note: '离火九紫，火运当旺（当前）' },
]

// 九星
export const JIU_XING: Record<number, { star: string; gua: string; wuxing: string; ji: '吉' | '凶' | '中' }> = {
  1: { star: '贪狼', gua: '坎', wuxing: '水', ji: '吉' },
  2: { star: '巨门', gua: '坤', wuxing: '土', ji: '凶' },
  3: { star: '禄存', gua: '震', wuxing: '木', ji: '凶' },
  4: { star: '文曲', gua: '巽', wuxing: '木', ji: '吉' },
  5: { star: '廉贞', gua: '中', wuxing: '土', ji: '凶' },
  6: { star: '武曲', gua: '乾', wuxing: '金', ji: '吉' },
  7: { star: '破军', gua: '兑', wuxing: '金', ji: '凶' },
  8: { star: '左辅', gua: '艮', wuxing: '土', ji: '吉' },
  9: { star: '右弼', gua: '离', wuxing: '火', ji: '吉' },
}

// 二十四山（八卦各统三山）
export const ER_SHI_SI: { gua: string; shan: string[]; pos: string }[] = [
  { gua: '坎', shan: ['壬', '子', '癸'], pos: '北' },
  { gua: '艮', shan: ['丑', '艮', '寅'], pos: '东北' },
  { gua: '震', shan: ['甲', '卯', '乙'], pos: '东' },
  { gua: '巽', shan: ['辰', '巽', '巳'], pos: '东南' },
  { gua: '离', shan: ['丙', '午', '丁'], pos: '南' },
  { gua: '坤', shan: ['未', '坤', '申'], pos: '西南' },
  { gua: '兑', shan: ['庚', '酉', '辛'], pos: '西' },
  { gua: '乾', shan: ['戌', '乾', '亥'], pos: '西北' },
]

// 地理五诀（峦头）
export const DI_LI_WU_JUE = [
  { key: '龙', title: '寻龙', content: '龙为山脉走势，犹人之骨骼。察其起伏、开帐、过峡、剥换以辨贵贱：龙贵起伏顿跌、支脉分明，忌散漫粗蠢。太祖山、少祖山、父母山层次分明者为贵。' },
  { key: '穴', title: '点穴', content: '穴为生气凝聚之处，犹人之穴位。须阴阳交会、界水止气；穴场宜窝钳乳突得宜，得龙虎砂护卫、明堂宽展为佳。' },
  { key: '砂', title: '察砂', content: '砂为穴场周围山势，犹人之侍卫。青龙白虎宜环抱护卫，案山朝山宜远近得宜、端正有情；忌反背、破碎、逼压。' },
  { key: '水', title: '观水', content: '水为生气之血脉，"山管人丁水管财"。来水宜曲环有情、去水宜关锁紧闭；水口宜有砂关拦，忌直冲直流。' },
  { key: '向', title: '立向', content: '向为乘生气之关键，龙穴砂水皆须合向。立向须合峦头形势与理气（三元九运/玄空），使阴阳交媾、旺气得乘。' },
]

// 学习知识
export const FENGSHUI_KNOWLEDGE = [
  { title: '堪舆源流', content: '堪舆即地理风水，"堪"为天道、"舆"为地道。分峦头（形势）与理气（方位气运）两大派，晋郭璞《葬书》为经典源头。' },
  { title: '地理五诀', content: '龙穴砂水向为峦头五要：寻龙点穴、察砂观水、立向乘气。五者须相互配合，方可成局。' },
  { title: '三元九运', content: '以 180 年为一大周期，分上中下三元，每元三运（60 年一甲子），每运 20 年。今 2024-2043 为九运（离火）。' },
  { title: '九宫飞星', content: '洛书九宫配九星（一白贪狼至九紫右弼），按飞星轨迹（中→乾→兑→艮→离→坎→坤→震→巽）逐年顺飞。年星入中，其余依次飞布，判当年各方位吉凶。' },
  { title: '紫白九星', content: '一白贪狼水（吉）、二黑巨门土（凶）、三碧禄存木（凶）、四绿文曲木（吉）、五黄廉贞土（大凶）、六白武曲金（吉）、七赤破军金（凶）、八白左辅土（吉）、九紫右弼火（吉）。' },
  { title: '二十四山', content: '罗盘分二十四山，每山 15°：八卦各统三山（壬子癸坎…戌乾亥乾）。立向坐山皆以二十四山为准。' },
  { title: '九运离火', content: '2024 年起九运离火当令：火性文明、光电、科技、美学相关行业趋旺；离中虚，虚火易浮，宜实学真才、戒浮躁。' },
  { title: '煞曜方位', content: '流年五黄廉贞、二黑巨门为大煞方位，宜静不宜动（忌动土、安床、动工）；三煞、太岁方位亦忌冲犯，岁破最重。' },
  { title: '应用要旨', content: '风水以"乘生气"为纲，峦头为本、理气为用；宅内外形势合局为上，方位吉凶次之。诸家推断宜互参印证，供研习验证。' },
]
