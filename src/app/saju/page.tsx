import { Moon } from 'lucide-react'

export default function SajuPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
        <Moon size={32} className="text-indigo-600" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-xl font-bold">AI 사주 분석</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          생년월일시를 입력하면
          <br />
          AI가 사주팔자를 분석해드려요
        </p>
      </div>
      <span className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
        개발 중
      </span>
    </div>
  )
}
