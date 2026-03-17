import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Kakao from 'next-auth/providers/kakao'
import Resend from 'next-auth/providers/resend'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/lib/db'
import * as tables from '@/lib/db/schema'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: tables.users,
    accountsTable: tables.accounts,
    sessionsTable: tables.sessions,
    verificationTokensTable: tables.verificationTokens,
  }),

  // JWT 전략: Cloudflare Edge Runtime에서 DB 없이 세션 검증 가능
  session: { strategy: 'jwt' },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Kakao({
      clientId: process.env.AUTH_KAKAO_ID!,
      clientSecret: process.env.AUTH_KAKAO_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: `사주 <no-reply@${process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '') ?? 'saju.app'}>`,
    }),
  ],

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    jwt({ token, user }) {
      // 최초 로그인 시 user.id를 token에 저장
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      // 세션에 user.id 추가
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
