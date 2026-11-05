# Tracking runtime performance pass — 4 November 2026

Scope: camera scheduling, worker/inline inference, recovery and capture-age diagnostics. No game, graphics, camera-resolution, scoring or stale-threshold relaxation changes.

- Copied video capture allocates only when no capture or inference is pending. There is no waiting bitmap queue; late resolved bitmaps close after route shutdown.
- Copied inference closes its bitmap in `finally` and explicitly reports errors. Direct inference closes frames/cropped views, reports first unsupported-stream failures and subsequent runtime errors, and cancels its reader on exit.
- Missing replies/capture completion (2.5s steady-state; first inference gets a bounded15s shader warm-up), absent primary results (4s after first result /15s startup), runtime errors and partner failures trigger controlled replacement. Two worker rebuilds maximum per camera session, followed by paced inline inference. Counts do not reset on successful initialization. Obsolete callbacks cannot publish results; callback/timer ownership is per route. Paired shutdown terminates its worker and stops its cloned track. Half-model initialization uses a generation check.
- Default/auto slow full-model results retry Lite after three rejected frames. Explicit saved Full/Lite choices are retained; diagnostics distinguish requested and actual model. Inline auto fallback selects Lite, limits inference to15Hz maximum and budgets at least equal UI time after inference. Repeated inline inference errors stop after three attempts rather than loop forever.
- Results older than180ms are rejected before becoming fresh input. Recovery and rejected seats clear previous landmarks, smoothing/standing history, hand velocities/acceleration and accepted freshness. Receipt timestamps remain distinct from capture estimates. Direct capture times can be arrival estimates until camera-clock calibration; `captureClock` reports the source.
- `trackerDiagnostics()` is exported and available through existing `__romp`. It contains route, actual/requested model, status, recovery/error counters, work-in-flight counts, capture/skip/result/rejection counts and per-seat capture/receipt/age numbers. No video/landmarks are included.

Validation:

- RED: `tracking-runtime.test.ts` failed because bounded capture/reply lifecycle was absent. GREEN covers one capture allocation, no copies while inference busy, late bitmap disposal, failed transfer disposal, a missing-reply recovery signal, obsolete generations, inline pacing and age rejection. Recovery reset also verifies accepted freshness and hand motion history clear.
- `node src/tracking-runtime.test.ts`, `node src/check.ts`, TypeScript: PASS.
- Isolated Vite production compilation: PASS (existing PlayCanvas node-worker externalization/chunk-size warnings).
- Real fake-camera Vite smoke exercised the actual Lite inline model. The worker-specific assertions failed honestly because the known classic-worker development loading path selected inline. This is not worker validation; use a production build for `tools/test-tracking-runtime.mjs`.

Browser integration command: set `AR_GAME_TEST_URL` to the production preview and `AR_PLAYWRIGHT_MODULE` to the installed Playwright module, then run `node tools/test-tracking-runtime.mjs`. It uses actual model inference and80ms-delayed real bitmap captures, terminates workers to test missing-reply recovery, checks obsolete callbacks are ignored, then verifies real paced inline fallback. Fake-camera footage is not a human movement/comfort test. Android/iPad performance gains remain unmeasured until device playtests.

5November finalization: first-inference warm-up regression observed RED at7s, then fixed with15s finite grace; cold inline shader compilation receives only200ms additional idle time rather than doubling a multi-second startup stall. Pure regressions pass. Final production worker/recovery check is recorded in the integrated tablet report.
