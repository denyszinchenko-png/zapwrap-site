/* Zap Wrap Naples — client-side i18n.
   English lives in the HTML (source of truth, what search engines index).
   ES / RU / UK / HE are applied on top via [data-i18n] innerHTML swaps;
   Hebrew flips the document to RTL. Choice persists in localStorage,
   first visit auto-detects the browser language. */
(function () {
  "use strict";

  var STORE = "zw-lang";
  var RTL = { he: true };

  var DICT = {
    /* ---------------- ESPAÑOL ---------------- */
    es: {
      "nav.work": "Trabajos", "nav.services": "Servicios", "nav.finishes": "Acabados", "nav.faq": "FAQ",
      "footer.privacy": "Política de Privacidad", "footer.terms": "Términos del Servicio",
      "nav.cta": "Reservar consulta", "nav.call": "Llamar al estudio",
      "hero.intro": "Estudio solo-vinilo &middot; 8 a&ntilde;os instalando &middot; 5.0 en Google",
      "hero.l1": "El estudio", "hero.l2": "de <em>wraps</em>", "hero.l3": "de Naples",
      "hero.sub": "Cambio de color completo, chrome delete, gr&aacute;ficos a medida. El vinilo es todo nuestro trabajo, no una l&iacute;nea del men&uacute;. No shortcuts.",
      "hero.book": "Reservar consulta <span aria-hidden=\"true\">&rarr;</span>",
      "hero.wa": "WhatsApp al estudio",
      "pitch": "<strong>Mira tu auto en un color nuevo.</strong> Elige el modelo m&aacute;s parecido y prueba los vinilos. En la consulta trazamos tu auto exacto con los cat&aacute;logos reales de 3M y Avery. <a href=\"https://wa.me/13527790041?text=Hi%21%20I%20want%20to%20see%20my%20car%20in%20a%20wrap%3A%20\" rel=\"noopener\">&iquest;No est&aacute; tu modelo? Env&iacute;alo al estudio</a>",
      "filmbar.car": "Elige tu auto", "filmbar.film": "Elige el vinilo",
      "filmbar.hint": "C&oacute;digos reales de 3M, Avery, Oracal, Hexis y KPMF",
      "films.neonnote": "El ne&oacute;n dura unos 6 meses al aire libre: te lo decimos antes de reservar, nunca despu&eacute;s.",
      "fc.shift": "Color-shift", "fc.irid": "Iridiscente", "fc.chrome": "Super chrome",
      "fc.metal": "Met&aacute;lico", "fc.gloss": "Brillante", "fc.satin": "Satinado",
      "fc.matte": "Mate", "fc.hgloss": "Alto brillo", "fc.pearl": "Perlado",
      "fc.carbon": "Carbono", "fc.neon": "Ne&oacute;n",
      "film.shift": "Flip Psychedelic", "film.coral": "Flip Electric Coral satinado",
      "film.deepspace": "Flip Deep Space", "film.aura": "Flip Golden Aura satinado",
      "film.sunset": "Sunset Shift brillante", "film.austral": "Austral Sea brillante",
      "film.purpleblue": "P&uacute;rpura azul brillante", "film.morpheus": "Morpheus Black Starlight",
      "film.chrpurple": "Super Chrome p&uacute;rpura", "film.chrpink": "Super Chrome rosa",
      "film.purple": "P&uacute;rpura met&aacute;lico satinado", "film.bluemet": "Azul met&aacute;lico brillante",
      "film.charcoal": "Grafito met&aacute;lico mate", "film.pink": "Hot Pink brillante",
      "film.rosso": "Hot Rod Red brillante", "film.envy": "Green Envy brillante",
      "film.satin": "Negro satinado", "film.vampire": "Vampire Red satinado",
      "film.velvetrose": "Velvet Rose satinado", "film.graphite": "Gris oscuro mate",
      "film.matteblack": "Negro mate", "film.matred": "Rojo mate",
      "film.nardo": "Gris Nardo alto brillo", "film.mantis": "Mantis Green alto brillo",
      "film.pearl": "Blanco perla brillante", "film.pearlsatin": "Blanco perla satinado",
      "film.carbon": "Fibra de carbono negra", "film.neongreen": "Verde ne&oacute;n satinado",
      "film.neonyellow": "Amarillo ne&oacute;n satinado",
      "req.group": "&iquest;No est&aacute;?", "req.opt": "Mi auto no est&aacute; - solicitarlo",
      "cta.like": "&iquest;Te gusta este color? M&iacute;ralo en tu auto:",
      "cta.link": "Escr&iacute;benos por WhatsApp",
      "rev.h": "Calificaci&oacute;n 5.0 en Google",
      "rev.lead": "Los conductores de Naples califican el trabajo, no los anuncios. Cada rese&ntilde;a es p&uacute;blica en Google: l&eacute;elas todas antes de llamar.",
      "rev.link": "Lee las rese&ntilde;as en Google",
      "try.build": "Mira este gris oscuro mate en tu auto <span aria-hidden=\"true\">&rarr;</span>",
      "ba.cap": "Arrastra la l&iacute;nea: de blanco f&aacute;brica a gris oscuro mate",
      "ba.before": "F&aacute;brica", "ba.after": "Con wrap",
      "exit.msg": "Ll&eacute;vate tu color: recibe los c&oacute;digos exactos de 3M y Avery por WhatsApp",
      "exit.link": "Escribe al estudio",
      "build.h": "&Uacute;ltimo wrap<span class=\"dot\">.</span>",
      "build.lead": "BMW X6 M Competition 2026: cambio de color completo, de blanco f&aacute;brica a gris oscuro mate. Cada esquina, curva y borde envuelto, con paneles desmontados donde el borde lo exig&iacute;a.",
      "build.credit": "Instalado por Zap Wrap para Studio Design USA &middot; Fotos: Angel Enrique Hernandez",
      "svc.h": "Wraps de auto en Naples<span class=\"dot\">.</span>",
      "svc.lead": "Una especializaci&oacute;n: wraps de vinilo para autos, al nivel de los ex&oacute;ticos. El cer&aacute;mico es un sellado que aplicamos sobre un wrap terminado, nunca un servicio aparte. Si no es vinilo, no est&aacute; en el men&uacute;.",
      "svc.full": "Cambio de color completo",
      "svc.full.d": "Satinado, brillante, met&aacute;lico, color-shift. La pintura de f&aacute;brica queda sellada debajo, intacta. 3 a 5 d&iacute;as en el taller.",
      "svc.chrome": "Chrome delete",
      "svc.chrome.d": "Molduras, emblemas, espejos y marcos de ventanas en negro satinado o brillante. La forma m&aacute;s r&aacute;pida de que un auto se vea terminado.",
      "svc.roof": "Techo, cap&oacute; y acentos",
      "svc.roof.d": "Techo en contraste, cap&oacute;, spoiler, espejos. Paneles peque&ntilde;os, bordes exactos.",
      "svc.graphics": "Gr&aacute;ficos y rotulaci&oacute;n",
      "svc.graphics.d": "Franjas, liveries, calcoman&iacute;as - cortadas y montadas en casa.",
      "svc.fleet": "Comercial y flotas",
      "svc.fleet.d": "Una van rotulada es una valla publicitaria que tu negocio ya posee. Imprimir, cortar, instalar y repetir en toda la flota.",
      "svc.ceramic": "Sellado cer&aacute;mico <span class=\"svc__tag\">extra</span>",
      "svc.ceramic.d": "Una capa cer&aacute;mica sobre el vinilo reci&eacute;n instalado: lavados m&aacute;s f&aacute;ciles, acabado m&aacute;s profundo. Solo sobre un wrap.",
      "svc.quote": "Cada proyecto se cotiza en persona: trae el auto o el c&oacute;digo de pintura y sal con un n&uacute;mero exacto. <a href=\"#book\">Reserva una consulta</a>",
      "why.h": "Por qu&eacute; el vinilo gana a repintar<span class=\"dot\">.</span>",
      "why.1.t": "Tu pintura queda de f&aacute;brica.",
      "why.1.d": "El vinilo sella la pintura original y se retira limpio. Totalmente reversible, el valor de reventa intacto.",
      "why.2.t": "5 a 7 a&ntilde;os de acabado.",
      "why.2.d": "Con el cuidado adecuado, un wrap profesional mantiene su color y brillo por a&ntilde;os.",
      "why.3.t": "M&aacute;s barato que un buen repintado.",
      "why.3.d": "Y a diferencia de la pintura, puedes cambiar de opini&oacute;n en tres a&ntilde;os.",
      "why.4.t": "8 a&ntilde;os sobre los paneles.",
      "why.4.d": "Estudio del propio due&ntilde;o. Quien cotiza tu auto es quien lo envuelve.",
      "fin.h": "Acabados<span class=\"dot\">.</span>",
      "fin.lead": "Trabajamos con los cat&aacute;logos completos de 3M, Avery Dennison, KPMF, Hexis y Oracal. Si existe en rollo, lo ponemos en tu auto.",
      "fin.gloss": "Brillante", "fin.satin": "Satinado", "fin.matte": "Mate",
      "fin.metal": "Met&aacute;lico", "fin.shift": "Color-shift", "fin.carbon": "Efecto carbono",
      "proc.h": "C&oacute;mo va un proyecto<span class=\"dot\">.</span>",
      "proc.1.t": "Consulta en el estudio",
      "proc.1.d": "Trae el auto o solo el c&oacute;digo de pintura. Revisamos la carrocer&iacute;a, hablamos de acabados y cotizamos directo.",
      "proc.2.t": "Vinilo y dise&ntilde;o",
      "proc.2.d": "Elige el rollo de los cat&aacute;logos y ve tu proyecto trazado en tu plantilla antes de cortar nada.",
      "proc.3.t": "Instalaci&oacute;n",
      "proc.3.d": "3 a 5 d&iacute;as en el taller. Desmontamos paneles donde el borde lo exige. Eso es lo de no shortcuts.",
      "proc.4.t": "Sellado y entrega",
      "proc.4.d": "Capa cer&aacute;mica opcional sobre el vinilo, gu&iacute;a de cuidado en mano y foto de revelado con luz de estudio.",
      "faq.h": "Preguntas sobre wraps, respuestas directas<span class=\"dot\">.</span>",
      "faq.1.q": "&iquest;El wrap da&ntilde;a mi pintura?",
      "faq.1.a": "Al contrario. El vinilo protege la pintura de f&aacute;brica del sol, la arena y las piedras, y un retiro profesional la deja como la encontramos. Por eso los autos con wrap se revenden bien.",
      "faq.2.q": "&iquest;Cu&aacute;nto dura un wrap?",
      "faq.2.a": "5 a 7 a&ntilde;os con buen cuidado bajo el sol de Florida. Con garaje y lavado a mano estar&aacute;s en el tope del rango.",
      "faq.3.q": "&iquest;Es realmente m&aacute;s barato que repintar?",
      "faq.3.a": "Un repintado de calidad en un auto premium cuesta m&aacute;s que un wrap completo, tarda m&aacute;s y es permanente. El vinilo te da el color ahora y la pintura de f&aacute;brica de vuelta cuando quieras.",
      "faq.4.q": "&iquest;Puedo envolver un auto en leasing?",
      "faq.4.a": "S&iacute;. El wrap se retira limpio antes de devolver el auto. Es el &uacute;nico cambio de color que un leasing permite.",
      "faq.5.q": "&iquest;C&oacute;mo lavo un auto con wrap?",
      "faq.5.a": "A mano o touchless, sin cera sobre mate o satinado, y evita la alta presi&oacute;n directa en bordes y uniones. Te entregamos la gu&iacute;a completa de cuidado al recoger.",
      "faq.6.q": "&iquest;Cu&aacute;nto cuesta un wrap?",
      "faq.6.a": "Cada auto es distinto: tama&ntilde;o y forma de la carrocer&iacute;a, la l&iacute;nea de vinilo que elijas, el estado de la pintura, molduras que hay que desmontar. Por eso cotizamos solo en persona: trae el auto o el c&oacute;digo de pintura y sales con un n&uacute;mero exacto que no cambia despu&eacute;s.",
      "faq.7.q": "&iquest;Qu&eacute; vinilos instalan?",
      "faq.7.a": "Trabajamos con los cat&aacute;logos completos de 3M, Avery Dennison, KPMF, Hexis y Oracal: l&iacute;neas respaldadas por el fabricante, nunca rollos sin marca. Eliges el acabado con muestras reales en la consulta, y cada proyecto se entrega con la gu&iacute;a de cuidado de ese vinilo exacto.",
      "faq.8.q": "&iquest;D&oacute;nde est&aacute; el estudio?",
      "faq.8.a": "Naples, Florida, con cita previa. Nos llegan autos desde Bonita Springs, Marco Island, Fort Myers y Cape Coral: un wrap bien hecho vale el viaje.",
      "faq.9.q": "&iquest;Trabajan ex&oacute;ticos y superautos?",
      "faq.9.a": "Los ex&oacute;ticos son la especialidad del estudio: por eso existe Zap Wrap Naples. Defensas bajas, paneles de carbono, sensores y aerodin&aacute;mica compleja cambian c&oacute;mo se debe forrar un auto, as&iacute; que los ex&oacute;ticos se hacen con paneles desmontados y el vinilo trazado sobre la carrocer&iacute;a exacta antes de cortar. Trae el auto a la consulta y mira el trazado primero.",
      "faq.10.q": "&iquest;Cu&aacute;nto tarda un wrap?",
      "faq.10.a": "Un cambio de color completo toma de 3 a 5 d&iacute;as en el taller. Los chrome delete y los techos o cofres toman menos. El cronograma exacto te lo damos junto con la cotizaci&oacute;n en la consulta.",
      "book.h": "Tr&aacute;enos el auto<span class=\"dot\">.</span>",
      "book.lead": "Las consultas son en el estudio y sin presi&oacute;n. Entra con un c&oacute;digo de pintura y sal sabiendo exactamente c&oacute;mo se ver&aacute; tu wrap. Env&iacute;a los datos y respondemos en un d&iacute;a h&aacute;bil.",
      "book.call": "Llamar", "book.msg": "Escribir al estudio", "book.msg2": "Escribir al estudio",
      "book.studio": "Estudio", "book.studio.v": "Naples, FL &middot; con cita",
      "book.hours": "Horario", "book.hours.v": "Dom-Jue 8am-8pm &middot; Vie 8am-5pm &middot; S&aacute;b cerrado",
      "book.serving": "Servimos",
      "f.name": "Nombre", "f.phone": "Tel&eacute;fono", "f.car": "El auto",
      "f.svc": "Qu&eacute; buscas", "f.notes": "Algo m&aacute;s",
      "ph.name": "Tu nombre", "ph.phone": "Tu n&uacute;mero", "ph.car": "A&ntilde;o, marca y modelo",
      "ph.notes": "Ideas de acabado, plazos, c&oacute;digo de pintura...",
      "f.choose": "Elige un servicio", "f.o1": "Cambio de color completo", "f.o2": "Chrome delete",
      "f.o3": "Wrap parcial / techo / cap&oacute;", "f.o4": "Gr&aacute;ficos / rotulaci&oacute;n",
      "f.o5": "Comercial / flota", "f.o6": "Sellado cer&aacute;mico extra", "f.o7": "A&uacute;n no s&eacute; - aconséjame",
      "f.submit": "Pedir mi consulta <span aria-hidden=\"true\">&rarr;</span>",
      "f.fine": "Sin spam. Tus datos solo llegan al estudio.",
      "book.next.1": "Tu solicitud se abre en WhatsApp ya escrita: rev&iacute;sala, toca enviar y llega al estudio. Respondemos en un d&iacute;a h&aacute;bil.",
      "f.alt": "&iquest;Sin WhatsApp? <a href=\"tel:+13527790041\">Llama al (352) 779-0041</a> o <a href=\"sms:+13527790041\">escribe al estudio</a> con los mismos datos.",
      "book.entity": "Zap Wrap Naples es un estudio de wraps de vinilo en Naples, Florida: el estudio de wraps ex&oacute;ticos de Naples. Instalamos cambios de color completos, chrome deletes, wraps parciales, gr&aacute;ficos a medida y wraps de flotas comerciales para conductores de Naples, Bonita Springs, Marco Island, Fort Myers y Cape Coral. Es un estudio de due&ntilde;o-instalador: quien cotiza tu auto tiene 8 a&ntilde;os de experiencia profesional y lo forra &eacute;l mismo. El vinilo es el &uacute;nico oficio; el cer&aacute;mico se ofrece solo como sellado final sobre un wrap nuevo. No shortcuts.",
      "meta.title": "Car Wraps en Naples FL | Cambio de Color y Chrome Delete | Zap Wrap",
      "meta.desc": "Estudio de car wraps en Naples FL: cambios de color completos, chrome deletes y wraps de flotas. Especialistas en vinilo para Naples, Bonita Springs y Marco Island. No shortcuts.",
      "book.next.2": "Consulta de 15 minutos: tu auto, muestras reales de vinilo, sin rodeos.",
      "book.next.3": "Sales con la cotizaci&oacute;n exacta y tu turno de instalaci&oacute;n.",
    },

    /* ---------------- РУССКИЙ ---------------- */
    ru: {
      "nav.work": "Работы", "nav.services": "Услуги", "nav.finishes": "Финиши", "nav.faq": "Вопросы",
      "footer.privacy": "Политика конфиденциальности", "footer.terms": "Условия использования",
      "nav.cta": "Записаться", "nav.call": "Позвонить в студию",
      "hero.intro": "Только винил &middot; 8 лет в оклейке &middot; 5.0 на Google",
      "hero.l1": "Экзотик-", "hero.l2": "<em>врап</em> студия", "hero.l3": "Нейплса",
      "hero.sub": "Полная смена цвета, chrome delete, кастомная графика. Винил - вся наша работа, а не строчка в меню. No shortcuts.",
      "hero.book": "Записаться на консульт <span aria-hidden=\"true\">&rarr;</span>",
      "hero.wa": "WhatsApp студии",
      "pitch": "<strong>Посмотри свою машину в новом цвете.</strong> Выбери ближайшую модель и полистай плёнки. На консультации отрисуем именно твою машину по реальным каталогам 3M и Avery. <a href=\"https://wa.me/13527790041?text=Hi%21%20I%20want%20to%20see%20my%20car%20in%20a%20wrap%3A%20\" rel=\"noopener\">Нет твоей модели? Отправь её в студию</a>",
      "filmbar.car": "Выбери машину", "filmbar.film": "Выбери плёнку",
      "filmbar.hint": "Реальные коды 3M, Avery, Oracal, Hexis и KPMF",
      "films.neonnote": "Неон живёт примерно 6 месяцев на улице: говорим об этом до записи, а не после.",
      "fc.shift": "Хамелеон", "fc.irid": "Иридесцент", "fc.chrome": "Супер-хром",
      "fc.metal": "Металлик", "fc.gloss": "Глянец", "fc.satin": "Сатин",
      "fc.matte": "Мат", "fc.hgloss": "Супер-глянец", "fc.pearl": "Перламутр",
      "fc.carbon": "Карбон", "fc.neon": "Неон",
      "film.shift": "Flip Psychedelic", "film.coral": "Сатин Flip Electric Coral",
      "film.deepspace": "Flip Deep Space", "film.aura": "Сатин Flip Golden Aura",
      "film.sunset": "Глянец Sunset Shift", "film.austral": "Глянец Austral Sea",
      "film.purpleblue": "Глянец фиолетово-синий", "film.morpheus": "Morpheus Black Starlight",
      "film.chrpurple": "Супер-хром фиолетовый", "film.chrpink": "Супер-хром розовый",
      "film.purple": "Сатин фиолетовый металлик", "film.bluemet": "Глянец синий металлик",
      "film.charcoal": "Мат графит металлик", "film.pink": "Глянец Hot Pink",
      "film.rosso": "Глянец Hot Rod Red", "film.envy": "Глянец Green Envy",
      "film.satin": "Сатиновый чёрный", "film.vampire": "Сатин Vampire Red",
      "film.velvetrose": "Сатин Velvet Rose", "film.graphite": "Тёмно-серый мат",
      "film.matteblack": "Чёрный мат", "film.matred": "Красный мат",
      "film.nardo": "Супер-глянец Nardo Gray", "film.mantis": "Супер-глянец Mantis Green",
      "film.pearl": "Глянец белый перламутр", "film.pearlsatin": "Сатин белый перламутр",
      "film.carbon": "Чёрный карбон", "film.neongreen": "Сатин неон зелёный",
      "film.neonyellow": "Сатин неон жёлтый",
      "req.group": "Нет в списке?", "req.opt": "Моей машины нет - запросить",
      "cta.like": "Нравится цвет? Посмотри его на своей машине:",
      "cta.link": "Напиши нам в WhatsApp",
      "rev.h": "Оценка 5.0 в Google",
      "rev.lead": "Водители Нейплса оценивают работу, а не рекламу. Каждый отзыв публичный, на Google: прочитай все перед звонком.",
      "rev.link": "Читать отзывы в Google",
      "try.build": "Посмотри этот тёмно-серый мат на своей машине <span aria-hidden=\"true\">&rarr;</span>",
      "ba.cap": "Потяни линию: заводской белый - тёмно-серый мат",
      "ba.before": "Завод", "ba.after": "В плёнке",
      "exit.msg": "Забери свой цвет: точные коды 3M и Avery в WhatsApp",
      "exit.link": "Написать студии",
      "build.h": "Свежая оклейка<span class=\"dot\">.</span>",
      "build.lead": "BMW X6 M Competition 2026: полная смена цвета, с заводского белого в тёмно-серый мат. Каждый угол, изгиб и кромка оклеены, панели сняты там, где этого требовала кромка.",
      "build.credit": "Установка: Zap Wrap для Studio Design USA &middot; Фото: Angel Enrique Hernandez",
      "svc.h": "Оклейка авто в Нейплсе<span class=\"dot\">.</span>",
      "svc.lead": "Одна специализация: виниловая оклейка авто на уровне экзотиков. Керамика - это финишное покрытие поверх готового врапа, никогда не отдельная услуга. Если это не винил, этого нет в меню.",
      "svc.full": "Полная смена цвета",
      "svc.full.d": "Сатин, глянец, металлик, хамелеон. Заводская краска запечатана под плёнкой и остаётся нетронутой. 3-5 дней в боксе.",
      "svc.chrome": "Chrome delete",
      "svc.chrome.d": "Молдинги, шильдики, зеркала, окантовка окон в сатиновый или глянцевый чёрный. Самый быстрый способ придать машине законченный вид.",
      "svc.roof": "Крыша, капот и акценты",
      "svc.roof.d": "Контрастная крыша, капот, спойлер, зеркала. Малые панели, точные кромки.",
      "svc.graphics": "Графика и леттеринг",
      "svc.graphics.d": "Полосы, ливреи, декали - режем и клеим сами, в студии.",
      "svc.fleet": "Коммерческий транспорт",
      "svc.fleet.d": "Оклеенный вэн - это билборд, который у твоего бизнеса уже есть. Печать, резка, установка - и так по всему автопарку.",
      "svc.ceramic": "Керамика <span class=\"svc__tag\">финиш</span>",
      "svc.ceramic.d": "Керамический слой поверх свежей плёнки: легче мойка, глубже финиш. Только поверх врапа.",
      "svc.quote": "Каждый проект считаем лично: приезжай на машине или с кодом краски - уедешь с точной цифрой. <a href=\"#book\">Записаться на консульт</a>",
      "why.h": "Почему плёнка лучше перекраса<span class=\"dot\">.</span>",
      "why.1.t": "Заводская краска остаётся заводской.",
      "why.1.d": "Плёнка запечатывает родное ЛКП и снимается чисто. Полностью обратимо, цена при перепродаже не страдает.",
      "why.2.t": "5-7 лет финиша.",
      "why.2.d": "При правильном уходе профессиональный врап держит цвет и блеск годами.",
      "why.3.t": "Дешевле качественного перекраса.",
      "why.3.d": "И в отличие от краски - через три года можно передумать.",
      "why.4.t": "8 лет на панелях.",
      "why.4.d": "Студия владельца. Тот, кто считает твою машину, сам её и оклеивает.",
      "fin.h": "Финиши<span class=\"dot\">.</span>",
      "fin.lead": "Работаем по полным каталогам 3M, Avery Dennison, KPMF, Hexis и Oracal. Если это существует в рулоне - мы положим это на твою машину.",
      "fin.gloss": "Глянец", "fin.satin": "Сатин", "fin.matte": "Мат",
      "fin.metal": "Металлик", "fin.shift": "Хамелеон", "fin.carbon": "Под карбон",
      "proc.h": "Как идёт проект<span class=\"dot\">.</span>",
      "proc.1.t": "Консультация в студии",
      "proc.1.d": "Приезжай на машине или просто с кодом краски. Смотрим кузов, обсуждаем финиши, называем честную цену.",
      "proc.2.t": "Плёнка и дизайн",
      "proc.2.d": "Выбираешь рулон из каталогов и видишь проект на шаблоне своей машины до того, как что-то отрезано.",
      "proc.3.t": "Установка",
      "proc.3.d": "3-5 дней в боксе. Панели снимаем там, где этого требует кромка. Это и есть no shortcuts.",
      "proc.4.t": "Финиш и выдача",
      "proc.4.d": "Опциональная керамика поверх плёнки, гайд по уходу на руки, кадр ревила в студийном свете.",
      "faq.h": "Вопросы об оклейке, прямые ответы<span class=\"dot\">.</span>",
      "faq.1.q": "Плёнка испортит краску?",
      "faq.1.a": "Наоборот. Плёнка защищает заводское ЛКП от солнца, песка и сколов, а профессиональный демонтаж оставляет краску такой, какой мы её нашли. Поэтому оклеенные машины хорошо продаются.",
      "faq.2.q": "Сколько живёт врап?",
      "faq.2.a": "5-7 лет при правильном уходе под солнцем Флориды. Гараж и ручная мойка - и ты у верхней границы.",
      "faq.3.q": "Это правда дешевле перекраса?",
      "faq.3.a": "Качественный перекрас премиальной машины стоит дороже полного врапа, занимает больше времени и необратим. Плёнка даёт цвет сейчас - и заводскую краску обратно, когда захочешь.",
      "faq.4.q": "Можно оклеить лизинговую машину?",
      "faq.4.a": "Да. Плёнка снимается чисто до возврата машины. Это единственная смена цвета, которую разрешает лизинг.",
      "faq.5.q": "Как мыть оклеенную машину?",
      "faq.5.a": "Руками или бесконтактно, без воска по мату и сатину, без прямой струи высокого давления по кромкам. Полный гайд по уходу выдаём при получении.",
      "faq.6.q": "Сколько стоит оклейка?",
      "faq.6.a": "Каждая машина своя: размер и форма кузова, выбранная линейка плёнки, состояние лака, детали, которые придётся снимать. Поэтому считаем только вживую: приезжай с машиной или кодом краски - уедешь с точной цифрой, которая потом не поплывёт.",
      "faq.7.q": "Какие плёнки ставите?",
      "faq.7.a": "Работаем с полными каталогами 3M, Avery Dennison, KPMF, Hexis и Oracal: линейки с заводской поддержкой, никаких no-name рулонов. Финиш выбираешь по живым образцам на консультации, а с машиной отдаём гайд по уходу именно за этой плёнкой.",
      "faq.8.q": "Где находится студия?",
      "faq.8.a": "Naples, Флорида, по записи. К нам едут из Bonita Springs, Marco Island, Fort Myers и Cape Coral: правильная оклейка стоит дороги.",
      "faq.9.q": "Оклеиваете экзотики и суперкары?",
      "faq.9.a": "Экзотики - специализация студии: ради них Zap Wrap Naples и существует. Низкие бамперы, карбоновые панели, датчики и сложная аэродинамика меняют сам подход к оклейке, поэтому экзотики клеятся со снятием панелей, а плёнка выкраивается по конкретному кузову до первого реза. Приезжай на консультацию и посмотри раскрой первым.",
      "faq.10.q": "Сколько занимает оклейка?",
      "faq.10.a": "Полная смена цвета - 3-5 дней в боксе. Chrome delete и крыша или капот - быстрее. Точные сроки получишь вместе со сметой на консультации в студии.",
      "book.h": "Привози машину<span class=\"dot\">.</span>",
      "book.lead": "Консультации - в студии и без давления. Заходишь с кодом краски - выходишь, точно зная, как будет выглядеть твой врап. Отправь данные, ответим в течение рабочего дня.",
      "book.call": "Телефон", "book.msg": "Написать студии", "book.msg2": "Написать студии",
      "book.studio": "Студия", "book.studio.v": "Нейплс, Флорида &middot; по записи",
      "book.hours": "Часы", "book.hours.v": "Вс-Чт 8:00-20:00 &middot; Пт 8:00-17:00 &middot; Сб выходной",
      "book.serving": "Работаем",
      "f.name": "Имя", "f.phone": "Телефон", "f.car": "Машина",
      "f.svc": "Что интересует", "f.notes": "Что-то ещё",
      "ph.name": "Твоё имя", "ph.phone": "Твой номер", "ph.car": "Год, марка и модель",
      "ph.notes": "Идеи финиша, сроки, код краски...",
      "f.choose": "Выбери услугу", "f.o1": "Полная смена цвета", "f.o2": "Chrome delete",
      "f.o3": "Частичная оклейка / крыша / капот", "f.o4": "Графика / леттеринг",
      "f.o5": "Коммерческий / автопарк", "f.o6": "Керамика (финиш)", "f.o7": "Пока не знаю - посоветуйте",
      "f.submit": "Запросить консульт <span aria-hidden=\"true\">&rarr;</span>",
      "f.fine": "Без спама. Твои данные попадают только в студию.",
      "book.next.1": "Заявка открывается в WhatsApp уже заполненной: проверь, нажми отправить, и она в студии. Отвечаем в течение рабочего дня.",
      "f.alt": "Нет WhatsApp? <a href=\"tel:+13527790041\">Позвони (352) 779-0041</a> или <a href=\"sms:+13527790041\">напиши SMS</a> с теми же данными.",
      "book.entity": "Zap Wrap Naples - студия виниловой оклейки в Нейплсе, Флорида: студия экзотик-врапа Нейплса. Делаем полную смену цвета, chrome delete, частичную оклейку, кастомную графику и оклейку коммерческих автопарков для водителей Нейплса, Bonita Springs, Marco Island, Fort Myers и Cape Coral. Студия работает от владельца: тот, кто считает смету, имеет 8 лет профессионального опыта и клеит сам. Винил - единственное ремесло; керамика предлагается только как финишное покрытие поверх новой оклейки. No shortcuts.",
      "meta.title": "Оклейка авто в Нейплсе, Флорида | Смена цвета и Chrome Delete | Zap Wrap",
      "meta.desc": "Студия виниловой оклейки в Нейплсе, Флорида: полная смена цвета, chrome delete, оклейка автопарков. Специалисты по винилу: Нейплс, Bonita Springs, Marco Island. No shortcuts.",
      "book.next.2": "15 минут консультации: твоя машина, живые образцы плёнки, разговор по делу.",
      "book.next.3": "Уезжаешь с точной ценой и слотом на оклейку.",
    },

    /* ---------------- УКРАЇНСЬКА ---------------- */
    uk: {
      "nav.work": "Роботи", "nav.services": "Послуги", "nav.finishes": "Фініші", "nav.faq": "Питання",
      "footer.privacy": "Політика конфіденційності", "footer.terms": "Умови використання",
      "nav.cta": "Записатися", "nav.call": "Зателефонувати",
      "hero.intro": "Тільки вініл &middot; 8 років в обклейці &middot; 5.0 на Google",
      "hero.l1": "Екзотик-", "hero.l2": "<em>врап</em> студія", "hero.l3": "Нейплса",
      "hero.sub": "Повна зміна кольору, chrome delete, кастомна графіка. Вініл - вся наша робота, а не рядок у меню. No shortcuts.",
      "hero.book": "Записатися на консульт <span aria-hidden=\"true\">&rarr;</span>",
      "hero.wa": "WhatsApp студії",
      "pitch": "<strong>Подивись свою автівку в новому кольорі.</strong> Обери найближчу модель і погортай плівки. На консультації відмалюємо саме твою автівку за реальними каталогами 3M та Avery. <a href=\"https://wa.me/13527790041?text=Hi%21%20I%20want%20to%20see%20my%20car%20in%20a%20wrap%3A%20\" rel=\"noopener\">Немає твоєї моделі? Надішли її в студію</a>",
      "filmbar.car": "Обери автівку", "filmbar.film": "Обери плівку",
      "filmbar.hint": "Справжні коди 3M, Avery, Oracal, Hexis та KPMF",
      "films.neonnote": "Неон живе близько 6 місяців на вулиці: кажемо про це до запису, а не після.",
      "fc.shift": "Хамелеон", "fc.irid": "Іридесцент", "fc.chrome": "Супер-хром",
      "fc.metal": "Металік", "fc.gloss": "Глянець", "fc.satin": "Сатин",
      "fc.matte": "Мат", "fc.hgloss": "Супер-глянець", "fc.pearl": "Перламутр",
      "fc.carbon": "Карбон", "fc.neon": "Неон",
      "film.shift": "Flip Psychedelic", "film.coral": "Сатин Flip Electric Coral",
      "film.deepspace": "Flip Deep Space", "film.aura": "Сатин Flip Golden Aura",
      "film.sunset": "Глянець Sunset Shift", "film.austral": "Глянець Austral Sea",
      "film.purpleblue": "Глянець фіолетово-синій", "film.morpheus": "Morpheus Black Starlight",
      "film.chrpurple": "Супер-хром фіолетовий", "film.chrpink": "Супер-хром рожевий",
      "film.purple": "Сатин фіолетовий металік", "film.bluemet": "Глянець синій металік",
      "film.charcoal": "Мат графіт металік", "film.pink": "Глянець Hot Pink",
      "film.rosso": "Глянець Hot Rod Red", "film.envy": "Глянець Green Envy",
      "film.satin": "Сатиновий чорний", "film.vampire": "Сатин Vampire Red",
      "film.velvetrose": "Сатин Velvet Rose", "film.graphite": "Темно-сірий мат",
      "film.matteblack": "Чорний мат", "film.matred": "Червоний мат",
      "film.nardo": "Супер-глянець Nardo Gray", "film.mantis": "Супер-глянець Mantis Green",
      "film.pearl": "Глянець білий перламутр", "film.pearlsatin": "Сатин білий перламутр",
      "film.carbon": "Чорний карбон", "film.neongreen": "Сатин неон зелений",
      "film.neonyellow": "Сатин неон жовтий",
      "req.group": "Немає в списку?", "req.opt": "Моєї автівки немає - запросити",
      "cta.like": "Подобається колір? Поглянь на своїй автівці:",
      "cta.link": "Напиши нам у WhatsApp",
      "rev.h": "Оцінка 5.0 у Google",
      "rev.lead": "Водії Нейплса оцінюють роботу, а не рекламу. Кожен відгук публічний, на Google: прочитай усі перед дзвінком.",
      "rev.link": "Читати відгуки в Google",
      "try.build": "Поглянь цей темно-сірий мат на своїй автівці <span aria-hidden=\"true\">&rarr;</span>",
      "ba.cap": "Потягни лінію: заводський білий - темно-сірий мат",
      "ba.before": "Завод", "ba.after": "У плівці",
      "exit.msg": "Забери свій колір: точні коди 3M і Avery у WhatsApp",
      "exit.link": "Написати студії",
      "build.h": "Свіжа обклейка<span class=\"dot\">.</span>",
      "build.lead": "BMW X6 M Competition 2026: повна зміна кольору, із заводського білого в темно-сірий мат. Кожен кут, вигин і кромка обклеєні, панелі зняті там, де цього вимагала кромка.",
      "build.credit": "Встановлення: Zap Wrap для Studio Design USA &middot; Фото: Angel Enrique Hernandez",
      "svc.h": "Обклейка авто в Нейплсі<span class=\"dot\">.</span>",
      "svc.lead": "Одна спеціалізація: вінілова обклейка авто на рівні екзотиків. Кераміка - це фінішне покриття поверх готового врапу, ніколи не окрема послуга. Якщо це не вініл, цього немає в меню.",
      "svc.full": "Повна зміна кольору",
      "svc.full.d": "Сатин, глянець, металік, хамелеон. Заводська фарба запечатана під плівкою і лишається неторканою. 3-5 днів у боксі.",
      "svc.chrome": "Chrome delete",
      "svc.chrome.d": "Молдинги, шильдики, дзеркала, окантовка вікон у сатиновий чи глянцевий чорний. Найшвидший спосіб надати автівці завершеного вигляду.",
      "svc.roof": "Дах, капот і акценти",
      "svc.roof.d": "Контрастний дах, капот, спойлер, дзеркала. Малі панелі, точні кромки.",
      "svc.graphics": "Графіка та леттеринг",
      "svc.graphics.d": "Смуги, лівреї, декалі - ріжемо і клеїмо самі, в студії.",
      "svc.fleet": "Комерційний транспорт",
      "svc.fleet.d": "Обклеєний вен - це білборд, який у твого бізнесу вже є. Друк, різка, встановлення - і так по всьому автопарку.",
      "svc.ceramic": "Кераміка <span class=\"svc__tag\">фініш</span>",
      "svc.ceramic.d": "Керамічний шар поверх свіжої плівки: легше мийка, глибший фініш. Тільки поверх врапу.",
      "svc.quote": "Кожен проєкт рахуємо особисто: приїжджай автівкою або з кодом фарби - поїдеш із точною цифрою. <a href=\"#book\">Записатися на консульт</a>",
      "why.h": "Чому плівка краща за перефарбування<span class=\"dot\">.</span>",
      "why.1.t": "Заводська фарба лишається заводською.",
      "why.1.d": "Плівка запечатує рідне ЛФП і знімається чисто. Повністю оборотно, ціна при перепродажу не страждає.",
      "why.2.t": "5-7 років фінішу.",
      "why.2.d": "За правильного догляду професійний врап тримає колір і блиск роками.",
      "why.3.t": "Дешевше за якісне перефарбування.",
      "why.3.d": "І на відміну від фарби - за три роки можна передумати.",
      "why.4.t": "8 років на панелях.",
      "why.4.d": "Студія власника. Той, хто рахує твою автівку, сам її і обклеює.",
      "fin.h": "Фініші<span class=\"dot\">.</span>",
      "fin.lead": "Працюємо за повними каталогами 3M, Avery Dennison, KPMF, Hexis та Oracal. Якщо це існує в рулоні - ми покладемо це на твою автівку.",
      "fin.gloss": "Глянець", "fin.satin": "Сатин", "fin.matte": "Мат",
      "fin.metal": "Металік", "fin.shift": "Хамелеон", "fin.carbon": "Під карбон",
      "proc.h": "Як іде проєкт<span class=\"dot\">.</span>",
      "proc.1.t": "Консультація в студії",
      "proc.1.d": "Приїжджай автівкою або просто з кодом фарби. Дивимось кузов, обговорюємо фініші, називаємо чесну ціну.",
      "proc.2.t": "Плівка і дизайн",
      "proc.2.d": "Обираєш рулон із каталогів і бачиш проєкт на шаблоні своєї автівки до того, як щось відрізано.",
      "proc.3.t": "Встановлення",
      "proc.3.d": "3-5 днів у боксі. Панелі знімаємо там, де цього вимагає кромка. Це і є no shortcuts.",
      "proc.4.t": "Фініш і видача",
      "proc.4.d": "Опціональна кераміка поверх плівки, гайд із догляду на руки, кадр ревілу в студійному світлі.",
      "faq.h": "Питання про обклейку, прямі відповіді<span class=\"dot\">.</span>",
      "faq.1.q": "Плівка зіпсує фарбу?",
      "faq.1.a": "Навпаки. Плівка захищає заводське ЛФП від сонця, піску та сколів, а професійний демонтаж лишає фарбу такою, якою ми її знайшли. Тому обклеєні автівки добре продаються.",
      "faq.2.q": "Скільки живе врап?",
      "faq.2.a": "5-7 років за правильного догляду під сонцем Флориди. Гараж і ручна мийка - і ти біля верхньої межі.",
      "faq.3.q": "Це справді дешевше за перефарбування?",
      "faq.3.a": "Якісне перефарбування преміальної автівки коштує дорожче за повний врап, займає більше часу і незворотне. Плівка дає колір зараз - і заводську фарбу назад, коли захочеш.",
      "faq.4.q": "Чи можна обклеїти лізингову автівку?",
      "faq.4.a": "Так. Плівка знімається чисто до повернення автівки. Це єдина зміна кольору, яку дозволяє лізинг.",
      "faq.5.q": "Як мити обклеєну автівку?",
      "faq.5.a": "Руками або безконтактно, без воску по мату й сатину, без прямого струменя високого тиску по кромках. Повний гайд із догляду видаємо при отриманні.",
      "faq.6.q": "Скільки коштує обклейка?",
      "faq.6.a": "Кожна автівка своя: розмір і форма кузова, обрана лінійка плівки, стан лаку, деталі, які доведеться знімати. Тому рахуємо лише наживо: приїжджай з автівкою або кодом фарби - поїдеш з точною цифрою, яка потім не попливе.",
      "faq.7.q": "Які плівки ставите?",
      "faq.7.a": "Працюємо з повними каталогами 3M, Avery Dennison, KPMF, Hexis і Oracal: лінійки з заводською підтримкою, жодних no-name рулонів. Фініш обираєш за живими зразками на консультації, а з автівкою віддаємо гайд з догляду саме за цією плівкою.",
      "faq.8.q": "Де студія?",
      "faq.8.a": "Naples, Флорида, за записом. До нас їдуть з Bonita Springs, Marco Island, Fort Myers і Cape Coral: правильна обклейка варта дороги.",
      "faq.9.q": "Обклеюєте екзотики та суперкари?",
      "faq.9.a": "Екзотики - спеціалізація студії: заради них Zap Wrap Naples і існує. Низькі бампери, карбонові панелі, датчики та складна аеродинаміка змінюють сам підхід до обклейки, тому екзотики клеяться зі зняттям панелей, а плівка розкроюється під конкретний кузов до першого різу. Приїжджай на консультацію і подивись розкрій першим.",
      "faq.10.q": "Скільки триває обклейка?",
      "faq.10.a": "Повна зміна кольору - 3-5 днів у боксі. Chrome delete і дах чи капот - швидше. Точні терміни отримаєш разом із кошторисом на консультації в студії.",
      "book.h": "Привозь автівку<span class=\"dot\">.</span>",
      "book.lead": "Консультації - в студії та без тиску. Заходиш із кодом фарби - виходиш, точно знаючи, як виглядатиме твій врап. Надішли дані, відповімо протягом робочого дня.",
      "book.call": "Телефон", "book.msg": "Написати студії", "book.msg2": "Написати студії",
      "book.studio": "Студія", "book.studio.v": "Нейплс, Флорида &middot; за записом",
      "book.hours": "Години", "book.hours.v": "Нд-Чт 8:00-20:00 &middot; Пт 8:00-17:00 &middot; Сб вихідний",
      "book.serving": "Працюємо",
      "f.name": "Ім'я", "f.phone": "Телефон", "f.car": "Автівка",
      "f.svc": "Що цікавить", "f.notes": "Щось іще",
      "ph.name": "Твоє ім'я", "ph.phone": "Твій номер", "ph.car": "Рік, марка і модель",
      "ph.notes": "Ідеї фінішу, терміни, код фарби...",
      "f.choose": "Обери послугу", "f.o1": "Повна зміна кольору", "f.o2": "Chrome delete",
      "f.o3": "Часткова оклейка / дах / капот", "f.o4": "Графіка / леттеринг",
      "f.o5": "Комерційний / автопарк", "f.o6": "Кераміка (фініш)", "f.o7": "Ще не знаю - порадьте",
      "f.submit": "Запросити консульт <span aria-hidden=\"true\">&rarr;</span>",
      "f.fine": "Без спаму. Твої дані потрапляють лише в студію.",
      "book.next.1": "Заявка відкривається у WhatsApp уже заповненою: перевір, натисни надіслати, і вона в студії. Відповідаємо протягом робочого дня.",
      "f.alt": "Немає WhatsApp? <a href=\"tel:+13527790041\">Подзвони (352) 779-0041</a> або <a href=\"sms:+13527790041\">напиши SMS</a> з тими ж даними.",
      "book.entity": "Zap Wrap Naples - студія вінілової обклейки в Нейплсі, Флорида: студія екзотик-врапу Нейплса. Робимо повну зміну кольору, chrome delete, часткову обклейку, кастомну графіку та обклейку комерційних автопарків для водіїв Нейплса, Bonita Springs, Marco Island, Fort Myers і Cape Coral. Студія працює від власника: той, хто рахує кошторис, має 8 років професійного досвіду і клеїть сам. Вініл - єдине ремесло; кераміка пропонується лише як фінішне покриття поверх нової обклейки. No shortcuts.",
      "meta.title": "Обклейка авто в Нейплсі, Флорида | Зміна кольору та Chrome Delete | Zap Wrap",
      "meta.desc": "Студія вінілової обклейки в Нейплсі, Флорида: повна зміна кольору, chrome delete, обклейка автопарків. Фахівці з вінілу: Нейплс, Bonita Springs, Marco Island. No shortcuts.",
      "book.next.2": "15 хвилин консультації: твоя автівка, живі зразки плівки, розмова по суті.",
      "book.next.3": "Їдеш з точною ціною та слотом на обклейку.",
    },

    /* ---------------- עברית ---------------- */
    he: {
      "nav.work": "עבודות", "nav.services": "שירותים", "nav.finishes": "גימורים", "nav.faq": "שאלות",
      "footer.privacy": "מדיניות פרטיות", "footer.terms": "תנאי שימוש",
      "nav.cta": "לקבוע ייעוץ", "nav.call": "להתקשר לסטודיו",
      "hero.intro": "סטודיו ויניל בלבד &middot; 8 שנות ניסיון &middot; 5.0 בגוגל",
      "hero.l1": "סטודיו", "hero.l2": "ה<em>ראפ</em> האקזוטי", "hero.l3": "של נייפלס",
      "hero.sub": "החלפת צבע מלאה, chrome delete, גרפיקה בהתאמה אישית. ויניל הוא כל העבודה שלנו, לא שורה בתפריט. No shortcuts.",
      "hero.book": "לקבוע ייעוץ <span aria-hidden=\"true\">&larr;</span>",
      "hero.wa": "וואטסאפ לסטודיו",
      "pitch": "<strong>תראו את הרכב שלכם בצבע חדש.</strong> בחרו את הדגם הקרוב ביותר ועברו בין הציפויים. בייעוץ נשרטט את הרכב המדויק שלכם לפי הקטלוגים האמיתיים של 3M ו-Avery. <a href=\"https://wa.me/13527790041?text=Hi%21%20I%20want%20to%20see%20my%20car%20in%20a%20wrap%3A%20\" rel=\"noopener\">הדגם שלכם לא כאן? שלחו אותו לסטודיו</a>",
      "filmbar.car": "בחרו רכב", "filmbar.film": "בחרו ציפוי",
      "filmbar.hint": "קודים אמיתיים של 3M, Avery, Oracal, Hexis ו-KPMF",
      "films.neonnote": "ניאון מחזיק כ-6 חודשים בחוץ: אומרים לכם לפני ההזמנה, לא אחריה.",
      "fc.shift": "קולור-שיפט", "fc.irid": "אירידסנט", "fc.chrome": "סופר כרום",
      "fc.metal": "מטאלי", "fc.gloss": "מבריק", "fc.satin": "סאטן",
      "fc.matte": "מט", "fc.hgloss": "ברק גבוה", "fc.pearl": "פנינה",
      "fc.carbon": "קרבון", "fc.neon": "ניאון",
      "film.shift": "Flip Psychedelic", "film.coral": "Flip Electric Coral סאטן",
      "film.deepspace": "Flip Deep Space", "film.aura": "Flip Golden Aura סאטן",
      "film.sunset": "Sunset Shift מבריק", "film.austral": "Austral Sea מבריק",
      "film.purpleblue": "סגול-כחול מבריק", "film.morpheus": "Morpheus Black Starlight",
      "film.chrpurple": "סופר כרום סגול", "film.chrpink": "סופר כרום ורוד",
      "film.purple": "סגול מטאלי סאטן", "film.bluemet": "כחול מטאלי מבריק",
      "film.charcoal": "פחם מטאלי מט", "film.pink": "Hot Pink מבריק",
      "film.rosso": "Hot Rod Red מבריק", "film.envy": "Green Envy מבריק",
      "film.satin": "שחור סאטן", "film.vampire": "Vampire Red סאטן",
      "film.velvetrose": "Velvet Rose סאטן", "film.graphite": "אפור כהה מט",
      "film.matteblack": "שחור מט", "film.matred": "אדום מט",
      "film.nardo": "אפור נארדו ברק גבוה", "film.mantis": "Mantis Green ברק גבוה",
      "film.pearl": "לבן פנינה מבריק", "film.pearlsatin": "לבן פנינה סאטן",
      "film.carbon": "סיבי פחמן שחורים", "film.neongreen": "ירוק ניאון סאטן",
      "film.neonyellow": "צהוב ניאון סאטן",
      "req.group": "לא ברשימה?", "req.opt": "הרכב שלי לא כאן - לבקש אותו",
      "cta.like": "אוהבים את הצבע? תראו אותו על הרכב שלכם:",
      "cta.link": "כתבו לנו בוואטסאפ",
      "rev.h": "דירוג 5.0 בגוגל",
      "rev.lead": "נהגים בנייפלס מדרגים את העבודה, לא את הפרסומות. כל ביקורת ציבורית בגוגל: קראו את כולן לפני שמתקשרים.",
      "rev.link": "לקריאת הביקורות בגוגל",
      "try.build": "תראו את האפור הכהה המט הזה על הרכב שלכם <span aria-hidden=\"true\">&larr;</span>",
      "ba.cap": "גררו את הקו: מלבן מפעל לאפור כהה מט",
      "ba.before": "מפעל", "ba.after": "עטוף",
      "exit.msg": "קחו את הצבע איתכם: קבלו את הקודים המדויקים של 3M ו-Avery בוואטסאפ",
      "exit.link": "כתבו לסטודיו",
      "build.h": "ראפ אחרון<span class=\"dot\">.</span>",
      "build.lead": "BMW X6 M Competition 2026: החלפת צבע מלאה, מלבן מקורי לאפור כהה מט. כל פינה, קימור וקצה עטופים, פאנלים פורקו היכן שהקצה דרש זאת.",
      "build.credit": "התקנה: Zap Wrap עבור Studio Design USA &middot; צילום: Angel Enrique Hernandez",
      "svc.h": "ציפוי רכב בנייפלס<span class=\"dot\">.</span>",
      "svc.lead": "התמחות אחת: ציפוי ויניל לרכב, ברמה של רכבי יוקרה. קרמיקה היא ציפוי גימור מעל ראפ מוכן, לעולם לא שירות נפרד. אם זה לא ויניל, זה לא בתפריט.",
      "svc.full": "החלפת צבע מלאה",
      "svc.full.d": "סאטן, מבריק, מטאלי, קולור-שיפט. צבע המפעל נאטם מתחת ונשאר ללא פגע. 3-5 ימים במוסך.",
      "svc.chrome": "Chrome delete",
      "svc.chrome.d": "פסי קישוט, סמלים, מראות ומסגרות חלונות בשחור סאטן או מבריק. הדרך המהירה ביותר לגרום לרכב להיראות גמור.",
      "svc.roof": "גג, מכסה מנוע ואקצנטים",
      "svc.roof.d": "גג בצבע מנוגד, מכסה מנוע, ספוילר, מראות. פאנלים קטנים, קצוות מדויקים.",
      "svc.graphics": "גרפיקה וכיתוב",
      "svc.graphics.d": "פסים, ליבריות, מדבקות - חותכים ומדביקים אצלנו בסטודיו.",
      "svc.fleet": "רכב מסחרי וציי רכב",
      "svc.fleet.d": "ואן עטוף הוא שלט חוצות שכבר יש לעסק שלכם. הדפסה, חיתוך, התקנה - וכך לכל הצי.",
      "svc.ceramic": "איטום קרמי <span class=\"svc__tag\">תוספת</span>",
      "svc.ceramic.d": "שכבה קרמית מעל הציפוי הטרי: שטיפות קלות יותר, גימור עמוק יותר. רק מעל ראפ.",
      "svc.quote": "כל פרויקט מתומחר אישית: תביאו את הרכב או את קוד הצבע - ותצאו עם מספר מדויק. <a href=\"#book\">לקבוע ייעוץ</a>",
      "why.h": "למה ציפוי מנצח צביעה מחדש<span class=\"dot\">.</span>",
      "why.1.t": "צבע המפעל נשאר מקורי.",
      "why.1.d": "הציפוי אוטם את הצבע המקורי ומתקלף נקי. הפיך לחלוטין, ערך המכירה נשמר.",
      "why.2.t": "5 עד 7 שנים של גימור.",
      "why.2.d": "עם טיפול נכון, ראפ מקצועי שומר על הצבע והברק שנים.",
      "why.3.t": "זול יותר מצביעה איכותית.",
      "why.3.d": "ובניגוד לצבע - אפשר להתחרט בעוד שלוש שנים.",
      "why.4.t": "8 שנים על הפאנלים.",
      "why.4.d": "סטודיו בבעלות המתקין. מי שמתמחר את הרכב שלכם הוא זה שעוטף אותו.",
      "fin.h": "גימורים<span class=\"dot\">.</span>",
      "fin.lead": "עובדים עם הקטלוגים המלאים של 3M, Avery Dennison, KPMF, Hexis ו-Oracal. אם זה קיים בגליל - נשים את זה על הרכב שלכם.",
      "fin.gloss": "מבריק", "fin.satin": "סאטן", "fin.matte": "מט",
      "fin.metal": "מטאלי", "fin.shift": "קולור-שיפט", "fin.carbon": "דמוי קרבון",
      "proc.h": "איך מתנהל פרויקט<span class=\"dot\">.</span>",
      "proc.1.t": "ייעוץ בסטודיו",
      "proc.1.d": "תביאו את הרכב, או רק את קוד הצבע. בודקים את המרכב, מדברים על גימורים ונותנים מחיר ישיר.",
      "proc.2.t": "ציפוי ועיצוב",
      "proc.2.d": "בוחרים את הגליל מהקטלוגים ורואים את הפרויקט משורטט על תבנית הרכב שלכם לפני שנחתך משהו.",
      "proc.3.t": "התקנה",
      "proc.3.d": "3-5 ימים במוסך. פאנלים יורדים היכן שהקצה דורש. זה ה-no shortcuts שלנו.",
      "proc.4.t": "איטום ומסירה",
      "proc.4.d": "שכבה קרמית אופציונלית מעל הציפוי, מדריך טיפול ביד, וצילום חשיפה באור הסטודיו.",
      "faq.h": "שאלות על ציפוי, תשובות ישרות<span class=\"dot\">.</span>",
      "faq.1.q": "האם הציפוי יפגע בצבע שלי?",
      "faq.1.a": "להפך. הציפוי מגן על צבע המפעל משמש, חול ואבנים, והסרה מקצועית משאירה את הצבע כפי שמצאנו אותו. לכן רכבים עטופים נמכרים טוב.",
      "faq.2.q": "כמה זמן מחזיק ראפ?",
      "faq.2.a": "5 עד 7 שנים עם טיפול נכון בשמש של פלורידה. חניה מקורה ושטיפה ידנית - ותהיו בקצה העליון של הטווח.",
      "faq.3.q": "זה באמת זול יותר מצביעה?",
      "faq.3.a": "צביעה איכותית של רכב יוקרה עולה יותר מראפ מלא, לוקחת יותר זמן והיא בלתי הפיכה. הציפוי נותן לכם את הצבע עכשיו - ואת צבע המפעל בחזרה מתי שתרצו.",
      "faq.4.q": "אפשר לעטוף רכב בליסינג?",
      "faq.4.a": "כן. הציפוי יורד נקי לפני החזרת הרכב. זו החלפת הצבע היחידה שליסינג מאפשר.",
      "faq.5.q": "איך שוטפים רכב עטוף?",
      "faq.5.a": "ביד או ללא מגע, בלי ווקס על מט וסאטן, ובלי לחץ מים ישיר על קצוות ותפרים. מדריך טיפול מלא ניתן באיסוף.",
      "faq.6.q": "כמה עולה ציפוי לרכב?",
      "faq.6.a": "כל רכב שונה: גודל וצורת המרכב, סדרת הוויניל שבוחרים, מצב הצבע, חלקים שצריך לפרק. לכן אנחנו מתמחרים רק פנים מול פנים: תביאו את הרכב או את קוד הצבע ותצאו עם מחיר מדויק שלא זז אחר כך.",
      "faq.7.q": "אילו ציפויים אתם מתקינים?",
      "faq.7.a": "אנחנו עובדים עם הקטלוגים המלאים של 3M, Avery Dennison, KPMF, Hexis ו-Oracal: סדרות עם גיבוי יצרן, אף פעם לא גלילים ללא שם. בוחרים גימור מול דוגמאות אמיתיות בפגישה, וכל רכב יוצא עם מדריך טיפול לציפוי המדויק הזה.",
      "faq.8.q": "איפה הסטודיו?",
      "faq.8.a": "נייפלס, פלורידה, בתיאום מראש. מגיעים אלינו מבוניטה ספרינגס, מרקו איילנד, פורט מאיירס וקייפ קורל: ציפוי טוב שווה את הנסיעה.",
      "faq.9.q": "אתם עוטפים רכבי יוקרה וסופרקארים?",
      "faq.9.a": "רכבי יוקרה הם ההתמחות של הסטודיו: בשבילם Zap Wrap Naples קיים. פגושים נמוכים, פאנלים מקרבון, חיישנים ואווירודינמיקה מורכבת משנים את כל הגישה לציפוי, ולכן רכבי יוקרה נעטפים עם פירוק פאנלים והוויניל נחתך לפי המרכב המדויק לפני החיתוך הראשון. תביאו את הרכב לייעוץ ותראו את התכנון קודם.",
      "faq.10.q": "כמה זמן לוקח ראפ?",
      "faq.10.a": "החלפת צבע מלאה לוקחת 3 עד 5 ימים בסדנה. חיסול כרום וגג או מכסה מנוע לוקחים פחות. את לוח הזמנים המדויק תקבלו יחד עם הצעת המחיר בייעוץ בסטודיו.",
      "book.h": "תביאו לנו את הרכב<span class=\"dot\">.</span>",
      "book.lead": "הייעוץ בסטודיו וללא לחץ. נכנסים עם קוד צבע - יוצאים בידיעה מדויקת איך הראפ ייראה. שלחו פרטים ונחזור תוך יום עסקים.",
      "book.call": "טלפון", "book.msg": "הודעה לסטודיו", "book.msg2": "הודעה לסטודיו",
      "book.studio": "סטודיו", "book.studio.v": "נייפלס, פלורידה &middot; בתיאום מראש",
      "book.hours": "שעות", "book.hours.v": "א'-ה' 8:00-20:00 &middot; ו' 8:00-17:00 &middot; שבת סגור",
      "book.serving": "אזורי שירות",
      "f.name": "שם", "f.phone": "טלפון", "f.car": "הרכב",
      "f.svc": "מה מעניין אתכם", "f.notes": "משהו נוסף",
      "ph.name": "השם שלכם", "ph.phone": "המספר שלכם", "ph.car": "שנה, יצרן ודגם",
      "ph.notes": "רעיונות לגימור, לוחות זמנים, קוד צבע...",
      "f.choose": "בחרו שירות", "f.o1": "החלפת צבע מלאה", "f.o2": "Chrome delete",
      "f.o3": "ציפוי חלקי / גג / מכסה מנוע", "f.o4": "גרפיקה / כיתוב",
      "f.o5": "מסחרי / צי רכב", "f.o6": "איטום קרמי (תוספת)", "f.o7": "עוד לא בטוח - תייעצו לי",
      "f.submit": "לבקש ייעוץ <span aria-hidden=\"true\">&larr;</span>",
      "f.fine": "בלי ספאם. הפרטים שלכם מגיעים רק לסטודיו.",
      "book.next.1": "הבקשה נפתחת בוואטסאפ כבר מוכנה: בדקו, לחצו שלח, והיא בסטודיו. אנחנו חוזרים תוך יום עסקים.",
      "f.alt": "אין וואטסאפ? <a href=\"tel:+13527790041\">התקשרו (352) 779-0041</a> או <a href=\"sms:+13527790041\">שלחו SMS</a> עם אותם פרטים.",
      "book.entity": "Zap Wrap Naples הוא סטודיו לציפוי ויניל בנייפלס, פלורידה: סטודיו האקזוטיק-ראפ של נייפלס. הסטודיו מתקין החלפות צבע מלאות, חיסול כרום, ציפויים חלקיים, גרפיקה בהתאמה אישית וציפויי ציי רכב מסחריים לנהגים מנייפלס, בוניטה ספרינגס, מרקו איילנד, פורט מאיירס וקייפ קורל. הסטודיו מנוהל על ידי הבעלים: מי שמתמחר את הרכב שלכם הוא מתקין עם 8 שנות ניסיון מקצועי שעוטף בעצמו. ויניל הוא המקצוע היחיד; קרמיקה מוצעת רק כציפוי גימור מעל ראפ חדש. No shortcuts.",
      "meta.title": "ציפוי רכב בנייפלס פלורידה | החלפת צבע וחיסול כרום | Zap Wrap",
      "meta.desc": "סטודיו לציפוי רכב בנייפלס, פלורידה: החלפות צבע מלאות, חיסול כרום וציפויי ציים. מומחי ויניל לנייפלס, בוניטה ספרינגס ומרקו איילנד. No shortcuts.",
      "book.next.2": "פגישת ייעוץ של 15 דקות: הרכב שלכם, דוגמאות ויניל אמיתיות, דיבור ישיר.",
      "book.next.3": "יוצאים עם מחיר מדויק ותור להתקנה.",
    },
  };

  var orig = null;
  function snapshot() {
    var md = document.querySelector('meta[name="description"]');
    orig = { text: {}, ph: {}, label: {}, title: document.title, desc: md ? md.getAttribute("content") : "" };
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      orig.text[el.getAttribute("data-i18n")] = el.innerHTML;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      orig.ph[el.getAttribute("data-i18n-ph")] = el.getAttribute("placeholder") || "";
    });
    document.querySelectorAll("[data-i18n-label]").forEach(function (el) {
      orig.label[el.getAttribute("data-i18n-label")] = el.getAttribute("label") || "";
    });
  }

  function apply(lang) {
    if (!orig) snapshot();
    var d = DICT[lang] || {};
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      var v = d[k] != null ? d[k] : orig.text[k];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph");
      var v = d[k] != null ? d[k] : orig.ph[k];
      if (v != null) el.setAttribute("placeholder", v.replace(/&amp;/g, "&"));
    });
    document.querySelectorAll("[data-i18n-label]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-label");
      var v = d[k] != null ? d[k] : orig.label[k];
      if (v != null) el.setAttribute("label", v.replace(/&iquest;/g, "¿").replace(/&aacute;/g, "á"));
    });
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", RTL[lang] ? "rtl" : "ltr");
    try { localStorage.setItem(STORE, lang); } catch (e) { /* private mode */ }
    /* title + description follow the language (dict stores display HTML; the
       title bar wants plain text) */
    var strip = function (s) { var t = document.createElement("div"); t.innerHTML = s; return t.textContent; };
    document.title = d["meta.title"] ? strip(d["meta.title"]) : orig.title;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", d["meta.desc"] ? strip(d["meta.desc"]) : orig.desc);
    /* the canonical for a language is its prerendered page (dev/build-i18n.js),
       so an in-place swap on "/" still points crawlers at the real URL */
    var can = document.querySelector('link[rel="canonical"]');
    if (can) can.setAttribute("href", "https://zapwrapnaples.com/" + (lang === "en" ? "" : lang + "/"));
    /* the address bar must agree with that canonical: when the language came
       from localStorage or navigator (no ?lang in the URL), sync the URL too,
       keeping any other params (utm) intact */
    try {
      if (history.replaceState && typeof URLSearchParams !== "undefined") {
        var sp = new URLSearchParams(location.search);
        if (lang === "en") sp.delete("lang"); else sp.set("lang", lang);
        var qs = sp.toString();
        var next = location.pathname + (qs ? "?" + qs : "") + location.hash;
        if (next !== location.pathname + location.search + location.hash) {
          history.replaceState(null, "", next);
        }
      }
    } catch (e) { /* sandboxed context */ }
    var sel = document.getElementById("lang-select");
    if (sel && sel.value !== lang) sel.value = lang;
  }

  function initial() {
    /* ?lang=xx wins over everything: those are the URLs the hreflang tags in
       the head point at, so a crawler (or a shared link) must land on that
       language regardless of what this browser picked last time. */
    var q = null;
    try { q = new URLSearchParams(location.search).get("lang"); } catch (e) { /* no URLSearchParams */ }
    if (q) {
      q = q.slice(0, 2).toLowerCase();
      if (q === "en" || DICT[q]) return q;
    }
    var saved = null;
    try { saved = localStorage.getItem(STORE); } catch (e) { /* private mode */ }
    if (saved && (saved === "en" || DICT[saved])) return saved;
    var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return DICT[nav] ? nav : "en";
  }

  function boot() {
    /* prerendered pages (/es/ /ru/ /uk/ /he/) arrive already translated by
       dev/build-i18n.js and marked with data-baked - no swapping there */
    var baked = document.documentElement.getAttribute("data-baked") || null;
    var lang = baked || initial();
    var sel = document.getElementById("lang-select");
    if (sel) {
      sel.value = lang;
      sel.addEventListener("change", function () {
        try { localStorage.setItem(STORE, sel.value); } catch (e) { /* private mode */ }
        /* languages are real URLs now: switching navigates, so the address bar,
           canonical and content always agree */
        location.href = sel.value === "en" ? "/" : "/" + sel.value + "/";
      });
    }
    if (baked) {
      try { localStorage.setItem(STORE, baked); } catch (e) { /* private mode */ }
      return;
    }
    if (lang !== "en") apply(lang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
