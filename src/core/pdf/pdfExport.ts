import { jsPDF } from 'jspdf'
import type { InterpretationReport, NatalChart } from '../types'

const page = {
  width: 210,
  height: 297,
  margin: 18,
}

export async function exportNatalPdf(chart: NatalChart, interpretation: InterpretationReport) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const logo = await loadImage(`${import.meta.env.BASE_URL}brand/carta-astral.png`)
  const title = `Carta natal de ${chart.input.name}`

  drawCover(doc, title, chart, logo)
  drawIndex(doc, interpretation)
  drawTechnicalPages(doc, chart, logo)
  drawInterpretation(doc, interpretation, logo)

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
  doc.text(`${chart.input.date} · ${chart.input.time} · ${chart.location.label}`, page.width / 2, 154, { align: 'center' })
  doc.text(`Sistema de casas: ${chart.houseSystem} · Zona horaria: ${chart.birthTime.timezone}`, page.width / 2, 162, {
    align: 'center',
  })
}

function drawIndex(doc: jsPDF, interpretation: InterpretationReport) {
  doc.addPage()
  drawHeader(doc, 'Índice')
  let y = 42
  interpretation.sections.forEach((section, index) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(23, 32, 51)
    doc.text(`${index + 1}. ${section.title}`, page.margin, y)
    doc.setDrawColor(215, 170, 93)
    doc.line(page.margin, y + 2, page.width - page.margin, y + 2)
    y += 10
  })
}

function drawTechnicalPages(doc: jsPDF, chart: NatalChart, logo: HTMLImageElement) {
  doc.addPage()
  drawHeader(doc, 'Datos técnicos')
  drawChartWheel(doc, chart, 105, 92, 54)
  doc.addImage(logo, 'PNG', 91, 78, 28, 28)
  let y = 158
  y = drawKeyValue(doc, y, 'Nombre', chart.input.name)
  y = drawKeyValue(doc, y, 'Nacimiento local', `${chart.input.date} ${chart.input.time}`)
  y = drawKeyValue(doc, y, 'UTC calculado', chart.birthTime.utcIso)
  y = drawKeyValue(doc, y, 'Ubicación', chart.location.label)
  y = drawKeyValue(doc, y, 'Coordenadas', `${chart.location.latitude.toFixed(5)}, ${chart.location.longitude.toFixed(5)}`)
  y = drawKeyValue(doc, y, 'Efemérides', chart.ephemerisMode === 'swiss-files' ? 'Swiss Ephemeris' : 'Moshier fallback')

  doc.addPage()
  drawHeader(doc, 'Posiciones y aspectos')
  y = 38
  y = drawTable(
    doc,
    y,
    ['Punto', 'Posición', 'Casa'],
    chart.positions.map((position) => [position.label, position.formatted, position.house ? `Casa ${position.house}` : '']),
  )
  doc.addPage()
  drawHeader(doc, 'Aspectos principales')
  drawTable(
    doc,
    38,
    ['Aspecto', 'Cuerpos', 'Orbe'],
    chart.aspects.map((aspect) => [
      aspect.label,
      `${labelFor(chart, aspect.from)} - ${labelFor(chart, aspect.to)}`,
      `${aspect.orb.toFixed(2)}°`,
    ]),
  )
}

function drawInterpretation(doc: jsPDF, interpretation: InterpretationReport, logo: HTMLImageElement) {
  doc.addPage()
  drawHeader(doc, interpretation.title)
  let y = 36
  y = drawParagraph(doc, interpretation.overview, y, true)
  interpretation.sections.forEach((section) => {
    if (y > 238) {
      doc.addPage()
      drawHeader(doc, interpretation.title)
      y = 36
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(23, 32, 51)
    doc.text(section.title, page.margin, y)
    y += 8
    y = drawParagraph(doc, section.summary, y, true)
    section.body.forEach((paragraph) => {
      y = drawParagraph(doc, paragraph, y)
    })
    y += 4
  })
  doc.addImage(logo, 'PNG', 170, 254, 18, 18)
}

function drawHeader(doc: jsPDF, title: string) {
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, page.width, page.height, 'F')
  doc.setTextColor(23, 32, 51)
  doc.setFont('times', 'normal')
  doc.setFontSize(18)
  doc.text(title, page.margin, 22)
  doc.setDrawColor(215, 170, 93)
  doc.line(page.margin, 27, page.width - page.margin, 27)
}

function drawFooter(doc: jsPDF, index: number, total: number) {
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
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(102, 112, 133)
  doc.text(key, page.margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(23, 32, 51)
  doc.text(value, 70, y)
  return y + 8
}

function drawTable(doc: jsPDF, y: number, headers: string[], rows: string[][]) {
  const colWidth = (page.width - page.margin * 2) / headers.length
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  headers.forEach((header, index) => doc.text(header, page.margin + index * colWidth, y))
  y += 5
  doc.setDrawColor(226, 232, 240)
  doc.line(page.margin, y, page.width - page.margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  rows.forEach((row) => {
    if (y > 270) {
      doc.addPage()
      drawHeader(doc, headers.join(' · '))
      y = 38
    }
    row.forEach((cell, index) => doc.text(String(cell), page.margin + index * colWidth, y, { maxWidth: colWidth - 4 }))
    y += 7
  })
  return y
}

function drawParagraph(doc: jsPDF, text: string, y: number, accent = false) {
  doc.setFont('helvetica', accent ? 'bold' : 'normal')
  doc.setFontSize(accent ? 10 : 9.5)
  doc.setTextColor(accent ? 185 : 23, accent ? 130 : 32, accent ? 47 : 51)
  const lines = doc.splitTextToSize(text, page.width - page.margin * 2)
  if (y + lines.length * 5 > 276) {
    doc.addPage()
    drawHeader(doc, 'Interpretación')
    y = 36
  }
  doc.text(lines, page.margin, y)
  return y + lines.length * 5 + 5
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
