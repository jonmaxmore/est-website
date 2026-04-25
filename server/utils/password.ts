/**
 * ═══ Password Hashing ═══
 * ใช้ bcryptjs สำหรับเข้ารหัสรหัสผ่าน admin
 *
 * SALT_ROUNDS = 12 → ยิ่งสูง ยิ่งปลอดภัย แต่ช้าลง
 * ค่า 12 เป็นค่ามาตรฐานที่สมดุลระหว่างความปลอดภัยกับความเร็ว
 */
import { hash, compare } from 'bcryptjs'

const SALT_ROUNDS = 12

/** เข้ารหัสรหัสผ่าน → เก็บลง DB */
export async function hashAdminPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

/** ตรวจสอบรหัสผ่านกับ hash ที่เก็บใน DB */
export async function verifyAdminPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return compare(password, hashedPassword)
}
