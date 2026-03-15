# zkRune — X (Twitter) Marketing Postları

Ürün odaklı içerik stratejisi: privacy verification infrastructure positioning, developer adoption ve kullanım senaryoları.

---

## 1. Build in Public — Mimari Thread

**Başlık tweet (thread 1/8):**

```
Most "privacy" products send your data to a server to generate proofs.

We built the opposite.

Here's how zkRune keeps your secrets in your browser — zero server calls, real Groth16. 🧵
```

**2/8 — Problem:**
```
The privacy paradox in Web3:

You want to prove something (age, balance, membership) without revealing it.

But if the proof is generated on THEIR server, they see everything.

That's not privacy. That's a data honeypot.
```

**3/8 — Mimari karar:**
```
Our architecture rule: the prover never leaves the client.

• Circuit (Circom) → compiled to WASM
• WASM + zkey loaded in browser
• snarkjs.groth16.fullProve() runs 100% client-side
• Proof + public signals only — no private inputs ever leave the tab
```

**4/8 — Neden bu tasarım:**
```
Why client-side matters:

1. No server = no logs, no DB, no "we don't store but we process"
2. Same crypto as Zcash (Groth16) — battle-tested
3. You can verify the circuit source. We're not a black box.
4. 0.4–5s proof gen, ~200 byte proof. Verification <2ms on-chain ready.
```

**5/8 — Kanıt:**
```
13 production circuits. All proof gen in browser.

Balance proof → prove min balance without amount
Token swap → prove swap eligibility without exposing position
Age verification → prove 18+ without birthdate
Private voting, membership, credentials, NFT ownership...

Try it: zkrune.com/templates (no signup, no server)
```

**6/8 — Trusted setup:**
```
"Who generated the zkey?"

Multi-party ceremony. Phase 1: Hermez PoT (54 participants). Phase 2: zkRune community (5 contributors). Beacon: drand.

Secure if at least one participant was honest. Full report + verification: github.com/louisstein94/zkrune — ceremony/CEREMONY_REPORT.md
```

**7/8 — Özet:**
```
TL;DR:

• 100% client-side ZK proofs
• Real Groth16 (Zcash-grade)
• 13 templates, <1s gen, 0 server calls
• Open circuit code, verifiable ceremony
• Solana Privacy Hack 2026 — built for private payments, launchpads, governance

Privacy isn't a feature. It's the architecture.
```

**8/8 — CTA:**
```
If you're building on Solana and need:

→ Private payments / balance proofs
→ Fair launch eligibility (without doxxing wallets)
→ Anonymous voting or credentials

We've got templates + SDK. Docs: zkrune.com/docs

Follow @rune_zk for more build-in-public threads. 🔐
```

---

## 2. Educational Thread — "ZK 101 for Builders"

**1/6:**
```
"Zero-knowledge" gets thrown around a lot in Web3.

Here's what it actually means in one sentence:

You prove a statement is TRUE without revealing the evidence.

Example: "I am over 18" — proved without revealing your birthdate. That's ZK. 🧵
```

**2/6:**
```
How does that work?

You encode the rule in a "circuit" (math + constraints). You run it with your secret inputs. Out comes a tiny proof.

Verifier checks the proof. They learn: "the prover knew inputs that satisfy the rule." Nothing else.
```

**3/6:**
```
Groth16 (what zkRune uses):

• Same system as Zcash
• Small proofs (~200 bytes), fast verification
• Needs a one-time "trusted setup" — we did a multi-party ceremony so no single party has the toxic waste
```

**4/6:**
```
The trap most products fall into:

They run the prover on THEIR server. You send your secrets → they generate the proof. They've seen everything. Privacy theatre.
```

**5/6:**
```
The fix: client-side proving.

Circuit runs in YOUR browser (or app). Your secrets never leave. Only the proof goes out. That's real privacy.
```

**6/6:**
```
We built zkRune so every proof is generated in the browser. 13 templates, Solana-ready. Try the Age Verification template at zkrune.com/templates — your birthdate never hits our servers (we don't have a server for proofs).

Follow @rune_zk for more ZK breakdowns.
```

---

## 3. Proof Over Promise — Code as Marketing

**Tekil tweet (code snippet):**
```
This is our age verification circuit.

You prove "I am 18+" without revealing your birth year.

Private input: birthYear
Public: currentYear, minimumAge
Output: isValid (only 1 if age >= minimumAge)

All constraints in Circom. Proof generated in your browser. No server. 🔐

https://github.com/louisstein94/zkrune/blob/main/circuits/age-verification/circuit.circom
```

**İkinci snippet (client flow):**
```
Where does your data go when you generate a zkRune proof?

Nowhere.

fullProve(inputs, wasmPath, zkeyPath) runs in the browser. WASM + zkey from our CDN (public). Your inputs stay in the tab. Proof goes to you (or to chain). We never see private inputs.

Code: lib/clientZkProof.ts
```

**Audit / ceremony tweet:**
```
Trusted setup is public.

• Hermez Powers of Tau (54 participants)
• zkRune Phase 2: 5 contributors, beacon from drand
• Finalized 2026-01-15. Full report + verification steps in the repo.

You don't have to trust us — verify the ceremony. 🔐
```

---

## 4. Web3 / Meme Tone

**Meme-style (Web2 roast):**
```
Web2: "We value your privacy" *sends your data to 47 servers*

zkRune: Your birthdate never leaves your browser. The proof does. We never see it.

Somebody had to build it. We did. 🏴‍☠️
```

**Engagement hook:**
```
Hot take: If your "privacy" product needs to see my data to create a proof, it's not a privacy product.

Client-side ZK or it doesn't count.
```

**Sarcasm:**
```
"Just sign in with Google to prove you're over 18"

— Every Web2 age gate ever

We built the opposite: prove 18+ with a ZK proof. No login. No birthdate sent. Just math. zkrune.com/templates
```

---

## 5. Product Hooks (Kısa, paylaşılabilir)

**One-liner:**
```
100% client-side ZK proofs on Solana. Your secrets stay in your browser. Real Groth16. 13 templates. zkrune.com
```

**Stats:**
```
13 circuits · 0 server calls · <1s proof gen · ~200 byte proof · same crypto as Zcash. Solana privacy, done right. zkrune.com
```

**Use-case:**
```
Private payments: prove min balance without revealing amount.
Fair launchpads: prove eligibility without doxxing wallets.
Anonymous voting: cast a vote with a proof, not an address.

All in-browser. All Groth16. zkrune.com
```

---

## 6. Community & CTA

**Discord/Telegram funnel:**
```
X is where we ship threads and code.

If you want to test templates, break things, or build on zkRune — jump into [Discord/Telegram]. Early testers get [early access / role / feedback channel]. Link in bio. 🔐
```

**Incentivized testing:**
```
We're looking for builders who'll stress-test our privacy claims.

Try the templates. Break them. Report what you find. Best feedback gets [recognition / role / reward]. No NDA, no fluff — just proof over promise. [Link]
```

**Spaces / voice:**
```
Weekly X Space: Privacy on Solana — ZK, client-side proving, and why "server-side privacy" is an oxymoron. [Day/time]. Bring questions. Bring skepticism. We'll show the code.
```

---

## 7. Haftalık / Günlük Kullanım Önerisi

| Gün        | İçerik tipi              | Örnek |
|-----------|---------------------------|--------|
| Pazartesi | Build in Public / mimari  | Thread: client-side flow, ceremony |
| Salı      | Eğitim                    | ZK 101 veya "why Groth16" |
| Çarşamba  | Code / kanıt              | Circuit snippet veya verification |
| Perşembe  | Meme / engagement         | Web2 roast veya hot take |
| Cuma      | Product / use-case        | "Private payments in 3 steps" |
| Hafta sonu| Community / Spaces        | CTA Discord/Telegram veya Space duyurusu |

---

## 8. Mobile APK — Yeni Sürüm Duyurusu

**Ana post (önerilen):**
```
zkRune Mobile v0.2.0 — APK out now 📱

ZK proofs in your pocket. No server. No compromise.

• 6 templates: age, balance, membership, credentials, voting, reputation
• Phantom & Solflare — connect via deep link
• Offline: download circuits, prove without internet
• Face ID / Touch ID — biometric lock
• Proofs generated on-device. Secrets never leave your phone.

Android: [APK download link]

Privacy isn’t desktop-only. Try it. 🔐
```

**Kısa versiyon (link + hook):**
```
zkRune Mobile is live.

Generate ZK proofs on your Android. Phantom/Solflare, offline circuits, biometric lock. All proof gen on-device.

APK: [link]

🔐
```

**Thread açılışı (1/4):**
```
We shipped zkRune on mobile.

Same promise: your secrets never leave the device. Proofs generated on your phone. No server. Real Groth16.

Here’s what’s in the new APK. 🧵
```

**Thread 2/4 — Özellikler:**
```
• 6 proof templates (age, balance, membership, credentials, voting, reputation)
• Connect Phantom or Solflare via deep link — no copy-paste keys
• Download circuits once → generate proofs offline
• Face ID / Touch ID / fingerprint for sensitive actions
• Encrypted storage (expo-secure-store). Push for governance & proofs.
```

**Thread 3/4 — Teknik:**
```
Still 100% client-side. Circuit runs on device. Only the proof goes out. Same architecture as zkrune.com, now in your pocket.

React Native + Expo. Solana-ready. Dark UI, glassmorphism, zkRune branding.
```

**Thread 4/4 — CTA:**
```
Android APK: [link]

iOS build coming. Follow @rune_zk for updates.

If you’re on Solana and care about privacy — this is for you. 🔐
```

**Meme / engagement:**
```
"Prove you're 18+ without sending your birthdate to 12 ad networks"

We put that in an app. On your phone. Offline-capable.

zkRune Mobile APK is live. [link] 📱
```

---

## 9. Telegram Bot — zkRune TG Bot is Live

**Ana post (önerilen):**
```
zkRune Telegram bot is live 🐋

Whale group access — without doxxing your wallet.

• Prove you hold enough zkRUNE with a ZK proof (whale-holder circuit)
• Generate proof on zkrune.com/whale-chat → export JSON → send to bot
• Bot verifies Groth16 on-chain, checks nullifier (no replay), sends single-use invite
• Your address and balance never leave the proof. Only "meets threshold" is verified.

Privacy-first community. Join via proof, not via wallet. [Bot link]
```

**Kısa versiyon:**
```
zkRune TG bot is live.

Prove you're a whale with a ZK proof. Get invite to the group. Your address and balance stay private. Groth16 + nullifier, no replay.

Try: [Bot link] → /verify
```

**Tek cümle + CTA:**
```
Whale chat access without revealing your wallet: zkRune Telegram bot verifies your balance with a ZK proof and sends a single-use invite. Live now. [Bot link] 🔐
```

**Proof-over-promise açılışı:**
```
We don't ask "what's your wallet?"

We ask: "prove you meet the threshold."

zkRune Telegram bot is live. Generate a whale-holder ZK proof, send the file, get in. Address and balance never exposed. [Bot link]
```

---

## 10. Ürün Odaklı Postlar (Yeni)

### Value proposition — tek cümle
```
Privacy verification infrastructure for Solana.

Prove age, balance, membership, or credentials — without exposing the data. 100% client-side Groth16. 13 templates. zkrune.com
```
```
Verification without exposure.

Users prove claims. You get a yes/no. No birthdates, no wallet addresses, no credentials on your server. zkrune.com
```
```
Stop asking for the data. Ask for the proof.

zkRune: zero-knowledge verification for access, eligibility, and identity. Solana-ready. zkrune.com
```

### Use-case: Access & eligibility
```
Age gate without the birthdate.

User proves "I am 18+" with a ZK proof. You never see their date of birth. Same for "I hold ≥X tokens" or "I'm in this allowlist."

One verification API. No PII. zkrune.com
```
```
Fair launch without doxxing wallets.

Prove eligibility with a balance or membership proof. No wallet reveal. No sniping. Just "eligible" or "not." Built for Solana. zkrune.com
```
```
Gated community without exposing identity.

Membership proof → user proves they're in the set. Credential proof → they prove they hold a valid pass. You grant access. You never see who. zkrune.com
```

### Use-case: Governance & reputation
```
Anonymous voting that’s actually anonymous.

Private voting + quadratic voting templates. Prove a valid vote without linking it to a wallet. DAO-ready. zkrune.com
```
```
Reputation without doxxing the score.

Prove "my score ≥ X" with a ZK proof. Credit systems, trust tiers, allocations — no need to reveal the exact number. zkrune.com
```

### Use-case: Payments & swaps
```
Prove you can pay — without revealing balance.

Balance proof: "I hold ≥ X." Token swap: "I have enough for this swap." Payment channels, DEX eligibility, private transfers. zkrune.com
```

### Developer / integration
```
Embed ZK verification in your app.

zkrune-sdk: generateProof() in the browser, verify via our API or your own vKey. Age, balance, membership, credentials — one integration. Docs: zkrune.com/docs
```
```
3 steps to privacy-preserving verification:

1. npm install zkrune-sdk
2. generateProof(templateId, inputs) — runs in user’s browser
3. verify proof on your backend or zkrune.com/api/verify-proof

No secrets on your server. Ever. zkrune.com/docs
```
```
You don’t need to run a prover.

We don’t either. Proofs are generated in the user’s browser. You get proof + publicSignals. Verify with the public vKey. That’s it. zkrune.com
```

### Özellik vurgusu (templates, verify API, widget)
```
13 proof templates. One stack.

Age, balance, membership, credentials, NFT ownership, private voting, quadratic voting, token swap, range proof, hash preimage, signature, patience, reputation.

All Groth16. All client-side. zkrune.com/templates
```
```
Verify proofs in your backend.

POST to zkrune.com/api/verify-proof with proof + publicSignals. We use the same trusted vKeys from our ceremony. You get { isValid }. No key management. zkrune.com/docs
```
```
Add a "Prove with zkRune" flow to your app.

Widget or SDK. User generates proof in-browser. You verify and grant access. No iframes of sensitive data — just the proof. zkrune.com/docs
```

### Token & ecosystem
```
zkRUNE isn’t just a token.

Governance → vote on templates and features. Staking → earn APY. Marketplace → buy/sell circuit templates (95% to creators). Burn → unlock Builder/Pro/Enterprise tiers. zkrune.com
```
```
Unlock more with zkRUNE.

Free: 5 proofs/day. Builder (burn 100): unlimited proofs, all templates, API. Pro: custom circuits, gasless. Enterprise: white-label. zkrune.com/premium
```

### "What you can build"
```
What can you build with zkRune?

• Age-gated content without collecting birthdates  
• Token-gated access without wallet checks  
• Anonymous DAO voting  
• Fair launch eligibility without wallet exposure  
• Private balance proofs for DeFi  
• Credential checks without seeing the credential  

All with real ZK proofs. All client-side. zkrune.com
```
```
Build privacy into the flow.

Not "we don’t store it" — we never see it. User proves in browser. You verify. Access granted or denied. No data handover. zkrune.com
```

### Karşılaştırma / positioning
```
Traditional verification: "Send us your data, we’ll check it."

zkRune: "Generate a proof. We’ll verify the proof. We never see your data."

Same outcome. Zero exposure. zkrune.com
```
```
Most eligibility checks = "connect wallet" → everyone sees who you are and what you hold.

zkRune = prove "I meet the bar" with a ZK proof. Verifier learns yes/no. Nothing else. zkrune.com
```

### Kısa CTA’lar (link + hook)
```
Privacy verification for Solana. Prove, don’t expose. zkrune.com 🔐
```
```
13 ZK templates. 0 server calls for proof gen. Solana-ready. zkrune.com
```
```
Access. Eligibility. Identity. Verified with ZK, not with data. zkrune.com
```

---

## Linkler (bio / link tree)

- **Site:** zkrune.com  
- **Templates:** zkrune.com/templates  
- **Docs:** zkrune.com/docs  
- **Governance:** zkrune.com/governance  
- **Token (pump.fun):** README’deki link  
- **Twitter:** @rune_zk  
- **Dev:** @legelsteinn  
- **Ceremony report:** repo → ceremony/CEREMONY_REPORT.md  

---

*Bu dosya, ürün odaklı içerik stratejisine göre hazırlanmıştır. İstediğin tweet’i kopyalayıp düzenleyerek kullanabilirsin.*
