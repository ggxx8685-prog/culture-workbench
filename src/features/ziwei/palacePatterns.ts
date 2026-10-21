// 紫微斗数经典格局定义与检测
// 条件匹配基于星曜落宫位置（iztro palaces 结构，index 0-11）

export interface PatternMatchContext {
  starPalace: Record<string, number> // 星名 → 宫 index（主星+辅星）
  lifeIndex: number // 命宫 index（iztro 固定为 11）
  lifeBranch: string // 命宫地支
  palaceBranches: string[] // index → 地支
  palaceNames: string[] // index → 宫名
  mutagens: Record<string, string> // 星名 → 四化（禄/权/科/忌）
}

export interface PalacePattern {
  id: string
  name: string
  result: '吉' | '凶' | '中性'
  condition: string // 组成条件（人话描述）
  desc: string // 详解
  match: (ctx: PatternMatchContext) => boolean
}

// 工具函数
const has = (ctx: PatternMatchContext, star: string) => ctx.starPalace[star] !== undefined
const samePalace = (ctx: PatternMatchContext, a: string, b: string) =>
  has(ctx, a) && has(ctx, b) && ctx.starPalace[a] === ctx.starPalace[b]
const inLife = (ctx: PatternMatchContext, star: string) => ctx.starPalace[star] === ctx.lifeIndex
const lifeBranchIn = (ctx: PatternMatchContext, branches: string[]) =>
  branches.includes(ctx.lifeBranch)
const sanfangOf = (i: number) => [i, (i + 4) % 12, (i + 8) % 12]
const inSanfang = (ctx: PatternMatchContext, star: string) =>
  has(ctx, star) && sanfangOf(ctx.lifeIndex).includes(ctx.starPalace[star])
// 夹：starA 与 starB 分别在 target 星所在宫的两侧（左右夹）
const clampedBy = (ctx: PatternMatchContext, target: string, a: string, b: string) => {
  if (!has(ctx, target) || !has(ctx, a) || !has(ctx, b)) return false
  const t = ctx.starPalace[target]
  return (
    (ctx.starPalace[a] === (t + 11) % 12 && ctx.starPalace[b] === (t + 1) % 12) ||
    (ctx.starPalace[a] === (t + 1) % 12 && ctx.starPalace[b] === (t + 11) % 12)
  )
}
// 夹命宫
const clampLife = (ctx: PatternMatchContext, a: string, b: string) =>
  clampedBy(ctx, '命宫', a, b) ||
  (ctx.starPalace[a] === (ctx.lifeIndex + 11) % 12 && ctx.starPalace[b] === (ctx.lifeIndex + 1) % 12) ||
  (ctx.starPalace[a] === (ctx.lifeIndex + 1) % 12 && ctx.starPalace[b] === (ctx.lifeIndex + 11) % 12)
// 化科权禄齐（三奇嘉会）：命宫三方内的星至少含 化禄、化权、化科 各一
const hasSanqi = (ctx: PatternMatchContext) => {
  const targets = sanfangOf(ctx.lifeIndex)
  const m: Record<string, boolean> = {}
  for (const [star, mg] of Object.entries(ctx.mutagens)) {
    if (targets.includes(ctx.starPalace[star] ?? -1)) m[mg] = true
  }
  return !!m['禄'] && !!m['权'] && !!m['科']
}
// 化忌所在宫
const mutagenPalace = (ctx: PatternMatchContext, kind: string) => {
  for (const [star, mg] of Object.entries(ctx.mutagens)) {
    if (mg === kind) return ctx.starPalace[star]
  }
  return undefined
}

export const PALACE_PATTERNS: PalacePattern[] = [
  // ========== 吉格 ==========
  {
    id: 'zi-fu-tong-gong',
    name: '紫府同宫格',
    result: '吉',
    condition: '紫微 + 天府 同宫（多在辰、戌）',
    desc: '紫微为帝星、天府为财库，二星同宫力量极强，主大器晚成、领导格局。行事稳重有度，善于掌控大局，宜从政、管理或执掌大机构。最忌煞星冲破，则变"紫府同宫失陷"。',
    match: (ctx) => samePalace(ctx, '紫微', '天府'),
  },
  {
    id: 'huo-tan',
    name: '火贪格',
    result: '吉',
    condition: '火星 + 贪狼 同宫',
    desc: '贪狼遇火星为"火炼贪狼"，主横发暴富、突然成名，多因冒险、投机、新颖行业而崛起。来势凶猛也去得快，财富起伏大，贵在把握时机、见好就收。',
    match: (ctx) => samePalace(ctx, '火星', '贪狼'),
  },
  {
    id: 'ling-tan',
    name: '铃贪格',
    result: '吉',
    condition: '铃星 + 贪狼 同宫',
    desc: '铃星配贪狼主"暗发"之财，财富来得较隐晦、后劲足，适合幕后操作、暗中积累的行业。较火贪格更持久，但也更劳心。',
    match: (ctx) => samePalace(ctx, '铃星', '贪狼'),
  },
  {
    id: 'yue-lang-tian-men',
    name: '月朗天门格',
    result: '吉',
    condition: '太阴在亥宫坐命（亥为天门）',
    desc: '太阴在亥得庙旺之地，主聪明温润、内心清明，一生多得女性贵人或异性助力，名利双收之格。女命更佳，男命得之为"月朗天门"，主声誉清雅。',
    match: (ctx) => inLife(ctx, '太阴') && lifeBranchIn(ctx, ['亥']),
  },
  {
    id: 'ri-zhao-lei-men',
    name: '日照雷门格',
    result: '吉',
    condition: '太阳在卯宫坐命（卯为雷门）',
    desc: '太阳在卯为旭日东升，主早年奋发、名声早起，光明磊落，利公职与传播行业。一生贵人明助，越走越亮。',
    match: (ctx) => inLife(ctx, '太阳') && lifeBranchIn(ctx, ['卯']),
  },
  {
    id: 'shi-zhong-yin-yu',
    name: '石中隐玉格',
    result: '吉',
    condition: '巨门在子、午宫坐命，三方见科权禄',
    desc: '巨门在子午得地，配科权禄则化口舌为辩才，主内敛而有真才实学，厚积薄发，中年后大放异彩，宜学术、法律、外交。',
    match: (ctx) =>
      inLife(ctx, '巨门') && lifeBranchIn(ctx, ['子', '午']) &&
      (hasSanqi(ctx) || ctx.mutagens['巨门'] === '禄'),
  },
  {
    id: 'qi-sha-chao-dou',
    name: '七杀朝斗格',
    result: '吉',
    condition: '七杀在寅、申宫坐命',
    desc: '七杀坐寅申为得地，主将星得位、大权在握。刚毅果决，能独当一面，开创性强，适合军警、创业、开拓型行业。',
    match: (ctx) => inLife(ctx, '七杀') && lifeBranchIn(ctx, ['寅', '申']),
  },
  {
    id: 'xiong-su-qian-yuan',
    name: '雄宿乾元格',
    result: '吉',
    condition: '廉贞在寅、申宫坐命',
    desc: '廉贞在寅申得地，主志节清高、才华横溢，能化邪为正。为人清廉自守、聪慧过人，利文教、司法、技艺。',
    match: (ctx) => inLife(ctx, '廉贞') && lifeBranchIn(ctx, ['寅', '申']),
  },
  {
    id: 'san-qi-jia-hui',
    name: '三奇嘉会格',
    result: '吉',
    condition: '命宫三方四正见 化禄 + 化权 + 化科',
    desc: '科权禄三奇会照命宫，为紫微斗数最上乘的格局之一，主一生顺遂、富贵双全。具体层次看庙陷：三奇皆旺更佳，若被煞冲破则打折扣。',
    match: (ctx) => hasSanqi(ctx),
  },
  {
    id: 'lu-ma-jiao-chi',
    name: '禄马交驰格',
    result: '吉',
    condition: '禄存 + 天马 同宫或同在三方',
    desc: '禄存主财、天马主动，禄马交驰主"动中求财"，利异地发展、贸易运输、跨境行业。奔波劳碌换财富，也主见闻广博。',
    match: (ctx) =>
      (has(ctx, '禄存') && has(ctx, '天马') && ctx.starPalace['禄存'] === ctx.starPalace['天马']) ||
      (has(ctx, '禄存') && has(ctx, '天马') && sanfangOf(ctx.lifeIndex).includes(ctx.starPalace['禄存']) && sanfangOf(ctx.lifeIndex).includes(ctx.starPalace['天马'])),
  },
  {
    id: 'ji-yue-tong-liang',
    name: '机月同梁格',
    result: '中性',
    condition: '天机、太阴、天同、天梁 聚于命宫三方',
    desc: '四星会聚，主文职、公职、技术型工作，为人聪敏稳健、乐于助人。一生平稳少大起大落，宜深耕专业领域。',
    match: (ctx) =>
      inSanfang(ctx, '天机') && inSanfang(ctx, '太阴') &&
      inSanfang(ctx, '天同') && inSanfang(ctx, '天梁'),
  },
  {
    id: 'fu-xiang-chao-yuan',
    name: '府相朝垣格',
    result: '吉',
    condition: '天府或天相坐命，另一星在命宫三方朝拱',
    desc: '天府为财库、天相为印星，府相朝垣主衣食丰足、稳重有助，一生多得贵人提携，利管理、财务、幕僚之职。',
    match: (ctx) =>
      (inLife(ctx, '天府') && inSanfang(ctx, '天相') && ctx.starPalace['天相'] !== ctx.lifeIndex) ||
      (inLife(ctx, '天相') && inSanfang(ctx, '天府') && ctx.starPalace['天府'] !== ctx.lifeIndex),
  },
  {
    id: 'fu-bi-gong-zhu',
    name: '辅弼拱主格',
    result: '吉',
    condition: '左辅、右弼 夹命宫',
    desc: '左辅右弼为"夹贵"之星，左右夹命主得人助、人缘佳，一生常有贵人扶助，利团队领导与协调型工作。',
    match: (ctx) => clampLife(ctx, '左辅', '右弼'),
  },
  {
    id: 'chang-qu-jia-di',
    name: '昌曲夹帝格',
    result: '吉',
    condition: '文昌、文曲 夹紫微所在宫',
    desc: '昌曲夹紫微，主才学与权力兼备，文采出众且具领导力，宜文教、出版、传播与政务。',
    match: (ctx) => clampedBy(ctx, '紫微', '文昌', '文曲'),
  },
  {
    id: 'cai-yin-jia-yin',
    name: '财荫夹印格',
    result: '吉',
    condition: '武曲（财）、天梁（荫） 夹天相（印）',
    desc: '天相为印星，被武曲与天梁所夹，主既得财又得荫护，一生财务安稳、贵人扶持，利财务、法务、管理岗位。',
    match: (ctx) => clampedBy(ctx, '天相', '武曲', '天梁'),
  },
  {
    id: 'ri-yue-bing-ming',
    name: '日月并明格',
    result: '吉',
    condition: '太阳、太阴 同宫（庙旺之地更佳）',
    desc: '日月同宫主阴阳调和、福寿俱全，一生机遇均衡，白天晚上都有人助。主声名与财富并得，须防过劳与情绪起伏。',
    match: (ctx) => samePalace(ctx, '太阳', '太阴'),
  },
  {
    id: 'tan-wu-tong-xing',
    name: '贪武同行格',
    result: '中性',
    condition: '贪狼、武曲 同宫（多在丑、未）',
    desc: '贪狼与武曲同为财星，贪武同行主"以武求财、以技生财"，多因专业技艺、竞争行业得财。性急好胜，中年后方显。',
    match: (ctx) => samePalace(ctx, '贪狼', '武曲'),
  },

  // ========== 凶格 ==========
  {
    id: 'ju-huo-yang',
    name: '巨火羊格',
    result: '凶',
    condition: '巨门 + 火星 + 擎羊 同宫',
    desc: '巨门暗星遇火星擎羊两大煞，主口舌是非、官非破财、心绪不宁。宜修口业、戒冲动，凡事多忍让，避免与人冲突。',
    match: (ctx) =>
      samePalace(ctx, '巨门', '火星') && has(ctx, '擎羊') &&
      ctx.starPalace['擎羊'] === ctx.starPalace['巨门'],
  },
  {
    id: 'xing-qiu-jia-yin',
    name: '刑囚夹印格',
    result: '凶',
    condition: '擎羊（刑）+ 廉贞（囚） 夹天相（印）',
    desc: '刑囚夹印主官非刑伤，多因文书、契约、法律问题惹祸。处事须格外谨慎，合同文件务必反复核对，遇事勿逞强。',
    match: (ctx) => clampedBy(ctx, '天相', '擎羊', '廉贞'),
  },
  {
    id: 'xing-ji-jia-yin',
    name: '刑忌夹印格',
    result: '凶',
    condition: '擎羊（刑）+ 化忌星 夹天相（印）',
    desc: '化忌所落之宫与擎羊分夹天相，主是非缠身、暗耗破财。天相之印被刑忌所夹，宜低调守成，谨慎处理法律与财务事项。',
    match: (ctx) => {
      const ji = mutagenPalace(ctx, '忌')
      if (!has(ctx, '天相') || !has(ctx, '擎羊') || ji === undefined) return false
      const t = ctx.starPalace['天相']
      return (
        (ctx.starPalace['擎羊'] === (t + 11) % 12 && ji === (t + 1) % 12) ||
        (ctx.starPalace['擎羊'] === (t + 1) % 12 && ji === (t + 11) % 12)
      )
    },
  },
  {
    id: 'ma-tou-dai-jian',
    name: '马头带剑格',
    result: '凶',
    condition: '天马 + 擎羊 同宫于午宫（马头）',
    desc: '午为天马之头，擎羊为剑，马头带剑主奔波带险，多因远行、车辆、交通之事受灾。出行须格外注意安全，利守不利攻。',
    match: (ctx) =>
      has(ctx, '天马') && has(ctx, '擎羊') &&
      ctx.starPalace['天马'] === ctx.starPalace['擎羊'] &&
      ctx.palaceBranches[ctx.starPalace['天马']] === '午',
  },
  {
    id: 'huo-ling-jia-ming',
    name: '火铃夹命格',
    result: '凶',
    condition: '火星、铃星 夹命宫',
    desc: '火铃二煞夹命，主一生多惊险波折，情绪急躁易冲动，健康与安全上易有突发状况。宜修心养性，凡事三思后行。',
    match: (ctx) => clampLife(ctx, '火星', '铃星'),
  },

  // ========== 中性 ==========
  {
    id: 'sha-po-lang',
    name: '杀破狼格',
    result: '中性',
    condition: '七杀、破军、贪狼 聚于命宫三方（不全同宫）',
    desc: '杀破狼主人生大起大落、开创性极强，一生变动多、机会也多。格局本身无吉凶，重在四化与庙陷：逢吉化则变革成功，逢煞忌则动荡不安。',
    match: (ctx) =>
      inSanfang(ctx, '七杀') && inSanfang(ctx, '破军') && inSanfang(ctx, '贪狼') &&
      !(samePalace(ctx, '七杀', '破军') && samePalace(ctx, '破军', '贪狼')),
  },
]

// 检测命盘命中的格局
export function detectPatterns(chartData: any): PalacePattern[] {
  if (!chartData || !chartData.palaces) return []

  // 星 → 宫 index 映射（主星 + 辅星）
  const starPalace: Record<string, number> = {}
  const mutagens: Record<string, string> = {}
  chartData.palaces.forEach((p: any, idx: number) => {
    const allStars = [...p.majorStars, ...p.minorStars]
    allStars.forEach((s: any) => {
      starPalace[s.name] = idx
      if (s.mutagen) mutagens[s.name] = s.mutagen
    })
  })

  const lifeIndex = chartData.palaces.findIndex((p: any) => p.name === '命宫')
  const lifePalace = chartData.palaces[lifeIndex]
  if (!lifePalace) return []

  const ctx: PatternMatchContext = {
    starPalace,
    lifeIndex,
    lifeBranch: lifePalace.earthlyBranch,
    palaceBranches: chartData.palaces.map((p: any) => p.earthlyBranch),
    palaceNames: chartData.palaces.map((p: any) => p.name),
    mutagens,
  }

  return PALACE_PATTERNS.filter((pattern) => pattern.match(ctx))
}
