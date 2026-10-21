// 跨模块共享命盘档案：四柱排盘后写入，紫微/易经等模块读取自动回填
export interface SharedProfile {
  date: string
  timeIndex: number
  gender: '男' | '女'
  name: string
  updatedAt: string
}

const KEY = 'sharedProfile'

export function getSharedProfile(): SharedProfile | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as SharedProfile
  } catch {
    return null
  }
}

export function setSharedProfile(p: Omit<SharedProfile, 'updatedAt'>): void {
  localStorage.setItem(KEY, JSON.stringify({ ...p, updatedAt: new Date().toISOString().slice(0, 10) }))
}

// 跨模块跳转（Layout 监听 module:nav 事件）
export function navTo(module: string): void {
  window.dispatchEvent(new CustomEvent('module:nav', { detail: module }))
}
