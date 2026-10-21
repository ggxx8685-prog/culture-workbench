export type ModuleId =
  | 'ziwei'
  | 'bazi'
  | 'meihua'
  | 'yijing'
  | 'zhenjiu'
  | 'wuqi'
  | 'calendar'
  | 'zeri'
  | 'bazhai'
  | 'fengshui'

interface ModuleItem {
  id: ModuleId
  name: string
  description: string
}

interface ModuleGroup {
  title: string
  items: ModuleItem[]
}

const moduleGroups: ModuleGroup[] = [
  {
    title: '命理推演',
    items: [
      { id: 'ziwei', name: '紫微斗数', description: '星盘排盘与命宫分析' },
      { id: 'bazi', name: '四柱八字', description: '八字排盘与五行推演' },
      { id: 'meihua', name: '梅花易数', description: '起卦与体用分析' },
      { id: 'yijing', name: '易经推命', description: '卦象解读与爻辞推演' },
    ],
  },
  {
    title: '中医养生',
    items: [
      { id: 'zhenjiu', name: '针灸', description: '经络穴位与配伍' },
      { id: 'wuqi', name: '五气六运', description: '运气推演与脏腑对应' },
    ],
  },
  {
    title: '术数堪舆',
    items: [
      { id: 'calendar', name: '天文历法', description: '干支节气与星宿换算' },
      { id: 'zeri', name: '择日', description: '吉日推算与宜忌' },
      { id: 'bazhai', name: '八宅明镜', description: '宅盘分析与方位吉凶' },
      { id: 'fengshui', name: '地理风水', description: '形势理气与峦头分析' },
    ],
  },
]

interface SidebarProps {
  activeModule: ModuleId
  onModuleChange: (module: ModuleId) => void
}

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <aside className="w-60 min-h-screen bg-[#2c2416] text-[#f5f0e8] flex flex-col shrink-0">
      {/* 平台标题 */}
      <div className="px-5 py-6 border-b border-[#4a3f30]">
        <h1 className="text-xl font-bold tracking-wider text-[#e8d5b7]">
          传统文化研习台
        </h1>
        <p className="text-xs text-[#9a8b75] mt-1 tracking-wide">
          格物致知 · 知行合一
        </p>
      </div>

      {/* 模块导航 */}
      <nav className="flex-1 overflow-y-auto py-4">
        {moduleGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <div className="px-5 mb-2 text-xs text-[#9a8b75] tracking-widest">
              {group.title}
            </div>
            <ul>
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onModuleChange(item.id)}
                    className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
                      activeModule === item.id
                        ? 'bg-[#c0392b] text-white border-l-3 border-[#e74c3c]'
                        : 'text-[#d4c9b8] hover:bg-[#3d3426] hover:text-[#f5f0e8] border-l-3 border-transparent'
                    }`}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs mt-0.5 ${
                      activeModule === item.id ? 'text-[#f0d0c8]' : 'text-[#7a6d5a]'
                    }`}>
                      {item.description}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* 底部版本信息 */}
      <div className="px-5 py-3 border-t border-[#4a3f30] text-xs text-[#7a6d5a]">
        v0.1.0 · 内部研习版
      </div>
    </aside>
  )
}
