'use client'

import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import type { SajuResult } from '@/lib/saju'
import { ELEMENT_NAMES } from '@/lib/saju'
import Link from 'next/link'

// ────────────────────────────────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────────────────────────────────

export interface StoredReading {
  id: string
  type: string
  resultData: {
    summary: string
    dayMaster: SajuResult['dayMaster']
    fourPillars: SajuResult['fourPillars']
    elementBalance: SajuResult['elementBalance']
    aiText: string
  }
  createdAt: string
}

// ────────────────────────────────────────────────────────────────────────────
// 상수
// ────────────────────────────────────────────────────────────────────────────

const ELEMENT_TEXT_COLORS: Record<string, string> = {
  목: 'text-green-700',
  화: 'text-red-700',
  토: 'text-amber-700',
  금: 'text-gray-600',
  수: 'text-blue-700',
}

const ELEMENT_BG_LIGHT: Record<string, string> = {
  목: 'bg-green-100',
  화: 'bg-red-100',
  토: 'bg-amber-100',
  금: 'bg-gray-100',
  수: 'bg-blue-100',
}

// ────────────────────────────────────────────────────────────────────────────
// 카드 컴포넌트
// ────────────────────────────────────────────────────────────────────────────

function ReadingCard({
  reading,
  onDelete,
}: {
  reading: StoredReading
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { dayMaster, fourPillars, elementBalance, aiText } = reading.resultData
  const fp = fourPillars

  const date = new Date(reading.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  async function handleDelete() {
    if (!confirm('이 분석을 삭제할까요?')) return
    setDeleting(true)
    try {
      await fetch(`/api/readings/${reading.id}`, { method: 'DELETE' })
      onDelete(reading.id)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-start gap-3 p-4">
        {/* 일간 배지 */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
            ELEMENT_BG_LIGHT[dayMaster.element]
          } ${ELEMENT_TEXT_COLORS[dayMaster.element]}`}
        >
          {dayMaster.stem}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            {dayMaster.stemKorean}({dayMaster.element} {dayMaster.yinYang}) 일간
          </p>
          {/* 4기둥 요약 */}
          <div className="mt-1 flex gap-1">
            {[fp.year, fp.month, fp.day, ...(fp.hour ? [fp.hour] : [])].map((p, i) => (
              <span key={i} className="text-xs text-muted-foreground">
                {p.stem}{p.branch}
              </span>
            ))}
          </div>
          {/* 오행 분포 */}
          <div className="mt-1.5 flex gap-1">
            {ELEMENT_NAMES.map((e) => {
              const cnt = elementBalance[e]
              if (!cnt) return null
              return (
                <span
                  key={e}
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ELEMENT_BG_LIGHT[e]} ${ELEMENT_TEXT_COLORS[e]}`}
                >
                  {e}{cnt}
                </span>
              )
            })}
          </div>
        </div>

        {/* 날짜 + 삭제 */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground">{date}</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* AI 분석 텍스트 토글 */}
      {aiText && (
        <>
          <div className="border-t border-border px-4 py-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-indigo-500" />
                AI 분석 결과 보기
              </span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          {expanded && (
            <div className="border-t border-border px-4 pb-4 pt-3">
              <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {aiText.slice(0, 600)}
                {aiText.length > 600 && '...'}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ────────────────────────────────────────────────────────────────────────────

export default function StorageClient({ initialReadings }: { initialReadings: StoredReading[] }) {
  const [items, setItems] = useState(initialReadings)

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((r) => r.id !== id))
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Sparkles size={28} className="text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-semibold">저장된 분석이 없어요</p>
          <p className="mt-1 text-sm text-muted-foreground">사주 분석 후 보관함에 저장해보세요</p>
        </div>
        <Link
          href="/saju"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          AI 사주 분석하기
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((r) => (
        <ReadingCard key={r.id} reading={r} onDelete={handleDelete} />
      ))}
    </div>
  )
}
