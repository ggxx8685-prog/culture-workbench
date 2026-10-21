import { Layout } from './components/Layout'
import type { ModuleId } from './components/Sidebar'
import { ZiweiPanel } from './features/ziwei/ZiweiPanel'
import { ZeriPanel } from './features/zeri/ZeriPanel'
import { YijingPanel } from './features/yijing/YijingPanel'
import { BaziPanel } from './features/bazi/BaziPanel'
import { CalendarPanel } from './features/calendar/CalendarPanel'
import { WuqiPanel } from './features/wuqi/WuqiPanel'
import { BazhaiPanel } from './features/bazhai/BazhaiPanel'
import { MeihuaPanel } from './features/meihua/MeihuaPanel'
import { ZhenjiuPanel } from './features/zhenjiu/ZhenjiuPanel'
import { FengshuiPanel } from './features/fengshui/FengshuiPanel'

function PlaceholderPanel({ moduleName }: { moduleName: string }) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2c2416]">{moduleName}</h1>
        <p className="text-sm text-[#5c4d3d] mt-1">模块建设中...</p>
      </div>
      <div className="bg-white rounded-lg border border-[#d4c9b8] p-16 text-center text-[#9a8b75]">
        <div className="text-4xl mb-4">⚒</div>
        <p>「{moduleName}」模块正在规划中</p>
        <p className="text-sm mt-2 text-[#b8a98f]">
          当前优先开发紫微斗数模块，后续逐步迭代其他模块
        </p>
      </div>
    </div>
  )
}

const moduleNames: Record<ModuleId, string> = {
  ziwei: '紫微斗数',
  bazi: '四柱八字',
  meihua: '梅花易数',
  yijing: '易经推命',
  zhenjiu: '针灸',
  wuqi: '五气六运',
  calendar: '天文历法',
  zeri: '择日',
  bazhai: '八宅明镜',
  fengshui: '地理风水',
}

function App() {
  return (
    <Layout>
      {(activeModule) => {
        if (activeModule === 'ziwei') {
          return <ZiweiPanel />
        }
        if (activeModule === 'zeri') {
          return <ZeriPanel />
        }
        if (activeModule === 'yijing') {
          return <YijingPanel />
        }
        if (activeModule === 'bazi') {
          return <BaziPanel />
        }
        if (activeModule === 'calendar') {
          return <CalendarPanel />
        }
        if (activeModule === 'wuqi') {
          return <WuqiPanel />
        }
        if (activeModule === 'bazhai') {
          return <BazhaiPanel />
        }
        if (activeModule === 'meihua') {
          return <MeihuaPanel />
        }
        if (activeModule === 'zhenjiu') {
          return <ZhenjiuPanel />
        }
        if (activeModule === 'fengshui') {
          return <FengshuiPanel />
        }
        return <PlaceholderPanel moduleName={moduleNames[activeModule]} />
      }}
    </Layout>
  )
}

export default App
