import type { InterpretationReport, NatalChart, PlanetPosition } from '../types'

const bodyMeaning: Record<string, string> = {
  sun: 'identidad, vitalidad y modo de expresar propósito',
  moon: 'mundo emocional, necesidades de seguridad y memoria afectiva',
  ascendant: 'primera impresión, estilo de respuesta y forma de iniciar experiencias',
  mercury: 'pensamiento, comunicación y aprendizaje',
  venus: 'vínculos, placer, valores y forma de recibir afecto',
  mars: 'deseo, impulso, iniciativa y manejo del conflicto',
  jupiter: 'expansión, confianza, visión y oportunidades de crecimiento',
  saturn: 'estructura, límites, responsabilidad y madurez',
  uranus: 'originalidad, cambio, independencia y ruptura de patrones',
  neptune: 'imaginación, sensibilidad, ideales y zonas de confusión',
  pluto: 'intensidad, transformación, poder personal y procesos profundos',
  midheaven: 'vocación, dirección profesional y presencia pública',
}

export function buildInterpretation(chart: NatalChart): InterpretationReport {
  const sun = find(chart, 'sun')
  const moon = find(chart, 'moon')
  const asc = find(chart, 'ascendant')
  const dominant = chart.balance.dominants.join(' y ')

  return {
    title: `Lectura natal de ${chart.input.name}`,
    overview: `Esta lectura integra posiciones, casas, aspectos, elementos y modalidades. No presenta la astrología como ciencia demostrada ni como destino fijo: describe símbolos que pueden servir para observar patrones personales con más claridad.`,
    sections: [
      {
        id: 'summary',
        title: 'Resumen general',
        summary: `Predominan ${dominant}, con Sol en ${sun.sign}, Luna en ${moon.sign} y Ascendente en ${asc.sign}.`,
        linkedBodies: ['sun', 'moon', 'ascendant'],
        body: [
          `La carta sugiere una combinación entre la identidad de ${sun.sign}, la sensibilidad de ${moon.sign} y una manera de entrar en la vida marcada por ${asc.sign}. Esta tríada es el punto de partida de la interpretación: identidad, necesidad emocional y presencia externa no siempre empujan en la misma dirección, y ahí aparece buena parte de la riqueza del mapa.`,
          `Los dominantes ${dominant} indican el clima general de la carta. Funcionan como una tonalidad de fondo: no sustituyen a planetas, casas o aspectos, pero ayudan a entender por qué ciertos temas se repiten con más fuerza que otros.`,
        ],
      },
      ...chart.positions
        .filter((position) => bodyMeaning[position.id])
        .map((position) => interpretPosition(position, chart)),
      {
        id: 'relationships',
        title: 'Relaciones y compatibilidad',
        summary: 'La compatibilidad no puede deducirse solo del signo solar.',
        linkedBodies: ['venus', 'mars', 'moon', 'descendant'],
        body: [
          `Para vínculos, la carta pide mirar Luna, Venus, Marte, Descendente, Casa 7 y aspectos. En esta carta, Venus y Marte describen estilos afectivos y de deseo que pueden complementarse o generar fricción según sus aspectos.`,
          `Una comparación fiable requeriría la carta completa de la otra persona. Esta lectura solo ofrece orientación general sobre necesidades vinculares, no afirma compatibilidad o incompatibilidad definitiva.`,
        ],
      },
      {
        id: 'synthesis',
        title: 'Síntesis final',
        summary: 'La carta se entiende mejor como un mapa de autoconocimiento que como una sentencia.',
        body: [
          `El eje central consiste en reconocer qué partes de la personalidad avanzan con naturalidad y cuáles piden más atención consciente. Las fortalezas aparecen cuando los rasgos dominantes se expresan con madurez; los retos surgen cuando una misma energía se vuelve automática o rígida.`,
          `La recomendación práctica es trabajar con la carta por capas: primero Sol, Luna y Ascendente; después casas y aspectos; finalmente dominantes y contradicciones internas. Así la lectura conserva profundidad sin volverse abrumadora.`,
        ],
      },
    ],
  }
}

function interpretPosition(position: PlanetPosition, chart: NatalChart) {
  const aspects = chart.aspects.filter((aspect) => aspect.from === position.id || aspect.to === position.id).slice(0, 3)
  return {
    id: position.id,
    title: `${position.label} en ${position.sign}${position.house ? ` · Casa ${position.house}` : ''}`,
    summary: `${position.label} representa ${bodyMeaning[position.id]}. En ${position.sign}, esa función adopta un tono específico dentro de la carta.`,
    linkedBodies: [position.id],
    linkedAspects: aspects.map((aspect) => aspect.id),
    body: [
      `Esta posición puede manifestarse como una forma de vivir ${bodyMeaning[position.id]} a través de cualidades asociadas con ${position.sign}. Si además cae en Casa ${position.house ?? 'sin asignar'}, el énfasis se desplaza hacia esa área concreta de experiencia.`,
      aspects.length > 0
        ? `Sus aspectos más relevantes (${aspects.map((aspect) => aspect.label.toLowerCase()).join(', ')}) matizan la interpretación: no basta con leer planeta y signo de forma aislada, porque estas conexiones muestran cómo dialoga esta función con otras partes de la personalidad.`
        : `Al no destacar por aspectos mayores dentro del orbe seleccionado, esta función puede expresarse de manera más autónoma, con menos interferencias directas de otros planetas.`,
      `Como fortaleza, puede aportar coherencia y recursos propios de ${position.sign}. Como reto, conviene observar cuándo esa misma energía se vuelve excesiva, defensiva o poco flexible. La práctica recomendada es reconocer el patrón antes de reaccionar automáticamente.`,
    ],
  }
}

function find(chart: NatalChart, id: PlanetPosition['id']) {
  const position = chart.positions.find((item) => item.id === id)
  if (!position) throw new Error(`No se encontró ${id}`)
  return position
}
