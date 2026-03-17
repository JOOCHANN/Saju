/**
 * AES-256-GCM 암호화 유틸리티
 *
 * Web Crypto API 기반으로 구현 — Node.js 및 Cloudflare Workers(Edge) 모두 호환.
 * 생년월일, 출생시간 등 민감 개인정보를 DB 저장 전 암호화하는 데 사용.
 *
 * ENCRYPTION_KEY 환경 변수: 64자 hex 문자열 (32 bytes)
 * 생성 방법: openssl rand -hex 32
 */

const ALGORITHM = 'AES-GCM'
const IV_LENGTH = 12 // GCM 권장 IV 길이 (96 bits)

function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('올바르지 않은 hex 문자열입니다.')
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function getKey(keyHex: string): Promise<CryptoKey> {
  const keyBytes = hexToUint8Array(keyHex)
  return crypto.subtle.importKey('raw', keyBytes.buffer as ArrayBuffer, { name: ALGORITHM }, false, [
    'encrypt',
    'decrypt',
  ])
}

/**
 * 평문을 AES-256-GCM으로 암호화합니다.
 * @returns base64 인코딩된 문자열 (IV 12바이트 + 암호문 + GCM 태그 16바이트)
 */
export async function encrypt(plaintext: string): Promise<string> {
  const keyHex = process.env.ENCRYPTION_KEY
  if (!keyHex) throw new Error('ENCRYPTION_KEY 환경 변수가 설정되지 않았습니다.')

  const key = await getKey(keyHex)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoded = new TextEncoder().encode(plaintext)

  const cipherBuffer = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded)

  // IV + 암호문을 합쳐 base64로 반환
  const combined = new Uint8Array(iv.byteLength + cipherBuffer.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(cipherBuffer), iv.byteLength)

  return uint8ArrayToBase64(combined)
}

/**
 * AES-256-GCM으로 암호화된 base64 문자열을 복호화합니다.
 */
export async function decrypt(ciphertext: string): Promise<string> {
  const keyHex = process.env.ENCRYPTION_KEY
  if (!keyHex) throw new Error('ENCRYPTION_KEY 환경 변수가 설정되지 않았습니다.')

  const key = await getKey(keyHex)
  const combined = base64ToUint8Array(ciphertext)

  const iv = combined.slice(0, IV_LENGTH)
  const data = combined.slice(IV_LENGTH)

  const decryptedBuffer = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, data)

  return new TextDecoder().decode(decryptedBuffer)
}
