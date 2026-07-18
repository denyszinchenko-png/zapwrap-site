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
      "nav.cta": "Reservar consulta",
      "hero.intro": "Estudio de vinilo &middot; Naples, Florida",
      "hero.l1": "El estudio", "hero.l2": "de <em>wraps</em>", "hero.l3": "de Naples",
      "hero.sub": "Cambio de color completo, chrome delete, gr&aacute;ficos a medida. El vinilo es todo nuestro trabajo, no una l&iacute;nea del men&uacute;. No shortcuts.",
      "hero.book": "Reservar consulta <span aria-hidden=\"true\">&rarr;</span>",
      "hero.wa": "WhatsApp al estudio",
      "pitch": "<strong>Mira tu auto en un color nuevo.</strong> Elige el modelo m&aacute;s parecido y prueba los vinilos. En la consulta trazamos tu auto exacto con los cat&aacute;logos reales de 3M y Avery. <a href=\"https://wa.me/13527790041?text=Hi%21%20I%20want%20to%20see%20my%20car%20in%20a%20wrap%3A%20\" rel=\"noopener\">&iquest;No est&aacute; tu modelo? Env&iacute;alo al estudio</a>",
      "filmbar.car": "Elige tu auto", "filmbar.film": "Elige el vinilo",
      "film.shift": "Color-shift", "film.satin": "Negro satinado", "film.graphite": "Gris oscuro mate",
      "film.nardo": "Gris Nardo", "film.miami": "Azul Miami", "film.rosso": "Rosso brillante",
      "film.purple": "P&uacute;rpura profundo", "film.pink": "Rosa brillante", "film.army": "Verde militar satinado",
      "req.group": "&iquest;No est&aacute;?", "req.opt": "Mi auto no est&aacute; - solicitarlo",
      "cta.like": "&iquest;Te gusta este color? M&iacute;ralo en tu auto:",
      "cta.link": "Escr&iacute;benos por WhatsApp",
      "rev.h": "Calificaci&oacute;n 5.0 en Google",
      "rev.lead": "Los conductores de Naples califican el trabajo, no los anuncios. Cada rese&ntilde;a es p&uacute;blica y verificada por Google.",
      "rev.link": "Lee las rese&ntilde;as en Google",
      "build.h": "&Uacute;ltimo proyecto<span class=\"dot\">.</span>",
      "build.lead": "BMW X6 M Competition 2026: cambio de color completo, de blanco f&aacute;brica a gris oscuro mate. Cada esquina, curva y borde envuelto, con paneles desmontados donde el borde lo exig&iacute;a.",
      "build.credit": "Instalado por Zap Wrap para Studio Design USA &middot; Fotos: Angel Enrique Hernandez",
      "svc.h": "Qu&eacute; hacemos<span class=\"dot\">.</span>",
      "svc.lead": "Una especializaci&oacute;n, al nivel de los ex&oacute;ticos. El cer&aacute;mico es un sellado que aplicamos sobre un wrap terminado, nunca un servicio aparte. Si no es vinilo, no est&aacute; en el men&uacute;.",
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
      "faq.h": "Respuestas directas<span class=\"dot\">.</span>",
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
      "book.h": "Tr&aacute;enos el auto<span class=\"dot\">.</span>",
      "book.lead": "Las consultas son en el estudio y sin presi&oacute;n. Entra con un c&oacute;digo de pintura y sal sabiendo exactamente c&oacute;mo se ver&aacute; tu wrap. Env&iacute;a los datos y respondemos en un d&iacute;a h&aacute;bil.",
      "book.call": "Llamar", "book.msg": "Escribir al estudio",
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
    },

    /* ---------------- РУССКИЙ ---------------- */
    ru: {
      "nav.work": "Работы", "nav.services": "Услуги", "nav.finishes": "Финиши", "nav.faq": "Вопросы",
      "nav.cta": "Записаться",
      "hero.intro": "Студия винилового врапа &middot; Нейплс, Флорида",
      "hero.l1": "Экзотик-", "hero.l2": "<em>врап</em> студия", "hero.l3": "Нейплса",
      "hero.sub": "Полная смена цвета, chrome delete, кастомная графика. Винил - вся наша работа, а не строчка в меню. No shortcuts.",
      "hero.book": "Записаться на консульт <span aria-hidden=\"true\">&rarr;</span>",
      "hero.wa": "WhatsApp студии",
      "pitch": "<strong>Посмотри свою машину в новом цвете.</strong> Выбери ближайшую модель и полистай плёнки. На консультации отрисуем именно твою машину по реальным каталогам 3M и Avery. <a href=\"https://wa.me/13527790041?text=Hi%21%20I%20want%20to%20see%20my%20car%20in%20a%20wrap%3A%20\" rel=\"noopener\">Нет твоей модели? Отправь её в студию</a>",
      "filmbar.car": "Выбери машину", "filmbar.film": "Выбери плёнку",
      "film.shift": "Хамелеон", "film.satin": "Сатиновый чёрный", "film.graphite": "Тёмно-серый мат",
      "film.nardo": "Серый Nardo", "film.miami": "Голубой Miami", "film.rosso": "Глянцевый Rosso",
      "film.purple": "Глубокий фиолетовый", "film.pink": "Глянцевый розовый", "film.army": "Сатиновый хаки",
      "req.group": "Нет в списке?", "req.opt": "Моей машины нет - запросить",
      "cta.like": "Нравится цвет? Посмотри его на своей машине:",
      "cta.link": "Напиши нам в WhatsApp",
      "rev.h": "Оценка 5.0 в Google",
      "rev.lead": "Водители Нейплса оценивают работу, а не рекламу. Каждый отзыв публичный и проверен Google.",
      "rev.link": "Читать отзывы в Google",
      "build.h": "Свежая работа<span class=\"dot\">.</span>",
      "build.lead": "BMW X6 M Competition 2026: полная смена цвета, с заводского белого в тёмно-серый мат. Каждый угол, изгиб и кромка оклеены, панели сняты там, где этого требовала кромка.",
      "build.credit": "Установка: Zap Wrap для Studio Design USA &middot; Фото: Angel Enrique Hernandez",
      "svc.h": "Что мы делаем<span class=\"dot\">.</span>",
      "svc.lead": "Одна специализация - на уровне экзотиков. Керамика - это финишное покрытие поверх готового врапа, никогда не отдельная услуга. Если это не винил, этого нет в меню.",
      "svc.full": "Полная смена цвета",
      "svc.full.d": "Сатин, глянец, металлик, хамелеон. Заводская краска запечатана под плёнкой и остаётся нетронутой. 3-5 дней в боксе.",
      "svc.chrome": "Chrome delete",
      "svc.chrome.d": "Молдинги, шильдики, зеркала, окантовка окон в сатиновый или глянцевый чёрный. Самый быстрый способ придать машине законченный вид.",
      "svc.roof": "Крыша, капот и акценты",
      "svc.roof.d": "Контрастная крыша, капот, спойлер, зеркала. Малые панели, точные кромки.",
      "svc.graphics": "Графика и леттеринг",
      "svc.graphics.d": "Полосы, ливреи, декали - режем и клеим сами, в студии.",
      "svc.fleet": "Коммерческий транспорт",
      "svc.fleet.d": "Оклеенный вэн - это билборд, который у твоего бизнеса уже есть. Печать, резка, установка - и так по всему флиту.",
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
      "faq.h": "Прямые ответы<span class=\"dot\">.</span>",
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
      "book.h": "Привози машину<span class=\"dot\">.</span>",
      "book.lead": "Консультации - в студии и без давления. Заходишь с кодом краски - выходишь, точно зная, как будет выглядеть твой врап. Отправь данные, ответим в течение рабочего дня.",
      "book.call": "Телефон", "book.msg": "Написать студии",
      "book.studio": "Студия", "book.studio.v": "Нейплс, Флорида &middot; по записи",
      "book.hours": "Часы", "book.hours.v": "Вс-Чт 8:00-20:00 &middot; Пт 8:00-17:00 &middot; Сб выходной",
      "book.serving": "Работаем",
      "f.name": "Имя", "f.phone": "Телефон", "f.car": "Машина",
      "f.svc": "Что интересует", "f.notes": "Что-то ещё",
      "ph.name": "Твоё имя", "ph.phone": "Твой номер", "ph.car": "Год, марка и модель",
      "ph.notes": "Идеи финиша, сроки, код краски...",
      "f.choose": "Выбери услугу", "f.o1": "Полная смена цвета", "f.o2": "Chrome delete",
      "f.o3": "Частичная оклейка / крыша / капот", "f.o4": "Графика / леттеринг",
      "f.o5": "Коммерческий / флит", "f.o6": "Керамика (финиш)", "f.o7": "Пока не знаю - посоветуйте",
      "f.submit": "Запросить консульт <span aria-hidden=\"true\">&rarr;</span>",
      "f.fine": "Без спама. Твои данные попадают только в студию.",
    },

    /* ---------------- УКРАЇНСЬКА ---------------- */
    uk: {
      "nav.work": "Роботи", "nav.services": "Послуги", "nav.finishes": "Фініші", "nav.faq": "Питання",
      "nav.cta": "Записатися",
      "hero.intro": "Студія вінілового врапу &middot; Нейплс, Флорида",
      "hero.l1": "Екзотик-", "hero.l2": "<em>врап</em> студія", "hero.l3": "Нейплса",
      "hero.sub": "Повна зміна кольору, chrome delete, кастомна графіка. Вініл - вся наша робота, а не рядок у меню. No shortcuts.",
      "hero.book": "Записатися на консульт <span aria-hidden=\"true\">&rarr;</span>",
      "hero.wa": "WhatsApp студії",
      "pitch": "<strong>Подивись свою автівку в новому кольорі.</strong> Обери найближчу модель і погортай плівки. На консультації відмалюємо саме твою автівку за реальними каталогами 3M та Avery. <a href=\"https://wa.me/13527790041?text=Hi%21%20I%20want%20to%20see%20my%20car%20in%20a%20wrap%3A%20\" rel=\"noopener\">Немає твоєї моделі? Надішли її в студію</a>",
      "filmbar.car": "Обери автівку", "filmbar.film": "Обери плівку",
      "film.shift": "Хамелеон", "film.satin": "Сатиновий чорний", "film.graphite": "Темно-сірий мат",
      "film.nardo": "Сірий Nardo", "film.miami": "Блакитний Miami", "film.rosso": "Глянцевий Rosso",
      "film.purple": "Глибокий фіолетовий", "film.pink": "Глянцевий рожевий", "film.army": "Сатиновий хакі",
      "req.group": "Немає в списку?", "req.opt": "Моєї автівки немає - запросити",
      "cta.like": "Подобається колір? Поглянь на своїй автівці:",
      "cta.link": "Напиши нам у WhatsApp",
      "rev.h": "Оцінка 5.0 у Google",
      "rev.lead": "Водії Нейплза оцінюють роботу, а не рекламу. Кожен відгук публічний і перевірений Google.",
      "rev.link": "Читати відгуки в Google",
      "build.h": "Свіжа робота<span class=\"dot\">.</span>",
      "build.lead": "BMW X6 M Competition 2026: повна зміна кольору, із заводського білого в темно-сірий мат. Кожен кут, вигин і кромка обклеєні, панелі зняті там, де цього вимагала кромка.",
      "build.credit": "Встановлення: Zap Wrap для Studio Design USA &middot; Фото: Angel Enrique Hernandez",
      "svc.h": "Що ми робимо<span class=\"dot\">.</span>",
      "svc.lead": "Одна спеціалізація - на рівні екзотиків. Кераміка - це фінішне покриття поверх готового врапу, ніколи не окрема послуга. Якщо це не вініл, цього немає в меню.",
      "svc.full": "Повна зміна кольору",
      "svc.full.d": "Сатин, глянець, металік, хамелеон. Заводська фарба запечатана під плівкою і лишається неторканою. 3-5 днів у боксі.",
      "svc.chrome": "Chrome delete",
      "svc.chrome.d": "Молдинги, шильдики, дзеркала, окантовка вікон у сатиновий чи глянцевий чорний. Найшвидший спосіб надати автівці завершеного вигляду.",
      "svc.roof": "Дах, капот і акценти",
      "svc.roof.d": "Контрастний дах, капот, спойлер, дзеркала. Малі панелі, точні кромки.",
      "svc.graphics": "Графіка та леттеринг",
      "svc.graphics.d": "Смуги, лівреї, декалі - ріжемо і клеїмо самі, в студії.",
      "svc.fleet": "Комерційний транспорт",
      "svc.fleet.d": "Обклеєний вен - це білборд, який у твого бізнесу вже є. Друк, різка, встановлення - і так по всьому фліту.",
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
      "faq.h": "Прямі відповіді<span class=\"dot\">.</span>",
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
      "book.h": "Привозь автівку<span class=\"dot\">.</span>",
      "book.lead": "Консультації - в студії та без тиску. Заходиш із кодом фарби - виходиш, точно знаючи, як виглядатиме твій врап. Надішли дані, відповімо протягом робочого дня.",
      "book.call": "Телефон", "book.msg": "Написати студії",
      "book.studio": "Студія", "book.studio.v": "Нейплс, Флорида &middot; за записом",
      "book.hours": "Години", "book.hours.v": "Нд-Чт 8:00-20:00 &middot; Пт 8:00-17:00 &middot; Сб вихідний",
      "book.serving": "Працюємо",
      "f.name": "Ім'я", "f.phone": "Телефон", "f.car": "Автівка",
      "f.svc": "Що цікавить", "f.notes": "Щось іще",
      "ph.name": "Твоє ім'я", "ph.phone": "Твій номер", "ph.car": "Рік, марка і модель",
      "ph.notes": "Ідеї фінішу, терміни, код фарби...",
      "f.choose": "Обери послугу", "f.o1": "Повна зміна кольору", "f.o2": "Chrome delete",
      "f.o3": "Часткова оклейка / дах / капот", "f.o4": "Графіка / леттеринг",
      "f.o5": "Комерційний / фліт", "f.o6": "Кераміка (фініш)", "f.o7": "Ще не знаю - порадьте",
      "f.submit": "Запросити консульт <span aria-hidden=\"true\">&rarr;</span>",
      "f.fine": "Без спаму. Твої дані потрапляють лише в студію.",
    },

    /* ---------------- עברית ---------------- */
    he: {
      "nav.work": "עבודות", "nav.services": "שירותים", "nav.finishes": "גימורים", "nav.faq": "שאלות",
      "nav.cta": "לקבוע ייעוץ",
      "hero.intro": "סטודיו לציפוי ויניל &middot; נייפלס, פלורידה",
      "hero.l1": "סטודיו", "hero.l2": "ה<em>ראפ</em> האקזוטי", "hero.l3": "של נייפלס",
      "hero.sub": "החלפת צבע מלאה, chrome delete, גרפיקה בהתאמה אישית. ויניל הוא כל העבודה שלנו, לא שורה בתפריט. No shortcuts.",
      "hero.book": "לקבוע ייעוץ <span aria-hidden=\"true\">&larr;</span>",
      "hero.wa": "וואטסאפ לסטודיו",
      "pitch": "<strong>תראו את הרכב שלכם בצבע חדש.</strong> בחרו את הדגם הקרוב ביותר ועברו בין הציפויים. בייעוץ נשרטט את הרכב המדויק שלכם לפי הקטלוגים האמיתיים של 3M ו-Avery. <a href=\"https://wa.me/13527790041?text=Hi%21%20I%20want%20to%20see%20my%20car%20in%20a%20wrap%3A%20\" rel=\"noopener\">הדגם שלכם לא כאן? שלחו אותו לסטודיו</a>",
      "filmbar.car": "בחרו רכב", "filmbar.film": "בחרו ציפוי",
      "film.shift": "קולור-שיפט", "film.satin": "שחור סאטן", "film.graphite": "אפור כהה מט",
      "film.nardo": "אפור נארדו", "film.miami": "כחול מיאמי", "film.rosso": "אדום מבריק",
      "film.purple": "סגול עמוק", "film.pink": "ורוד מבריק", "film.army": "ירוק צבאי סאטן",
      "req.group": "לא ברשימה?", "req.opt": "הרכב שלי לא כאן - לבקש אותו",
      "cta.like": "אוהבים את הצבע? תראו אותו על הרכב שלכם:",
      "cta.link": "כתבו לנו בוואטסאפ",
      "rev.h": "דירוג 5.0 בגוגל",
      "rev.lead": "נהגים בניידפלס מדרגים את העבודה, לא את הפרסומות. כל ביקורת ציבורית ומאומתת על ידי גוגל.",
      "rev.link": "לקריאת הביקורות בגוגל",
      "build.h": "פרויקט אחרון<span class=\"dot\">.</span>",
      "build.lead": "BMW X6 M Competition 2026: החלפת צבע מלאה, מלבן מקורי לאפור כהה מט. כל פינה, קימור וקצה עטופים, פאנלים פורקו היכן שהקצה דרש זאת.",
      "build.credit": "התקנה: Zap Wrap עבור Studio Design USA &middot; צילום: Angel Enrique Hernandez",
      "svc.h": "מה אנחנו עושים<span class=\"dot\">.</span>",
      "svc.lead": "התמחות אחת, ברמה של רכבי יוקרה. קרמיקה היא ציפוי גימור מעל ראפ מוכן, לעולם לא שירות נפרד. אם זה לא ויניל, זה לא בתפריט.",
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
      "faq.h": "תשובות ישרות<span class=\"dot\">.</span>",
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
      "book.h": "תביאו לנו את הרכב<span class=\"dot\">.</span>",
      "book.lead": "הייעוץ בסטודיו וללא לחץ. נכנסים עם קוד צבע - יוצאים בידיעה מדויקת איך הראפ ייראה. שלחו פרטים ונחזור תוך יום עסקים.",
      "book.call": "טלפון", "book.msg": "הודעה לסטודיו",
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
    },
  };

  var orig = null;
  function snapshot() {
    orig = { text: {}, ph: {}, label: {} };
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
    var sel = document.getElementById("lang-select");
    if (sel && sel.value !== lang) sel.value = lang;
  }

  function initial() {
    var saved = null;
    try { saved = localStorage.getItem(STORE); } catch (e) { /* private mode */ }
    if (saved && (saved === "en" || DICT[saved])) return saved;
    var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return DICT[nav] ? nav : "en";
  }

  function boot() {
    var lang = initial();
    var sel = document.getElementById("lang-select");
    if (sel) {
      sel.value = lang;
      sel.addEventListener("change", function () { apply(sel.value); });
    }
    if (lang !== "en") apply(lang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
