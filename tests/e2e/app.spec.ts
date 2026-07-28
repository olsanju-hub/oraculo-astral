import { expect, test } from '@playwright/test'

test('renders the static app shell', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Oráculo Astral' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Tus datos de nacimiento' })).toBeVisible()
  await expect(page.getByLabel('Nombre')).toBeVisible()
  await expect(page.getByText('Solo la búsqueda geográfica consulta un servicio externo')).toBeVisible()
})

test('exposes a PWA manifest', async ({ page }) => {
  const response = await page.goto('/manifest.webmanifest')
  expect(response?.ok()).toBe(true)
  const manifest = JSON.parse(await page.locator('body').innerText())

  expect(manifest.name).toBe('Oráculo Astral')
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: '192x192' }),
      expect.objectContaining({ sizes: '512x512' }),
    ]),
  )
})
