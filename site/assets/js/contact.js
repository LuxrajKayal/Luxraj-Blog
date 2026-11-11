/*
 * Luxraj Blog — Contact page interactions
 * This module is loaded only by site/pages/contact.html.
 */

const recipientSelect = document.querySelector("#contact-recipient");
const providerRoot = document.querySelector("[data-provider-select]");
const composeButton = document.querySelector("[data-compose-submit]");
const feedback = document.querySelector("[data-contact-feedback]");

if (recipientSelect && providerRoot && composeButton) {
  const providerTrigger = providerRoot.querySelector("#contact-provider-trigger");
  const providerMenu = providerRoot.querySelector("#contact-provider-options");
  const selectedIcon = providerRoot.querySelector("[data-selected-provider-icon]");
  const selectedLabel = providerRoot.querySelector("[data-selected-provider-label]");
  const providerOptions = Array.from(providerMenu.querySelectorAll("[data-provider-option]"));

  const providerNames = {
    gmail: "Gmail",
    outlook: "Outlook",
    yahoo: "Yahoo Mail",
    default: "your default email application"
  };

  let selectedProvider = "gmail";

  function setFeedback(message) {
    if (feedback) feedback.textContent = message;
  }

  function closeProviderMenu(returnFocus) {
    providerMenu.hidden = true;
    providerTrigger.setAttribute("aria-expanded", "false");
    if (returnFocus) providerTrigger.focus();
  }

  function openProviderMenu(focusSelected) {
    providerMenu.hidden = false;
    providerTrigger.setAttribute("aria-expanded", "true");
    if (focusSelected) {
      const selectedOption = providerOptions.find((option) => option.dataset.providerOption === selectedProvider);
      if (selectedOption) selectedOption.focus();
    }
  }

  function chooseProvider(option) {
    if (!option) return;

    selectedProvider = option.dataset.providerOption;
    selectedLabel.textContent = providerNames[selectedProvider] || "Email service";
    selectedIcon.innerHTML = option.querySelector("[data-provider-icon]").innerHTML;

    providerOptions.forEach((item) => {
      const isSelected = item === option;
      item.setAttribute("aria-selected", String(isSelected));
      item.tabIndex = isSelected ? 0 : -1;
    });

    closeProviderMenu(false);
    setFeedback("");
  }

  providerTrigger.addEventListener("click", () => {
    if (providerMenu.hidden) openProviderMenu(true);
    else closeProviderMenu(false);
  });

  providerTrigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openProviderMenu(true);
    }
  });

  providerMenu.addEventListener("click", (event) => {
    const option = event.target.closest("[data-provider-option]");
    if (option) chooseProvider(option);
  });

  providerMenu.addEventListener("keydown", (event) => {
    const current = event.target.closest("[data-provider-option]");
    if (!current) return;

    const currentIndex = providerOptions.indexOf(current);
    let nextIndex = currentIndex;

    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % providerOptions.length;
    else if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + providerOptions.length) % providerOptions.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = providerOptions.length - 1;
    else if (event.key === "Escape") {
      event.preventDefault();
      closeProviderMenu(true);
      return;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseProvider(current);
      providerTrigger.focus();
      return;
    } else {
      return;
    }

    event.preventDefault();
    providerOptions[nextIndex].focus();
  });

  document.addEventListener("click", (event) => {
    if (!providerRoot.contains(event.target) && !providerMenu.hidden) {
      closeProviderMenu(false);
    }
  });

  providerRoot.addEventListener("focusout", (event) => {
    if (!providerRoot.contains(event.relatedTarget) && !providerMenu.hidden) {
      closeProviderMenu(false);
    }
  });

  recipientSelect.addEventListener("change", () => setFeedback(""));

  function createComposeUrl(recipient, subject) {
    const params = new URLSearchParams();

    if (selectedProvider === "gmail") {
      params.set("view", "cm");
      params.set("fs", "1");
      params.set("to", recipient);
      params.set("su", subject);
      return "https://mail.google.com/mail/?" + params.toString();
    }

    if (selectedProvider === "outlook") {
      params.set("to", recipient);
      params.set("subject", subject);
      return "https://outlook.office.com/mail/deeplink/compose?" + params.toString();
    }

    if (selectedProvider === "yahoo") {
      params.set("to", recipient);
      params.set("subj", subject);
      return "https://compose.mail.yahoo.com/?" + params.toString();
    }

    return "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
  }

  composeButton.addEventListener("click", () => {
    const recipient = recipientSelect.value;
    const selectedRecipient = recipientSelect.options[recipientSelect.selectedIndex];
    const subject = selectedRecipient.dataset.subject || "Message to Luxraj Blog";
    const composeUrl = createComposeUrl(recipient, subject);

    // Open synchronously from this click so browser popup protection can recognize
    // the action as a direct user gesture. noopener/noreferrer isolate the new tab.
    window.open(composeUrl, "_blank", "noopener,noreferrer");

    if (selectedProvider === "default") {
      setFeedback("Your default email application should open. Its behaviour depends on your device's mail handler.");
    } else {
      setFeedback("Opening " + providerNames[selectedProvider] + " in a new tab. You may need to sign in.");
    }
  });
}

async function copyEmailAddress(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const temporaryInput = document.createElement("textarea");
  temporaryInput.value = value;
  temporaryInput.setAttribute("readonly", "");
  temporaryInput.setAttribute("aria-hidden", "true");
  temporaryInput.style.position = "fixed";
  temporaryInput.style.opacity = "0";
  temporaryInput.style.pointerEvents = "none";
  temporaryInput.style.left = "-9999px";
  document.body.appendChild(temporaryInput);
  temporaryInput.select();
  temporaryInput.setSelectionRange(0, temporaryInput.value.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    temporaryInput.remove();
  }
  return copied;
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-email]");
  if (!button) return;

  const email = button.dataset.copyEmail;
  const label = button.querySelector("[data-copy-label]");
  const originalLabel = label ? label.textContent : "Copy";
  button.disabled = true;

  try {
    const copied = await copyEmailAddress(email);
    if (!copied) throw new Error("The browser did not confirm the copy operation.");

    if (label) label.textContent = "Copied!";
    button.setAttribute("aria-label", "Copied " + email);
    button.classList.add("is-copied");
  } catch (error) {
    if (label) label.textContent = "Select address";
    button.setAttribute("aria-label", "Copy failed for " + email + ". Select the visible address instead.");
    const liveRegion = document.querySelector("[data-contact-feedback]");
    if (liveRegion) liveRegion.textContent = "Copying was unavailable. Select the email address and copy it manually.";
  } finally {
    button.disabled = false;
    window.setTimeout(() => {
      if (label) label.textContent = originalLabel;
      button.setAttribute("aria-label", "Copy " + email);
      button.classList.remove("is-copied");
    }, 1800);
  }
});
