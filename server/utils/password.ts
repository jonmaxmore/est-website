import { hash, compare } from 'bcryptjs'

const SALT_ROUNDS = 12

export async function hashAdminPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

export async function verifyAdminPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return compare(password, hashedPassword)
}
