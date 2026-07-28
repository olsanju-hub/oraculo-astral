import { jsPDF } from 'jspdf'
import type { InterpretationReport, NatalChart } from '../types'

const page = {
  width: 210,
  height: 297,
  margin: 18,
  bottom: 272,
}

interface IndexEntry {
  title: string
  page: number
  kind: 'front' | 'chapter'
}

export async function exportNatalPdf(chart: NatalChart, interpretation: InterpretationReport) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const logo = await loadImage(`${import.meta.env.BASE_URL}brand/carta-astral.png`)
  const title = `Carta natal de ${chart.input.name}`
  const indexEntries: IndexEntry[] = []

  drawCover(doc, title, chart, logo)
  const indexPage = doc.getNumberOfPages() + 1
  doc.addPage()
  drawTechnicalPages(doc, chart, logo, indexEntries)
  drawInterpretation(doc, interpretation, logo, indexEntries)
  drawIndex(doc, indexPage, indexEntries)

  const pageCount = doc.getNumberOfPages()
  for (let index = 1; index <= pageCount; index += 1) {
    doc.setPage(index)
    drawFooter(doc, index, pageCount)
  }

  doc.save(`Carta_Natal_${chart.input.name.replace(/\s+/g, '_')}.pdf`)
}

function drawCover(doc: jsPDF, title: string, chart: NatalChart, logo: HTMLImageElement) {
  doc.setFillColor(8, 11, 22)
  doc.rect(0, 0, page.width, page.height, 'F')
  doc.addImage(logo, 'PNG', 65, 28, 80, 80)
  doc.setTextColor(245, 217, 162)
  doc.setFont('times', 'normal')
  doc.setFontSize(30)
  doc.text('Oráculo Astral', page.width / 2, 128, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(235, 238, 245)
  doc.text(title, page.width / 2, 144, { align: 'center' })
  doc.setFontSize(10)
  const place = doc.splitTextToSize(`${chart.input.date} · ${chart.input.time} · ${chart.location.label}`, 150)
  doc.text(place, page.width / 2, 154, { align: 'center' })
  doc.text(`Sistema de casas: ${chart.houseSystem} · Zona horaria: ${chart.birthTime.timezone}`, page.width / 2, 162, {
    align: 'center',
  })
}

function drawIndex(doc: jsPDF, indexPage: number, entries: IndexEntry[]) {
  doc.setPage(indexPage)
  drawHeader(doc, 'Índice de lectura')
  drawCallout(
    doc,
    36,
    'Este informe está pensado para leerse de forma progresiva: primero explica el vocabulario básico, después muestra los datos calculados y finalmente desarrolla la interpretación por grandes temas.',
  )
  let y = 62
  entries.forEach((entry, index) => {
    if (y > page.bottom - 10) {
      doc.addPage()
      drawHeader(doc, 'Índice de lectura')
      y = 38
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(entry.kind === 'front' ? 9.5 : 10)
    doc.setTextColor(23, 32, 51)
    doc.text(`${index + 1}. ${entry.title}`, page.margin, y)
    doc.setDrawColor(226, 232, 240)
    doc.line(page.margin + 72, y - 1.5, page.width - page.margin - 12, y - 1.5)
    doc.text(String(entry.page), page.width - page.margin, y, { align: 'right' })
    y += 8
  })
}

function drawTechnicalPages(doc: jsPDF, chart: NatalChart, logo: HTMLImageElement, indexEntries: IndexEntry[]) {
  doc.addPage()
  indexEntries.push({ title: 'Datos técnicos y rueda natal', page: doc.getNumberOfPages(), kind: 'front' })
  drawHeader(doc, 'Datos técnicos')
  drawCallout(
    doc,
    34,
    'La rueda natal es una representación del cielo calculado para el lugar, fecha y hora de nacimiento. Los planetas indican funciones internas; las casas muestran áreas de vida; los aspectos son líneas de relación entre puntos.',
  )
  drawChartWheel(doc, chart, 105, 105, 48)
  doc.addImage(logo, 'PNG', 91, 78, 28, 28)
  let y = 168
  y = drawKeyValue(doc, y, 'Nombre', chart.input.name)
  y = drawKeyValue(doc, y, 'Nacimiento local', `${chart.input.date} ${chart.input.time}`)
  y = drawKeyValue(doc, y, 'UTC calculado', chart.birthTime.utcIso)
  y = drawKeyValue(doc, y, 'Ubicación', chart.location.label)
  y = drawKeyValue(doc, y, 'Coordenadas', `${chart.location.latitude.toFixed(5)}, ${chart.location.longitude.toFixed(5)}`)
  y = drawKeyValue(doc, y, 'Efemérides', chart.ephemerisMode === 'swiss-files' ? 'Swiss Ephemeris' : 'Moshier fallback')
  y += 8
  drawBalanceBars(doc, chart, y)

  doc.addPage()
  indexEntries.push({ title: 'Tabla de posiciones', page: doc.getNumberOfPages(), kind: 'front' })
  drawHeader(doc, 'Posiciones y aspectos')
  y = drawCallout(
    doc,
    34,
    'La tabla de posiciones resume dónde cae cada planeta o punto. “Casa” indica el área de experiencia donde esa energía se expresa con más claridad.',
  )
  y = drawTable(
    doc,
    y,
    ['Punto', 'Posición', 'Casa'],
    chart.positions.map((position) => [position.label, position.formatted, position.house ? `Casa ${position.house}` : '']),
  )
  doc.addPage()
  indexEntries.push({ title: 'Aspectos principales', page: doc.getNumberOfPages(), kind: 'front' })
  drawHeader(doc, 'Aspectos principales')
  const aspectY = drawCallout(
    doc,
    34,
    'Los aspectos describen relaciones entre puntos de la carta. El orbe indica cuánta distancia hay respecto al ángulo exacto: cuanto más pequeño, más preciso es el contacto.',
  )
  drawTable(
    doc,
    aspectY,
    ['Aspecto', 'Cuerpos implicados', 'Orbe'],
    chart.aspects.map((aspect) => [
      aspect.label,
      `${labelFor(chart, aspect.from)} - ${labelFor(chart, aspect.to)}`,
      `${aspect.orb.toFixed(2)}°`,
    ]),
  )
}

function drawInterpretation(doc: jsPDF, interpretation: InterpretationReport, logo: HTMLImageElement, indexEntries: IndexEntry[]) {
  doc.addPage()
  indexEntries.push({ title: interpretation.title, page: doc.getNumberOfPages(), kind: 'front' })
  drawHeader(doc, interpretation.title)
  let y = 36
  y = drawParagraph(doc, interpretation.overview, y, true)
  interpretation.sections.forEach((section) => {
    const estimatedBlock = estimateTextHeight(doc, section.summary, 10, page.width - page.margin * 2) + 18
    if (y + estimatedBlock > 244) {
      doc.addPage()
      drawHeader(doc, interpretation.title)
      y = 36
    }
    indexEntries.push({ title: section.title, page: doc.getNumberOfPages(), kind: 'chapter' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(23, 32, 51)
    doc.text(section.title, page.margin, y)
    y += 8
    y = drawParagraph(doc, section.summary, y, true)
    section.body.forEach((paragraph) => {
      y = drawParagraph(doc, paragraph, y)
    })
    y += 6
  })
  doc.addImage(logo, 'PNG', 170, 254, 18, 18)
}

function drawHeader(doc: jsPDF, title: string) {
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, page.width, page.height, 'F')
  doc.setTextColor(23, 32, 51)
  doc.setFont('times', 'normal')
  doc.setFontSize(18)
  doc.text(doc.splitTextToSize(title, 150)[0], page.margin, 22)
  doc.setDrawColor(215, 170, 93)
  doc.line(page.margin, 27, page.width - page.margin, 27)
}

function drawFooter(doc: jsPDF, index: number, total: number) {
  if (index === 1) return
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(102, 112, 133)
  doc.text('Oráculo Astral', page.margin, 285)
  doc.text(`${index} / ${total}`, page.width - page.margin, 285, { align: 'right' })
}

function drawChartWheel(doc: jsPDF, chart: NatalChart, cx: number, cy: number, radius: number) {
  doc.setDrawColor(215, 170, 93)
  doc.circle(cx, cy, radius)
  doc.circle(cx, cy, radius * 0.78)
  doc.circle(cx, cy, radius * 0.48)
  for (let index = 0; index < 12; index += 1) {
    const angle = ((index * 30 - 90) * Math.PI) / 180
    doc.line(cx + Math.cos(angle) * radius * 0.48, cy + Math.sin(angle) * radius * 0.48, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
  }
  chart.positions.slice(0, 16).forEach((position) => {
    const angle = ((position.longitude - 90) * Math.PI) / 180
    const x = cx + Math.cos(angle) * radius * 0.86
    const y = cy + Math.sin(angle) * radius * 0.86
    doc.circle(x, y, 2.2, 'F')
  })
}

function drawKeyValue(doc: jsPDF, y: number, key: string, value: string) {
  const lines = doc.splitTextToSize(value, 118)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(102, 112, 133)
  doc.text(key, page.margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(23, 32, 51)
  doc.text(lines, 70, y)
  return y + Math.max(8, lines.length * 5)
}

function drawTable(doc: jsPDF, y: number, headers: string[], rows: string[][]) {
  const colWidths = getColumnWidths(headers.length)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  let x = page.margin
  headers.forEach((header, index) => {
    doc.text(header, x, y, { maxWidth: colWidths[index] - 4 })
    x += colWidths[index]
  })
  y += 5
  doc.setDrawColor(226, 232, 240)
  doc.line(page.margin, y, page.width - page.margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  rows.forEach((row) => {
    const wrapped = row.map((cell, index) => doc.splitTextToSize(String(cell), colWidths[index] - 4))
    const rowHeight = Math.max(7, ...wrapped.map((cell) => cell.length * 4.2 + 2))
    if (y + rowHeight > page.bottom) {
      doc.addPage()
      drawHeader(doc, headers.join(' · '))
      y = 38
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
    }
    let cellX = page.margin
    wrapped.forEach((cell, index) => {
      doc.text(cell, cellX, y)
      cellX += colWidths[index]
    })
    doc.setDrawColor(238, 241, 245)
    doc.line(page.margin, y + rowHeight - 1.5, page.width - page.margin, y + rowHeight - 1.5)
    y += rowHeight
  })
  return y
}

function drawParagraph(doc: jsPDF, text: string, y: number, accent = false) {
  doc.setFont('helvetica', accent ? 'bold' : 'normal')
  doc.setFontSize(accent ? 10 : 9.5)
  doc.setTextColor(accent ? 185 : 23, accent ? 130 : 32, accent ? 47 : 51)
  const lines = doc.splitTextToSize(text, page.width - page.margin * 2)
  const lineHeight = accent ? 5.4 : 5
  if (y + lines.length * lineHeight > page.bottom) {
    doc.addPage()
    drawHeader(doc, 'Interpretación')
    y = 36
  }
  doc.text(lines, page.margin, y, { lineHeightFactor: 1.36 })
  return y + lines.length * lineHeight + 5
}

function drawCallout(doc: jsPDF, y: number, text: string) {
  const lines = doc.splitTextToSize(text, page.width - page.margin * 2 - 10)
  const height = lines.length * 4.8 + 10
  doc.setFillColor(250, 247, 240)
  doc.setDrawColor(235, 220, 190)
  doc.roundedRect(page.margin, y - 5, page.width - page.margin * 2, height, 2, 2, 'FD')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(72, 64, 52)
  doc.text(lines, page.margin + 5, y + 2)
  return y + height + 8
}

function drawBalanceBars(doc: jsPDF, chart: NatalChart, y: number) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(23, 32, 51)
  doc.text('Resumen visual de la distribución', page.margin, y)
  y += 8
  const maxElement = Math.max(...Object.values(chart.balance.elements), 1)
  Object.entries(chart.balance.elements).forEach(([element, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text(element, page.margin, y)
    doc.setFillColor(235, 238, 245)
    doc.rect(48, y - 3, 52, 3, 'F')
    doc.setFillColor(215, 170, 93)
    doc.rect(48, y - 3, (value / maxElement) * 52, 3, 'F')
    doc.text(String(value), 104, y)
    y += 6
  })
}

function estimateTextHeight(doc: jsPDF, text: string, fontSize: number, width: number) {
  doc.setFontSize(fontSize)
  return doc.splitTextToSize(text, width).length * 5
}

function getColumnWidths(count: number) {
  const contentWidth = page.width - page.margin * 2
  if (count === 3) return [42, contentWidth - 76, 34]
  if (count === 2) return [62, contentWidth - 62]
  return Array.from({ length: count }, () => contentWidth / count)
}

function labelFor(chart: NatalChart, id: string) {
  return chart.positions.find((position) => position.id === id)?.label ?? id
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}
