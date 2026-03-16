// src/circuits.ts
var CIRCUITS = {
  "age-verification": {
    id: "age-verification",
    name: "Age Verification",
    description: "Prove you meet a minimum age requirement without revealing your birth year",
    category: "identity",
    fields: [
      { name: "birthYear", label: "Birth Year", description: "Year of birth (4-digit)", required: true, type: "integer" },
      { name: "currentYear", label: "Current Year", description: "Current calendar year", required: true, type: "integer" },
      { name: "minimumAge", label: "Minimum Age", description: "Required minimum age", required: true, type: "integer" }
    ]
  },
  "balance-proof": {
    id: "balance-proof",
    name: "Balance Proof",
    description: "Prove your balance exceeds a threshold without revealing the amount",
    category: "financial",
    fields: [
      { name: "balance", label: "Balance", description: "Actual token balance", required: true, type: "integer" },
      { name: "minimumBalance", label: "Minimum Balance", description: "Required minimum", required: true, type: "integer" }
    ]
  },
  "membership-proof": {
    id: "membership-proof",
    name: "Membership Proof",
    description: "Prove membership in a group without revealing your identity",
    category: "identity",
    fields: [
      { name: "memberId", label: "Member ID", description: "Private member identifier", required: true, type: "hash" },
      { name: "groupHash", label: "Group Hash", description: "Hash of the group set", required: true, type: "hash" }
    ]
  },
  "range-proof": {
    id: "range-proof",
    name: "Range Proof",
    description: "Prove a value falls within a range without revealing it",
    category: "financial",
    fields: [
      { name: "value", label: "Value", description: "Private value", required: true, type: "integer" },
      { name: "minRange", label: "Minimum", description: "Lower bound (inclusive)", required: true, type: "integer" },
      { name: "maxRange", label: "Maximum", description: "Upper bound (inclusive)", required: true, type: "integer" }
    ]
  },
  "private-voting": {
    id: "private-voting",
    name: "Private Voting",
    description: "Cast a verifiable vote without revealing your identity",
    category: "governance",
    fields: [
      { name: "voterId", label: "Voter ID", description: "Private voter identifier", required: true, type: "hash" },
      { name: "voteChoice", label: "Vote Choice", description: "Numeric vote option", required: true, type: "integer" },
      { name: "pollId", label: "Poll ID", description: "Poll identifier", required: true, type: "hash" }
    ]
  },
  "hash-preimage": {
    id: "hash-preimage",
    name: "Hash Preimage",
    description: "Prove knowledge of a hash preimage without revealing it",
    category: "cryptographic",
    fields: [
      { name: "preimage", label: "Preimage", description: "Secret preimage value", required: true, type: "hash" },
      { name: "salt", label: "Salt", description: "Random salt", required: true, type: "hash" },
      { name: "expectedHash", label: "Expected Hash", description: "Public hash to verify against", required: true, type: "hash" }
    ]
  },
  "credential-proof": {
    id: "credential-proof",
    name: "Credential Proof",
    description: "Prove possession of a valid credential without exposing it",
    category: "identity",
    fields: [
      { name: "credentialHash", label: "Credential Hash", description: "Hash of credential data", required: true, type: "hash" },
      { name: "credentialSecret", label: "Credential Secret", description: "Private key bound to credential", required: true, type: "hash" },
      { name: "validUntil", label: "Valid Until", description: "Expiry timestamp", required: true, type: "timestamp" },
      { name: "currentTime", label: "Current Time", description: "Current timestamp", required: true, type: "timestamp" },
      { name: "expectedHash", label: "Expected Hash", description: "Public commitment hash", required: true, type: "hash" }
    ]
  },
  "token-swap": {
    id: "token-swap",
    name: "Token Swap",
    description: "Prove eligibility for a token swap without revealing your full balance",
    category: "financial",
    fields: [
      { name: "tokenABalance", label: "Token A Balance", description: "Source token balance", required: true, type: "integer" },
      { name: "swapSecret", label: "Swap Secret", description: "Private swap secret", required: true, type: "hash" },
      { name: "requiredTokenA", label: "Required Token A", description: "Minimum source amount", required: true, type: "integer" },
      { name: "swapRate", label: "Swap Rate", description: "Exchange rate multiplier", required: true, type: "integer" },
      { name: "minReceive", label: "Min Receive", description: "Minimum tokens to receive", required: true, type: "integer" }
    ]
  },
  "signature-verification": {
    id: "signature-verification",
    name: "Signature Verification",
    description: "Verify an EdDSA signature inside a zero-knowledge circuit",
    category: "cryptographic",
    fields: [
      { name: "R8x", label: "R8 X", description: "X coordinate of R8", required: true, type: "hash" },
      { name: "R8y", label: "R8 Y", description: "Y coordinate of R8", required: true, type: "hash" },
      { name: "S", label: "S", description: "Scalar component", required: true, type: "hash" },
      { name: "Ax", label: "Public Key X", description: "Signer pub key X", required: true, type: "hash" },
      { name: "Ay", label: "Public Key Y", description: "Signer pub key Y", required: true, type: "hash" },
      { name: "M", label: "Message", description: "Signed message", required: true, type: "hash" }
    ]
  },
  "patience-proof": {
    id: "patience-proof",
    name: "Patience Proof",
    description: "Prove a minimum waiting period has elapsed",
    category: "cryptographic",
    fields: [
      { name: "startTime", label: "Start Time", description: "Wait start timestamp", required: true, type: "timestamp" },
      { name: "endTime", label: "End Time", description: "Wait end timestamp", required: true, type: "timestamp" },
      { name: "secret", label: "Secret", description: "Time-lock secret", required: true, type: "hash" },
      { name: "minimumWaitTime", label: "Min Wait", description: "Required wait (seconds)", required: true, type: "integer" },
      { name: "commitmentHash", label: "Commitment Hash", description: "Public commitment", required: true, type: "hash" }
    ]
  },
  "quadratic-voting": {
    id: "quadratic-voting",
    name: "Quadratic Voting",
    description: "Cast a quadratic vote weighted by token balance",
    category: "governance",
    fields: [
      { name: "voterId", label: "Voter ID", description: "Private voter identifier", required: true, type: "hash" },
      { name: "tokenBalance", label: "Token Balance", description: "Governance tokens held", required: true, type: "integer" },
      { name: "voteChoice", label: "Vote Choice", description: "Vote option", required: true, type: "integer" },
      { name: "pollId", label: "Poll ID", description: "Poll identifier", required: true, type: "hash" },
      { name: "minTokens", label: "Min Tokens", description: "Minimum to participate", required: true, type: "integer" }
    ]
  },
  "nft-ownership": {
    id: "nft-ownership",
    name: "NFT Ownership",
    description: "Prove you own an NFT without revealing which one",
    category: "financial",
    fields: [
      { name: "nftTokenId", label: "NFT Token ID", description: "Private token ID", required: true, type: "integer" },
      { name: "ownerSecret", label: "Owner Secret", description: "Ownership proof key", required: true, type: "hash" },
      { name: "collectionRoot", label: "Collection Root", description: "Merkle root of collection", required: true, type: "hash" },
      { name: "minTokenId", label: "Min Token ID", description: "Valid range lower bound", required: true, type: "integer" },
      { name: "maxTokenId", label: "Max Token ID", description: "Valid range upper bound", required: true, type: "integer" }
    ]
  },
  "anonymous-reputation": {
    id: "anonymous-reputation",
    name: "Anonymous Reputation",
    description: "Prove reputation score exceeds a threshold anonymously",
    category: "identity",
    fields: [
      { name: "userId", label: "User ID", description: "Private user identifier", required: true, type: "hash" },
      { name: "reputationScore", label: "Reputation Score", description: "Actual score", required: true, type: "integer" },
      { name: "userNonce", label: "User Nonce", description: "Random nonce for unlinkability", required: true, type: "hash" },
      { name: "thresholdScore", label: "Threshold", description: "Minimum score required", required: true, type: "integer" },
      { name: "platformId", label: "Platform ID", description: "Score issuer ID", required: true, type: "hash" }
    ]
  },
  "whale-holder": {
    id: "whale-holder",
    name: "Whale Holder",
    description: "Prove whale-level token holdings without revealing exact amount",
    category: "financial",
    fields: [
      { name: "balance", label: "Balance", description: "Actual token balance", required: true, type: "integer" },
      { name: "minimumBalance", label: "Whale Threshold", description: "Minimum whale balance", required: true, type: "integer" }
    ]
  }
};
var CIRCUIT_CATEGORIES = {
  identity: { label: "Identity", icon: "\u{1F6E1}" },
  financial: { label: "Financial", icon: "\u{1F4B0}" },
  governance: { label: "Governance", icon: "\u{1F5F3}" },
  cryptographic: { label: "Cryptographic", icon: "\u{1F510}" }
};
function getCircuitsByCategory() {
  const grouped = {};
  for (const circuit of Object.values(CIRCUITS)) {
    if (!grouped[circuit.category]) grouped[circuit.category] = [];
    grouped[circuit.category].push(circuit);
  }
  return grouped;
}
function validateInputs(circuitId, inputs) {
  const schema = CIRCUITS[circuitId];
  if (!schema) return { valid: false, errors: [`Unknown circuit: ${circuitId}`] };
  const errors = [];
  for (const field of schema.fields) {
    const value = inputs[field.name];
    if (field.required && (value === void 0 || value === "")) {
      errors.push(`${field.label} is required`);
      continue;
    }
    if (value === void 0 || value === "") continue;
    if (field.type === "integer" || field.type === "timestamp") {
      if (!/^\d+$/.test(value)) {
        errors.push(`${field.label} must be a non-negative integer`);
      }
    }
    if (field.type === "hash") {
      if (!/^\d+$/.test(value) && !/^0x[0-9a-fA-F]+$/.test(value)) {
        errors.push(`${field.label} must be a numeric or hex value`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

// src/styles.ts
function getStyles(theme) {
  const t = theme === "dark" ? {
    bg: "#0a0a0f",
    bgOverlay: "rgba(0,0,0,0.7)",
    surface: "#111118",
    surfaceHover: "#1a1a24",
    border: "rgba(255,255,255,0.1)",
    borderHover: "rgba(255,255,255,0.2)",
    text: "#e5e7eb",
    textMuted: "#9ca3af",
    textDim: "#6b7280",
    primary: "#6366f1",
    primaryHover: "#5b5bd6",
    primaryText: "#fff",
    success: "#34d399",
    successBg: "rgba(52,211,153,0.1)",
    error: "#f87171",
    errorBg: "rgba(248,113,113,0.1)",
    inputBg: "rgba(255,255,255,0.05)",
    inputBorder: "rgba(255,255,255,0.1)",
    badgeBg: "#6366f1",
    badgeText: "#fff",
    scrollThumb: "#333"
  } : {
    bg: "#ffffff",
    bgOverlay: "rgba(0,0,0,0.4)",
    surface: "#f9fafb",
    surfaceHover: "#f3f4f6",
    border: "rgba(0,0,0,0.1)",
    borderHover: "rgba(0,0,0,0.2)",
    text: "#111827",
    textMuted: "#6b7280",
    textDim: "#9ca3af",
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    primaryText: "#fff",
    success: "#059669",
    successBg: "rgba(5,150,105,0.1)",
    error: "#dc2626",
    errorBg: "rgba(220,38,38,0.1)",
    inputBg: "#fff",
    inputBorder: "rgba(0,0,0,0.15)",
    badgeBg: "#6366f1",
    badgeText: "#fff",
    scrollThumb: "#ccc"
  };
  return `
:host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

* { box-sizing: border-box; margin: 0; padding: 0; }

.zkr-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border: none; border-radius: 8px;
  background: ${t.badgeBg}; color: ${t.badgeText};
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.zkr-btn:hover { background: ${t.primaryHover}; transform: translateY(-1px); }
.zkr-btn:active { transform: translateY(0); }
.zkr-btn svg { width: 18px; height: 18px; }

.zkr-overlay {
  position: fixed; inset: 0; z-index: 999999;
  background: ${t.bgOverlay}; display: flex; align-items: center; justify-content: center;
  animation: zkr-fadeIn 0.2s ease;
}

.zkr-modal {
  background: ${t.bg}; border: 1px solid ${t.border}; border-radius: 16px;
  width: 90vw; max-width: 480px; max-height: 85vh; overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  animation: zkr-slideUp 0.25s ease;
}
.zkr-modal::-webkit-scrollbar { width: 6px; }
.zkr-modal::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }

.zkr-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid ${t.border};
}
.zkr-header h2 { font-size: 18px; font-weight: 700; color: ${t.text}; }
.zkr-close {
  width: 32px; height: 32px; border: none; border-radius: 8px;
  background: ${t.surface}; color: ${t.textMuted}; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; transition: background 0.15s;
}
.zkr-close:hover { background: ${t.surfaceHover}; }

.zkr-body { padding: 24px; }

.zkr-circuits {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.zkr-circuit-card {
  padding: 14px; border: 1px solid ${t.border}; border-radius: 10px;
  background: ${t.surface}; cursor: pointer; transition: all 0.15s;
}
.zkr-circuit-card:hover { border-color: ${t.primary}; background: ${t.surfaceHover}; }
.zkr-circuit-card h4 { font-size: 13px; font-weight: 600; color: ${t.text}; margin-bottom: 4px; }
.zkr-circuit-card p { font-size: 11px; color: ${t.textMuted}; line-height: 1.4; }
.zkr-circuit-card .zkr-cat { font-size: 10px; color: ${t.primary}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }

.zkr-form { display: flex; flex-direction: column; gap: 16px; }
.zkr-field label { display: block; font-size: 13px; font-weight: 500; color: ${t.text}; margin-bottom: 6px; }
.zkr-field .zkr-desc { font-size: 11px; color: ${t.textDim}; margin-bottom: 6px; }
.zkr-field input {
  width: 100%; padding: 10px 12px; border: 1px solid ${t.inputBorder};
  border-radius: 8px; background: ${t.inputBg}; color: ${t.text};
  font-size: 14px; outline: none; transition: border 0.15s;
}
.zkr-field input:focus { border-color: ${t.primary}; }
.zkr-field input::placeholder { color: ${t.textDim}; }

.zkr-errors { padding: 12px; border-radius: 8px; background: ${t.errorBg}; border: 1px solid ${t.error}; }
.zkr-errors p { font-size: 12px; color: ${t.error}; }

.zkr-submit {
  width: 100%; padding: 12px; border: none; border-radius: 10px;
  background: ${t.primary}; color: ${t.primaryText};
  font-size: 15px; font-weight: 600; cursor: pointer;
  transition: background 0.15s;
}
.zkr-submit:hover { background: ${t.primaryHover}; }
.zkr-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.zkr-back {
  background: none; border: none; color: ${t.primary};
  font-size: 13px; cursor: pointer; padding: 0; margin-bottom: 16px;
  display: flex; align-items: center; gap: 4px;
}
.zkr-back:hover { text-decoration: underline; }

.zkr-progress {
  display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 32px 0;
}
.zkr-spinner {
  width: 48px; height: 48px; border: 3px solid ${t.border};
  border-top-color: ${t.primary}; border-radius: 50%;
  animation: zkr-spin 0.8s linear infinite;
}
.zkr-progress-label { font-size: 14px; color: ${t.textMuted}; }

.zkr-result {
  display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px 0;
}
.zkr-result-icon { font-size: 48px; }
.zkr-result-title { font-size: 20px; font-weight: 700; color: ${t.text}; }
.zkr-result-sub { font-size: 13px; color: ${t.textMuted}; text-align: center; }
.zkr-result-pass { color: ${t.success}; }
.zkr-result-fail { color: ${t.error}; }

.zkr-result-details {
  width: 100%; padding: 14px; border-radius: 10px;
  background: ${t.surface}; border: 1px solid ${t.border};
  font-size: 12px; color: ${t.textMuted}; word-break: break-all;
}
.zkr-result-details dt { font-weight: 600; color: ${t.text}; margin-top: 8px; }
.zkr-result-details dt:first-child { margin-top: 0; }
.zkr-result-details dd { margin: 2px 0 0; }

.zkr-footer {
  padding: 16px 24px; border-top: 1px solid ${t.border};
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 11px; color: ${t.textDim};
}
.zkr-footer a { color: ${t.primary}; text-decoration: none; }
.zkr-footer a:hover { text-decoration: underline; }

@keyframes zkr-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zkr-slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes zkr-spin { to { transform: rotate(360deg); } }
`;
}

// src/ui.ts
var LOGO_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`;
var WidgetUI = class {
  constructor(container, theme, buttonLabel, preselectedCircuit) {
    this.stage = "idle";
    this.selectedCircuit = null;
    this.onCircuitSelect = () => {
    };
    this.onSubmit = () => {
    };
    this.onClose = () => {
    };
    this.host = container;
    this.theme = theme;
    this.buttonLabel = buttonLabel;
    this.selectedCircuit = preselectedCircuit ?? null;
    this.shadow = this.host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = getStyles(theme);
    this.shadow.appendChild(style);
    this.renderButton();
  }
  on(event, cb) {
    if (event === "circuitSelect") this.onCircuitSelect = cb;
    if (event === "submit") this.onSubmit = cb;
    if (event === "close") this.onClose = cb;
  }
  setStage(stage, data) {
    this.stage = stage;
    if (stage === "proving" || stage === "verifying") this.renderProgress(stage);
    else if (stage === "result" && data?.result) this.renderResult(data.result);
    else if (stage === "result" && data?.error) this.renderError(data.error);
  }
  destroy() {
    this.host.innerHTML = "";
  }
  // --- Render methods ---
  renderButton() {
    this.clearContent();
    const btn = document.createElement("button");
    btn.className = "zkr-btn";
    btn.innerHTML = `${LOGO_SVG} ${this.buttonLabel}`;
    btn.addEventListener("click", () => this.openModal());
    this.shadow.appendChild(btn);
  }
  openModal() {
    if (this.selectedCircuit) {
      this.stage = "input";
      this.renderModal();
    } else {
      this.stage = "select";
      this.renderModal();
    }
  }
  renderModal() {
    let overlay = this.shadow.querySelector(".zkr-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "zkr-overlay";
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.closeModal();
      });
      this.shadow.appendChild(overlay);
    }
    const modal = document.createElement("div");
    modal.className = "zkr-modal";
    overlay.innerHTML = "";
    overlay.appendChild(modal);
    modal.innerHTML = `
      <div class="zkr-header">
        <h2>${this.stage === "select" ? "Select Proof Type" : CIRCUITS[this.selectedCircuit]?.name ?? "Verify"}</h2>
        <button class="zkr-close">&times;</button>
      </div>
      <div class="zkr-body"></div>
      <div class="zkr-footer">
        Powered by <a href="https://zkrune.com" target="_blank" rel="noopener">zkRune</a> \u2014 Privacy Infrastructure on Solana
      </div>
    `;
    modal.querySelector(".zkr-close").addEventListener("click", () => this.closeModal());
    const body = modal.querySelector(".zkr-body");
    if (this.stage === "select") this.renderCircuitSelect(body);
    else if (this.stage === "input") this.renderInputForm(body);
  }
  closeModal() {
    const overlay = this.shadow.querySelector(".zkr-overlay");
    if (overlay) overlay.remove();
    this.stage = "idle";
    this.onClose();
  }
  renderCircuitSelect(body) {
    const grouped = getCircuitsByCategory();
    let html = "";
    for (const [catKey, circuits] of Object.entries(grouped)) {
      const cat = CIRCUIT_CATEGORIES[catKey];
      html += `<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;color:${this.theme === "dark" ? "#9ca3af" : "#6b7280"};margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">${cat?.icon ?? ""} ${cat?.label ?? catKey}</div>`;
      html += `<div class="zkr-circuits">`;
      for (const c of circuits) {
        html += `<div class="zkr-circuit-card" data-circuit="${c.id}"><h4>${c.name}</h4><p>${c.description}</p></div>`;
      }
      html += `</div></div>`;
    }
    body.innerHTML = html;
    body.querySelectorAll(".zkr-circuit-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.circuit;
        this.selectedCircuit = id;
        this.stage = "input";
        this.onCircuitSelect(id);
        this.renderModal();
      });
    });
  }
  renderInputForm(body) {
    const circuit = CIRCUITS[this.selectedCircuit];
    if (!circuit) return;
    let fieldsHtml = "";
    for (const field of circuit.fields) {
      const placeholder = field.type === "timestamp" ? "Unix timestamp" : field.type === "hash" ? "Numeric or 0x hex" : "Number";
      fieldsHtml += `
        <div class="zkr-field">
          <label>${field.label}${field.required ? " *" : ""}</label>
          <div class="zkr-desc">${field.description}</div>
          <input type="text" name="${field.name}" placeholder="${placeholder}" data-type="${field.type}" />
        </div>
      `;
    }
    body.innerHTML = `
      <button class="zkr-back">&larr; ${this.selectedCircuit ? "Change proof type" : "Back"}</button>
      <p style="font-size:13px;color:${this.theme === "dark" ? "#9ca3af" : "#6b7280"};margin-bottom:16px">${circuit.description}</p>
      <form class="zkr-form">
        ${fieldsHtml}
        <div class="zkr-errors" style="display:none"></div>
        <button type="submit" class="zkr-submit">Generate & Verify Proof</button>
      </form>
    `;
    body.querySelector(".zkr-back").addEventListener("click", () => {
      this.selectedCircuit = null;
      this.stage = "select";
      this.renderModal();
    });
    const form = body.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = {};
      form.querySelectorAll("input").forEach((input) => {
        inputs[input.name] = input.value.trim();
      });
      this.onSubmit(this.selectedCircuit, inputs);
    });
  }
  renderProgress(stage) {
    const body = this.shadow.querySelector(".zkr-body");
    if (!body) return;
    body.innerHTML = `
      <div class="zkr-progress">
        <div class="zkr-spinner"></div>
        <div class="zkr-progress-label">
          ${stage === "proving" ? "Generating zero-knowledge proof..." : "Verifying proof on server..."}
        </div>
        <div style="font-size:11px;color:${this.theme === "dark" ? "#6b7280" : "#9ca3af"}">
          ${stage === "proving" ? "This may take a few seconds. All data stays in your browser." : "Checking proof against trusted verification key."}
        </div>
      </div>
    `;
  }
  renderResult(result) {
    const body = this.shadow.querySelector(".zkr-body");
    if (!body) return;
    const circuit = CIRCUITS[result.circuitName];
    const pass = result.verified;
    body.innerHTML = `
      <div class="zkr-result">
        <div class="zkr-result-icon">${pass ? "\u2713" : "\u2717"}</div>
        <div class="zkr-result-title ${pass ? "zkr-result-pass" : "zkr-result-fail"}">
          ${pass ? "Proof Verified" : "Verification Failed"}
        </div>
        <div class="zkr-result-sub">
          ${pass ? `${circuit?.name ?? result.circuitName} proof is cryptographically valid.` : "The proof could not be verified. Inputs may be incorrect."}
        </div>
        <dl class="zkr-result-details">
          <dt>Circuit</dt><dd>${circuit?.name ?? result.circuitName}</dd>
          <dt>Proof Hash</dt><dd>${result.proofHash}</dd>
          <dt>Timestamp</dt><dd>${new Date(result.timestamp).toISOString()}</dd>
          <dt>Public Signals</dt><dd>[${result.publicSignals.join(", ")}]</dd>
        </dl>
        <button class="zkr-submit" style="margin-top:8px">Done</button>
      </div>
    `;
    body.querySelector(".zkr-submit").addEventListener("click", () => this.closeModal());
  }
  renderError(message) {
    const body = this.shadow.querySelector(".zkr-body");
    if (!body) return;
    body.innerHTML = `
      <div class="zkr-result">
        <div class="zkr-result-icon">\u26A0</div>
        <div class="zkr-result-title zkr-result-fail">Error</div>
        <div class="zkr-result-sub">${message}</div>
        <button class="zkr-submit" style="margin-top:16px">Try Again</button>
      </div>
    `;
    body.querySelector(".zkr-submit").addEventListener("click", () => {
      this.stage = this.selectedCircuit ? "input" : "select";
      this.renderModal();
    });
  }
  clearContent() {
    while (this.shadow.childNodes.length > 1) {
      this.shadow.removeChild(this.shadow.lastChild);
    }
  }
};

// src/widget.ts
var SNARKJS_CDN = "https://cdn.jsdelivr.net/npm/snarkjs@0.7.4/build/snarkjs.min.js";
var DEFAULT_CIRCUIT_BASE = "https://zkrune.com/circuits";
var DEFAULT_VERIFIER_URL = "https://zkrune.com/api/verify-proof";
var snarkjsPromise = null;
function loadSnarkjs() {
  if (snarkjsPromise) return snarkjsPromise;
  if (typeof window.snarkjs !== "undefined") {
    snarkjsPromise = Promise.resolve(window.snarkjs);
    return snarkjsPromise;
  }
  snarkjsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SNARKJS_CDN;
    script.onload = () => {
      if (window.snarkjs) resolve(window.snarkjs);
      else reject(new Error("snarkjs loaded but not available on window"));
    };
    script.onerror = () => reject(new Error("Failed to load snarkjs from CDN"));
    document.head.appendChild(script);
  });
  return snarkjsPromise;
}
async function hashProof(proof) {
  const data = JSON.stringify(proof);
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
function init(config) {
  const container = typeof config.container === "string" ? document.querySelector(config.container) : config.container;
  if (!container) throw new Error(`zkRune Widget: container "${config.container}" not found`);
  const theme = config.theme ?? "dark";
  const circuitBaseUrl = (config.circuitBaseUrl ?? DEFAULT_CIRCUIT_BASE).replace(/\/$/, "");
  const verifierUrl = config.verifierUrl ?? DEFAULT_VERIFIER_URL;
  const buttonLabel = config.buttonLabel ?? "Verify with zkRune";
  const ui = new WidgetUI(container, theme, buttonLabel, config.circuit);
  ui.on("submit", async (circuitId, inputs) => {
    const validation = validateInputs(circuitId, inputs);
    if (!validation.valid) {
      const err = { code: "INVALID_INPUTS", message: validation.errors.join(", ") };
      config.onError?.(err);
      ui.setStage("result", { error: validation.errors.join("\n") });
      return;
    }
    try {
      ui.setStage("proving");
      const snarkjs = await loadSnarkjs();
      const [wasmResp, zkeyResp] = await Promise.all([
        fetch(`${circuitBaseUrl}/${circuitId}.wasm`),
        fetch(`${circuitBaseUrl}/${circuitId}.zkey`)
      ]);
      if (!wasmResp.ok || !zkeyResp.ok) {
        throw { code: "CIRCUIT_LOAD_FAILED", message: `Failed to load circuit files for ${circuitId}` };
      }
      const [wasmBuffer, zkeyBuffer] = await Promise.all([
        wasmResp.arrayBuffer(),
        zkeyResp.arrayBuffer()
      ]);
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        new Uint8Array(wasmBuffer),
        new Uint8Array(zkeyBuffer)
      );
      ui.setStage("verifying");
      const verifyResp = await fetch(verifierUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circuitName: circuitId, proof, publicSignals })
      });
      if (!verifyResp.ok) {
        throw { code: "NETWORK_ERROR", message: `Verifier returned ${verifyResp.status}` };
      }
      const verifyData = await verifyResp.json();
      const proofHash = await hashProof(proof);
      const result = {
        verified: verifyData.isValid === true,
        circuitName: circuitId,
        proof,
        publicSignals,
        proofHash,
        timestamp: Date.now()
      };
      ui.setStage("result", { result });
      config.onResult?.(result);
      if (window.parent !== window) {
        window.parent.postMessage({ type: "zkrune-result", ...result }, "*");
      }
    } catch (err) {
      const widgetError = {
        code: err.code ?? "PROOF_GENERATION_FAILED",
        message: err.message ?? "Proof generation failed"
      };
      config.onError?.(widgetError);
      ui.setStage("result", { error: widgetError.message });
    }
  });
  return {
    destroy: () => ui.destroy()
  };
}
function verify(circuitId, inputs, options) {
  return new Promise((resolve, reject) => {
    const container = document.createElement("div");
    container.style.display = "none";
    document.body.appendChild(container);
    const circuitBaseUrl = (options?.circuitBaseUrl ?? DEFAULT_CIRCUIT_BASE).replace(/\/$/, "");
    const verifierUrl = options?.verifierUrl ?? DEFAULT_VERIFIER_URL;
    const validation = validateInputs(circuitId, inputs);
    if (!validation.valid) {
      container.remove();
      reject({ code: "INVALID_INPUTS", message: validation.errors.join(", ") });
      return;
    }
    (async () => {
      try {
        const snarkjs = await loadSnarkjs();
        const [wasmResp, zkeyResp] = await Promise.all([
          fetch(`${circuitBaseUrl}/${circuitId}.wasm`),
          fetch(`${circuitBaseUrl}/${circuitId}.zkey`)
        ]);
        if (!wasmResp.ok || !zkeyResp.ok) {
          throw { code: "CIRCUIT_LOAD_FAILED", message: `Failed to load circuit files for ${circuitId}` };
        }
        const [wasmBuffer, zkeyBuffer] = await Promise.all([
          wasmResp.arrayBuffer(),
          zkeyResp.arrayBuffer()
        ]);
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
          inputs,
          new Uint8Array(wasmBuffer),
          new Uint8Array(zkeyBuffer)
        );
        const verifyResp = await fetch(verifierUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ circuitName: circuitId, proof, publicSignals })
        });
        const verifyData = await verifyResp.json();
        const proofHash = await hashProof(proof);
        const result = {
          verified: verifyData.isValid === true,
          circuitName: circuitId,
          proof,
          publicSignals,
          proofHash,
          timestamp: Date.now()
        };
        container.remove();
        resolve(result);
      } catch (err) {
        container.remove();
        reject({ code: err.code ?? "PROOF_GENERATION_FAILED", message: err.message ?? "Failed" });
      }
    })();
  });
}
export {
  CIRCUITS,
  CIRCUIT_CATEGORIES,
  getCircuitsByCategory,
  init,
  validateInputs,
  verify
};
