import type { Aspect, CelestialBodyId, InterpretationReport, InterpretationSection, NatalChart, PlanetPosition } from '../types'

const houseTopics: Record<number, string> = {
  1: 'presencia, identidad visible e iniciativa personal',
  2: 'seguridad material, autoestima y relación con los recursos',
  3: 'lenguaje, aprendizaje, entorno cercano y ritmo mental cotidiano',
  4: 'raíces, intimidad, memoria familiar y necesidad de pertenencia',
  5: 'creatividad, placer, juego, romance y autoexpresión',
  6: 'trabajo diario, hábitos, cuidado práctico y mejora continua',
  7: 'pareja, acuerdos, colaboración y espejo vincular',
  8: 'intimidad profunda, transformación, confianza y manejo de crisis',
  9: 'sentido, estudios amplios, viajes, fe personal y horizonte vital',
  10: 'vocación, reputación, ambición y lugar visible en el mundo',
  11: 'amistades, redes, proyectos colectivos y visión de futuro',
  12: 'vida interior, retiro, inconsciente, cierre de ciclos y sensibilidad sutil',
}

const signTone: Record<string, string> = {
  Aries: 'directa, impulsiva y orientada a abrir camino',
  Tauro: 'constante, sensorial y enfocada en construir estabilidad',
  Géminis: 'curiosa, móvil y mentalmente asociativa',
  Cáncer: 'protectora, receptiva y vinculada a la memoria emocional',
  Leo: 'expresiva, cálida y centrada en afirmar una voz propia',
  Virgo: 'analítica, precisa y atenta a lo que puede mejorarse',
  Libra: 'relacional, estética y sensible al equilibrio',
  Escorpio: 'intensa, reservada y orientada a comprender lo oculto',
  Sagitario: 'expansiva, franca y guiada por significado',
  Capricornio: 'sobria, estratégica y consciente de la responsabilidad',
  Acuario: 'independiente, conceptual y orientada a lo colectivo',
  Piscis: 'imaginativa, empática y permeable a climas sutiles',
}

const elementTone: Record<string, string> = {
  Fuego: 'el impulso, la intuición activa y la necesidad de sentirse en movimiento',
  Tierra: 'la concreción, la prudencia y la necesidad de resultados palpables',
  Aire: 'la observación, el intercambio y la necesidad de comprender antes de fijar posición',
  Agua: 'la sensibilidad, la resonancia emocional y la necesidad de seguridad afectiva',
}

const modalityTone: Record<string, string> = {
  Cardinal: 'iniciar procesos y tomar la delantera cuando algo necesita forma',
  Fijo: 'sostener lo elegido incluso cuando el entorno cambia',
  Mutable: 'adaptarse, traducir experiencias y moverse entre perspectivas',
}

export function buildInterpretation(chart: NatalChart): InterpretationReport {
  const ctx = createContext(chart)
  return {
    title: `Lectura natal de ${chart.input.name}`,
    overview: buildOverview(ctx),
    sections: [
      identitySection(ctx),
      emotionalSection(ctx),
      mindSection(ctx),
      relationshipSection(ctx),
      actionSection(ctx),
      vocationSection(ctx),
      talentsSection(ctx),
      challengesSection(ctx),
      contradictionsSection(ctx),
      growthSection(ctx),
      synthesisSection(ctx),
    ],
  }
}

interface InterpretationContext {
  chart: NatalChart
  byId: Map<CelestialBodyId, PlanetPosition>
  primaryElement: string
  secondaryElement: string
  scarceElement: string
  primaryModality: string
  scarceModality: string
  angularBodies: PlanetPosition[]
  personalAspects: Aspect[]
}

function createContext(chart: NatalChart): InterpretationContext {
  const byId = new Map(chart.positions.map((position) => [position.id, position]))
  const elements = sortedEntries(chart.balance.elements)
  const modalities = sortedEntries(chart.balance.modalities)
  return {
    chart,
    byId,
    primaryElement: elements[0][0],
    secondaryElement: elements[1]?.[0] ?? elements[0][0],
    scarceElement: elements.at(-1)?.[0] ?? elements[0][0],
    primaryModality: modalities[0][0],
    scarceModality: modalities.at(-1)?.[0] ?? modalities[0][0],
    angularBodies: chart.positions.filter((position) => [1, 4, 7, 10].includes(position.house ?? 0)),
    personalAspects: chart.aspects.filter((aspect) => touches(aspect, ['sun', 'moon', 'mercury', 'venus', 'mars', 'ascendant', 'midheaven'])),
  }
}

function buildOverview(ctx: InterpretationContext) {
  const sun = must(ctx, 'sun')
  const moon = must(ctx, 'moon')
  const asc = must(ctx, 'ascendant')
  const mainAspect = strongest(ctx.personalAspects)
  const angular = ctx.angularBodies.filter((position) => !['ascendant', 'descendant', 'midheaven', 'imum-coeli'].includes(position.id))
  const angularPhrase =
    angular.length > 0
      ? ` Además, ${list(angular.map((position) => position.label))} en casas angulares hace que parte de esa dinámica sea visible y difícil de dejar en segundo plano.`
      : ' La carta no concentra todos sus planetas personales en los ángulos, de modo que varias motivaciones operan con más elaboración interna que exhibición inmediata.'

  return `Esta lectura integra la carta como sistema simbólico, no como una suma de piezas aisladas. El eje inicial combina Sol en ${sun.sign} en Casa ${sun.house}, Luna en ${moon.sign} en Casa ${moon.house} y Ascendente en ${asc.sign}; sobre ese eje pesan la dominante ${ctx.primaryElement.toLowerCase()} y la modalidad ${ctx.primaryModality.toLowerCase()}, que inclinan la personalidad hacia ${elementTone[ctx.primaryElement]} y hacia ${modalityTone[ctx.primaryModality]}. ${
    mainAspect ? `El aspecto más cerrado, ${aspectPhrase(ctx, mainAspect)}, actúa como una nota de fondo que colorea varias áreas de la lectura.` : ''
  }${angularPhrase} La astrología se presenta aquí como lenguaje de autoconocimiento, no como diagnóstico ni predicción cerrada.`
}

function identitySection(ctx: InterpretationContext): InterpretationSection {
  const sun = must(ctx, 'sun')
  const asc = must(ctx, 'ascendant')
  const moon = must(ctx, 'moon')
  const sunAspects = aspectsFor(ctx, 'sun').slice(0, 3)
  const ascAspects = aspectsFor(ctx, 'ascendant').slice(0, 2)
  const solarPressure = describeAspectSet(ctx, sunAspects, 'la identidad no se expresa en línea recta')
  const innerOuter =
    sun.sign === asc.sign
      ? `Como Sol y Ascendente comparten ${sun.sign}, la imagen que ${ctx.chart.input.name} proyecta tiende a coincidir con lo que intenta afirmar por dentro; hay menos distancia entre primera impresión y voluntad central.`
      : `Hay una diferencia útil entre el Sol en ${sun.sign} y el Ascendente en ${asc.sign}: por fuera aparece una respuesta ${signTone[asc.sign]}, mientras que el centro personal busca expresarse de manera ${signTone[sun.sign]}. Esa distancia puede ser riqueza si se usa conscientemente, y fricción si se convierte en personaje automático.`

  return {
    id: 'identity',
    title: 'Identidad y personalidad',
    summary: `La identidad combina el centro solar de ${sun.sign}, la entrada al mundo de ${asc.sign} y una base emocional lunar en ${moon.sign}.`,
    linkedBodies: ['sun', 'ascendant', 'moon'],
    linkedAspects: [...sunAspects, ...ascAspects].map((aspect) => aspect.id),
    body: [
      `${innerOuter} El Sol cae en Casa ${sun.house}, área asociada con ${topic(sun)}, así que la pregunta “quién soy” se activa especialmente cuando aparecen asuntos de ${topic(sun)}.`,
      solarPressure,
      ascAspects.length > 0
        ? `El Ascendente no funciona como simple máscara: ${describeAspectSet(ctx, ascAspects, 'la manera de iniciar experiencias recibe interferencias claras de otros puntos de la carta').toLowerCase()}`
        : `El Ascendente en ${asc.sign} ofrece una puerta de entrada relativamente limpia: la persona puede iniciar situaciones desde esa cualidad ${signTone[asc.sign]} sin que los aspectos principales distorsionen demasiado la primera respuesta.`,
    ],
  }
}

function emotionalSection(ctx: InterpretationContext): InterpretationSection {
  const moon = must(ctx, 'moon')
  const saturnMoon = aspectBetween(ctx, 'moon', 'saturn')
  const neptuneMoon = aspectBetween(ctx, 'moon', 'neptune')
  const moonAspects = aspectsFor(ctx, 'moon').slice(0, 4)
  const elementContrast = ctx.primaryElement === 'Agua' ? 'la sensibilidad está reforzada por la dominante elemental' : `la dominante ${ctx.primaryElement.toLowerCase()} puede hacer que lo emocional busque expresarse a través de ${elementTone[ctx.primaryElement]}`

  const paragraphs = [
    `La Luna en ${moon.sign} en Casa ${moon.house} coloca la seguridad emocional en temas de ${topic(moon)}. No describe solo “cómo siente”, sino dónde necesita reconocer pertenencia, descanso y respuesta íntima. En esta carta, ${elementContrast}, de modo que la emoción no siempre se muestra con la misma textura con la que nace.`,
    describeAspectSet(ctx, moonAspects, 'el mundo emocional recibe mucha información de otras funciones psíquicas'),
  ]

  if (saturnMoon) {
    paragraphs.push(`${aspectPhrase(ctx, saturnMoon)} sugiere que la vulnerabilidad puede pasar por filtros de autocontrol, responsabilidad o reserva. La madurez emocional aquí no consiste en endurecerse, sino en distinguir cuidado real de exigencia interiorizada.`)
  }
  if (neptuneMoon) {
    paragraphs.push(`${aspectPhrase(ctx, neptuneMoon)} añade permeabilidad: el clima de otras personas puede entrar con facilidad. Esto puede dar imaginación y compasión, pero también exige límites claros para no convertir cada emoción ajena en una obligación propia.`)
  }

  return {
    id: 'emotional-world',
    title: 'Mundo emocional',
    summary: `La Luna en ${moon.sign} se interpreta junto con sus aspectos y con la dominante ${ctx.primaryElement.toLowerCase()} de la carta.`,
    linkedBodies: ['moon'],
    linkedAspects: moonAspects.map((aspect) => aspect.id),
    body: paragraphs,
  }
}

function mindSection(ctx: InterpretationContext): InterpretationSection {
  const mercury = must(ctx, 'mercury')
  const moon = must(ctx, 'moon')
  const mercuryAspects = aspectsFor(ctx, 'mercury').slice(0, 4)
  const moonMercury = aspectBetween(ctx, 'moon', 'mercury')
  const airSupport = ctx.primaryElement === 'Aire' || ctx.secondaryElement === 'Aire'
  return {
    id: 'thinking',
    title: 'Forma de pensar y comunicarse',
    summary: `Mercurio en ${mercury.sign} en Casa ${mercury.house} organiza la mente mientras la Luna en ${moon.sign} marca el clima emocional desde el que se interpreta lo vivido.`,
    linkedBodies: ['mercury', 'moon'],
    linkedAspects: mercuryAspects.map((aspect) => aspect.id),
    body: [
      `Mercurio en ${mercury.sign} da a la mente una cualidad ${signTone[mercury.sign]}; al estar en Casa ${mercury.house}, piensa mejor cuando puede ordenar experiencias relacionadas con ${topic(mercury)}. La Luna en ${moon.sign} aporta el filtro emocional: no todo se procesa como idea, porque algunas conclusiones nacen de una sensación previa. ${
        airSupport
          ? 'La presencia de Aire en la distribución general facilita distancia mental y capacidad de lectura de contexto.'
          : `Como el Aire no domina la carta, el pensamiento puede estar más ligado a experiencia, emoción o necesidad práctica que a abstracción pura.`
      }`,
      moonMercury
        ? `${aspectPhrase(ctx, moonMercury)} une memoria emocional y lenguaje. Esto puede hacer que la palabra salga cargada de vivencia: la persona no solo comunica datos, comunica atmósferas, recuerdos o necesidades no siempre dichas de frente.`
        : `Al no haber un aspecto mayor cerrado entre Luna y Mercurio, sentir y explicar pueden funcionar en tiempos distintos. A veces primero aparece la reacción interna y más tarde llega la frase precisa.`,
      describeAspectSet(ctx, mercuryAspects, 'la mente se define por sus conexiones: no es una pieza neutral del mapa, sino un puente entre varias demandas internas'),
    ],
  }
}

function relationshipSection(ctx: InterpretationContext): InterpretationSection {
  const venus = must(ctx, 'venus')
  const mars = must(ctx, 'mars')
  const descendant = must(ctx, 'descendant')
  const moon = must(ctx, 'moon')
  const venusAspects = aspectsFor(ctx, 'venus').slice(0, 3)
  const marsAspects = aspectsFor(ctx, 'mars').slice(0, 3)
  const venusMars = aspectBetween(ctx, 'venus', 'mars')
  return {
    id: 'relationships',
    title: 'Relaciones y afectividad',
    summary: `La vida afectiva se lee desde Venus, Marte, Luna, Descendente y los aspectos que los conectan.`,
    linkedBodies: ['venus', 'mars', 'moon', 'descendant'],
    linkedAspects: [...venusAspects, ...marsAspects].map((aspect) => aspect.id),
    body: [
      `Venus en ${venus.sign} en Casa ${venus.house} busca valor y vínculo a través de ${topic(venus)}, mientras Marte en ${mars.sign} en Casa ${mars.house} actúa desde una energía ${signTone[mars.sign]}. El Descendente en ${descendant.sign} señala que las relaciones importantes suelen traer cualidades ${signTone[descendant.sign]} que obligan a negociar con el propio modo de aparecer ante el mundo.`,
      venusMars
        ? `${aspectPhrase(ctx, venusMars)} hace que deseo y afecto no caminen separados. Según el tono del aspecto, puede haber magnetismo, tensión creativa o necesidad de aprender a pedir lo que se desea sin desordenar lo que se valora.`
        : `Venus y Marte no aparecen unidos por un aspecto mayor cerrado; por eso el lenguaje afectivo y el impulso pueden expresarse por canales distintos. La carta gana matiz cuando la persona no exige que atracción, ternura y compromiso tengan siempre el mismo ritmo.`,
      `La Luna en ${moon.sign} añade la necesidad emocional de fondo: aunque Venus describa preferencias vinculares, la relación solo se vuelve habitable si también respeta esa seguridad lunar ligada a ${topic(moon)}.`,
      [...venusAspects, ...marsAspects].length > 0
        ? `Los aspectos afectivos principales modifican el retrato: ${describeAspectSet(ctx, [...venusAspects, ...marsAspects].slice(0, 4), 'la manera de vincularse no se explica por un solo signo').toLowerCase()}`
        : `Al no concentrarse aspectos mayores sobre Venus o Marte, los vínculos pueden depender más de decisiones conscientes y contexto que de una tensión natal claramente dominante.`,
      `Una compatibilidad real requeriría comparar dos cartas completas. Esta lectura solo describe el patrón relacional propio; no concluye que alguien sea compatible o incompatible por signo solar, elemento o una posición aislada.`,
    ],
  }
}

function actionSection(ctx: InterpretationContext): InterpretationSection {
  const mars = must(ctx, 'mars')
  const sun = must(ctx, 'sun')
  const saturn = optional(ctx, 'saturn')
  const marsAspects = aspectsFor(ctx, 'mars').slice(0, 4)
  const sunMars = aspectBetween(ctx, 'sun', 'mars')
  const marsSaturn = aspectBetween(ctx, 'mars', 'saturn')
  const fireScarce = ctx.scarceElement === 'Fuego'
  return {
    id: 'action',
    title: 'Energía y acción',
    summary: `Marte se interpreta junto al Sol, Saturno y la cantidad de Fuego disponible en la carta.`,
    linkedBodies: ['mars', 'sun', 'saturn'],
    linkedAspects: marsAspects.map((aspect) => aspect.id),
    body: [
      `Marte en ${mars.sign} en Casa ${mars.house} muestra dónde aparece iniciativa, deseo y defensa personal: ${topic(mars)}. ${
        fireScarce
          ? 'Como el Fuego es el elemento menos presente, la acción puede necesitar motivo claro antes de encenderse; cuando se activa, conviene protegerla de la dispersión o la duda.'
          : `La distribución elemental sostiene una acción teñida por ${elementTone[ctx.primaryElement]}, así que el impulso no actúa solo por velocidad, sino por la lógica dominante del mapa.`
      }`,
      sunMars
        ? `${aspectPhrase(ctx, sunMars)} conecta voluntad e iniciativa; la persona suele notar rápido cuándo algo toca su identidad, porque el cuerpo y el deseo responden antes de que todo esté explicado.`
        : `El Sol en ${sun.sign} y Marte en ${mars.sign} no dependen de un aspecto mayor exacto para funcionar; esto permite separar identidad y reacción, aunque también exige decidir cuándo actuar y cuándo simplemente observar.`,
      marsSaturn && saturn
        ? `${aspectPhrase(ctx, marsSaturn)} introduce una pedagogía del ritmo: Saturno en ${saturn.sign} no apaga a Marte, pero le exige método, paciencia y consecuencias. La frustración puede transformarse en oficio si la persona acepta entrenar su fuerza en vez de medirla solo por intensidad inmediata.`
        : describeAspectSet(ctx, marsAspects, 'la acción recibe señales de otros puntos de la carta'),
    ],
  }
}

function vocationSection(ctx: InterpretationContext): InterpretationSection {
  const mc = must(ctx, 'midheaven')
  const sun = must(ctx, 'sun')
  const saturn = optional(ctx, 'saturn')
  const jupiter = optional(ctx, 'jupiter')
  const mcAspects = aspectsFor(ctx, 'midheaven').slice(0, 4)
  const tenthBodies = ctx.chart.positions.filter((position) => position.house === 10 && !isAngle(position.id))
  return {
    id: 'vocation',
    title: 'Vocación y profesión',
    summary: `El Medio Cielo en ${mc.sign}, los planetas de Casa 10 y los aspectos al eje profesional definen el estilo de realización pública.`,
    linkedBodies: ['midheaven', 'sun', 'saturn', 'jupiter'],
    linkedAspects: mcAspects.map((aspect) => aspect.id),
    body: [
      `El Medio Cielo en ${mc.sign} orienta la proyección pública hacia una expresión ${signTone[mc.sign]}. No habla solo de empleo: describe el tipo de huella que la persona intenta dejar cuando asume responsabilidad visible.`,
      `El Sol en ${sun.sign} en Casa ${sun.house} indica que la vocación gana autenticidad cuando no se separa de los temas de ${topic(sun)}. La carrera no se lee aquí como una fachada pública, sino como una prolongación posible del centro vital.`,
      tenthBodies.length > 0
        ? `La Casa 10 recibe a ${list(tenthBodies.map((position) => `${position.label} en ${position.sign}`))}; por eso la vocación no es un tema periférico. Es un escenario donde varias funciones internas buscan reconocimiento, estructura o dirección.`
        : `La Casa 10 no concentra planetas principales, de modo que la profesión puede construirse más desde el regente simbólico del Medio Cielo, los aspectos y las decisiones de trayectoria que desde una presión planetaria directa en esa casa.`,
      saturn
        ? `Saturno en ${saturn.sign} en Casa ${saturn.house} muestra dónde la carta pide competencia real antes de exponerse demasiado. Si se integra bien, la ambición deja de ser prisa y se convierte en arquitectura.`
        : `La lectura vocacional se apoya más en el Medio Cielo y en los aspectos que en una marca saturnina explícita dentro de las posiciones disponibles.`,
      jupiter
        ? `Júpiter en ${jupiter.sign} en Casa ${jupiter.house} indica dónde la confianza crece cuando hay amplitud y sentido. Sus temas de ${topic(jupiter)} pueden funcionar como puerta de oportunidad, especialmente si no se confunden expansión con exceso.`
        : `La expansión profesional se lee aquí desde el conjunto de la carta, sin una posición jupiteriana destacada en los datos disponibles.`,
      describeAspectSet(ctx, mcAspects, 'el camino profesional está condicionado por vínculos directos con otros puntos del mapa'),
    ],
  }
}

function talentsSection(ctx: InterpretationContext): InterpretationSection {
  const harmonic = ctx.chart.aspects.filter((aspect) => aspect.tone === 'harmonic').slice(0, 5)
  const angular = ctx.angularBodies.filter((position) => !isAngle(position.id))
  const element = ctx.primaryElement
  return {
    id: 'talents',
    title: 'Talentos naturales',
    summary: `Los recursos más fluidos aparecen donde se repiten elemento dominante, casas angulares y aspectos armónicos.`,
    linkedBodies: uniqueBodies(harmonic),
    linkedAspects: harmonic.map((aspect) => aspect.id),
    body: [
      `La dominante ${element.toLowerCase()} da un talento de base para moverse desde ${elementTone[element]}. No es una garantía automática de éxito, pero sí un idioma que la carta habla con más facilidad que otros.`,
      harmonic.length > 0
        ? `Los aspectos armónicos más útiles son ${list(harmonic.map((aspect) => aspectPhrase(ctx, aspect)))}. Estos contactos muestran zonas donde distintas funciones internas cooperan sin exigir tanta negociación previa.`
        : `No destacan muchos aspectos armónicos cerrados; esto no reduce el potencial, pero sugiere que los talentos se desarrollan más por integración consciente que por facilidad inmediata.`,
      angular.length > 0
        ? `${list(angular.map((position) => position.label))} en casas angulares convierte parte del talento en presencia: otras personas pueden percibir esas cualidades incluso antes de que la persona las explique.`
        : `Al haber menos planetas personales en ángulos, varios dones pueden sentirse privados al principio y volverse visibles cuando existe contexto, confianza o oficio.`,
    ],
  }
}

function challengesSection(ctx: InterpretationContext): InterpretationSection {
  const tense = ctx.chart.aspects.filter((aspect) => aspect.tone === 'tense').slice(0, 6)
  const saturnAspects = aspectsFor(ctx, 'saturn').slice(0, 3)
  const plutoAspects = aspectsFor(ctx, 'pluto').slice(0, 3)
  return {
    id: 'challenges',
    title: 'Retos personales',
    summary: `Los retos principales no son defectos: son puntos donde la carta pide más conciencia, ritmo y elección.`,
    linkedBodies: uniqueBodies([...tense, ...saturnAspects, ...plutoAspects]),
    linkedAspects: [...tense, ...saturnAspects, ...plutoAspects].map((aspect) => aspect.id),
    body: [
      tense.length > 0
        ? `Las tensiones más insistentes son ${list(tense.map((aspect) => aspectPhrase(ctx, aspect)))}. Al repetirse, no conviene leerlas como “problemas”, sino como fricciones estructurales entre necesidades legítimas que no siempre quieren lo mismo al mismo tiempo.`
        : `La carta no muestra una gran acumulación de aspectos tensos principales; los retos pueden aparecer más por distribución elemental, casas activadas o decisiones vitales que por choques planetarios muy cerrados.`,
      saturnAspects.length > 0
        ? `Saturno interviene en ${list(saturnAspects.map((aspect) => aspectPhrase(ctx, aspect)))}. Eso suele volver más seria la función tocada: pide realidad, límites y práctica sostenida, incluso cuando otra parte de la carta preferiría resolverlo con rapidez.`
        : `Saturno no domina por aspectos cerrados en esta selección, por lo que la sensación de deber puede ser más situacional que nuclear.`,
      plutoAspects.length > 0
        ? `Plutón añade intensidad en ${list(plutoAspects.map((aspect) => aspectPhrase(ctx, aspect)))}. Allí la carta no se conforma con arreglos superficiales; pide revisar control, apego, miedo a perder poder o necesidad de transformación real.`
        : `Plutón no aparece como gran modificador de los planetas personales principales, de modo que los procesos de transformación pueden activarse más por tránsitos y experiencias que por una presión natal constante.`,
    ],
  }
}

function contradictionsSection(ctx: InterpretationContext): InterpretationSection {
  const sun = must(ctx, 'sun')
  const moon = must(ctx, 'moon')
  const venus = must(ctx, 'venus')
  const mars = must(ctx, 'mars')
  const sunMoon = aspectBetween(ctx, 'sun', 'moon')
  const venusSaturn = aspectBetween(ctx, 'venus', 'saturn')
  const uranusPersonal = ctx.chart.aspects.find((aspect) => touches(aspect, ['uranus']) && touches(aspect, ['sun', 'moon', 'venus', 'mars', 'ascendant']))
  return {
    id: 'contradictions',
    title: 'Contradicciones internas',
    summary: `Las contradicciones más importantes aparecen al comparar identidad, emoción, vínculo, acción y dominantes.`,
    linkedBodies: ['sun', 'moon', 'venus', 'mars', 'saturn', 'uranus'],
    linkedAspects: [sunMoon, venusSaturn, uranusPersonal].filter(isAspect).map((aspect) => aspect.id),
    body: [
      sunMoon
        ? `${aspectPhrase(ctx, sunMoon)} describe la conversación central entre voluntad y necesidad emocional. Cuando el aspecto es fluido, ambas partes pueden cooperar; cuando es tenso, la persona puede oscilar entre ser fiel a lo que quiere y proteger lo que necesita.`
        : `Sol en ${sun.sign} y Luna en ${moon.sign} no están unidos por un aspecto mayor cerrado; eso permite que identidad y emoción se alternen sin estar siempre en conflicto directo, aunque sus signos y casas sigan marcando necesidades diferentes.`,
      `Venus en ${venus.sign} busca vínculo desde una lógica ${signTone[venus.sign]}, mientras Marte en ${mars.sign} persigue deseo y afirmación desde una lógica ${signTone[mars.sign]}. Si ambas energías no se escuchan, una parte puede querer paz afectiva mientras otra exige movimiento, conquista o defensa.`,
      venusSaturn
        ? `${aspectPhrase(ctx, venusSaturn)} puede introducir cautela en el amor o exigencia al valorar. Bien trabajado, da lealtad y criterio; sin conciencia, puede convertir el afecto en examen permanente.`
        : `Al no destacar un contacto Venus-Saturno cerrado, las contradicciones afectivas no parecen venir principalmente de miedo al compromiso o exceso de exigencia, sino de la relación entre deseo, necesidad emocional y estilo vincular.`,
      uranusPersonal
        ? `${aspectPhrase(ctx, uranusPersonal)} introduce una necesidad de libertad que no se negocia bien bajo presión. Esta carta necesita espacio para respirar; de lo contrario, puede romper de golpe lo que no pudo reformar gradualmente.`
        : `Urano no aparece como el principal detonador de contradicción personal, así que la independencia puede expresarse de forma más conceptual o contextual que como ruptura constante.`,
    ],
  }
}

function growthSection(ctx: InterpretationContext): InterpretationSection {
  const north = optional(ctx, 'north-node')
  const south = optional(ctx, 'south-node')
  const chiron = optional(ctx, 'chiron')
  const nodeAspects = aspectsFor(ctx, 'north-node').slice(0, 3)
  return {
    id: 'growth',
    title: 'Potencial de crecimiento',
    summary: north ? `El Nodo Norte en ${north.sign} orienta el desarrollo hacia temas de Casa ${north.house}.` : 'El crecimiento se lee desde la integración de tensiones y dominantes.',
    linkedBodies: ['north-node', 'south-node', 'chiron'],
    linkedAspects: nodeAspects.map((aspect) => aspect.id),
    body: [
      north && south
        ? `El eje nodal va de ${south.sign} en Casa ${south.house} hacia ${north.sign} en Casa ${north.house}. La zona conocida está asociada con ${topic(south)}; el crecimiento, en cambio, pide ensayar una cualidad ${signTone[north.sign]} en asuntos de ${topic(north)}.`
        : `Sin eje nodal completo disponible, el desarrollo se entiende mejor a partir de los aspectos tensos y de la distribución elemental de la carta.`,
      nodeAspects.length > 0
        ? `Los aspectos al Nodo Norte (${list(nodeAspects.map((aspect) => aspectPhrase(ctx, aspect)))}) muestran que el crecimiento no ocurre en abstracto: involucra funciones concretas de la personalidad que empujan, resisten o abren puertas.`
        : `El Nodo Norte no recibe aspectos mayores cerrados en esta selección, por lo que su dirección puede sentirse menos urgente al principio y más clara cuando la vida active sus casas y signos por experiencia.`,
      chiron
        ? `Quirón en ${chiron.sign} en Casa ${chiron.house} señala una sensibilidad alrededor de ${topic(chiron)}. No debe leerse como herida fija, sino como una zona donde la persona aprende a acompañarse con más precisión porque conoce bien esa fragilidad.`
        : `Quirón no se incluye si el motor no lo calcula de forma fiable; por eso esta lectura no inventa un punto adicional solo para adornar el informe.`,
    ],
  }
}

function synthesisSection(ctx: InterpretationContext): InterpretationSection {
  const sun = must(ctx, 'sun')
  const moon = must(ctx, 'moon')
  const mc = must(ctx, 'midheaven')
  const strongestAspect = strongest(ctx.chart.aspects)
  return {
    id: 'synthesis',
    title: 'Síntesis final',
    summary: `La carta se organiza alrededor de ${ctx.primaryElement.toLowerCase()}, modalidad ${ctx.primaryModality.toLowerCase()} y el diálogo entre Sol, Luna y Medio Cielo.`,
    linkedBodies: ['sun', 'moon', 'ascendant', 'midheaven'],
    linkedAspects: strongestAspect ? [strongestAspect.id] : [],
    body: [
      `La impresión de conjunto no es la de una lista de rasgos, sino la de un sistema que intenta coordinar identidad ${signTone[sun.sign]}, sensibilidad ${signTone[moon.sign]} y una vocación pública ${signTone[mc.sign]}. La dominante ${ctx.primaryElement.toLowerCase()} da el material principal con el que la persona responde a la vida; la modalidad ${ctx.primaryModality.toLowerCase()} describe cómo intenta organizar ese material.`,
      strongestAspect
        ? `El aspecto más exacto, ${aspectPhrase(ctx, strongestAspect)}, merece atención especial porque los aspectos cerrados suelen sentirse antes que las descripciones generales. No anula el resto de la carta, pero funciona como una bisagra: muchas decisiones personales pasan por aprender a usar esa tensión o facilidad con madurez.`
        : `Al no destacar un aspecto único muy dominante, la integración depende más de leer patrones repetidos entre casas, elementos y planetas personales que de resolver una sola tensión central.`,
      `El potencial de esta carta aparece cuando ${ctx.chart.input.name} no intenta vivir una parte del mapa contra otra. La identidad necesita escuchar a la Luna, la acción necesita respetar los límites del conjunto, y la vocación gana fuerza cuando no se separa de la vida emocional. Ese trabajo de integración es precisamente lo que convierte una carta natal en una herramienta viva de autoconocimiento.`,
    ],
  }
}

function aspectsFor(ctx: InterpretationContext, body: CelestialBodyId) {
  return ctx.chart.aspects
    .filter((aspect) => aspect.from === body || aspect.to === body)
    .sort((a, b) => a.orb - b.orb)
}

function aspectBetween(ctx: InterpretationContext, a: CelestialBodyId, b: CelestialBodyId) {
  return ctx.chart.aspects.find((aspect) => (aspect.from === a && aspect.to === b) || (aspect.from === b && aspect.to === a))
}

function describeAspectSet(ctx: InterpretationContext, aspects: Aspect[], fallback: string) {
  if (aspects.length === 0) return `${capitalize(fallback)}.`
  const harmonic = aspects.filter((aspect) => aspect.tone === 'harmonic')
  const tense = aspects.filter((aspect) => aspect.tone === 'tense')
  const neutral = aspects.filter((aspect) => aspect.tone === 'neutral')
  const clauses = []
  if (harmonic.length) clauses.push(`encuentra cooperación en ${list(harmonic.map((aspect) => aspectPhrase(ctx, aspect)))}`)
  if (tense.length) clauses.push(`se ve exigida por ${list(tense.map((aspect) => aspectPhrase(ctx, aspect)))}`)
  if (neutral.length) clauses.push(`se matiza mediante ${list(neutral.map((aspect) => aspectPhrase(ctx, aspect)))}`)
  return `${capitalize(fallback)}: ${clauses.join('; ')}.`
}

function aspectPhrase(ctx: InterpretationContext, aspect: Aspect) {
  const from = must(ctx, aspect.from)
  const to = must(ctx, aspect.to)
  const tone =
    aspect.tone === 'harmonic'
      ? 'facilita el diálogo entre'
      : aspect.tone === 'tense'
        ? 'crea fricción entre'
        : 'pone en contacto'
  return `${aspect.label.toLowerCase()} ${tone} ${from.label} en ${from.sign} y ${to.label} en ${to.sign} (orbe ${aspect.orb.toFixed(2)}°)`
}

function touches(aspect: Aspect, bodies: CelestialBodyId[]) {
  return bodies.includes(aspect.from) || bodies.includes(aspect.to)
}

function isAspect(aspect: Aspect | undefined): aspect is Aspect {
  return Boolean(aspect)
}

function uniqueBodies(aspects: Aspect[]) {
  return Array.from(new Set(aspects.flatMap((aspect) => [aspect.from, aspect.to])))
}

function topic(position: PlanetPosition) {
  return houseTopics[position.house ?? 0] ?? 'un área no determinada de la carta'
}

function isAngle(id: CelestialBodyId) {
  return ['ascendant', 'descendant', 'midheaven', 'imum-coeli'].includes(id)
}

function must(ctx: InterpretationContext, id: CelestialBodyId) {
  const position = ctx.byId.get(id)
  if (!position) throw new Error(`No se encontró ${id}`)
  return position
}

function optional(ctx: InterpretationContext, id: CelestialBodyId) {
  return ctx.byId.get(id)
}

function strongest(aspects: Aspect[]) {
  return aspects[0]
}

function sortedEntries<T extends Record<string, number>>(record: T) {
  return Object.entries(record).sort((a, b) => b[1] - a[1])
}

function list(items: string[]) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} y ${items.at(-1)}`
}

function capitalize(text: string) {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`
}
