import { handlers } from '@/auth'

// postgres 드라이버가 Node.js TCP 모듈(net, tls)을 사용하므로 nodejs runtime 필요
// Cloudflare 배포 시에는 nodejs_compat 플래그로 TCP가 지원됨
export const runtime = 'nodejs'

// 인증 요청은 항상 런타임에 처리
export const dynamic = 'force-dynamic'

export const { GET, POST } = handlers
