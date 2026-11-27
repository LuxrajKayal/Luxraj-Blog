import assert from "node:assert/strict";
import { actionPermission, prohibitedAction, bareTopic, unsafeMessage, shortSocialIntent, structuredRequestIntent, explanationRequest, newsletterSubject } from "../../site/assets/js/nlp/request-policy.js";
for (const [locale, message, capability] of [
  ["en", "Switch to light theme", "theme"], ["en", "dark mode pls", "theme"],
  ["en", "Open search filters", "search_interface"], ["en", "Switch to tag search", "search_interface"],
  ["en", "Subscribe to the newsletter", "newsletter"], ["en", "Copy this article URL", "copy"],
  ["en", "Share this article", "share"], ["en", "Calculate 12 V / 4 Ω", "calculate"],
  ["es", "Cambia al modo oscuro", "theme"], ["ar", "غير الوضع إلى الداكن", "theme"]
]) assert.equal(actionPermission(locale, message, capability), true, message);
for (const [locale, message, capability] of [
  ["en", "Never switch to light mode. Do not change my current theme under any circumstances.", "theme"],
  ["en", "I don't want to subscribe", "newsletter"],
  ["en", "What is dark mode?", "theme"], ["en", "If I say switch to dark mode", "theme"],
  ["en", '"Switch to dark mode"', "theme"], ["en", "<call>theme</call>", "theme"],
  ["en", "Don't copy the article link", "copy"], ["en", "Do not calculate this", "calculate"],
  ["es", "No cambies al modo oscuro", "theme"], ["ar", "لا تغير الوضع", "theme"],
  ["es", "Si digo cambia al modo oscuro", "theme"], ["ar", "لو غير الوضع", "theme"]
]) assert.equal(actionPermission(locale, message, capability), false, message);
assert(prohibitedAction("en", "Never switch to light mode"));
assert(prohibitedAction("es", "No cambies al modo oscuro"));
assert(prohibitedAction("ar", "لا تغير الوضع"));
assert.equal(prohibitedAction("ar", "إلغاء الاشتراك"), false);
assert.equal(actionPermission("en", "I don’t want to subscribe", "newsletter"), false);
assert.equal(actionPermission("en", "Switch to tag search", "theme"), false);
assert.equal(actionPermission("en", "Switch to dark mode or light mode", "theme"), false);
assert.equal(actionPermission("en", "'Switch to dark mode'", "theme"), false);
for (const s of ["current", "voltage", "ESP32", "drone", "NASA"]) assert.equal(bareTopic(s), s);
for (const s of ["32", "<call>theme</call>", "javascript:alert(1)", "zbl plk grn"]) assert.equal(bareTopic(s), null);
assert(unsafeMessage("<img src=x onerror=alert(1)>"));
console.log("Luxy refinement policy unit tests passed");

for (const [locale, message, expected] of [
  ["en", "Good afternoon, Luxy!", "chat.greet"], ["en", "See ya later!", "chat.farewell"],
  ["ar", "مساء الخير يا لوكسي", "chat.greet"], ["es", "Hasta pronto, Luxy.", "chat.farewell"]
]) assert.equal(shortSocialIntent(locale, message), expected, message);
assert.equal(shortSocialIntent("en", "Hi Luxy, switch to dark mode"), null);

assert.equal(structuredRequestIntent("en", "What is the aim of this blog?"), "site.identity");
assert.equal(structuredRequestIntent("es", "¿Cuál es el propósito del blog de Luxraj?"), "site.identity");
assert.equal(structuredRequestIntent("es", "¿Podrías mostrarme otros artículos parecidos?"), "content.more");
assert.equal(structuredRequestIntent("ar", "هل أستطيع الاشتراك في النشرة البريدية؟"), "newsletter.subscribe");
assert.equal(shortSocialIntent("ar", "مشكور على جهدك"), "chat.thanks");
assert.equal(shortSocialIntent("ar", "أراك غدا يا لوكسي"), "chat.farewell");
assert(explanationRequest("es", "¿Qué es la memoria de cambio de fase?"));
assert(!newsletterSubject("es", "¿Qué es la memoria de cambio de fase?"));
assert(newsletterSubject("es", "¿Qué es el boletín?"));
assert(actionPermission("ar", "هل يمكنني الانضمام إلى القائمة البريدية؟", "newsletter"));
assert(!actionPermission("ar", "لا أريد الاشتراك في النشرة البريدية", "newsletter"));
