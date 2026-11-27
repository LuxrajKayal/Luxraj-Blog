/*
 * Luxraj Blog — article sharing controls
 *
 * Supports the reusable author bar and older article-share attributes.
 * Uses the Clipboard API first, then a legacy copy attempt, and finally
 * a manual-copy prompt if the browser blocks both automatic methods.
 */

const copyFeedbackTimers = new WeakMap();

export function getArticleShareData() {
    const title = document.querySelector(".article-entry-header h1")?.textContent?.trim()
        || document.title;
    const description = document.querySelector(".article-introduction")?.textContent?.trim()
        || "";

    return {
        title,
        text: description,
        url: window.location.href
    };
}

function getStatusElement(trigger) {
    return trigger?.closest("[data-author-bar]")?.querySelector("[data-author-bar-status]")
        || document.querySelector("[data-article-share-status]");
}

function setShareStatus(message, trigger) {
    const statusElement = getStatusElement(trigger);
    if (statusElement) statusElement.textContent = message;
}

function setCopyFeedback(trigger, state, message) {
    if (!trigger) return;

    const previousTimer = copyFeedbackTimers.get(trigger);
    if (previousTimer) window.clearTimeout(previousTimer);

    trigger.dataset.copyState = state;
    trigger.setAttribute("aria-label", message);
    trigger.title = message;

    const timer = window.setTimeout(() => {
        delete trigger.dataset.copyState;
        trigger.setAttribute("aria-label", "Copy article link");
        trigger.title = "Copy article link";
        copyFeedbackTimers.delete(trigger);
    }, 2200);

    copyFeedbackTimers.set(trigger, timer);
}

function tryLegacyCopy(url) {
    const temporaryField = document.createElement("textarea");
    temporaryField.value = url;
    temporaryField.setAttribute("readonly", "");
    temporaryField.setAttribute("aria-hidden", "true");
    temporaryField.style.position = "fixed";
    temporaryField.style.top = "0";
    temporaryField.style.left = "-9999px";
    temporaryField.style.fontSize = "16px";
    document.body.appendChild(temporaryField);

    temporaryField.focus({ preventScroll: true });
    temporaryField.select();
    temporaryField.setSelectionRange(0, temporaryField.value.length);

    let copied = false;
    try {
        copied = document.execCommand("copy");
    } catch {
        copied = false;
    } finally {
        temporaryField.remove();
    }

    return copied;
}

export async function copyArticleUrl({ check = () => {}, allowManual = true } = {}) {
    const url = window.location.href;

    if (navigator.clipboard?.writeText && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(url);
            return "copied";
        } catch (error) {
            // Continue to the fallback when the browser exposes Clipboard API
            // but rejects the write (for example, because permission is denied).
            console.warn("Clipboard API write was rejected; trying a fallback.", error);
        }
    }

    check();
    if (tryLegacyCopy(url)) return "copied";
    if (!allowManual) return "manual";

    // execCommand is deprecated and may be unavailable. Give the visitor
    // one final manual route rather than silently claiming the copy succeeded.
    const manualValue = window.prompt(
        "Automatic copying was blocked. Copy this article link:",
        url
    );

    if (manualValue === null) {
        throw new Error("The visitor cancelled the manual copy prompt.");
    }

    return "manual";
}

async function handleCopy(trigger) {
    try {
        const result = await copyArticleUrl();

        if (result === "manual") {
            setShareStatus("Copy the article URL from the prompt.", trigger);
            setCopyFeedback(trigger, "manual", "Copy the URL from the prompt");
            return;
        }

        setShareStatus("Link copied.", trigger);
        setCopyFeedback(trigger, "copied", "Link copied");
    } catch {
        setShareStatus("Copy failed. You can copy the address from your browser.", trigger);
        setCopyFeedback(trigger, "failed", "Copy failed");
    }
}

async function handleDeviceShare(trigger, unavailableMessage) {
    if (navigator.share) {
        try {
            await navigator.share(getArticleShareData());
            setShareStatus("Sharing completed.", trigger);
            return;
        } catch (error) {
            if (error?.name === "AbortError") return;
            // A rejected device share falls through to the copy route.
            console.warn("Native sharing was unavailable; trying link copy.", error);
        }
    }

    try {
        const result = await copyArticleUrl();
        if (result === "manual") {
            setShareStatus("Copy the article URL from the prompt.", trigger);
            return;
        }
        setShareStatus(unavailableMessage, trigger);
    } catch {
        setShareStatus("Sharing and automatic copying are unavailable in this browser.", trigger);
    }
}

document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (!target) return;

    const copyButton = target.closest("[data-article-copy]");
    if (copyButton) {
        event.preventDefault();
        handleCopy(copyButton);
        return;
    }

    const instagramButton = target.closest("[data-author-bar-instagram]");
    if (instagramButton) {
        event.preventDefault();
        handleDeviceShare(
            instagramButton,
            "Link copied. Paste it into your Instagram post or message."
        );
        return;
    }

    const legacyShareButton = target.closest("[data-article-share]");
    if (legacyShareButton) {
        event.preventDefault();
        handleDeviceShare(
            legacyShareButton,
            "Native sharing is unavailable here. Link copied instead."
        );
    }
});
