# Luxy v3.6 — Original Inline Sample Articles

This reference preserves the original inline article markup removed from `Luxy-reference/Luxy-V3.6.html` during the temporary article-movement step.

- Source branch: `feature/luxy-integration`
- Original v3.6 blob: `4c009fafafa2723f74e199c927989091e6427b59`
- The five HTML blocks below are preserved as they appeared in the v3.6 article feed.
- Working copies are in `site/test-luxy-articles/article-01.html` through `article-05.html`.
- This Markdown file is an archival reference, not a runtime page.

## Original inline article 1 — Low-Power ESP32 Microcontroller Telemetry & Custom PCB Routing

```html
        <!-- HOST ARTICLE 1 -->
        <article class="tech-article" id="art-esp32" data-crawlable="true">
          <div class="article-meta">
            <span class="tag">Embedded Systems</span>
            <span class="page-origin-pill">PAGE: index.html</span>
            <span>PUBLISHED: OCT 14, 2026 • BY ALEX MERCER</span>
          </div>
          <h1 class="article-title">Low-Power ESP32 Microcontroller Telemetry & Custom PCB Routing</h1>
          <div class="article-content">
            <h2 id="esp32-deep-sleep">Deep Sleep Microcontroller Power Optimization & Current Draw</h2>
            <p>Achieving ultra-low current consumption in ESP32 microcontroller edge telemetry nodes requires disabling unused peripherals before invoking deep sleep. In standard deep sleep mode, the main CPU core, Wi-Fi radio, and Bluetooth baseband are completely powered down, leaving only the Real-Time Clock (RTC) controller and RTC fast memory active.</p>
            <p>With proper power domain configuration, microcontroller current consumption drops from 240mA during Wi-Fi transmission down to approximately <strong>10µA to 15µA in deep sleep</strong>. Configure timer wake-up programmatically:</p>
            <div class="code-block">// ESP-IDF Deep Sleep Configuration
esp_sleep_enable_timer_wakeup(SLEEP_DURATION_SEC * 1000000ULL);
gpio_deep_sleep_hold_dis(); // Release GPIO pins to prevent leakage
esp_deep_sleep_start();</div>

            <h2 id="esp32-ldo-power">Custom LDO Selection & Power Gating</h2>
            <p>Standard linear regulators like the AMS1117 feature a high quiescent current (~5mA), rendering them unsuitable for battery-powered IoT microcontroller nodes. Instead, design with ultra-low quiescent current (Iq) LDO regulators such as the Texas Instruments TPS7A02, which exhibits an Iq of only 25nA.</p>

            <h2 id="esp32-rf-trace">RF Trace Impedance Matching (50Ω Coplanar Waveguide)</h2>
            <p>When routing the 2.4GHz Wi-Fi RF trace between the ESP32 chip and the PCB antenna, maintain strict 50-ohm characteristic impedance. Utilize a Grounded Coplanar Waveguide (GCPW) layout with continuous ground plane shielding on Layer 2 and ground stitching vias placed every λ/20 along the RF path.</p>

            <h2 id="esp32-i2c-polling">I2C Sensor Polling Architecture</h2>
            <p>To minimize energy spent per telemetry burst, poll environmental sensors (such as BME280 or MPU6050) over I2C operating at 400kHz Fast Mode. Read sensor data into RTC memory, evaluate threshold triggers, and immediately return to deep sleep if no critical delta is detected.</p>
          </div>
        </article>
```

## Original inline article 2 — Class-D 2.1 Audio Amplifier Architecture & Filter Design

```html
        <!-- HOST ARTICLE 2 -->
        <article class="tech-article" id="art-class-d" data-crawlable="true">
          <div class="article-meta">
            <span class="tag">Audio Engineering</span>
            <span class="page-origin-pill">PAGE: index.html</span>
            <span>PUBLISHED: NOV 02, 2026 • BY DR. HELENA VANCE</span>
          </div>
          <h1 class="article-title">Class-D 2.1 Audio Amplifier Architecture & Filter Design</h1>
          <div class="article-content">
            <h2 id="classd-pwm-switching">High-Frequency PWM Modulation Strategy</h2>
            <p>Class-D audio amplifiers operate output MOSFETs in switching states (fully ON or fully OFF), yielding efficiency ratings exceeding 90%. Switching frequencies typically range between 300kHz and 1.2MHz, pushing switching noise far above the 20Hz–20kHz audible spectrum.</p>

            <h2 id="classd-lc-filter">LC Reconstruction Filter Inductor & Capacitor Calculation</h2>
            <p>To convert the high-frequency PWM pulse train back into a clean analog acoustic waveform, a 2nd-order Butterworth LC low-pass filter must be placed at the output stage. The resonant cutoff frequency Fc is determined by:</p>
            <div class="code-block">Fc = 1 / (2 * π * sqrt(L * C))
For a 4-ohm speaker load and Fc = 30kHz:
Inductor (L) = 10µH (Shielded ferrite core, saturation current > 15A)
Capacitor (C) = 0.68µF (Film capacitor, Metalized Polypropylene)</div>

            <h2 id="classd-subwoofer-crossover">Active Subwoofer Crossover at 80Hz</h2>
            <p>In a 2.1 channel system, the subwoofer low-pass crossover is set at 80Hz using a 4th-order Linkwitz-Riley active filter topology, providing a flat amplitude response across the crossover region with a steep 24dB/octave attenuation slope.</p>

            <h2 id="classd-thermal-dissipation">Thermal Dissipation & Copper Pour Heatsinking</h2>
            <p>High-power peaks (e.g., 200W RMS into subwoofer) generate heat concentrated within the power stage IC. Utilize 2oz copper PCB layers with an array of thermal vias (0.3mm diameter, 0.8mm pitch) directly under the exposed thermal pad connecting to the bottom ground plane.</p>
          </div>
        </article>
```

## Original inline article 3 — Digital Multimeter Protection & Circuit Sandbox Design

```html
        <!-- HOST ARTICLE 3 -->
        <article class="tech-article" id="art-multimeter" data-crawlable="true">
          <div class="article-meta">
            <span class="tag">Analog Circuits</span>
            <span class="page-origin-pill">PAGE: index.html</span>
            <span>PUBLISHED: NOV 19, 2026 • BY MARCUS THORN</span>
          </div>
          <h1 class="article-title">Digital Multimeter Protection & Circuit Sandbox Design</h1>
          <div class="article-content">
            <h2 id="dmm-overvoltage">Overvoltage Input Protection (PTC & MOV Clamping)</h2>
            <p>Industrial digital multimeters (DMMs) rated for CAT III 1000V / CAT IV 600V safety standards must withstand high-voltage transient spikes without rupturing. Protection circuits utilize Positive Temperature Coefficient (PTC) thermistors in series and Metal Oxide Varistors (MOVs) in parallel.</p>
            <table class="spec-table">
              <thead>
                <tr>
                  <th>Protection Component</th>
                  <th>Primary Function</th>
                  <th>Typical Rating / Parameter</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>PTC Thermistor</td>
                  <td>Current Limiting / Self-Resetting Fuse</td>
                  <td>1000V Hold Current 10mA, Cold Resistance 1kΩ</td>
                </tr>
                <tr>
                  <td>Metal Oxide Varistor (MOV)</td>
                  <td>High-Energy Voltage Clamping</td>
                  <td>Varistor Voltage 1100V, Surge Energy >70J</td>
                </tr>
                <tr>
                  <td>High-Energy HRC Fuse</td>
                  <td>Short-Circuit Fault Interrupt</td>
                  <td>1000V / 11A, 10kA Interrupt Capacity</td>
                </tr>
              </tbody>
            </table>

            <h2 id="dmm-input-impedance">10MΩ High-Impedance Attenuator Network</h2>
            <p>To avoid loading delicate active circuits during voltage measurements, DMM inputs feature a precise 10MΩ input impedance divider network built from 0.1% tolerance thin-film resistor arrays.</p>

            <h2 id="dmm-nodal-solver">Kirchhoff Nodal Analysis Solver Engine</h2>
            <p>Interactive circuit sandbox software implements Modified Nodal Analysis (MNA) to solve circuit equations dynamically using matrix <strong>[G][V] = [I]</strong>, where G represents conductances, V is unknown node voltages, and I is independent current sources.</p>
          </div>
        </article>
```

## Original inline article 4 — Automated 2D Vector Animation & Rotoscoping Pipeline

```html
        <!-- HOST ARTICLE 4 -->
        <article class="tech-article" id="art-vector-anim" data-crawlable="true">
          <div class="article-meta">
            <span class="tag">Graphics & Vision</span>
            <span class="page-origin-pill">PAGE: index.html</span>
            <span>PUBLISHED: DEC 04, 2026 • BY SOPHIA CHEN</span>
          </div>
          <h1 class="article-title">Automated 2D Vector Animation & Rotoscoping Pipeline</h1>
          <div class="article-content">
            <h2 id="vec-opencv-edges">OpenCV Frame Difference Edge Detection</h2>
            <p>Automated vector rotoscoping extracts high-contrast contours from raw video frames. Sequential frames are converted to grayscale, smoothed with a 5x5 Gaussian Blur, and processed via Canny edge detection:</p>
            <div class="code-block">gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
blurred = cv2.GaussianBlur(gray, (5, 5), 0)
edges = cv2.Canny(blurred, threshold1=50, threshold2=150)
contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)</div>

            <h2 id="vec-vtracer-simplification">VTracer Path Simplification & Bézier Fitting</h2>
            <p>Pixel-based raster edges are converted to smooth vector paths using Douglas-Peucker polygon simplification followed by cubic Bézier curve fitting to minimize SVG node count.</p>
          </div>
        </article>
```

## Original inline article 5 — Zero-Backend Static Site Architecture & Client-Side Crawling

```html
        <!-- HOST ARTICLE 5 -->
        <article class="tech-article" id="art-rag-architecture" data-crawlable="true">
          <div class="article-meta">
            <span class="tag">Web Architecture</span>
            <span class="page-origin-pill">PAGE: index.html</span>
            <span>PUBLISHED: JAN 10, 2027 • BY BENJAMIN ROTH</span>
          </div>
          <h1 class="article-title">Zero-Backend Static Site Architecture & Client-Side Crawling</h1>
          <div class="article-content">
            <h2 id="rag-dom-indexing">Multi-Page Client-Side Crawling & DOMParser Retrieval</h2>
            <p>Modern client-side engines execute 100% inside the browser without backend server overhead. The multi-page spider discovers internal links via <code>a[href]</code> and parses external HTML documents in memory using <code>fetch()</code> and <code>new DOMParser().parseFromString(html, 'text/html')</code>.</p>

            <h2 id="rag-bm25-ranking">BM25+ Lexical Ranking, Prefix Expansion & Proximity Boosting</h2>
            <p>To rank document chunks across multiple pages, Luxy implements Okapi BM25 with field weights, bi-gram proximity scoring, Porter-lite suffix/consonant stemming, prefix auto-expansion, and Levenshtein fuzzy typo correction:</p>
            <div class="code-block">score(D, Q) = ∑ IDF(q) * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / avgdl)))) + ProximityBoost</div>
          </div>
        </article>
```
