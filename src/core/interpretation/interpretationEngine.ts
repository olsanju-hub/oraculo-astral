import type { Aspect, CelestialBodyId, InterpretationReport, InterpretationSection, NatalChart, PlanetPosition } from '../types'

const houseTopics: Record<number, string> = {
  1: 'presencia, iniciativa y manera de abrirse paso',
  2: 'seguridad, autoestima y relación con los recursos',
  3: 'aprendizaje, palabra, entorno cercano y ritmo mental cotidiano',
  4: 'raíces, intimidad, memoria familiar y sensación de pertenencia',
  5: 'creatividad, placer, romance y deseo de expresión propia',
  6: 'hábitos, trabajo diario, cuidado práctico y mejora continua',
  7: 'pareja, acuerdos, colaboración y aprendizaje a través del otro',
  8: 'intimidad profunda, confianza, transformación y manejo de crisis',
  9: 'sentido vital, estudios amplios, viajes, búsqueda y visión del mundo',
  10: 'vocación, reputación, responsabilidad pública y dirección profesional',
  11: 'amistades, redes, proyectos colectivos y futuro compartido',
  12: 'vida interior, retiro, inconsciente, cierre de ciclos y sensibilidad sutil',
}

const signTone: Record<string, string> = {
  Aries: 'directa, franca y rápida para iniciar',
  Tauro: 'constante, sensorial y orientada a construir seguridad',
  Géminis: 'curiosa, ágil y atenta a conexiones entre ideas',
  Cáncer: 'protectora, receptiva y muy ligada a la memoria emocional',
  Leo: 'cálida, expresiva y necesitada de una voz propia',
  Virgo: 'analítica, precisa y pendiente de mejorar lo que toca',
  Libra: 'relacional, estética y sensible al equilibrio',
  Escorpio: 'intensa, reservada y dispuesta a mirar debajo de la superficie',
  Sagitario: 'expansiva, honesta y movida por sentido',
  Capricornio: 'sobria, estratégica y consciente de las consecuencias',
  Acuario: 'independiente, lúcida y orientada a mirar desde otro ángulo',
  Piscis: 'imaginativa, empática y permeable a climas sutiles',
}

const elementTone: Record<string, string> = {
  Fuego: 'necesita entusiasmo, dirección y margen para actuar',
  Tierra: 'busca hechos, consistencia y resultados que puedan sostenerse',
  Aire: 'comprende la vida pensando, comparando, hablando y tomando distancia',
  Agua: 'registra antes el clima emocional que la explicación racional',
}

const modalityTone: Record<string, string> = {
  Cardinal: 'arranca procesos cuando percibe que algo debe moverse',
  Fijo: 'profundiza, sostiene y a veces tarda en soltar lo que ya eligió',
  Mutable: 'adapta, traduce y cambia de perspectiva cuando el contexto lo pide',
}

const bodyMeaning: Partial<Record<CelestialBodyId, string>> = {
  sun: 'identidad, voluntad y sentido de dirección',
  moon: 'necesidad emocional, refugio y memoria afectiva',
  mercury: 'pensamiento, lenguaje y forma de ordenar la experiencia',
  venus: 'afecto, deseo de armonía, placer y forma de valorar',
  mars: 'impulso, deseo, defensa personal y manera de actuar',
  jupiter: 'confianza, expansión, aprendizaje y horizonte de sentido',
  saturn: 'responsabilidad, límites, oficio y maduración',
  uranus: 'libertad, cambio, distancia frente a lo establecido',
  neptune: 'imaginación, sensibilidad, idealización y compasión',
  pluto: 'intensidad, transformación y relación con el control',
  'north-node': 'dirección de crecimiento',
  chiron: 'sensibilidad que puede convertirse en comprensión práctica',
  lilith: 'instinto, autonomía y zonas menos domesticadas de la personalidad',
  ascendant: 'primera respuesta ante el mundo',
  descendant: 'patrón de encuentro con otras personas',
  midheaven: 'vocación, reputación y lugar visible en el mundo',
}

export function buildInterpretation(chart: NatalChart): InterpretationReport {
  const ctx = createContext(chart)
  return {
    title: `Lectura natal de ${chart.input.name}`,
    overview: buildOverview(ctx),
    sections: [
      orientationSection(ctx),
      selfSection(ctx),
      mindSection(ctx),
      emotionalSection(ctx),
      bondsSection(ctx),
      driveSection(ctx),
      vocationSection(ctx),
      talentsSection(ctx),
      conflictSection(ctx),
      growthSection(ctx),
      integrationSection(ctx),
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
  const keyContact = strongest(ctx.personalAspects)
  const angular = ctx.angularBodies.filter((position) => !isAngle(position.id))
  const visible = angular.length
    ? ` Algunas cualidades resultan especialmente visibles porque ${list(angular.map((position) => position.label))} ocupa casas angulares, las zonas de la carta que se notan antes en la conducta.`
    : ' Varias cualidades parecen necesitar tiempo, intimidad o experiencia antes de mostrarse con toda claridad.'

  return `Esta lectura usa la carta natal como lenguaje de autoconocimiento. No pretende fijar un destino ni encerrar a ${ctx.chart.input.name} en una etiqueta: busca explicar cómo ciertas tendencias pueden influir en su manera de pensar, sentir, decidir y relacionarse. La base combina una identidad de estilo ${signTone[sun.sign]}, una vida emocional ${signTone[moon.sign]} y una primera respuesta ante el mundo ${signTone[asc.sign]}. La dominante ${ctx.primaryElement.toLowerCase()} indica que la personalidad suele organizarse desde una necesidad de ${elementTone[ctx.primaryElement]}, mientras que la modalidad ${ctx.primaryModality.toLowerCase()} describe un ritmo que ${modalityTone[ctx.primaryModality]}.${visible}${
    keyContact ? ` Hay además una relación especialmente precisa entre ${pair(ctx, keyContact)}; más que un dato técnico, funciona como una insistencia psicológica que reaparece en distintas áreas de la vida.` : ''
  }`
}

function orientationSection(ctx: InterpretationContext): InterpretationSection {
  return {
    id: 'orientation',
    title: 'Antes de empezar',
    summary: 'La lectura está organizada por dimensiones de la persona, no por una lista de planetas. Los términos astrológicos aparecen solo para que sepas de dónde nace cada idea.',
    linkedBodies: ['sun', 'moon', 'ascendant', 'midheaven'],
    linkedAspects: strongest(ctx.personalAspects) ? [strongest(ctx.personalAspects)!.id] : [],
    body: [
      `Imagina la carta como un plano de una casa. Los planetas son funciones interiores: voluntad, emoción, mente, deseo, impulso, límites o imaginación. Los signos describen el estilo con el que esas funciones se mueven. Las casas indican el escenario de la vida donde se expresan con más fuerza: trabajo, vínculos, hogar, creatividad, intimidad o vocación.`,
      `El Ascendente es la puerta de entrada: muestra cómo alguien suele responder al mundo en los primeros segundos. El Medio Cielo es la parte más visible del edificio: habla de oficio, reputación y dirección pública. El Nodo Norte no es un planeta, sino un punto de orientación; se usa para hablar de aprendizaje vital, no de obligación ni destino cerrado.`,
      `Los aspectos son relaciones entre partes de la personalidad. En lugar de memorizar nombres como trígono, cuadratura, oposición o quincuncio, basta entender la idea: a veces dos necesidades colaboran con naturalidad; otras veces se interrumpen, se exigen ajustes o piden más conciencia para convivir. Cuando un contacto sea relevante, aquí se traducirá a consecuencias prácticas: cómo puede influir en decisiones, vínculos, trabajo o manejo de conflictos.`,
      `También conviene mirar elementos y modalidades. Fuego habla de impulso, Tierra de concreción, Aire de comprensión y Agua de resonancia emocional. Cardinal inicia, Fijo sostiene y Mutable adapta. En esta carta pesan especialmente ${ctx.primaryElement.toLowerCase()} y ${ctx.primaryModality.toLowerCase()}, de modo que muchas conductas se entienden mejor desde esa combinación: ${elementTone[ctx.primaryElement]} y ${modalityTone[ctx.primaryModality]}.`,
    ],
  }
}

function selfSection(ctx: InterpretationContext): InterpretationSection {
  const sun = must(ctx, 'sun')
  const moon = must(ctx, 'moon')
  const asc = must(ctx, 'ascendant')
  const mc = must(ctx, 'midheaven')
  const sunMoon = aspectBetween(ctx, 'sun', 'moon')
  const sunAspects = aspectsFor(ctx, 'sun').slice(0, 3)
  const ascAspects = aspectsFor(ctx, 'ascendant').slice(0, 2)
  const alignment =
    sun.sign === asc.sign
      ? `Lo que se ve al principio y lo que busca afirmarse por dentro hablan un idioma parecido. Eso puede dar coherencia, presencia y una sensación de “voy de frente”, aunque también puede volver más difícil tomar distancia de la propia reacción inmediata.`
      : `Hay una diferencia fértil entre la imagen inicial y el centro de la personalidad. Por fuera puede aparecer una respuesta ${signTone[asc.sign]}, pero por dentro se busca una expresión ${signTone[sun.sign]}. En la vida cotidiana esto puede sentirse como adaptación: una cosa es cómo empieza a actuar, y otra lo que necesita sostener para sentirse fiel a sí misma.`

  return {
    id: 'who-you-are',
    title: 'Quién eres realmente',
    summary: `El núcleo de la lectura une identidad, emoción, primera impresión y propósito visible para responder a la pregunta: “¿qué dice esta carta sobre mi forma de ser?”.`,
    linkedBodies: ['sun', 'moon', 'ascendant', 'midheaven'],
    linkedAspects: compactAspects([sunMoon, ...sunAspects, ...ascAspects]).map((aspect) => aspect.id),
    body: [
      `${ctx.chart.input.name} parece construirse alrededor de una tensión creativa entre mostrarse, protegerse y encontrar una dirección reconocible. El Sol, que representa la voluntad y la sensación de identidad, se expresa con un estilo ${signTone[sun.sign]} y actúa con especial fuerza en asuntos de ${topic(sun)}. Esto sugiere que la persona se reconoce mejor cuando puede vivir esos temas de forma activa, no solo pensarlos desde fuera.`,
      `${alignment} La Luna añade una capa decisiva: bajo la voluntad visible hay una necesidad emocional ${signTone[moon.sign]}, relacionada con ${topic(moon)}. Si esa necesidad se descuida, la persona puede funcionar correctamente por fuera y aun así sentir que algo íntimo no está siendo atendido.`,
      sunMoon
        ? `Voluntad y emoción están conectadas con intensidad suficiente para que una influya en la otra. Cuando la persona decide algo importante, no decide solo con la cabeza: también se mueve una memoria afectiva, una necesidad de seguridad o una reacción corporal. La ventaja es una identidad con profundidad; la dificultad aparece cuando querer avanzar y necesitar protección tiran en direcciones distintas.`
        : `No aparece una unión mayor muy cerrada entre voluntad y emoción, lo que permite alternar registros. Puede haber momentos de claridad racional y otros de repliegue íntimo sin que todo deba resolverse a la vez. La clave está en no confundir esa alternancia con incoherencia.`,
      `La proyección pública, descrita por el Medio Cielo, toma un tono ${signTone[mc.sign]}. Esto influye en cómo la persona quiere ser tomada en serio: no solo por lo que hace, sino por el tipo de presencia que intenta dejar en el mundo. ${aspectWeave(ctx, [...sunAspects, ...ascAspects], 'En la identidad hay señales adicionales que matizan la manera de afirmarse')}`,
    ],
  }
}

function mindSection(ctx: InterpretationContext): InterpretationSection {
  const mercury = must(ctx, 'mercury')
  const jupiter = optional(ctx, 'jupiter')
  const saturn = optional(ctx, 'saturn')
  const mercuryAspects = aspectsFor(ctx, 'mercury').slice(0, 4)
  const moonMercury = aspectBetween(ctx, 'moon', 'mercury')
  const airAvailable = ctx.primaryElement === 'Aire' || ctx.secondaryElement === 'Aire'

  return {
    id: 'thinking',
    title: 'Cómo piensas',
    summary: 'Este capítulo mira cómo se forman las ideas, cómo se comunica la experiencia y qué ocurre cuando pensamiento y emoción no avanzan al mismo ritmo.',
    linkedBodies: ['mercury', 'moon', 'jupiter', 'saturn'],
    linkedAspects: compactAspects([moonMercury, ...mercuryAspects]).map((aspect) => aspect.id),
    body: [
      `La mente no aparece como una máquina fría. Mercurio, que habla de pensamiento y lenguaje, adopta un estilo ${signTone[mercury.sign]} y se activa especialmente en temas de ${topic(mercury)}. En la práctica, esto puede influir en cómo aprende, cómo explica lo que le ocurre y qué tipo de conversaciones le ayudan a ordenar la vida.`,
      airAvailable
        ? `La presencia de Aire en la distribución general favorece observar antes de concluir. Puede haber facilidad para comparar puntos de vista, encontrar palabras y leer matices sociales. La dificultad no está tanto en entender, sino en decidir qué idea merece convertirse en acción.`
        : `Como el Aire no domina el conjunto, las ideas pueden nacer más de la experiencia directa, la emoción o la necesidad práctica que de la abstracción. Esto no resta inteligencia; la vuelve más encarnada. La persona entiende mejor cuando algo toca la vida real.`,
      moonMercury
        ? `Pensar y sentir se influyen de manera notable. Una conversación puede remover recuerdos, y una emoción puede cambiar el tono de una idea. En el día a día esto puede dar una palabra sensible y persuasiva, pero también exige revisar si se está describiendo un hecho o defendiendo una herida.`
        : `La emoción y la palabra no siempre llegan juntas. A veces primero aparece una sensación y solo después la explicación; otras veces la mente entiende algo antes de que el cuerpo lo acepte. Respetar ese intervalo puede evitar decisiones precipitadas.`,
      jupiter
        ? `Júpiter añade una búsqueda de amplitud en ${topic(jupiter)}. Cuando la mente se encierra en detalles, esta parte recuerda que también hace falta sentido, perspectiva y confianza.`
        : `La ampliación de perspectiva depende aquí más del conjunto de la carta que de un foco jupiteriano destacado en los datos disponibles.`,
      saturn
        ? `Saturno, asociado con límites y madurez, coloca una exigencia de rigor en ${topic(saturn)}. Puede hacer que la persona revise mucho antes de hablar o decidir; bien integrado, esto da criterio, oficio y pensamiento responsable.`
        : `La carta no muestra a Saturno como apoyo principal de este capítulo, por lo que la disciplina mental se construye más por hábito que por presión natal evidente.`,
      aspectWeave(ctx, mercuryAspects, 'Las conexiones de Mercurio indican qué otras partes de la personalidad entran en la conversación mental'),
    ],
  }
}

function emotionalSection(ctx: InterpretationContext): InterpretationSection {
  const moon = must(ctx, 'moon')
  const venus = must(ctx, 'venus')
  const saturnMoon = aspectBetween(ctx, 'moon', 'saturn')
  const neptuneMoon = aspectBetween(ctx, 'moon', 'neptune')
  const plutoMoon = aspectBetween(ctx, 'moon', 'pluto')
  const moonAspects = aspectsFor(ctx, 'moon').slice(0, 4)

  return {
    id: 'feeling',
    title: 'Cómo sientes',
    summary: 'La vida emocional se interpreta como una forma de buscar seguridad, pertenencia y descanso interno, no como una simple reacción sentimental.',
    linkedBodies: ['moon', 'venus', 'saturn', 'neptune', 'pluto'],
    linkedAspects: compactAspects([saturnMoon, neptuneMoon, plutoMoon, ...moonAspects]).map((aspect) => aspect.id),
    body: [
      `La Luna describe el lugar donde una persona necesita sentirse a salvo. En esta carta se expresa de forma ${signTone[moon.sign]} y se vincula con ${topic(moon)}. Por eso muchas reacciones emocionales pueden entenderse como intentos de recuperar ese tipo de seguridad: pertenecer, ordenar, proteger, moverse, comprender o tomar distancia, según el clima del momento.`,
      `La dominante ${ctx.primaryElement.toLowerCase()} modifica esa sensibilidad. Si la emoción nace en un punto íntimo, el conjunto de la carta tiende a procesarla desde la necesidad de ${elementTone[ctx.primaryElement]}. Esto explica por qué la persona puede sentir una cosa y gestionarla de otra: sentir no siempre equivale a mostrar.`,
      saturnMoon
        ? `Hay una zona de reserva emocional que merece trato delicado. La necesidad de cuidado puede pasar por un filtro de autocontrol, deber o miedo a molestar. En la vida cotidiana esto puede verse como fortaleza serena, pero también como dificultad para pedir ayuda antes de llegar al límite.`
        : `No se aprecia una presión saturnina directa sobre la Luna entre los contactos principales, así que la contención emocional puede depender más de educación, contexto o decisiones personales que de una estructura natal especialmente rígida.`,
      neptuneMoon
        ? `La imaginación y la empatía amplifican el mundo interno. La persona puede captar atmósferas con rapidez y conmoverse con lo que otros apenas nombran. Esa sensibilidad es valiosa, siempre que no convierta cada clima ajeno en una responsabilidad propia.`
        : `La sensibilidad no parece depender principalmente de una fusión neptuniana fuerte; esto puede ayudar a distinguir con más claridad entre intuición, deseo y realidad concreta.`,
      plutoMoon
        ? `Las emociones no se quedan en la superficie. Algunas experiencias pueden vivirse con gran intensidad, especialmente cuando tocan confianza, pérdida o control. El aprendizaje consiste en no confundir profundidad con vigilancia permanente.`
        : `La carta no coloca a Plutón como modificador emocional central, lo que puede permitir procesos afectivos menos atravesados por dramatismo interno constante.`,
      `Venus, que describe placer y forma de valorar, añade un matiz ${signTone[venus.sign]} en asuntos de ${topic(venus)}. Esto muestra qué condiciones hacen que la vida se sienta amable, bella o digna de ser compartida.`,
    ],
  }
}

function bondsSection(ctx: InterpretationContext): InterpretationSection {
  const venus = must(ctx, 'venus')
  const mars = must(ctx, 'mars')
  const moon = must(ctx, 'moon')
  const descendant = must(ctx, 'descendant')
  const venusMars = aspectBetween(ctx, 'venus', 'mars')
  const venusSaturn = aspectBetween(ctx, 'venus', 'saturn')
  const relationshipAspects = compactAspects([
    venusMars,
    venusSaturn,
    ...aspectsFor(ctx, 'venus').slice(0, 3),
    ...aspectsFor(ctx, 'mars').slice(0, 3),
  ])

  return {
    id: 'relationships',
    title: 'Cómo te relacionas',
    summary: 'Los vínculos se leen desde la necesidad emocional, la forma de amar, el deseo y el tipo de espejo que atraen las relaciones importantes.',
    linkedBodies: ['venus', 'mars', 'moon', 'descendant', 'saturn'],
    linkedAspects: relationshipAspects.map((aspect) => aspect.id),
    body: [
      `En las relaciones, la carta no habla solo de romanticismo. Habla de cómo la persona se acerca, qué valora, qué teme perder y qué necesita para quedarse. Venus aporta una forma ${signTone[venus.sign]} de buscar armonía y placer; Marte añade una manera ${signTone[mars.sign]} de desear, defenderse y tomar iniciativa. Si ambas capas no se escuchan, puede querer una cosa afectivamente y actuar desde otra necesidad.`,
      `El Descendente, que señala el tipo de aprendizaje que aparece a través de los demás, cae en ${descendant.sign}. Esto suele atraer o necesitar cualidades ${signTone[descendant.sign]} en vínculos significativos. No significa que “deba” buscar personas de ese signo; significa que las relaciones importantes despiertan ese estilo de negociación, espejo o complementariedad.`,
      `La Luna recuerda qué vuelve habitable un vínculo: seguridad emocional en torno a ${topic(moon)}. Una relación puede ser atractiva para Venus y estimulante para Marte, pero si no respeta esa necesidad lunar, la persona acaba sintiendo que falta hogar interno.`,
      venusMars
        ? `Afecto y deseo están suficientemente conectados como para que la atracción no sea un detalle secundario. Puede haber intensidad, magnetismo y una necesidad de coherencia entre lo que se valora y lo que se persigue. El desafío es no convertir cada diferencia de ritmo en conflicto.`
        : `Afecto y deseo parecen conservar cierta independencia. Esto permite amar con un tempo y actuar con otro, pero también pide honestidad: no todo impulso expresa amor, y no todo cuidado necesita intensidad inmediata.`,
      venusSaturn
        ? `En el amor puede aparecer una pregunta seria: “¿esto es confiable?”. La carta favorece vínculos con responsabilidad y lealtad, aunque conviene evitar que el criterio se vuelva examen permanente o que el miedo al error enfríe la expresión afectiva.`
        : `La exigencia afectiva no parece organizada alrededor de un gran filtro de Saturno; los temas vinculares se explican mejor por la mezcla entre necesidad emocional, deseo, estilo de valoración y experiencias concretas.`,
      `Para hablar de compatibilidad harían falta dos cartas completas. Aquí solo se describe el patrón relacional propio: cómo tiende a amar, qué necesita para sentirse segura y qué tipo de dinámica puede activar crecimiento o defensa.`,
    ],
  }
}

function driveSection(ctx: InterpretationContext): InterpretationSection {
  const mars = must(ctx, 'mars')
  const saturn = optional(ctx, 'saturn')
  const sunMars = aspectBetween(ctx, 'sun', 'mars')
  const marsSaturn = aspectBetween(ctx, 'mars', 'saturn')
  const marsAspects = aspectsFor(ctx, 'mars').slice(0, 4)

  return {
    id: 'motivation',
    title: 'Qué te motiva',
    summary: 'La motivación se entiende como la relación entre deseo, voluntad, energía disponible y capacidad para sostener una decisión cuando deja de ser nueva.',
    linkedBodies: ['mars', 'sun', 'saturn'],
    linkedAspects: compactAspects([sunMars, marsSaturn, ...marsAspects]).map((aspect) => aspect.id),
    body: [
      `La acción nace desde Marte: impulso, deseo, defensa y energía para ir hacia algo. En esta carta actúa con un estilo ${signTone[mars.sign]} y se concentra en asuntos de ${topic(mars)}. Por eso la motivación no aparece igual en cualquier terreno; se enciende con más claridad cuando esos temas están implicados.`,
      ctx.scarceElement === 'Fuego'
        ? `El Fuego es el elemento menos presente, de modo que la chispa puede necesitar motivo real antes de arrancar. La persona quizá no funcione bien empujándose por pura intensidad; responde mejor cuando entiende por qué vale la pena moverse.`
        : `La distribución elemental aporta combustible desde ${ctx.primaryElement.toLowerCase()}: la energía se organiza alrededor de la necesidad de ${elementTone[ctx.primaryElement]}. Esto da una forma reconocible de actuar, incluso cuando el impulso inmediato fluctúa.`,
      sunMars
        ? `La voluntad y la acción se despiertan mutuamente. Cuando algo toca la identidad, el cuerpo suele responder: aparece prisa, deseo de intervenir o necesidad de marcar posición. Bien usado, esto da coraje; mal encauzado, puede llevar a reaccionar antes de escuchar todo el contexto.`
        : `La voluntad y la acción no dependen de estar siempre alineadas. Esto permite elegir cuándo actuar y cuándo observar, aunque también puede crear momentos en los que la persona sabe quién quiere ser pero tarda en convertirlo en movimiento concreto.`,
      marsSaturn && saturn
        ? `Saturno introduce aprendizaje de ritmo. La energía no se mide solo por intensidad, sino por resistencia, método y consecuencias. En la vida diaria esto puede verse como avance lento pero firme; la frustración aparece cuando se exige resultado inmediato en una carta que pide entrenamiento.`
        : `No destaca una presión saturnina directa sobre Marte entre los contactos principales, así que el manejo de la energía depende más de claridad de deseo, contexto y distribución elemental que de una sensación natal constante de freno.`,
      aspectWeave(ctx, marsAspects, 'La iniciativa se modifica por otras necesidades internas'),
    ],
  }
}

function vocationSection(ctx: InterpretationContext): InterpretationSection {
  const mc = must(ctx, 'midheaven')
  const sun = must(ctx, 'sun')
  const saturn = optional(ctx, 'saturn')
  const jupiter = optional(ctx, 'jupiter')
  const tenthBodies = ctx.chart.positions.filter((position) => position.house === 10 && !isAngle(position.id))
  const mcAspects = aspectsFor(ctx, 'midheaven').slice(0, 4)

  return {
    id: 'vocation',
    title: 'Cómo trabajas y qué huella quieres dejar',
    summary: 'La vocación no se reduce a profesión: habla de responsabilidad, reconocimiento, dirección y coherencia entre vida interior y lugar público.',
    linkedBodies: ['midheaven', 'sun', 'saturn', 'jupiter'],
    linkedAspects: mcAspects.map((aspect) => aspect.id),
    body: [
      `El Medio Cielo muestra cómo una persona busca ocupar un lugar visible. En ${mc.sign}, la huella pública tiende a pedir una expresión ${signTone[mc.sign]}. Esto puede influir en la forma de liderar, asumir responsabilidad, elegir metas o decidir qué merece esfuerzo prolongado.`,
      `La identidad solar participa en esa dirección: el trabajo gana sentido cuando permite vivir asuntos de ${topic(sun)} con autenticidad. Si la profesión se separa demasiado de ese centro, puede haber rendimiento externo pero sensación de estar representando un papel.`,
      tenthBodies.length > 0
        ? `La Casa 10 está especialmente habitada por ${list(tenthBodies.map((position) => position.label))}. Eso hace que la realización pública no sea un adorno de la carta: varias partes de la personalidad buscan expresarse en logros, oficio, reputación o contribución visible.`
        : `La Casa 10 no acumula planetas principales, por lo que la vocación se construye más como trayectoria que como presión evidente. La persona puede descubrir su lugar a través de decisiones sucesivas, experiencias y maduración del propio criterio.`,
      saturn
        ? `Saturno señala dónde hace falta oficio real. En temas de ${topic(saturn)}, la carta pide paciencia, estructura y respeto por los tiempos. Esta cualidad puede convertir ambición en arquitectura: menos promesa inmediata, más obra sostenida.`
        : `La maduración profesional se entiende aquí desde el conjunto de la carta, sin una posición saturnina especialmente destacada en los datos disponibles.`,
      jupiter
        ? `Júpiter abre una vía de confianza en ${topic(jupiter)}. Cuando el trabajo se vuelve demasiado estrecho, esta parte busca amplitud, aprendizaje y sentido. Conviene escucharla sin confundir expansión con exceso de compromisos.`
        : `La expansión profesional no depende de un foco jupiteriano dominante; se apoya en cómo la persona integra visión, constancia y oportunidad.`,
      aspectWeave(ctx, mcAspects, 'La imagen pública recibe matices de otras partes de la carta'),
    ],
  }
}

function talentsSection(ctx: InterpretationContext): InterpretationSection {
  const harmonic = ctx.chart.aspects.filter((aspect) => aspect.tone === 'harmonic').slice(0, 5)
  const angular = ctx.angularBodies.filter((position) => !isAngle(position.id))
  const dominants = ctx.chart.balance.dominants.length ? ctx.chart.balance.dominants.join(', ') : ctx.primaryElement

  return {
    id: 'talents',
    title: 'Talentos naturales',
    summary: 'Los talentos aparecen donde la carta repite una misma cualidad por distintos caminos: elemento dominante, casas activadas, apoyos entre planetas y presencia visible.',
    linkedBodies: uniqueBodies(harmonic),
    linkedAspects: harmonic.map((aspect) => aspect.id),
    body: [
      `El talento de base no se define por una sola posición. Aquí se repite una inclinación hacia ${ctx.primaryElement.toLowerCase()}, con dominantes vinculadas a ${dominants}. En términos prácticos, esto describe un modo espontáneo de resolver situaciones: ${elementTone[ctx.primaryElement]}.`,
      harmonic.length > 0
        ? `Hay zonas de la carta que cooperan con facilidad: ${list(harmonic.map((aspect) => plainPair(ctx, aspect)))}. Cuando estas partes se activan juntas, la persona puede sentir que algo fluye sin tener que forzarlo tanto. El talento consiste en reconocer esos cauces y darles forma concreta.`
        : `No se observa una gran cantidad de contactos fluidos muy cerrados. Esto no reduce el potencial; sugiere que los talentos se vuelven más sólidos cuando se trabajan deliberadamente, con menos dependencia de la facilidad inicial.`,
      angular.length > 0
        ? `${list(angular.map((position) => position.label))} en casas angulares vuelve más perceptibles algunas cualidades. Otras personas pueden notar esa presencia antes de que la persona la nombre: iniciativa, intensidad, sensibilidad, criterio o magnetismo según el planeta implicado.`
        : `Al haber menos planetas personales en ángulos, algunos dones pueden empezar como recursos privados. Se vuelven visibles cuando hay confianza, oficio o un escenario adecuado.`,
      `El talento principal está en convertir el patrón dominante en una herramienta consciente. Si ${ctx.primaryElement.toLowerCase()} domina, la vida mejora cuando esa cualidad no actúa en automático, sino con dirección: no solo reaccionar desde ella, sino elegir cuándo usarla y cuándo compensarla con el elemento menos presente, ${ctx.scarceElement.toLowerCase()}.`,
    ],
  }
}

function conflictSection(ctx: InterpretationContext): InterpretationSection {
  const tense = ctx.chart.aspects.filter((aspect) => aspect.tone === 'tense').slice(0, 6)
  const saturnAspects = aspectsFor(ctx, 'saturn').slice(0, 3)
  const plutoAspects = aspectsFor(ctx, 'pluto').slice(0, 3)
  const sun = must(ctx, 'sun')
  const moon = must(ctx, 'moon')
  const venus = must(ctx, 'venus')
  const mars = must(ctx, 'mars')

  return {
    id: 'conflicts',
    title: 'Conflictos internos y patrones que se repiten',
    summary: 'Este capítulo mira las zonas donde la personalidad puede dividirse: querer una cosa, necesitar otra y actuar desde un tercer impulso.',
    linkedBodies: uniqueBodies([...tense, ...saturnAspects, ...plutoAspects]),
    linkedAspects: [...tense, ...saturnAspects, ...plutoAspects].map((aspect) => aspect.id),
    body: [
      `Los conflictos de una carta no son defectos; son lugares donde dos necesidades legítimas aún no han aprendido a turnarse. Aquí conviene observar la distancia entre una voluntad ${signTone[sun.sign]}, una emoción ${signTone[moon.sign]}, un modo de amar ${signTone[venus.sign]} y una acción ${signTone[mars.sign]}. Esa mezcla puede producir riqueza, pero también cambios de ritmo que el entorno no siempre entiende.`,
      tense.length > 0
        ? `Las fricciones más claras aparecen entre ${list(tense.map((aspect) => plainPair(ctx, aspect)))}. En la vida cotidiana esto puede manifestarse como decisiones que cuestan más de lo esperado, reacciones intensas ante ciertos temas o necesidad de negociar entre independencia, seguridad, deseo, deber y control.`
        : `No hay una acumulación grande de fricciones principales muy cerradas. Los patrones repetidos pueden venir más de la distribución por elementos, de casas activadas o de aprendizajes vitales que de choques internos muy evidentes.`,
      saturnAspects.length > 0
        ? `Saturno añade seriedad alrededor de ${list(saturnAspects.map((aspect) => plainPair(ctx, aspect)))}. Esto puede sentirse como prudencia, exigencia o miedo a fallar. Su mejor expresión no es endurecerse, sino convertir la autocrítica en método y la cautela en responsabilidad lúcida.`
        : `Saturno no parece concentrar el conflicto principal por contactos cerrados; por eso la sensación de deber puede variar más según contexto que operar como tema dominante constante.`,
      plutoAspects.length > 0
        ? `Plutón intensifica temas vinculados con ${list(plutoAspects.map((aspect) => plainPair(ctx, aspect)))}. Allí la persona puede vivir los procesos con mucha profundidad: no le basta una explicación superficial cuando siente que está en juego confianza, poder personal o pérdida.`
        : `Plutón no aparece como gran modificador de los planetas personales principales; los procesos de cambio pueden activarse más por experiencias de vida que por una presión natal continua.`,
      `Un patrón útil de vigilar es el exceso del elemento dominante. Cuando ${ctx.primaryElement.toLowerCase()} ocupa demasiado espacio, puede faltar la compensación de ${ctx.scarceElement.toLowerCase()}. Eso se nota en momentos de estrés: la persona vuelve a su idioma más conocido aunque la situación pida otro recurso.`,
    ],
  }
}

function growthSection(ctx: InterpretationContext): InterpretationSection {
  const north = optional(ctx, 'north-node')
  const south = optional(ctx, 'south-node')
  const chiron = optional(ctx, 'chiron')
  const lilith = optional(ctx, 'lilith')
  const nodeAspects = aspectsFor(ctx, 'north-node').slice(0, 3)

  return {
    id: 'growth',
    title: 'Qué necesitas aprender',
    summary: 'El crecimiento se presenta como integración progresiva: desarrollar recursos menos automáticos sin negar los que ya son naturales.',
    linkedBodies: ['north-node', 'south-node', 'chiron', 'lilith'],
    linkedAspects: nodeAspects.map((aspect) => aspect.id),
    body: [
      north && south
        ? `El eje nodal habla de una transición simbólica: de una zona conocida hacia una forma de desarrollo más consciente. El Nodo Sur señala hábitos familiares alrededor de ${topic(south)}; el Nodo Norte orienta el aprendizaje hacia ${topic(north)} con un estilo ${signTone[north.sign]}. No obliga a abandonar lo conocido, pero sí a no vivir siempre desde el recurso automático.`
        : `Sin eje nodal completo disponible, el aprendizaje se lee desde los contrastes entre elementos, modalidad dominante y contactos principales de la carta.`,
      nodeAspects.length > 0
        ? `Ese aprendizaje no ocurre en abstracto: toca partes concretas de la personalidad, especialmente ${list(nodeAspects.map((aspect) => plainPair(ctx, aspect)))}. Por eso crecer puede implicar cambiar una manera de decidir, amar, protegerse, trabajar o expresar deseo.`
        : `El Nodo Norte no aparece muy presionado por otros puntos principales, de modo que su dirección puede sentirse gradual: se aclara con experiencia, no necesariamente como urgencia temprana.`,
      chiron
        ? `Quirón describe una sensibilidad que puede doler precisamente porque vuelve a la persona más consciente de un tema. En ${chiron.sign} y en asuntos de ${topic(chiron)}, esa sensibilidad puede transformarse en comprensión hacia otros si antes se aprende a tratar la propia fragilidad sin desprecio.`
        : `Quirón no forma parte destacada de esta lectura; el desarrollo se entiende mejor desde el eje nodal y los patrones generales.`,
      lilith
        ? `Lilith o Luna Negra señala una zona instintiva, menos domesticada, vinculada aquí con ${topic(lilith)}. Puede mostrar dónde la persona necesita recuperar una voz propia sin convertir la autonomía en aislamiento defensivo.`
        : `Lilith no aparece como foco interpretativo principal en esta carta, por lo que la autonomía se lee desde Ascendente, Marte, Urano y distribución general.`,
      `El aprendizaje más importante consiste en no vivir siempre desde el mecanismo más fuerte. Si la carta domina por ${ctx.primaryElement.toLowerCase()} y modalidad ${ctx.primaryModality.toLowerCase()}, crecer implica sumar deliberadamente lo menos disponible: ${ctx.scarceElement.toLowerCase()} y ritmo ${ctx.scarceModality.toLowerCase()}.`,
    ],
  }
}

function integrationSection(ctx: InterpretationContext): InterpretationSection {
  const sun = must(ctx, 'sun')
  const moon = must(ctx, 'moon')
  const asc = must(ctx, 'ascendant')
  const mc = must(ctx, 'midheaven')
  const strongestAspect = strongest(ctx.chart.aspects)

  return {
    id: 'integration',
    title: 'Cómo integrar todas las partes',
    summary: 'La síntesis final reúne identidad, emoción, mente, vínculos, acción y propósito para que la carta funcione como espejo de vida cotidiana.',
    linkedBodies: ['sun', 'moon', 'ascendant', 'midheaven'],
    linkedAspects: strongestAspect ? [strongestAspect.id] : [],
    body: [
      `La carta describe a una persona que necesita coordinar cuatro ejes: una voluntad ${signTone[sun.sign]}, una sensibilidad ${signTone[moon.sign]}, una entrada al mundo ${signTone[asc.sign]} y una ambición visible ${signTone[mc.sign]}. Ninguna de estas partes debe ganar siempre. La integración aparece cuando cada una tiene un lugar y un momento.`,
      strongestAspect
        ? `El contacto más preciso, entre ${plainPair(ctx, strongestAspect)}, merece atención porque puede sentirse como una cuerda tensa dentro del conjunto. Si se vive en automático, exagera reacciones; si se trabaja con conciencia, se vuelve una fuente de lucidez y carácter.`
        : `Al no destacar un único contacto dominante, la integración depende más de reconocer patrones repetidos que de resolver una sola tensión central.`,
      `En la vida cotidiana, esta lectura invita a hacer preguntas simples: cuando ${ctx.chart.input.name} decide, ¿está respondiendo a deseo, miedo, costumbre, cuidado o propósito? Cuando se relaciona, ¿está pidiendo seguridad lunar, armonía venusina, libertad uraniana o confirmación de identidad? Cuando trabaja, ¿está construyendo una trayectoria propia o solo cumpliendo una expectativa?`,
      `La carta no sustituye la libertad personal. Ofrece un vocabulario para observarse con más precisión. Su valor está en reconocer patrones antes de repetirlos, nombrar necesidades antes de convertirlas en conflicto y elegir con más conciencia qué parte de la personalidad debe conducir cada situación.`,
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

function aspectWeave(ctx: InterpretationContext, aspects: Aspect[], lead: string) {
  if (aspects.length === 0) return `${lead}, aunque no hay contactos principales muy cerrados que cambien de forma decisiva esta zona.`
  const harmonic = aspects.filter((aspect) => aspect.tone === 'harmonic').slice(0, 2)
  const tense = aspects.filter((aspect) => aspect.tone === 'tense').slice(0, 2)
  const neutral = aspects.filter((aspect) => aspect.tone === 'neutral').slice(0, 1)
  const sentences = [`${lead}.`]
  if (harmonic.length) {
    sentences.push(`Hay cooperación natural con ${list(harmonic.map((aspect) => plainPair(ctx, aspect)))}, lo que puede abrir respuestas más fluidas cuando la persona no se fuerza a funcionar contra su propio ritmo.`)
  }
  if (tense.length) {
    sentences.push(`También aparecen puntos de tensión con ${list(tense.map((aspect) => plainPair(ctx, aspect)))}, de modo que esta área puede pedir pausas, negociación interna y decisiones más conscientes.`)
  }
  if (neutral.length) {
    sentences.push(`Los ajustes más sutiles implican ${list(neutral.map((aspect) => plainPair(ctx, aspect)))}, una mezcla que conviene observar en situaciones ambiguas o de transición.`)
  }
  return sentences.join(' ')
}

function pair(ctx: InterpretationContext, aspect: Aspect) {
  const from = must(ctx, aspect.from)
  const to = must(ctx, aspect.to)
  return `${from.label} en ${from.sign} y ${to.label} en ${to.sign}`
}

function plainPair(ctx: InterpretationContext, aspect: Aspect) {
  const from = must(ctx, aspect.from)
  const to = must(ctx, aspect.to)
  const fromMeaning = bodyMeaning[from.id] ?? from.label.toLowerCase()
  const toMeaning = bodyMeaning[to.id] ?? to.label.toLowerCase()
  return `${from.label} (${fromMeaning}) y ${to.label} (${toMeaning})`
}

function touches(aspect: Aspect, bodies: CelestialBodyId[]) {
  return bodies.includes(aspect.from) || bodies.includes(aspect.to)
}

function compactAspects(aspects: Array<Aspect | undefined>) {
  const seen = new Set<string>()
  return aspects.filter((aspect): aspect is Aspect => {
    if (!aspect || seen.has(aspect.id)) return false
    seen.add(aspect.id)
    return true
  })
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
