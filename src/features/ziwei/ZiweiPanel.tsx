import { useEffect, useRef, useState } from 'react'
import { BirthForm } from './BirthForm'
import type { BirthInfo } from './BirthForm'
import { PalaceDetailPanel } from './PalaceDetailPanel'
import { SavedChartsPanel } from './SavedChartsPanel'
import type { SavedChart } from './SavedChartsPanel'
import { HoroscopeToolbar } from './HoroscopeToolbar'
import { DecadalPanel } from './DecadalPanel'
import { LiuyuePanel } from './LiuyuePanel'
import { ZiweiLearnPanel } from './ZiweiLearnPanel'
import { PalacePatternPanel } from './PalacePatternPanel'
import { ChartReadingPanel } from './ChartReadingPanel'
import { StarBrightnessPanel } from './StarBrightnessPanel'
import { ReadingArchivePanel } from './ReadingArchivePanel'
import { getSharedProfile } from '../../shared/profile'
// @ts-ignore - react-iztro 类型声明可能不完善
import { Iztrolabe } from 'react-iztro'
import { astro } from 'iztro'

export function ZiweiPanel() {
  const [learnMode, setLearnMode] = useState(false)
  const [learnStar, setLearnStar] = useState<string | null>(null)
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [horoscopeYear, setHoroscopeYear] = useState<number | null>(null)

  // 跨模块联动：读共享档案自动排盘（仅挂载时一次）
  const appliedRef = useRef(false)
  useEffect(() => {
    if (appliedRef.current) return
    const p = getSharedProfile()
    if (p) {
      appliedRef.current = true
      doCalculate({ date: p.date, timeIndex: p.timeIndex, gender: p.gender })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 从宫位详情跳转到学习板块并定位星曜
  const openLearnStar = (star: string) => {
    setLearnStar(star)
    setLearnMode(true)
  }

  // 手动切换标签时清空星曜定位
  const switchMode = (mode: boolean) => {
    setLearnMode(mode)
    if (!mode) setLearnStar(null)
  }

  const doCalculate = (info: BirthInfo) => {
    setLoading(true)
    setHoroscopeYear(null) // 切换盘时重置流年
    try {
      const astrolabe = astro.bySolar(info.date, info.timeIndex, info.gender)
      setBirthInfo(info)
      setChartData(astrolabe)
    } catch (err) {
      console.error('排盘失败:', err)
      alert('排盘失败，请检查输入信息')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (info: BirthInfo) => {
    doCalculate(info)
  }

  const handleLoadSavedChart = (chart: SavedChart) => {
    doCalculate({
      date: chart.date,
      timeIndex: chart.timeIndex,
      gender: chart.gender,
    })
  }

  const birthYear = birthInfo ? parseInt(birthInfo.date.split('-')[0]) : 1990

  // 构造流年日期
  const horoscopeDate = horoscopeYear
    ? `${horoscopeYear}-01-01`
    : undefined

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2c2416]">紫微斗数</h1>
          <p className="text-sm text-[#5c4d3d] mt-1">星盘排盘 · 命宫分析 · 研习验证</p>
        </div>
        {/* 模式切换 */}
        <div className="flex bg-[#f5efe0] rounded-lg p-1">
          <button
            onClick={() => switchMode(false)}
            className={`px-4 py-1.5 rounded text-sm transition-colors ${
              !learnMode
                ? 'bg-[#c0392b] text-white shadow-sm'
                : 'text-[#5c4d3d] hover:bg-[#efe9df]'
            }`}
          >
            排盘推算
          </button>
          <button
            onClick={() => switchMode(true)}
            className={`px-4 py-1.5 rounded text-sm transition-colors ${
              learnMode
                ? 'bg-[#c0392b] text-white shadow-sm'
                : 'text-[#5c4d3d] hover:bg-[#efe9df]'
            }`}
          >
            学习知识
          </button>
        </div>
      </div>

      {learnMode ? (
        <ZiweiLearnPanel embedded starName={learnStar} />
      ) : (
        <>
      {!birthInfo && !loading && (
        <div className="flex gap-6 items-start">
          <div className="w-72 shrink-0">
            <BirthForm onSubmit={handleSubmit} loading={loading} />
            <SavedChartsPanel
              currentChart={null}
              onLoadChart={handleLoadSavedChart}
            />
          </div>
          <div className="flex-1 bg-white rounded-lg border border-[#d4c9b8] p-16 text-center text-[#9a8b75]">
            <div className="text-4xl mb-4">✦</div>
            <p>输入出生信息开始排盘</p>
            <p className="text-sm mt-2 text-[#b8a98f]">
              或从左侧档案列表选择已保存的盘
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-lg border border-[#d4c9b8] p-16 text-center text-[#9a8b75]">
          <p>排盘中...</p>
        </div>
      )}

      {birthInfo && chartData && !loading && (
        <div className="space-y-6">
          {/* 顶部：表单 + 命盘图 */}
          <div className="flex gap-6 items-start">
            <div className="w-64 shrink-0">
              <BirthForm onSubmit={handleSubmit} loading={loading} />
              <SavedChartsPanel
                currentChart={birthInfo}
                onLoadChart={handleLoadSavedChart}
              />
            </div>
            <div className="flex-1 bg-white rounded-lg border border-[#d4c9b8] p-4">
              <HoroscopeToolbar
                birthYear={birthYear}
                onYearChange={setHoroscopeYear}
              />
              <Iztrolabe
                birthday={birthInfo.date}
                birthTime={birthInfo.timeIndex}
                gender={birthInfo.gender}
                birthdayType="solar"
                width="100%"
                horoscopeDate={horoscopeDate}
              />
            </div>
          </div>

          {/* 大限运势 */}
          <DecadalPanel
            chartData={chartData}
            currentYear={horoscopeYear}
            birthYear={birthYear}
            onSelectDecadal={(year) => setHoroscopeYear(year)}
          />

          {/* 流月流日 · 四化细推 */}
          <LiuyuePanel astrolabe={chartData} />

          {/* 星曜庙陷总览 */}
          <StarBrightnessPanel chartData={chartData} />

          {/* 命盘解读 */}
          <ChartReadingPanel chartData={chartData} onOpenLearnStar={openLearnStar} />

          {/* 命盘格局识别 */}
          <PalacePatternPanel chartData={chartData} />

          {/* 下方：宫位详情 + 笔记 */}
          <PalaceDetailPanel chartData={chartData} onOpenLearnStar={openLearnStar} />

          {/* 解读档案 */}
          <ReadingArchivePanel chartData={chartData} birthInfo={birthInfo} />
        </div>
      )}
        </>
      )}
    </div>
  )
}
