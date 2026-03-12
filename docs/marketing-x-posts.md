# zkRune — X (Twitter) Marketing Postları

Web3 privacy playbook’a göre hazırlanmış postlar: Build in Public, eğitim, kanıt odaklı içerik ve topluluk.

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

*Bu dosya, "Build in Public", eğitim, kanıt odaklı içerik ve topluluk playbook’una göre hazırlanmıştır. İstediğin tweet’i kopyalayıp düzenleyerek kullanabilirsin.*
