/** Common bot user-agent patterns — shared across tracking and analytics routes */
export const BOT_PATTERNS =
  /bot|crawl|spider|slurp|facebookexternalhit|mediapartners|google|bing|yandex|baidu|duckduck|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider/i

export function isBot(userAgent: string): boolean {
  return BOT_PATTERNS.test(userAgent)
}
