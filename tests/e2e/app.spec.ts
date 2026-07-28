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

test('calculates a chart with explicit location selection', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 3117735,
            name: 'Madrid',
            latitude: 40.4165,
            longitude: -3.7026,
            country: 'España',
            country_code: 'ES',
            admin1: 'Comunidad de Madrid',
            timezone: 'Europe/Madrid',
          },
          {
            id: 999,
            name: 'Madrid',
            latitude: 4.7324,
            longitude: -74.2642,
            country: 'Colombia',
            country_code: 'CO',
            admin1: 'Cundinamarca',
            timezone: 'America/Bogota',
          },
        ],
      }),
    })
  })

  await page.goto('/')
  await page.getByLabel('Nombre').fill('Alba')
  await page.getByLabel('Fecha').fill('1990-07-15')
  await page.getByLabel('Hora exacta').fill('12:00')
  await page.getByLabel('Localidad').fill('Madrid')
  await page.getByLabel('País').fill('España')
  await page.getByRole('button', { name: 'Buscar ubicación' }).click()
  await page.getByRole('button', { name: /Madrid/ }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByText('Europe/Madrid')).toBeVisible()
  await page.getByRole('button', { name: 'Generar carta' }).click()

  await expect(page.getByRole('heading', { name: 'Lectura integrada' })).toBeVisible({ timeout: 20_000 })
  await expect(page.getByRole('rowheader', { name: 'Sol' })).toBeVisible()
  await expect(page.getByText('Sistema de casas')).toBeVisible()
})
