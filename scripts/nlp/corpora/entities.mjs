// Stable names and synonyms for website controls, plus open argument patterns.
const languages = {
  en: ["English", "inglés", "الإنجليزية"],
  ar: ["Arabic", "árabe", "العربية"],
  es: ["Spanish", "español", "الإسبانية"]
};

export const grammar = {
  en: {
    enums: {
      page: {
        home: ["home", "homepage", "front page"],
        about: ["about us", "about page"],
        archive: ["archive", "article archive"],
        contact: ["contact", "contact us"],
        editorial: ["editorial", "editorial desk"],
        advertising: ["advertising", "advertise"],
        privacy: ["privacy", "privacy policy"]
      },
      theme: { dark: ["dark", "night", "dark mode"], light: ["light", "bright", "light mode"] },
      channel: { instagram: ["Instagram"], device: ["device share", "share sheet"] },
      language: languages
    },
    query: [
      /(?<=\b(?:articles|posts|guides|reading|read|anything|something|information)\s+(?:about|on|regarding|concerning|related to)\s+)[^?!\n]+/iu,
      /(?<=^\s*(?:please\s+)?(?:what (?:is|are|does)|(?:can you )?explain|tell me how|how does|help me understand|give me a definition of|I want to understand|search for|look up|find|I'm looking for)\s+)(?![^?!\n]*\b(?:articles|posts|guides|information)\s+(?:about|on|regarding|concerning|related to)\s)[^?!\n]+/iu,
      /(?<=\b(?:guide|introduction)\s+to\s+)[^?!\n]+/iu
    ],
    queryEnd: /\s+(?:please|mean|works?|(?:in|after|before|from)\s+[\p{Nd}].*|written by\s+.+)$/iu,
    genericQuery: /^(?:articles?|posts?|guides?|this|that|it|something)$/iu,
    date: /(?<![\p{L}\p{N}])(?:[\p{Nd}]{4}(?:-[\p{Nd}]{2}(?:-[\p{Nd}]{2})?)?|today|yesterday|last (?:week|month|year)|this (?:week|month|year)|recently)(?![\p{L}\p{N}])/iu,
    author: /(?<=\b(?:written by|posts by|articles by|guides by|author)\s+)[\p{L}][\p{L}\p{M}.'’-]*(?:\s+[\p{L}][\p{L}\p{M}.'’-]*){0,4}/iu,
    generated: "find articles about "
  },
  ar: {
    enums: {
      page: {
        home: ["الرئيسية", "الصفحة الرئيسية"],
        about: ["عن الموقع", "من نحن"],
        archive: ["الأرشيف", "أرشيف المقالات"],
        contact: ["اتصل بنا", "التواصل"],
        editorial: ["هيئة التحرير", "صفحة التحرير"],
        advertising: ["الإعلانات", "أعلن معنا"],
        privacy: ["الخصوصية", "سياسة الخصوصية"]
      },
      theme: { dark: ["داكن", "الداكن", "ليلي", "الليلي"], light: ["فاتح", "الفاتح", "مضيء", "المضيء"] },
      channel: { instagram: ["إنستغرام", "انستقرام", "Instagram"], device: ["مشاركة الجهاز"] },
      language: {
        en: [...languages.en, "الإنجليزية", "إنجليزي", "بالإنجليزية"],
        ar: [...languages.ar, "عربي", "بالعربية"],
        es: [...languages.es, "إسباني", "بالإسبانية"]
      }
    },
    query: [
      /(?<=\s(?:مقالات|تدوينات|قراءة|أقرأ|شيء|دليل[اًا]?|أبحث|ابحث|معلومات)\s+(?:حول|عن|تتناول|بخصوص|بشأن)\s+)(?!مقالات\s+)[^؟?!\n]+/u,
      /(?<=^\s*(?:ما (?:هو|هي|معنى|المقصود بـ)|ماذا يعني|اشرح(?: لي)?|وضح(?: مفهوم)?|كيف يعمل|أريد فهم|عرف لي|هل تشرح)\s+)(?!لي\s+)[^؟?!\n]+/u
    ],
    queryEnd: /\s+(?:من فضلك|لو سمحت|(?:بعد|قبل|في|من)\s+[\p{Nd}].*|بقلم\s+.+)$/u,
    genericQuery: /^(?:مقالات|المقالات|هذا|ذلك|دليل|شيء)$/u,
    date: /(?<![\p{L}\p{N}])(?:[\p{Nd}]{4}(?:-[\p{Nd}]{2}(?:-[\p{Nd}]{2})?)?|اليوم|أمس|(?:الأسبوع|الشهر|العام) الماضي|هذا (?:الأسبوع|الشهر|العام)|مؤخرا)(?![\p{L}\p{N}])/u,
    author: /(?<=\s(?:بقلم|كتبها|تأليف)\s+)[\p{L}][\p{L}\p{M}'’-]*(?:\s+[\p{L}][\p{L}\p{M}'’-]*){0,4}/u,
    generated: "ابحث عن مقالات حول "
  },
  es: {
    enums: {
      page: {
        home: ["inicio", "portada", "página principal"],
        about: ["acerca de", "sobre nosotros"],
        archive: ["archivo", "archivo de artículos"],
        contact: ["contacto", "contacta"],
        editorial: ["editorial", "equipo editorial"],
        advertising: ["publicidad", "anúnciate"],
        privacy: ["privacidad", "política de privacidad"]
      },
      theme: { dark: ["oscuro", "oscura", "nocturno"], light: ["claro", "clara", "luminoso"] },
      channel: { instagram: ["Instagram"], device: ["menú de compartir"] },
      language: languages
    },
    query: [
      /(?<=\b(?:art[ií]culos?|publicaci[oó]n|publicaciones|gu[ií]as?|leer|informaci[oó]n|contenido|algo)\s+(?:sobre|acerca de|respecto a)\s+)[^?!\n]+/iu,
      /(?<=^\s*[¿¡]?\s*(?:qu[eé] (?:es|son|significa|quiere decir)|(?:me puedes )?explicar|expl[ií]came|c[oó]mo funciona|quiero entender|dame una definici[oó]n de|busca|ando buscando)\s+)(?![^?!\n]*\b(?:sobre|acerca de|respecto a)\s)[^?!\n]+/iu,
      /(?<=\b(?:artículos|guías|información|contenido)\s+de\s+)(?![^?!\n]*\b(?:sobre|acerca de|respecto a)\s)[^?!\n]+/iu
    ],
    queryEnd: /,?\s+(?:por favor[.!]?|(?:en|de|desde|antes de|después de)\s+[\p{Nd}].*|escritos por\s+.+)$/iu,
    genericQuery: /^(?:art[ií]culos?|entradas?|gu[ií]as?|esto|eso|algo)$/iu,
    date: /(?<![\p{L}\p{N}])(?:[\p{Nd}]{4}(?:-[\p{Nd}]{2}(?:-[\p{Nd}]{2})?)?|hoy|ayer|la semana pasada|el (?:mes|año) pasado|est[ae] (?:semana|mes|año)|recientemente)(?![\p{L}\p{N}])/iu,
    author: /(?<=\b(?:escrit[oa]s? por|firmad[oa]s? por|del autor)\s+)[\p{L}][\p{L}\p{M}.'’-]*(?:\s+[\p{L}][\p{L}\p{M}.'’-]*){0,4}/iu,
    generated: "busca artículos sobre "
  }
};

export const email = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/iu;
export const expression = /[\p{Nd}]+(?:[.,][\p{Nd}]+)?(?:\s*[\p{L}Ω]+)?(?:\s*(?:[+*/×÷−=-]|\band\b|\by\b|و)\s*[\p{Nd}]+(?:[.,][\p{Nd}]+)?(?:\s*[\p{L}Ω]+)?)+/iu;

export const negatives = {
  en: ["book a flight to Tokyo", "order me a pizza", "start a bank transfer", "translate my entire contract", "sing a song", "unlock my front door", "run this JavaScript code", "what is tomorrow's weather", "write a screenplay", "do my homework", "set an alarm for seven", "pick a lottery ticket", "call me a cab", "schedule a reminder", "tell me the football score", "play a video"],
  ar: ["احجز لي تذكرة طيران", "اطلب البيتزا", "أرسل حوالة بنكية", "ترجم العقد كاملا", "غن لي أغنية", "افتح باب منزلي", "نفذ شيفرة جافاسكريبت", "كيف الطقس غدا", "اكتب رواية خيالية", "حول المال إلى الحساب البنكي", "ادفع فاتورة الكهرباء", "حل واجباتي المدرسية عني", "اضبط مؤقت الفرن", "اتصل بسائق تاكسي", "اذكر لي نتيجة المباراة"],
  es: ["reserva un vuelo a Tokio", "pide una pizza", "haz una transferencia bancaria", "traduce todo mi contrato", "canta una canción", "abre la puerta de mi casa", "ejecuta este código JavaScript", "qué tiempo hará mañana", "escribe una novela", "pon una alarma a las siete", "configura el temporizador del horno", "dime qué números salieron en la lotería", "haz los deberes escolares por mí", "programa una cita", "llama a un taxi", "dime el resultado del partido"]
};

export const ambiguous = {
  en: ["do that", "show me it", "what about it", "could you help with that", "do it please", "open that thing"],
  ar: ["افعل ذلك", "أرني إياه", "وماذا عنه", "ساعدني في ذلك", "افتح ذلك الشيء", "نفذ هذا", "افتحها لو سمحت"],
  es: ["haz eso", "muéstramelo", "y qué hay de eso", "ayúdame con eso", "abre esa cosa", "hazlo por favor"]
};
