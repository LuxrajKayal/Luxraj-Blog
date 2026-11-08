/**
 * Luxraj Universal Lazy Loader
 *
 * Shared loading state, delegated event triggers, caching and retry handling
 * live here. Individual feature profiles own their resources and conditions.
 */

export function createLazyLoader({ root = document } = {}) {
  const profiles = new Map();
  const states = new Map();
  const cleanupHandlers = [];
  let started = false;

  function register(profile) {
    if (!profile || typeof profile.id !== "string" || !profile.id.trim()) {
      throw new TypeError("A lazy-loading profile must have a non-empty id.");
    }
    if (profiles.has(profile.id)) {
      throw new Error('A lazy-loading profile named "' + profile.id + '" is already registered.');
    }
    if (typeof profile.load !== "function") {
      throw new TypeError('Lazy-loading profile "' + profile.id + '" must provide load().');
    }
    if (profile.trigger &&
        (profile.trigger.type !== "event" || typeof profile.trigger.selector !== "string")) {
      throw new TypeError('Profile "' + profile.id + '" has an unsupported event trigger definition.');
    }
    if (profile.attach !== undefined && typeof profile.attach !== "function") {
      throw new TypeError('Profile "' + profile.id + '" attach must be a function when supplied.');
    }

    profiles.set(profile.id, profile);
    states.set(profile.id, { status: "idle", promise: null, instance: null });
    if (started) attachProfile(profile);
    return api;
  }

  function attachProfile(profile) {
    // Custom profiles can bind conditions such as visibility while reusing
    // the same shared load and activation operations.
    if (typeof profile.attach === "function") {
      const cleanup = profile.attach({
        root,
        load: (context) => load(profile.id, context),
        activate: (trigger, event) => activate(profile.id, trigger, event)
      });
      if (typeof cleanup === "function") cleanupHandlers.push(cleanup);
      return;
    }
    if (!profile.trigger) return;

    const eventName = profile.trigger.event || "click";
    const selector = profile.trigger.selector;
    const listener = (event) => {
      const eventTarget = event.target;
      const trigger = eventTarget instanceof Element ? eventTarget.closest(selector) : null;
      if (!trigger || !root.contains(trigger)) return;

      if (eventName === "click") event.preventDefault();

      const previousAriaBusy = trigger.getAttribute("aria-busy");
      trigger.setAttribute("aria-busy", "true");
      void activate(profile.id, trigger, event)
        .catch((error) => {
          console.error('[Luxraj Lazy Loader] Failed to activate "' + profile.id + '".', error);
        })
        .finally(() => {
          if (previousAriaBusy === null) trigger.removeAttribute("aria-busy");
          else trigger.setAttribute("aria-busy", previousAriaBusy);
        });
    };

    root.addEventListener(eventName, listener);
    cleanupHandlers.push(() => root.removeEventListener(eventName, listener));
  }

  function load(profileId, context = {}) {
    const profile = profiles.get(profileId);
    const state = states.get(profileId);
    if (!profile || !state) {
      return Promise.reject(new Error('Unknown lazy-loading profile "' + profileId + '".'));
    }
    if (state.status === "loaded") return Promise.resolve(state.instance);
    if (state.promise) return state.promise;

    state.status = "loading";
    state.promise = Promise.resolve()
      .then(() => profile.load({ ...context, root }))
      .then((instance) => {
        if (instance === undefined) {
          throw new Error('Lazy-loading profile "' + profileId + '" did not return an instance.');
        }
        state.instance = instance;
        state.status = "loaded";
        return instance;
      })
      .catch((error) => {
        // Failed loads are not cached; a later trigger can retry.
        state.instance = null;
        state.status = "idle";
        throw error;
      })
      .finally(() => {
        state.promise = null;
      });

    return state.promise;
  }

  async function activate(profileId, trigger = null, event = null) {
    const profile = profiles.get(profileId);
    if (!profile) throw new Error('Unknown lazy-loading profile "' + profileId + '".');

    const instance = await load(profileId, { trigger, event });
    if (typeof profile.activate === "function") {
      await profile.activate({ instance, trigger, event, root, loader: api });
    }
    return instance;
  }

  function start() {
    if (started) return api;
    started = true;
    for (const profile of profiles.values()) attachProfile(profile);
    return api;
  }

  function getState(profileId) {
    const state = states.get(profileId);
    if (!state) return null;
    return {
      status: state.status,
      loaded: state.status === "loaded",
      loading: state.status === "loading"
    };
  }

  function destroy() {
    while (cleanupHandlers.length) {
      const cleanup = cleanupHandlers.pop();
      try {
        cleanup();
      } catch (error) {
        console.error("[Luxraj Lazy Loader] Could not remove a trigger listener.", error);
      }
    }
    started = false;
  }

  const api = { register, load, activate, start, getState, destroy };
  return api;
}
