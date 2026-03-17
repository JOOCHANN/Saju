import { Sparkles } from 'lucide-react'

export default function FortunePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
        <Sparkles size={32} className="text-amber-600" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-xl font-bold">오늘의 운세</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          12간지별 오늘의 운세를
          <br />
          준비하고 있어요
        </p>
      </div>
      <span className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
        개발 중
      </span>
    </div>
  )
}
