export function initNewsletterPopup({ audioContext = null } = {}) {
  const root=document.getElementById('luxraj-newsletter');
  if(!root||root.dataset.initialized==='true')return;
  root.dataset.initialized='true';
  const get=(id)=>root.querySelector('#'+id);
  let returnFocusTarget=null,previousBodyOverflow='',closeTimer=null,patHandTimeout=null;
  let introTimer=null,introSequenceActive=false;
  let ctaHighlightTimer=null,ctaHighlightActive=false,ctaHighlightIndex=0;

/******************************************************************
     * 1. CUTE SYNTHESIZED SOUND ENGINE (Web Audio API - No External Files)
     ******************************************************************/
    class CuteSoundBox {
      constructor(audioContext = null) {
        this.enabled = true;
        this.ctx = audioContext;
      }

      init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      // Cute bubble pop
      playPop(startFreq = 420, endFreq = 780) {
        if (!this.enabled) return;
        try {
          this.init();
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(startFreq, now);
          osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.095);
        } catch (e) {}
      }

      // Cozy wooden door knock + chime when opening the House Popup
      playDoorKnock() {
        if (!this.enabled) return;
        try {
          this.init();
          [150, 175].forEach((freq, i) => {
            const now = this.ctx.currentTime + i * 0.11;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.075);
          });
          setTimeout(() => this.playPop(520, 880), 230);
        } catch (e) {}
      }

      // Cookie munch sound
      playMunch() {
        if (!this.enabled) return;
        try {
          this.init();
          [260, 340, 290].forEach((freq, i) => {
            const now = this.ctx.currentTime + i * 0.09;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.06);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.075);
          });
        } catch (e) {}
      }

      // A soft, flute-like cottage serenade
      playFlute() {
        if (!this.enabled) return;
        try {
          this.init();
          const notes = [659.25, 783.99, 880, 783.99];
          notes.forEach((freq, i) => {
            const now = this.ctx.currentTime + i * 0.16;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.045, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.155);
          });
        } catch (e) {}
      }

      // Happy Victory Chime
      playVictory() {
        if (!this.enabled) return;
        try {
          this.init();
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, i) => {
            const now = this.ctx.currentTime + i * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.13, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.32);
          });
        } catch (e) {}
      }
    }

    const sound = new CuteSoundBox(audioContext);

    /******************************************************************
     * 2. BREVO CONFIGURATION & GAME STATE ("LUXY")
     ******************************************************************/
    // Newsletter submissions are sent to Brevo; a confirmed return will trigger the celebration.

    let charmScore = 20;
    let begStage = 0;
    let cookiesFed = 0;
    let headPats = 0;
    let isSubscribed = false;
    let isHouseOpen = false;
    const unlockedStickers = new Set();

    const BEGGING_MOVES = [
      {
        headline: "Move 1: Luxy's Giant Shimmering Puppy Eyes",
        speech: '"Look at these giant watery eyes in my cottage window! I practiced in the mirror for 3 hours just for you!"',
        btnLabel: "Okay, Those Eyes Worked!",
        charmBonus: 15
      },
      {
        headline: "Move 2: The Hand-Drawn Cardboard Sign",
        speech: '"I made this sign out of a cereal box! Will trade our best visual explanations for 1 cozy email!"',
        btnLabel: "Accept Luxy's Trade!",
        charmBonus: 15
      },
      {
        headline: "Move 3: A Little Cottage Serenade",
        speech: "“♪ ♫ Playing a tiny, sweet serenade from my cottage window... can you hear my dedication? ♪”",
        btnLabel: "Bravo! Sign Me Up!",
        charmBonus: 15
      },
      {
        headline: "Move 4: Bribing You With Barnaby the Frog",
        speech: '"Okay, what if I invite my roommate Barnaby the polite wizard frog? He loves engineering discoveries!"',
        btnLabel: "Do It For Barnaby!",
        charmBonus: 15
      },
      {
        headline: "Move 5: The Royal Oath Form",
        speech: "“The Royal Oath Form is ready! This way, please! 👑”",
        btnLabel: "Claim My Royal Spot!",
        charmBonus: 15
      },
      {
        headline: "Move 6: The Dramatic Flop",
        speech: "“*FLOP* Okay, I am officially out of moves on my cottage floor... please just one tiny click? 🥺👉👈”",
        btnLabel: "Cheer Luxy Up & Join!",
        charmBonus: 20
      }
    ];

    // Friendly idle tour. Any real visitor interaction hands the bubble back to the game.
    const INTRO_MESSAGES = [
      "Hiii! I'm Luxy! Welcome to my wittle Mail Cottage! 🥰",
      "Not convinced by my cuteness? Tap 'Convince Me Harder'! I dare ya! 🥺",
      "Feed me a cookie, pwees! 🍪 Technology blessings coming right up!",
      "Pwees pat my wittle head! It makes this mail buddy super-duper happy!",
      "Pssst... I saw you sneaky-peeking at the Shubshribe! button! 👀💌"
    ];

    const COOKIE_QUIPS = [
      '"NOM NOM NOM! 🍪 Oh!! Warm chocolate chip! Welcome to my cottage forever!"',
      '"CRUNCH CRUNCH! 🍪 That was delicious! Wait until you see the visual explanations we’re baking!"',
      '"YUM!! 🍪 Luxy is now 80% cookie and 20% excitement to be your pen-pal!"',
      '"MUNCH! 🍪 You spoil me! I promise our Luxraj.com dispatches are just as sweet as this cookie!"'
    ];

    const PAT_QUIPS = [
      '"*Happy squishy purring noises* 🥰 That’s the best head pat in the whole neighborhood!"',
      '"Hehe! 🖐️ My LUXY postman cap almost wiggled off! Thank you!"',
      '"Boi-oi-oing! 💖 Head pats give me +100 energy to deliver engineering discoveries!"',
      '"Aww yiss! ✨ You’re officially my favorite cottage guest today!"'
    ];

    /******************************************************************
     * 3. DOM ELEMENTS
     ******************************************************************/
    const housePopupBackdrop = get('house-popup-backdrop');
    const houseModalCard = get('house-modal-card');
    const closeHousePopupBtn = get('close-house-popup-btn');

    const mainHeadline = get('main-headline');
    const charmStatusLabel = get('charm-status-label');
    const charmPercentBadge = get('charm-percent-badge');
    const charmBarFill = get('charm-bar-fill');

    const characterStage = get('character-stage');
    const floatingFxLayer = get('floating-fx-layer');
    const speechBubble = get('speech-bubble');
    const speechText = get('speech-text');

    const luxySvg = get('luxy-svg');
    const luxyEyesTrack = get('luxy-eyes-track');
    const luxyMouth = get('luxy-mouth');
    const puppyEyeLeft = get('puppy-eye-left');
    const puppyEyeRight = get('puppy-eye-right');
    const starEyeLeft = get('star-eye-left');
    const starEyeRight = get('star-eye-right');

    // Right-side companion area: one companion is visible for each move.
    const companionProps = [
      'prop-mirror',
      'prop-cardboard-sign',
      'prop-flute',
      'prop-frog',
      'prop-arrow',
      'prop-anvil'
    ].map(get).filter(Boolean);
    const propSadSign = get('prop-sad-sign');
    const propBestiesBanner = get('prop-besties-banner');
    const inputVipCrown = get('input-vip-crown');
    const vipCarpetBadge = get('vip-carpet-badge');

    const patHandEl = get('pat-hand-el');
    const flyingCookieEl = get('flying-cookie-el');

    // Buttons & Counters
    const btnBegHarder = get('btn-beg-harder');
    const btnCookie = get('btn-cookie');
    const btnPat = get('btn-pat');
    const submitButton = get('submit-btn');
    const begStepCounter = get('beg-step-counter');
    const cookieCounter = get('cookie-counter');
    const patCounter = get('pat-counter');

    // Form Elements
    const emailInput = get('EMAIL');
    const optInInput = get('OPT_IN');
    const consentErrorMsg = get('newsletter-consent-error');
    const emailEmojiStatus = get('email-emoji-status');
    const submitBtnLabel = get('submit-btn-label');
    const subscribeForm = get('sib-form');
    const emailErrorMsg = get('email-error-msg');

    // Brevo redirects successful submissions to the standalone broadcaster page.
    let brevoSubmissionPending = false;
    let brevoPendingTimeout = null;
    const newsletterChannel = typeof BroadcastChannel === 'function'
      ? new BroadcastChannel('luxraj-newsletter')
      : null;

    if (newsletterChannel) {
      newsletterChannel.addEventListener('message', (event) => {
        const message = event.data || {};
        if (message.type !== 'BREVO_SUBSCRIPTION_SUCCESS' || !brevoSubmissionPending) return;

        brevoSubmissionPending = false;
        window.clearTimeout(brevoPendingTimeout);

        // Reopen the cottage if the visitor closed it while Brevo was processing.
        if (!isHouseOpen) {
          openHousePopup(document.activeElement, { celebration: true });
        }
        showSubscriptionCelebration();

        newsletterChannel.postMessage({
          type: 'BREVO_SUCCESS_ACK',
          id: message.id
        });
      });
    }

    /******************************************************************
     * 4. HOUSE POPUP OPEN / CLOSE LOGIC
     ******************************************************************/
    function openHousePopup(trigger = document.activeElement, { celebration = false } = {}) {
      if (isHouseOpen) return;
      isHouseOpen = true;
      stopCtaHighlightCycle();
      returnFocusTarget = trigger instanceof HTMLElement ? trigger : document.activeElement;
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      housePopupBackdrop.classList.remove('hidden');
      if (!celebration) startIntroSequence();
      requestAnimationFrame(() => { houseModalCard.classList.remove('house-modal-hidden'); houseModalCard.classList.add('house-modal-visible'); });
      sound.playDoorKnock();
      window.setTimeout(() => { if (!isSubscribed) triggerSquishAnimation(); spawnFloatingEmojis(['🏠','💖','✨'],4); closeHousePopupBtn.focus(); },220);
    }
    function closeHousePopup() {
      if (!isHouseOpen) return;
      isHouseOpen = false;
      stopIntroSequence();
      stopCtaHighlightCycle();
      resetLuxyEyes();
      sound.playPop(520,300);
      houseModalCard.classList.remove('house-modal-visible'); houseModalCard.classList.add('house-modal-hidden');
      window.clearTimeout(closeTimer);
      closeTimer=window.setTimeout(()=>{
        if(isHouseOpen)return;
        housePopupBackdrop.classList.add('hidden'); document.body.style.overflow=previousBodyOverflow;
        if(returnFocusTarget&&document.contains(returnFocusTarget))returnFocusTarget.focus();
        returnFocusTarget=null;
      },300);
    }
    closeHousePopupBtn.addEventListener('click',closeHousePopup);

    // The first visitor input stops the idle tour before any feature dialogue can update the bubble.
    houseModalCard.addEventListener('pointerdown', stopIntroSequence, true);
    houseModalCard.addEventListener('click', stopIntroSequence, true);
    houseModalCard.addEventListener('keydown', stopIntroSequence, true);

    // Close when clicking backdrop outside the house
    housePopupBackdrop.addEventListener('click', (e) => {
      if (e.target === housePopupBackdrop) {
        closeHousePopup();
      }
    });

    document.addEventListener('keydown',(event)=>{
      if(!isHouseOpen)return;
      if(event.key==='Escape'){event.preventDefault();closeHousePopup();return;}
      if(event.key!=='Tab')return;
      const focusable=Array.from(houseModalCard.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(el=>!el.closest('.hidden')&&el.getAttribute('aria-hidden')!=='true');
      if(!focusable.length){event.preventDefault();closeHousePopupBtn.focus();return;}
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
    /******************************************************************
     * 5. HELPER FUNCTIONS: FLOATING EMOJIS, CHARM METER & STICKERS
     ******************************************************************/
    function spawnFloatingEmojis(emojis = ['💖', '✨'], count = 4) {
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.textContent = emojis[i % emojis.length];
        el.className = 'newsletter-floating-emoji';
        const leftPct = 28 + Math.random() * 44;
        const topPct = 35 + Math.random() * 25;
        el.style.left = `${leftPct}%`;
        el.style.top = `${topPct}%`;
        el.style.animation = `floatUpFade ${0.75 + Math.random() * 0.4}s ease-out forwards`;
        floatingFxLayer.appendChild(el);
        setTimeout(() => el.remove(), 1200);
      }
    }

    function triggerSquishAnimation() {
      if (begStage === 6 && !isSubscribed) return;
      luxySvg.classList.remove('luxy-idle', 'luxy-squish');
      void luxySvg.offsetWidth;
      luxySvg.classList.add('luxy-squish');
      setTimeout(() => {
        if (!isSubscribed && begStage !== 6) {
          luxySvg.classList.remove('luxy-squish');
          luxySvg.classList.add('luxy-idle');
        }
      }, 560);
    }

    function updateSpeech(text) {
      speechText.textContent = text;
      speechBubble.style.transform = 'scale(1.04)';
      setTimeout(() => {
        speechBubble.style.transform = 'scale(1)';
      }, 160);
    }

    function stopIntroSequence() {
      introSequenceActive = false;
      if (introTimer !== null) {
        window.clearTimeout(introTimer);
        introTimer = null;
      }
    }

    function stopCtaHighlightCycle() {
      ctaHighlightActive = false;
      if (ctaHighlightTimer !== null) {
        window.clearTimeout(ctaHighlightTimer);
        ctaHighlightTimer = null;
      }
      btnBegHarder.classList.remove('newsletter-cta-attention');
      submitButton.classList.remove('newsletter-cta-attention');
    }

    function showNextCtaHighlight() {
      if (!ctaHighlightActive || !isHouseOpen) return;

      btnBegHarder.classList.remove('newsletter-cta-attention');
      submitButton.classList.remove('newsletter-cta-attention');

      const target = ctaHighlightIndex === 0 ? btnBegHarder : submitButton;
      target.classList.add('newsletter-cta-attention');
      ctaHighlightIndex = (ctaHighlightIndex + 1) % 2;
      ctaHighlightTimer = window.setTimeout(showNextCtaHighlight, 2400);
    }

    function startCtaHighlightCycle() {
      stopCtaHighlightCycle();
      if (!isHouseOpen) return;
      ctaHighlightActive = true;
      // The final intro line points to Shubshribe!, so spotlight it first.
      ctaHighlightIndex = 1;
      showNextCtaHighlight();
    }

    function startIntroSequence() {
      stopIntroSequence();
      stopCtaHighlightCycle();
      if (!isHouseOpen) return;

      introSequenceActive = true;
      let messageIndex = 0;
      updateSpeech(INTRO_MESSAGES[messageIndex]);

      const showNextMessage = () => {
        if (!introSequenceActive || !isHouseOpen) return;

        messageIndex += 1;
        if (messageIndex >= INTRO_MESSAGES.length) {
          introSequenceActive = false;
          introTimer = null;
          return;
        }

        updateSpeech(INTRO_MESSAGES[messageIndex]);

        // Spotlight Shubshribe! as soon as Luxy says the final intro line.
        if (messageIndex === INTRO_MESSAGES.length - 1) {
          introSequenceActive = false;
          introTimer = null;
          startCtaHighlightCycle();
          return;
        }

        introTimer = window.setTimeout(showNextMessage, 4000);
      };

      introTimer = window.setTimeout(showNextMessage, 4000);
    }

    function addCharm(amount) {
      charmScore = Math.min(100, charmScore + amount);
      charmPercentBadge.textContent = `${charmScore}%`;
      charmBarFill.style.width = `${charmScore}%`;

      if (charmScore < 45) {
        charmStatusLabel.textContent = "Luxy's Charm Effort: Trying Hard!";
      } else if (charmScore < 75) {
        charmStatusLabel.textContent = "Luxy's Charm Effort: Super Earnest!";
      } else if (charmScore < 100) {
        charmStatusLabel.textContent = "Luxy's Charm Effort: Irresistible!!";
      } else {
        charmStatusLabel.textContent = "MAX CHARM REACHED! Official Housemates!";
      }
    }

    function unlockSticker(id) {
      if (unlockedStickers.has(id)) return;
      unlockedStickers.add(id);
      const el = get(id);
      if (el) {
        el.classList.remove('sticker-locked');
        el.classList.add('sticker-unlocked', 'sticker-pop');
      }
      get('sticker-count-label').textContent = `${unlockedStickers.size} / 6 Unlocked`;
    }

    function showCompanion(propId) {
      companionProps.forEach((prop) => {
        prop.classList.remove('active');
        prop.setAttribute('aria-hidden', 'true');
      });

      const nextProp = propId ? get(propId) : null;
      if (nextProp) {
        nextProp.setAttribute('aria-hidden', 'false');
        nextProp.classList.add('active');
      }

    }

    /******************************************************************
     * 6. BUTTON 1: "CONVINCE ME HARDER" (6 ESCALATING CUTE STAGES)
     ******************************************************************/
    function advanceBeggingMove() {
      const moveIndex = begStage % BEGGING_MOVES.length;
      begStage = moveIndex + 1;
      const move = BEGGING_MOVES[moveIndex];

      begStepCounter.textContent = `Move ${begStage}/6`;
      mainHeadline.textContent = move.headline;
      updateSpeech(move.speech);
      if (!isSubscribed) {
        submitBtnLabel.textContent = move.btnLabel;
      }

      addCharm(move.charmBonus);
      unlockSticker('sticker-puppy');

      // Replace the current companion; Move 0 remains empty until this is clicked.
      showCompanion(null);
      propSadSign.setAttribute('opacity', '0');
      luxySvg.classList.remove('luxy-flop');

      if (begStage === 1) {
        sound.playPop(480, 880);
        showCompanion('prop-mirror');
        puppyEyeLeft.setAttribute('opacity', '1');
        puppyEyeRight.setAttribute('opacity', '1');
        luxyMouth.setAttribute('d', 'M 122 128 Q 130 122 138 128');
        triggerSquishAnimation();
        spawnFloatingEmojis(['🥺', '💧', '✨'], 5);
      } else if (begStage === 2) {
        sound.playPop(520, 760);
        showCompanion('prop-cardboard-sign');
        triggerSquishAnimation();
        spawnFloatingEmojis(['📦', '💌', '✨'], 5);
      } else if (begStage === 3) {
        sound.playFlute();
        showCompanion('prop-flute');
        luxyMouth.setAttribute('d', 'M 122 129 Q 130 120 138 129');
        triggerSquishAnimation();
        spawnFloatingEmojis(['🎶', '🎵', '✨'], 6);
      } else if (begStage === 4) {
        sound.playPop(350, 690);
        showCompanion('prop-frog');
        unlockSticker('sticker-frog');
        luxyMouth.setAttribute('d', 'M 118 124 Q 124 132 130 124 Q 136 132 142 124');
        triggerSquishAnimation();
        spawnFloatingEmojis(['🐸', '🪄', '✨'], 6);
      } else if (begStage === 5) {
        sound.playVictory();
        showCompanion('prop-arrow');
        inputVipCrown.classList.remove('hidden');
        vipCarpetBadge.classList.remove('hidden');
        unlockSticker('sticker-crown');
        triggerSquishAnimation();
        spawnFloatingEmojis(['👑', '✨', '💎'], 6);
      } else if (begStage === 6) {
        sound.playPop(600, 240);
        showCompanion('prop-anvil');
        luxySvg.classList.remove('luxy-idle', 'luxy-squish');
        luxySvg.classList.add('luxy-flop');
        spawnFloatingEmojis(['⚒️', '🥺', '👉👈'], 6);
      }
    }

    // Either highlighted CTA being used ends the attention cycle for this popup visit.
    [btnBegHarder, submitButton].forEach((button) => {
      button.addEventListener('pointerdown', stopCtaHighlightCycle);
      button.addEventListener('click', stopCtaHighlightCycle);
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') stopCtaHighlightCycle();
      });
      button.addEventListener('focus', stopCtaHighlightCycle);
    });

    btnBegHarder.addEventListener('click', advanceBeggingMove);

    // The speech message advances the same sequence; prevent a click-through head-pat.
    speechBubble.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      advanceBeggingMove();
    });

    speechBubble.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      advanceBeggingMove();
    });
    /******************************************************************
     * 7. BUTTON 2: "GIVE LUXY A COOKIE"
     ******************************************************************/
    btnCookie.addEventListener('click', () => {
      cookiesFed++;
      cookieCounter.textContent = `${cookiesFed} Fed`;
      sound.playMunch();
      addCharm(12);
      unlockSticker('sticker-cookie');

      if (begStage === 6 && !isSubscribed) {
        luxySvg.classList.remove('luxy-flop');
      }

      flyingCookieEl.classList.remove('hidden');
      flyingCookieEl.style.animation = 'none';
      void flyingCookieEl.offsetWidth;
      flyingCookieEl.style.animation = 'cookieArc 0.55s ease-in-out forwards';

      luxyMouth.setAttribute('d', 'M 122 122 A 8 8 0 1 0 138 122 A 8 8 0 1 0 122 122');
      setTimeout(() => {
        triggerSquishAnimation();
        luxyMouth.setAttribute('d', 'M 116 122 Q 130 138 144 122');
        spawnFloatingEmojis(['🍪', '💖', '✨', '😋'], 6);
        updateSpeech(COOKIE_QUIPS[(cookiesFed - 1) % COOKIE_QUIPS.length]);
      }, 420);
    });

    /******************************************************************
     * 8. BUTTON 3: "PAT LUXY'S HEAD" & WINDOW CLICK
     ******************************************************************/
    function performHeadPat() {
      headPats++;
      patCounter.textContent = `${headPats} Pats`;
      sound.playPop(540, 920);
      addCharm(10);
      unlockSticker('sticker-pat');

      if (begStage === 6 && !isSubscribed) {
        luxySvg.classList.remove('luxy-flop');
      }

      patHandEl.classList.remove('hidden');
      triggerSquishAnimation();
      luxyMouth.setAttribute('d', 'M 118 124 Q 124 132 130 124 Q 136 132 142 124');
      spawnFloatingEmojis(['💖', '🌸', '✨'], 5);
      updateSpeech(PAT_QUIPS[(headPats - 1) % PAT_QUIPS.length]);

      clearTimeout(patHandTimeout);
      patHandTimeout = setTimeout(() => {
        patHandEl.classList.add('hidden');
      }, 950);
    }

    btnPat.addEventListener('click', performHeadPat);
    characterStage.addEventListener('click', performHeadPat);

    /******************************************************************
     * 9. RESPONSIVE EYE TRACKING & EMAIL INPUT LIVE REACTIONS
     ******************************************************************/
    let eyeTargetX = 0;
    let eyeTargetY = 0;
    let eyeCurrentX = 0;
    let eyeCurrentY = 0;
    let eyeAnimationFrame = 0;
    let activeTouchPointerId = null;

    const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
    const houseScroll = root.querySelector('.house-scroll');

    function animateEyeTracking() {
      // Faster easing is limited to coarse-pointer devices; desktop stays at 0.28.
      const easing = coarsePointerQuery.matches ? 0.42 : 0.28;
      eyeCurrentX += (eyeTargetX - eyeCurrentX) * easing;
      eyeCurrentY += (eyeTargetY - eyeCurrentY) * easing;

      luxyEyesTrack.setAttribute(
        'transform',
        `translate(${eyeCurrentX.toFixed(2)}, ${eyeCurrentY.toFixed(2)})`
      );

      if (Math.abs(eyeTargetX - eyeCurrentX) > 0.03 || Math.abs(eyeTargetY - eyeCurrentY) > 0.03) {
        eyeAnimationFrame = window.requestAnimationFrame(animateEyeTracking);
      } else {
        eyeCurrentX = eyeTargetX;
        eyeCurrentY = eyeTargetY;
        luxyEyesTrack.setAttribute(
          'transform',
          `translate(${eyeCurrentX.toFixed(2)}, ${eyeCurrentY.toFixed(2)})`
        );
        eyeAnimationFrame = 0;
      }
    }

    function setEyeTarget(x, y) {
      eyeTargetX = x;
      eyeTargetY = y;

      if (!eyeAnimationFrame) {
        eyeAnimationFrame = window.requestAnimationFrame(animateEyeTracking);
      }
    }

    function getEyeVector(clientX, clientY) {
      const rect = luxySvg.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;

      return {
        x: (clientX - (rect.left + rect.width / 2)) * (260 / rect.width),
        y: (clientY - (rect.top + rect.height / 2)) * (220 / rect.height)
      };
    }

    /*
     * Phone gaze: Luxy looks towards the centre of the visible screen.
     * As the reader scrolls the cottage interior, the screen centre stays
     * fixed while Luxy's position changes, so its gaze follows the reader.
     */
    function updateReaderAwareGaze() {
      if (!isHouseOpen || !coarsePointerQuery.matches || !luxySvg || !luxyEyesTrack) return;

      const viewport = window.visualViewport;
      const screenCenterX = viewport
        ? viewport.offsetLeft + viewport.width / 2
        : window.innerWidth / 2;
      const screenCenterY = viewport
        ? viewport.offsetTop + viewport.height / 2
        : window.innerHeight / 2;

      const vector = getEyeVector(screenCenterX, screenCenterY);
      if (!vector) return;

      const distance = Math.hypot(vector.x, vector.y);
      const deadZone = 2;
      if (distance <= deadZone) {
        setEyeTarget(0, 0);
        return;
      }

      // Gradually strengthen the gaze as Luxy moves farther from screen centre.
      const strength = Math.min(6, (distance - deadZone) / 8);
      setEyeTarget(
        (vector.x / distance) * strength,
        (vector.y / distance) * strength
      );
    }

    /*
     * Other touch targets can draw Luxy's attention fully in their direction.
     * The three game buttons and Luxy's own interaction stage are excluded:
     * during those moments Luxy keeps looking towards the reader.
     */
    function moveTouchGaze(event) {
      if (activeTouchPointerId !== event.pointerId) return;

      const vector = getEyeVector(event.clientX, event.clientY);
      if (!vector) return;

      const distance = Math.hypot(vector.x, vector.y);
      if (distance < 7) {
        updateReaderAwareGaze();
        return;
      }

      const fullMovement = 6;
      setEyeTarget(
        (vector.x / distance) * fullMovement,
        (vector.y / distance) * fullMovement
      );
    }

    function startTouchGaze(event) {
      if (event.pointerType !== 'touch' || !event.isPrimary || !isHouseOpen) return;

      const target = event.target instanceof Element ? event.target : null;
      const readerFocusTarget = target?.closest(
        '#btn-beg-harder, #btn-cookie, #btn-pat, #character-stage'
      );

      if (readerFocusTarget) {
        activeTouchPointerId = null;
        updateReaderAwareGaze();
        return;
      }

      activeTouchPointerId = event.pointerId;
      moveTouchGaze(event);
    }

    function endTouchGaze(event) {
      if (event.pointerType !== 'touch') return;
      if (activeTouchPointerId !== null && activeTouchPointerId !== event.pointerId) return;

      activeTouchPointerId = null;

      // Return to reader-aware gaze, never to an arbitrary fixed resting point.
      if (isHouseOpen) updateReaderAwareGaze();
      else setEyeTarget(0, 0);
    }

    function moveLuxyEyes(event) {
      if (!isHouseOpen || !luxySvg || !luxyEyesTrack) return;
      if (event.pointerType === 'touch' && !event.isPrimary) return;

      if (event.pointerType === 'touch') {
        if (activeTouchPointerId === event.pointerId) {
          moveTouchGaze(event);
        } else {
          updateReaderAwareGaze();
        }
        return;
      }

      // Coarse-pointer devices use screen-centre gaze, not desktop cursor tracking.
      if (coarsePointerQuery.matches) {
        updateReaderAwareGaze();
        return;
      }

      // Desktop behaviour remains distance-based mouse tracking.
      const vector = getEyeVector(event.clientX, event.clientY);
      if (!vector) return;
      const angle = Math.atan2(vector.y, vector.x);
      const distance = Math.min(6, Math.hypot(vector.x, vector.y) / 40);
      setEyeTarget(Math.cos(angle) * distance, Math.sin(angle) * distance);
    }

    function handlePointerDown(event) {
      if (event.pointerType === 'touch') {
        startTouchGaze(event);
      } else {
        moveLuxyEyes(event);
      }
    }

    function resetLuxyEyes(event) {
      if (event?.pointerType && event.pointerType !== 'touch') return;

      activeTouchPointerId = null;
      if (isHouseOpen && coarsePointerQuery.matches) {
        updateReaderAwareGaze();
      } else {
        setEyeTarget(0, 0);
      }
    }

    function handleHouseScroll() {
      // A real scroll gesture switches from finger attention to reader attention.
      if (activeTouchPointerId !== null) activeTouchPointerId = null;
      updateReaderAwareGaze();
    }

    window.addEventListener('pointermove', moveLuxyEyes, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', endTouchGaze, { passive: true });
    window.addEventListener('pointercancel', endTouchGaze, { passive: true });
    window.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'touch') resetLuxyEyes();
    }, { passive: true });
    window.addEventListener('blur', resetLuxyEyes);
    window.addEventListener('resize', updateReaderAwareGaze, { passive: true });

    if (houseScroll) {
      houseScroll.addEventListener('scroll', handleHouseScroll, { passive: true });
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateReaderAwareGaze, { passive: true });
      window.visualViewport.addEventListener('scroll', updateReaderAwareGaze, { passive: true });
    }

    houseModalCard.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'transform') updateReaderAwareGaze();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) resetLuxyEyes();
    });

    emailInput.addEventListener('focus', () => {
      sound.playPop(600, 820);
      if (begStage === 6 && !isSubscribed) {
        luxySvg.classList.remove('luxy-flop');
      }
      updateSpeech('"Ooh!! You touched the brass mail slot! *Luxy peeks out the cottage window excitedly*"');
    });

    emailInput.addEventListener('input', (e) => {
      stopIntroSequence();
      const val = e.target.value.trim();
      emailErrorMsg.classList.add('hidden');
      sound.playPop(700, 860);

      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
      if (val.length === 0) {
        emailEmojiStatus.textContent = '✉️';
        starEyeLeft.setAttribute('opacity', '0');
        starEyeRight.setAttribute('opacity', '0');
      } else if (!isValid) {
        emailEmojiStatus.textContent = '👀';
        starEyeLeft.setAttribute('opacity', '0');
        starEyeRight.setAttribute('opacity', '0');
        updateSpeech('"Tap tap tap! That email is looking super cozy in the mail slot..."');
      } else {
        emailEmojiStatus.textContent = '🤩';
        starEyeLeft.setAttribute('opacity', '1');
        starEyeRight.setAttribute('opacity', '1');
        puppyEyeLeft.setAttribute('opacity', '0');
        puppyEyeRight.setAttribute('opacity', '0');
        updateSpeech('"GASP!! 🤩 That is a 10/10 valid email! Push it through the mail slot!"');
        spawnFloatingEmojis(['✨', '🤩'], 3);
      }
    });

    /******************************************************************
     * 10. BREVO (SENDINBLUE) SUBMISSION & VIP HOUSE KEY REWARD
     ******************************************************************/
    subscribeForm.addEventListener('submit',(e)=>{
      const val=emailInput.value.trim();
      const valid=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);

      if(!valid){
        e.preventDefault();
        sound.playPop(300,180);
        emailErrorMsg.textContent="🥺 Oops! Luxy needs a real email with an '@' and domain (like you@example.com)!";
        emailErrorMsg.classList.remove('hidden');
        emailInput.focus();
        return;
      }

      emailInput.value=val;
      emailErrorMsg.classList.add('hidden');
      consentErrorMsg.classList.add('hidden');

      // The Brevo success callback is expected in a second tab.
      brevoSubmissionPending = true;
      window.clearTimeout(brevoPendingTimeout);
      brevoPendingTimeout = window.setTimeout(() => {
        brevoSubmissionPending = false;
      }, 120000);
      // The native form POST remains responsible for sending the subscription to Brevo.
    });

    emailInput.addEventListener('invalid',()=>{
      emailErrorMsg.textContent='Please enter your email address before subscribing.';
      emailErrorMsg.classList.remove('hidden');
    });

    optInInput.addEventListener('invalid',()=>{
      consentErrorMsg.classList.remove('hidden');
      optInInput.setAttribute('aria-invalid','true');
    });

    optInInput.addEventListener('change',()=>{
      if(optInInput.checked){
        consentErrorMsg.classList.add('hidden');
        optInInput.removeAttribute('aria-invalid');
      }
    });
    // Reset Game Button
    get('reset-game-btn').addEventListener('click', () => {
      isSubscribed = false;
      begStage = 0;
      showCompanion(null);
      emailInput.value = '';
      optInInput.checked = false;
      consentErrorMsg.classList.add('hidden');
      optInInput.removeAttribute('aria-invalid');
      emailErrorMsg.classList.add('hidden');
      emailEmojiStatus.textContent = '✉️';
      propBestiesBanner.setAttribute('opacity', '0');
      starEyeLeft.setAttribute('opacity', '0');
      starEyeRight.setAttribute('opacity', '0');
      luxySvg.classList.remove('luxy-happy', 'luxy-flop');
      luxySvg.classList.add('luxy-idle');
      inputVipCrown.classList.add('hidden');
      vipCarpetBadge.classList.add('hidden');
      subscribeForm.classList.remove('hidden');
      get('vip-membership-card').classList.add('hidden');
      mainHeadline.textContent = "Welcome inside! Can we be inbox friends?";
      updateSpeech('"Ready for round two! Click any button below to play with Luxy!"');
      submitBtnLabel.textContent = "Shubshribe!";
      get('submit-btn').disabled = false;
    });

    // The whole porch footer is Luxy's playful "please don't leave" interaction area.
    const noThanksLink = get('no-thanks-link');
    const porchFooter = root.querySelector('.porch-footer');
    const rssBox = get('rss-box');
    const porchWarningSpeech = '"Wait! Don\'t go there! Luxy will be scared all alone in this lonely house! Try giving me 1 cookie first!?"';
    let porchTouchTimeout = null;
    let porchPreviousTouchSpeech = null;

    function showPorchWarning({ temporary = false } = {}) {
      stopIntroSequence();
      if (isSubscribed) return;

      if (temporary) {
        window.clearTimeout(porchTouchTimeout);
        if (speechText.textContent !== porchWarningSpeech) {
          porchPreviousTouchSpeech = speechText.textContent;
        }
      }

      sound.playPop(500, 320);
      puppyEyeLeft.setAttribute('opacity', '1');
      puppyEyeRight.setAttribute('opacity', '1');
      propSadSign.setAttribute('opacity', '1');
      luxyMouth.setAttribute('d', 'M 120 130 Q 130 120 140 130');
      updateSpeech(porchWarningSpeech);

      // Touch devices have no hover state, so let the porch reaction fade naturally.
      if (temporary) {
        porchTouchTimeout = window.setTimeout(() => {
          if (speechText.textContent === porchWarningSpeech && porchPreviousTouchSpeech !== null) {
            updateSpeech(porchPreviousTouchSpeech);
          }
          propSadSign.setAttribute('opacity', '0');
          porchTouchTimeout = null;
          porchPreviousTouchSpeech = null;
        }, 3200);
      }
    }

    // Desktop: hovering anywhere inside the porch footer triggers Luxy's reaction.
    porchFooter.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch') return;
      showPorchWarning();
    });

    porchFooter.addEventListener('pointerleave', () => {
      propSadSign.setAttribute('opacity', '0');
    });

    // Mobile: touching the porch area triggers the same reaction briefly.
    // The actual "No thanks" button is excluded so its RSS action remains unchanged.
    porchFooter.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch') return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('#no-thanks-link')) return;
      showPorchWarning({ temporary: true });
    }, { passive: true });

    noThanksLink.addEventListener('click', () => {
      window.clearTimeout(porchTouchTimeout);
      porchTouchTimeout = null;
      porchPreviousTouchSpeech = null;
      sound.playPop(380, 240);
      rssBox.classList.remove('hidden');
      updateSpeech('"Aw okay! I left our RSS feed link on the porch below in case you want to read anonymously!"');
    });

    /******************************************************************
     * 11. SOUND TOGGLE, CLIPBOARD & BREVO CONFIG MODAL
     ******************************************************************/
    const soundBtn = get('sound-btn');
    soundBtn.addEventListener('click', () => {
      sound.enabled = !sound.enabled;
      get('sound-emoji').textContent = sound.enabled ? '🔊' : '🔇';
      get('sound-text').textContent = sound.enabled ? 'Sound On' : 'Muted';
      if (sound.enabled) sound.playPop();
    });

    function copyToClipboard(text, onDone) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        if (onDone) onDone();
      } catch (e) {}
      document.body.removeChild(ta);
    }

    get('copy-rss-btn').addEventListener('click', (e) => {
      copyToClipboard('https://luxraj.com/rss.xml', () => {
        e.target.textContent = 'Copied! ✅';
        setTimeout(() => { e.target.textContent = 'Copy RSS Link 📋'; }, 2000);
      });
    });

    /******************************************************************
     * 12. CONFETTI CANNON
     ******************************************************************/
    const confettiCanvas = get('confetti-canvas');
    const cCtx = confettiCanvas.getContext('2d');
    let confettiPieces = [];
    let confettiFrame = null;

    function resizeConfetti() {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }

    function launchConfetti(){
      const colors=['#FF7EB6','#FFD166','#06D6A0','#38BDF8','#E05A47'];
      for(let i=0;i<80;i++)confettiPieces.push({x:window.innerWidth/2,y:window.innerHeight*.45,vx:(Math.random()-.5)*16,vy:-Math.random()*14-4,size:7+Math.random()*6,color:colors[i%colors.length],rot:Math.random()*6.28,vRot:(Math.random()-.5)*.25,life:1});
      if(!confettiFrame)confettiFrame=window.requestAnimationFrame(renderConfetti);
    }
    function renderConfetti(){
      cCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
      for(let i=confettiPieces.length-1;i>=0;i--){const p=confettiPieces[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.32;p.rot+=p.vRot;p.life-=.014;if(p.life<=0){confettiPieces.splice(i,1);continue;}cCtx.save();cCtx.translate(p.x,p.y);cCtx.rotate(p.rot);cCtx.globalAlpha=Math.max(0,p.life);cCtx.fillStyle=p.color;cCtx.fillRect(-p.size/2,-p.size/2,p.size,p.size);cCtx.restore();}
      if(confettiPieces.length)confettiFrame=window.requestAnimationFrame(renderConfetti);else confettiFrame=null;
    }
    function showSubscriptionCelebration() {
      if (isSubscribed) return;

      stopIntroSequence();
      stopCtaHighlightCycle();
      isSubscribed = true;

      addCharm(100);
      unlockSticker('sticker-bestie');

      luxySvg.classList.remove('luxy-idle', 'luxy-squish', 'luxy-flop');
      luxySvg.classList.add('luxy-happy');
      showCompanion(null);
      propSadSign.setAttribute('opacity', '0');
      propBestiesBanner.setAttribute('opacity', '1');
      starEyeLeft.setAttribute('opacity', '1');
      starEyeRight.setAttribute('opacity', '1');

      mainHeadline.textContent = "YAY!! You're officially a Luxraj Blog housemate!";
      updateSpeech('"Hooray!! Your place in my Mail Cottage is saved. I can’t wait to send you our next little delivery! 💖"');

      get('vip-member-email').textContent = 'You';
      get('vip-stats-line').textContent = 'Your place at the Mail Cottage is saved!';
      get('vip-membership-card').classList.remove('hidden');
      get('rss-box').classList.add('hidden');
      subscribeForm.classList.add('hidden');
      inputVipCrown.classList.remove('hidden');
      vipCarpetBadge.classList.remove('hidden');
      submitButton.disabled = true;

      sound.playVictory();
      spawnFloatingEmojis(['💖', '👑', '✨', '🎉'], 12);
      launchConfetti();
    }

    window.addEventListener('resize',resizeConfetti);
    resizeConfetti();

    // The universal lazy loader opens and closes the existing newsletter UI.
    return {
      open: openHousePopup,
      close: closeHousePopup
    };
}
