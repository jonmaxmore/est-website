import { getPayload } from 'payload'
import { refreshCmsContent } from '../lib/cms-maintenance'
import config from '../payload.config'
import { loadScriptEnv } from './load-script-env'

loadScriptEnv()

async function runRefresh() {
  const payload = await getPayload({ config })
  const summary = await refreshCmsContent(payload)

  for (const globalSlug of summary.updatedGlobals) {
    console.log(`Updated global: ${globalSlug}`)
  }

  for (const article of summary.touchedArticles) {
    console.log(`Updated article #${article.id}: ${article.titleEn}`)
  }

  console.log(`Refresh complete. Updated ${summary.updatedArticles} published news articles.`)
}

runRefresh()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to refresh CMS content:', error)
    process.exit(1)
  })
