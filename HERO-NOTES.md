# Hero and StonkFun data

The hero refreshes every 30 seconds. No wallet is requested. The initial unknown value is an em dash; successful numeric values persist in localStorage per mint. Missing fields preserve prior values, explicit null displays an em dash, and failed requests preserve the last good values. USDC is not converted to UBI.

Verified 2026-09-08 against https://www.stonkfun.xyz/developers and live responses:
- GET /api/public/v1/tokens/{mint}: data.token.market.{priceUsd,marketCapUsd,fdvUsd,volume24hUsd}
- GET /api/public/v1/rewards: data.launches.find(row => row.mint === MINT).distributedTokens; require quote.mint to be canonical USDC. Observed 78454.469838 USDC. Array index is not hardcoded.
- GET /api/public/v1/tokens/{mint}/rewards: data.rewards.undistributedTokens; observed 43.699205 USDC. This documented endpoint supplements the pending amount and can supply total payouts when the global rewards call fails.
- Same-origin fallback: /api/stonkfun/token. Only fixed StonkFun URLs are requested server-side.

Tests: node --experimental-strip-types --test lib/stonkfun.test.mjs

Image asset: public/ubi-hero-background.png
Created with the built-in ImageGen tool from the user-supplied Frame 238.png. Prompt: Preserve the blue cosmic starfield, neon grid and all portraits in their positions; remove the navigation bar, all text, amounts, buttons and central logo; fill removed areas with starfield and leave the center clear for HTML content. Landscape 16:9.
