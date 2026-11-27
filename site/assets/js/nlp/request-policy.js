// Deliberately conservative action permission; never treat sentiment or NLU scores as authorization.
const forms = {
  en: {
    negative: /\b(?:never|not|no|don't|dont|do not|cannot|can't|avoid|without|cancel|rather than|instead of)\b/iu,
    action: /\b(?:switch|change|toggle|set|turn|open|subscribe|unsubscribe|share|copy|calculate|navigate|theme|mode|search|signup|sign up|mailing list|newsletter)\b/iu,
    hypothetical: /\b(?:if|suppose|imagine|example|hypothetically|what would|what happens|how (?:do|can|would|should)|what is|tell me how|explain|said|says|say|quote)\b/iu,
    commands: {
      theme: /^(?:(?:please|plz)\s+)?(?:(?:switch(?: back)? to|turn on|set|change|use|make|toggle|i want)\b.{0,120}|\b(?:dark|light) (?:mode|theme)(?: please| pls)?)$/iu,
      search_interface: /^(?:(?:please|plz)\s+)?(?:open|switch to|bring up|show)\b.{0,100}\b(?:search|filters?|settings|sort)\b.{0,30}$/iu,
      newsletter: /^(?:(?:please|plz)\s+)?(?:subscribe\b|sign me up\b|add me\b|i want to receive\b|join\b|open\b|where do i sign up\b).{0,150}$/iu,
      share: /^(?:please\s+)?(?:share|send|open|i want to share)\b.{0,120}$/iu,
      copy: /^(?:please\s+)?(?:copy|give me a copy|put|i need the link)\b.{0,120}$/iu,
      calculate: /^(?:please\s+)?(?:calculate|work out|help me calculate|can you (?:do|calculate)|what is the result of)\b.{0,150}$/iu
    }
  },
  es: {
    negative: /\b(?:no|nunca|jamás|evita|evitar|sin|cancela|cancelar|en vez de)\b/iu,
    action: /\b(?:cambia|cambiar|activa|activar|abre|abrir|modo|tema|suscri\p{L}*|boletín|comparte|compartir|copia|copiar|calcula|calcular|búsqueda)\b/iu,
    hypothetical: /\b(?:si|supón|imagina|ejemplo|hipotéticamente|qué pasaría|cómo (?:se|puedo|puedes)|qué es|explica|dijo|cita)\b/iu,
    commands: {
      theme: /^(?:por favor\s+)?(?:cambia|activa|pon|usa|establece|alterna|quiero|modo (?:claro|oscuro))\b.{0,120}$/iu,
      search_interface: /^(?:por favor\s+)?(?:abre|muestra|cambia|activa)\b.{0,120}$/iu,
      newsletter: /^(?:por favor\s+)?(?:suscríbeme|suscribirme|quiero recibir|inscríbeme|apúntame|abre|añádeme|dame de alta)\b.{0,150}$/iu,
      share: /^(?:por favor\s+)?(?:comparte|envía|abre|quiero compartir)\b.{0,120}$/iu,
      copy: /^(?:por favor\s+)?(?:copia|dame|pon|necesito)\b.{0,120}$/iu,
      calculate: /^(?:por favor\s+)?(?:calcula|calcular|resuelve|ayúdame a calcular|puedes calcular|cuál es el resultado)\b.{0,150}$/iu
    }
  },
  ar: {
    negative: /(?:^|\s)(?:لا|لن|لم|ليس|عدم|بدون|تجنب|إلغاء|الغ|ألغ|ما\s+تغير)(?=\s|$)/u,
    action: /(?:تغير|تغيير|تبديل|بدل|الوضع|المظهر|افتح|فتح|اشترك|اشتراك|النشرة|شارك|مشاركة|انسخ|نسخ|احسب|حساب|البحث)/u,
    hypothetical: /(?:^|\s)(?:إذا|لو|افترض|تخيل|مثال|كيف|ماذا لو|ما هو|اشرح|قال|اقتباس)(?=\s|$)/u,
    commands: {
      theme: /^(?:من فضلك\s+)?(?:غير|غيّر|بدل|بدّل|حول|حوّل|فعّل|فعل|شغّل|اجعل|أريد|اريد|الوضع)\s*.{0,120}$/u,
      search_interface: /^(?:من فضلك\s+)?(?:افتح|أظهر|اعرض|بدل|بدّل|انتقل)\s*.{0,120}$/u,
      newsletter: /^(?:من فضلك\s+)?(?:اشترك|سجلني|سجّلني|أضفني|أريد|اريد|افتح)\s*.{0,150}$/u,
      share: /^(?:من فضلك\s+)?(?:شارك|أرسل|افتح|أريد)\s*.{0,120}$/u,
      copy: /^(?:من فضلك\s+)?(?:انسخ|أعطني|اعطني|ضع|أريد)\s*.{0,120}$/u,
      calculate: /^(?:من فضلك\s+)?(?:احسب|أحسب|حل|ساعدني|هل يمكنك حساب)\s*.{0,150}$/u
    }
  }
};
const hostileMarkup = /[<>]|\bjavascript\s*:|&(?:lt|gt|#0*60|#x0*3c);/iu;
const quoted = /["“”«»\x60]/u;
const normalize = message => String(message ?? "").normalize("NFKC").trim().replace(/^[¿¡]+|[.!؟?]+$/gu, "").trim();
export function prohibitedAction(locale, message) {
  const p = forms[locale], text = normalize(message);
  return Boolean(p && p.action.test(text) && p.negative.test(text));
}
export function actionPermission(locale, message, capability) {
  const p = forms[locale], text = normalize(message);
  if (!p || !Object.hasOwn(p.commands, capability) || !text || hostileMarkup.test(text) ||
      quoted.test(text) || /[\r\n;!?؟]/u.test(text) || p.negative.test(text) || p.hypothetical.test(text)) return false;
  return p.commands[capability].test(text);
}
// Read-only candidate; Pagefind, not the training vocabulary, establishes whether sources exist.
// Do not interpret punctuation-heavy strings, raw code, multiword commands or numeric-only inputs.
export function bareTopic(message) {
  const text = normalize(message);
  return /^[\p{L}][\p{L}\p{N}+#.-]{1,79}$/u.test(text) && !hostileMarkup.test(text) ? text : null;
}
export function unsafeMessage(message) {
  return hostileMarkup.test(String(message ?? ""));
}
