/* Verify export count updates after upload */
const { chromium } = require('playwright-core')
const path = require('path')

const EXE = path.join(process.env.USERPROFILE, 'AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe')

async function main() {
  const browser = await chromium.launch({ executablePath: EXE, headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 950 } })
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message))

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  const countBefore = await page.locator('.section-count').textContent()
  console.log('COUNT BEFORE UPLOAD:', countBefore.trim())

  // Upload the file with 2 extra candidates via the UI modal
  await page.getByRole('button', { name: /Upload Excel/i }).click()
  await page.waitForTimeout(400)
  await page.setInputFiles('input[type=file]', path.join(__dirname, '..', 'data', '_test_extra.xlsx'))
  await page.getByRole('button', { name: /Upload and update/i }).click()
  await page.waitForTimeout(2000)

  const countAfter = await page.locator('.section-count').textContent()
  console.log('COUNT AFTER UPLOAD:', countAfter.trim())

  await browser.close()
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
