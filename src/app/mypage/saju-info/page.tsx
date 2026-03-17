'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const HOURS = [
  { label: '모름 (시간 미입력)', value: '' },
  { label: '子時 밤 11시 ~ 새벽 1시', value: '23' },
  { label: '丑時 새벽 1시 ~ 3시', value: '1' },
  { label: '寅時 새벽 3시 ~ 5시', value: '3' },
  { label: '卯時 새벽 5시 ~ 7시', value: '5' },
  { label: '辰時 아침 7시 ~ 9시', value: '7' },
  { label: '巳時 오전 9시 ~ 11시', value: '9' },
  { label: '午時 오전 11시 ~ 오후 1시', value: '11' },
  { label: '未時 오후 1시 ~ 3시', value: '13' },
  { label: '申時 오후 3시 ~ 5시', value: '15' },
  { label: '酉時 오후 5시 ~ 7시', value: '17' },
  { label: '戌時 저녁 7시 ~ 9시', value: '19' },
  { label: '亥時 저녁 9시 ~ 11시', value: '21' },
]

export default function SajuInfoPage() {
  const router = useRouter()
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('1')
  const [day, setDay] = useState('1')
  const [hourValue, setHourValue] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 기존 프로필 불러오기
  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((json: { data: { year: number; month: number; day: number; hour?: number; gender: string } | null }) => {
        if (json.data) {
          setYear(String(json.data.year))
          setMonth(String(json.data.month))
          setDay(String(json.data.day))
          setHourValue(json.data.hour !== undefined ? String(json.data.hour) : '')
          setGender(json.data.gender as 'male' | 'female')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const y = parseInt(year)
    const m = parseInt(month)
    const d = parseInt(day)
    const hour = hourValue !== '' ? parseInt(hourValue) : undefined

    if (isNaN(y) || y < 1900 || y > 2020) {
      setErrorMsg('올바른 출생 연도를 입력해주세요 (1900~2020)')
      return
    }

    setSaving(true)
    setErrorMsg('')
    setSaved(false)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: y, month: m, day: d, hour, gender }),
      })
      if (!res.ok) throw new Error('저장 실패')
      setSaved(true)
      setTimeout(() => router.push('/mypage'), 1200)
    } catch {
      setErrorMsg('저장 중 오류가 발생했어요. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-5">
      <div>
        <h1 className="text-xl font-bold">내 사주 정보</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          사주 분석 시 자동으로 입력돼요
        </p>
      </div>

      {/* 성별 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">성별</label>
        <div className="flex gap-2">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                gender === g
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {g === 'male' ? '남성' : '여성'}
            </button>
          ))}
        </div>
      </div>

      {/* 생년 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="year">출생 연도</label>
        <input
          id="year"
          type="number"
          inputMode="numeric"
          placeholder="예) 1990"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min={1900}
          max={2020}
          required
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        />
      </div>

      {/* 생월 / 생일 */}
      <div className="flex gap-3">
        {[
          { id: 'month', label: '월', value: month, set: setMonth, count: 12, unit: '월' },
          { id: 'day', label: '일', value: day, set: setDay, count: 31, unit: '일' },
        ].map(({ id, label, value, set, count, unit }) => (
          <div key={id} className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor={id}>{label}</label>
            <div className="relative">
              <select
                id={id}
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {Array.from({ length: count }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}{unit}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      {/* 시간 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="hour">
          태어난 시간 <span className="font-normal text-muted-foreground">(선택)</span>
        </label>
        <div className="relative">
          <select
            id="hour"
            value={hourValue}
            onChange={(e) => setHourValue(e.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {HOURS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

      <button
        type="submit"
        disabled={saving || saved}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {saved ? (
          <><CheckCircle2 size={16} /> 저장 완료</>
        ) : saving ? (
          <><Loader2 size={16} className="animate-spin" /> 저장 중...</>
        ) : (
          '저장하기'
        )}
      </button>
    </form>
  )
}
