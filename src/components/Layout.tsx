import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import type { ModuleId } from './Sidebar'

interface LayoutProps {
  children: (activeModule: ModuleId) => ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [activeModule, setActiveModule] = useState<ModuleId>('ziwei')

  // 跨模块联动：监听 module:nav 事件切换模块
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (typeof detail === 'string') {
        setActiveModule(detail as ModuleId)
      }
    }
    window.addEventListener('module:nav', handler)
    return () => window.removeEventListener('module:nav', handler)
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="flex-1 bg-[#f5f0e8] min-h-screen">
        {children(activeModule)}
      </main>
    </div>
  )
}
