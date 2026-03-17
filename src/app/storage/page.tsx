import { Archive } from 'lucide-react'

export default function StoragePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Archive size={32} className="text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-xl font-bold">보관함</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          저장한 사주 분석 결과를
          <br />
          여기서 확인할 수 있어요
        </p>
      </div>
      <span className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
        로그인 후 이용 가능
      </span>
    </div>
  )
}
