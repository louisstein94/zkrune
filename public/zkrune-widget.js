"use strict";var ZkRuneWidget=(()=>{var T=Object.defineProperty;var B=Object.getOwnPropertyDescriptor;var A=Object.getOwnPropertyNames;var L=Object.prototype.hasOwnProperty;var U=(t,e)=>{for(var r in e)T(t,r,{get:e[r],enumerable:!0})},D=(t,e,r,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of A(e))!L.call(t,i)&&i!==r&&T(t,i,{get:()=>e[i],enumerable:!(a=B(e,i))||a.enumerable});return t};var V=t=>D(T({},"__esModule",{value:!0}),t);var j={};U(j,{CIRCUITS:()=>u,CIRCUIT_CATEGORIES:()=>v,getCircuitsByCategory:()=>k,init:()=>M,validateInputs:()=>y,verify:()=>H});var u={"age-verification":{id:"age-verification",name:"Age Verification",description:"Prove you meet a minimum age requirement without revealing your birth year",category:"identity",fields:[{name:"birthYear",label:"Birth Year",description:"Year of birth (4-digit)",required:!0,type:"integer"},{name:"currentYear",label:"Current Year",description:"Current calendar year",required:!0,type:"integer"},{name:"minimumAge",label:"Minimum Age",description:"Required minimum age",required:!0,type:"integer"}]},"balance-proof":{id:"balance-proof",name:"Balance Proof",description:"Prove your balance exceeds a threshold without revealing the amount",category:"financial",fields:[{name:"balance",label:"Balance",description:"Actual token balance",required:!0,type:"integer"},{name:"minimumBalance",label:"Minimum Balance",description:"Required minimum",required:!0,type:"integer"}]},"membership-proof":{id:"membership-proof",name:"Membership Proof",description:"Prove membership in a group without revealing your identity",category:"identity",fields:[{name:"memberId",label:"Member ID",description:"Private member identifier",required:!0,type:"hash"},{name:"groupHash",label:"Group Hash",description:"Hash of the group set",required:!0,type:"hash"}]},"range-proof":{id:"range-proof",name:"Range Proof",description:"Prove a value falls within a range without revealing it",category:"financial",fields:[{name:"value",label:"Value",description:"Private value",required:!0,type:"integer"},{name:"minRange",label:"Minimum",description:"Lower bound (inclusive)",required:!0,type:"integer"},{name:"maxRange",label:"Maximum",description:"Upper bound (inclusive)",required:!0,type:"integer"}]},"private-voting":{id:"private-voting",name:"Private Voting",description:"Cast a verifiable vote without revealing your identity",category:"governance",fields:[{name:"voterId",label:"Voter ID",description:"Private voter identifier",required:!0,type:"hash"},{name:"voteChoice",label:"Vote Choice",description:"Numeric vote option",required:!0,type:"integer"},{name:"pollId",label:"Poll ID",description:"Poll identifier",required:!0,type:"hash"}]},"hash-preimage":{id:"hash-preimage",name:"Hash Preimage",description:"Prove knowledge of a hash preimage without revealing it",category:"cryptographic",fields:[{name:"preimage",label:"Preimage",description:"Secret preimage value",required:!0,type:"hash"},{name:"salt",label:"Salt",description:"Random salt",required:!0,type:"hash"},{name:"expectedHash",label:"Expected Hash",description:"Public hash to verify against",required:!0,type:"hash"}]},"credential-proof":{id:"credential-proof",name:"Credential Proof",description:"Prove possession of a valid credential without exposing it",category:"identity",fields:[{name:"credentialHash",label:"Credential Hash",description:"Hash of credential data",required:!0,type:"hash"},{name:"credentialSecret",label:"Credential Secret",description:"Private key bound to credential",required:!0,type:"hash"},{name:"validUntil",label:"Valid Until",description:"Expiry timestamp",required:!0,type:"timestamp"},{name:"currentTime",label:"Current Time",description:"Current timestamp",required:!0,type:"timestamp"},{name:"expectedHash",label:"Expected Hash",description:"Public commitment hash",required:!0,type:"hash"}]},"token-swap":{id:"token-swap",name:"Token Swap",description:"Prove eligibility for a token swap without revealing your full balance",category:"financial",fields:[{name:"tokenABalance",label:"Token A Balance",description:"Source token balance",required:!0,type:"integer"},{name:"swapSecret",label:"Swap Secret",description:"Private swap secret",required:!0,type:"hash"},{name:"requiredTokenA",label:"Required Token A",description:"Minimum source amount",required:!0,type:"integer"},{name:"swapRate",label:"Swap Rate",description:"Exchange rate multiplier",required:!0,type:"integer"},{name:"minReceive",label:"Min Receive",description:"Minimum tokens to receive",required:!0,type:"integer"}]},"signature-verification":{id:"signature-verification",name:"Signature Verification",description:"Verify an EdDSA signature inside a zero-knowledge circuit",category:"cryptographic",fields:[{name:"R8x",label:"R8 X",description:"X coordinate of R8",required:!0,type:"hash"},{name:"R8y",label:"R8 Y",description:"Y coordinate of R8",required:!0,type:"hash"},{name:"S",label:"S",description:"Scalar component",required:!0,type:"hash"},{name:"Ax",label:"Public Key X",description:"Signer pub key X",required:!0,type:"hash"},{name:"Ay",label:"Public Key Y",description:"Signer pub key Y",required:!0,type:"hash"},{name:"M",label:"Message",description:"Signed message",required:!0,type:"hash"}]},"patience-proof":{id:"patience-proof",name:"Patience Proof",description:"Prove a minimum waiting period has elapsed",category:"cryptographic",fields:[{name:"startTime",label:"Start Time",description:"Wait start timestamp",required:!0,type:"timestamp"},{name:"endTime",label:"End Time",description:"Wait end timestamp",required:!0,type:"timestamp"},{name:"secret",label:"Secret",description:"Time-lock secret",required:!0,type:"hash"},{name:"minimumWaitTime",label:"Min Wait",description:"Required wait (seconds)",required:!0,type:"integer"},{name:"commitmentHash",label:"Commitment Hash",description:"Public commitment",required:!0,type:"hash"}]},"quadratic-voting":{id:"quadratic-voting",name:"Quadratic Voting",description:"Cast a quadratic vote weighted by token balance",category:"governance",fields:[{name:"voterId",label:"Voter ID",description:"Private voter identifier",required:!0,type:"hash"},{name:"tokenBalance",label:"Token Balance",description:"Governance tokens held",required:!0,type:"integer"},{name:"voteChoice",label:"Vote Choice",description:"Vote option",required:!0,type:"integer"},{name:"pollId",label:"Poll ID",description:"Poll identifier",required:!0,type:"hash"},{name:"minTokens",label:"Min Tokens",description:"Minimum to participate",required:!0,type:"integer"}]},"nft-ownership":{id:"nft-ownership",name:"NFT Ownership",description:"Prove you own an NFT without revealing which one",category:"financial",fields:[{name:"nftTokenId",label:"NFT Token ID",description:"Private token ID",required:!0,type:"integer"},{name:"ownerSecret",label:"Owner Secret",description:"Ownership proof key",required:!0,type:"hash"},{name:"collectionRoot",label:"Collection Root",description:"Merkle root of collection",required:!0,type:"hash"},{name:"minTokenId",label:"Min Token ID",description:"Valid range lower bound",required:!0,type:"integer"},{name:"maxTokenId",label:"Max Token ID",description:"Valid range upper bound",required:!0,type:"integer"}]},"anonymous-reputation":{id:"anonymous-reputation",name:"Anonymous Reputation",description:"Prove reputation score exceeds a threshold anonymously",category:"identity",fields:[{name:"userId",label:"User ID",description:"Private user identifier",required:!0,type:"hash"},{name:"reputationScore",label:"Reputation Score",description:"Actual score",required:!0,type:"integer"},{name:"userNonce",label:"User Nonce",description:"Random nonce for unlinkability",required:!0,type:"hash"},{name:"thresholdScore",label:"Threshold",description:"Minimum score required",required:!0,type:"integer"},{name:"platformId",label:"Platform ID",description:"Score issuer ID",required:!0,type:"hash"}]},"whale-holder":{id:"whale-holder",name:"Whale Holder",description:"Prove whale-level token holdings without revealing exact amount",category:"financial",fields:[{name:"balance",label:"Balance",description:"Actual token balance",required:!0,type:"integer"},{name:"minimumBalance",label:"Whale Threshold",description:"Minimum whale balance",required:!0,type:"integer"}]}},v={identity:{label:"Identity",icon:"\u{1F6E1}"},financial:{label:"Financial",icon:"\u{1F4B0}"},governance:{label:"Governance",icon:"\u{1F5F3}"},cryptographic:{label:"Cryptographic",icon:"\u{1F510}"}};function k(){let t={};for(let e of Object.values(u))t[e.category]||(t[e.category]=[]),t[e.category].push(e);return t}function y(t,e){let r=u[t];if(!r)return{valid:!1,errors:[`Unknown circuit: ${t}`]};let a=[];for(let i of r.fields){let o=e[i.name];if(i.required&&(o===void 0||o==="")){a.push(`${i.label} is required`);continue}o===void 0||o===""||((i.type==="integer"||i.type==="timestamp")&&(/^\d+$/.test(o)||a.push(`${i.label} must be a non-negative integer`)),i.type==="hash"&&!/^\d+$/.test(o)&&!/^0x[0-9a-fA-F]+$/.test(o)&&a.push(`${i.label} must be a numeric or hex value`))}return{valid:a.length===0,errors:a}}function q(t){let e=t==="dark"?{bg:"#0a0a0f",bgOverlay:"rgba(0,0,0,0.7)",surface:"#111118",surfaceHover:"#1a1a24",border:"rgba(255,255,255,0.1)",borderHover:"rgba(255,255,255,0.2)",text:"#e5e7eb",textMuted:"#9ca3af",textDim:"#6b7280",primary:"#6366f1",primaryHover:"#5b5bd6",primaryText:"#fff",success:"#34d399",successBg:"rgba(52,211,153,0.1)",error:"#f87171",errorBg:"rgba(248,113,113,0.1)",inputBg:"rgba(255,255,255,0.05)",inputBorder:"rgba(255,255,255,0.1)",badgeBg:"#6366f1",badgeText:"#fff",scrollThumb:"#333"}:{bg:"#ffffff",bgOverlay:"rgba(0,0,0,0.4)",surface:"#f9fafb",surfaceHover:"#f3f4f6",border:"rgba(0,0,0,0.1)",borderHover:"rgba(0,0,0,0.2)",text:"#111827",textMuted:"#6b7280",textDim:"#9ca3af",primary:"#6366f1",primaryHover:"#4f46e5",primaryText:"#fff",success:"#059669",successBg:"rgba(5,150,105,0.1)",error:"#dc2626",errorBg:"rgba(220,38,38,0.1)",inputBg:"#fff",inputBorder:"rgba(0,0,0,0.15)",badgeBg:"#6366f1",badgeText:"#fff",scrollThumb:"#ccc"};return`
:host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

* { box-sizing: border-box; margin: 0; padding: 0; }

.zkr-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border: none; border-radius: 8px;
  background: ${e.badgeBg}; color: ${e.badgeText};
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.zkr-btn:hover { background: ${e.primaryHover}; transform: translateY(-1px); }
.zkr-btn:active { transform: translateY(0); }
.zkr-btn svg { width: 18px; height: 18px; }

.zkr-overlay {
  position: fixed; inset: 0; z-index: 999999;
  background: ${e.bgOverlay}; display: flex; align-items: center; justify-content: center;
  animation: zkr-fadeIn 0.2s ease;
}

.zkr-modal {
  background: ${e.bg}; border: 1px solid ${e.border}; border-radius: 16px;
  width: 90vw; max-width: 480px; max-height: 85vh; overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  animation: zkr-slideUp 0.25s ease;
}
.zkr-modal::-webkit-scrollbar { width: 6px; }
.zkr-modal::-webkit-scrollbar-thumb { background: ${e.scrollThumb}; border-radius: 3px; }

.zkr-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid ${e.border};
}
.zkr-header h2 { font-size: 18px; font-weight: 700; color: ${e.text}; }
.zkr-close {
  width: 32px; height: 32px; border: none; border-radius: 8px;
  background: ${e.surface}; color: ${e.textMuted}; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; transition: background 0.15s;
}
.zkr-close:hover { background: ${e.surfaceHover}; }

.zkr-body { padding: 24px; }

.zkr-circuits {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.zkr-circuit-card {
  padding: 14px; border: 1px solid ${e.border}; border-radius: 10px;
  background: ${e.surface}; cursor: pointer; transition: all 0.15s;
}
.zkr-circuit-card:hover { border-color: ${e.primary}; background: ${e.surfaceHover}; }
.zkr-circuit-card h4 { font-size: 13px; font-weight: 600; color: ${e.text}; margin-bottom: 4px; }
.zkr-circuit-card p { font-size: 11px; color: ${e.textMuted}; line-height: 1.4; }
.zkr-circuit-card .zkr-cat { font-size: 10px; color: ${e.primary}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }

.zkr-form { display: flex; flex-direction: column; gap: 16px; }
.zkr-field label { display: block; font-size: 13px; font-weight: 500; color: ${e.text}; margin-bottom: 6px; }
.zkr-field .zkr-desc { font-size: 11px; color: ${e.textDim}; margin-bottom: 6px; }
.zkr-field input {
  width: 100%; padding: 10px 12px; border: 1px solid ${e.inputBorder};
  border-radius: 8px; background: ${e.inputBg}; color: ${e.text};
  font-size: 14px; outline: none; transition: border 0.15s;
}
.zkr-field input:focus { border-color: ${e.primary}; }
.zkr-field input::placeholder { color: ${e.textDim}; }

.zkr-errors { padding: 12px; border-radius: 8px; background: ${e.errorBg}; border: 1px solid ${e.error}; }
.zkr-errors p { font-size: 12px; color: ${e.error}; }

.zkr-submit {
  width: 100%; padding: 12px; border: none; border-radius: 10px;
  background: ${e.primary}; color: ${e.primaryText};
  font-size: 15px; font-weight: 600; cursor: pointer;
  transition: background 0.15s;
}
.zkr-submit:hover { background: ${e.primaryHover}; }
.zkr-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.zkr-back {
  background: none; border: none; color: ${e.primary};
  font-size: 13px; cursor: pointer; padding: 0; margin-bottom: 16px;
  display: flex; align-items: center; gap: 4px;
}
.zkr-back:hover { text-decoration: underline; }

.zkr-progress {
  display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 32px 0;
}
.zkr-spinner {
  width: 48px; height: 48px; border: 3px solid ${e.border};
  border-top-color: ${e.primary}; border-radius: 50%;
  animation: zkr-spin 0.8s linear infinite;
}
.zkr-progress-label { font-size: 14px; color: ${e.textMuted}; }

.zkr-result {
  display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px 0;
}
.zkr-result-icon { font-size: 48px; }
.zkr-result-title { font-size: 20px; font-weight: 700; color: ${e.text}; }
.zkr-result-sub { font-size: 13px; color: ${e.textMuted}; text-align: center; }
.zkr-result-pass { color: ${e.success}; }
.zkr-result-fail { color: ${e.error}; }

.zkr-result-details {
  width: 100%; padding: 14px; border-radius: 10px;
  background: ${e.surface}; border: 1px solid ${e.border};
  font-size: 12px; color: ${e.textMuted}; word-break: break-all;
}
.zkr-result-details dt { font-weight: 600; color: ${e.text}; margin-top: 8px; }
.zkr-result-details dt:first-child { margin-top: 0; }
.zkr-result-details dd { margin: 2px 0 0; }

.zkr-footer {
  padding: 16px 24px; border-top: 1px solid ${e.border};
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 11px; color: ${e.textDim};
}
.zkr-footer a { color: ${e.primary}; text-decoration: none; }
.zkr-footer a:hover { text-decoration: underline; }

@keyframes zkr-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zkr-slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes zkr-spin { to { transform: rotate(360deg); } }
`}var N='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',x=class{constructor(e,r,a,i){this.stage="idle";this.selectedCircuit=null;this.onCircuitSelect=()=>{};this.onSubmit=()=>{};this.onClose=()=>{};this.host=e,this.theme=r,this.buttonLabel=a,this.selectedCircuit=i??null,this.shadow=this.host.attachShadow({mode:"open"});let o=document.createElement("style");o.textContent=q(r),this.shadow.appendChild(o),this.renderButton()}on(e,r){e==="circuitSelect"&&(this.onCircuitSelect=r),e==="submit"&&(this.onSubmit=r),e==="close"&&(this.onClose=r)}setStage(e,r){this.stage=e,e==="proving"||e==="verifying"?this.renderProgress(e):e==="result"&&r?.result?this.renderResult(r.result):e==="result"&&r?.error&&this.renderError(r.error)}destroy(){this.host.innerHTML=""}renderButton(){this.clearContent();let e=document.createElement("button");e.className="zkr-btn",e.innerHTML=`${N} ${this.buttonLabel}`,e.addEventListener("click",()=>this.openModal()),this.shadow.appendChild(e)}openModal(){this.selectedCircuit?(this.stage="input",this.renderModal()):(this.stage="select",this.renderModal())}renderModal(){let e=this.shadow.querySelector(".zkr-overlay");e||(e=document.createElement("div"),e.className="zkr-overlay",e.addEventListener("click",i=>{i.target===e&&this.closeModal()}),this.shadow.appendChild(e));let r=document.createElement("div");r.className="zkr-modal",e.innerHTML="",e.appendChild(r),r.innerHTML=`
      <div class="zkr-header">
        <h2>${this.stage==="select"?"Select Proof Type":u[this.selectedCircuit]?.name??"Verify"}</h2>
        <button class="zkr-close">&times;</button>
      </div>
      <div class="zkr-body"></div>
      <div class="zkr-footer">
        Powered by <a href="https://zkrune.com" target="_blank" rel="noopener">zkRune</a> \u2014 Privacy Infrastructure on Solana
      </div>
    `,r.querySelector(".zkr-close").addEventListener("click",()=>this.closeModal());let a=r.querySelector(".zkr-body");this.stage==="select"?this.renderCircuitSelect(a):this.stage==="input"&&this.renderInputForm(a)}closeModal(){let e=this.shadow.querySelector(".zkr-overlay");e&&e.remove(),this.stage="idle",this.onClose()}renderCircuitSelect(e){let r=k(),a="";for(let[i,o]of Object.entries(r)){let n=v[i];a+=`<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;color:${this.theme==="dark"?"#9ca3af":"#6b7280"};margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">${n?.icon??""} ${n?.label??i}</div>`,a+='<div class="zkr-circuits">';for(let s of o)a+=`<div class="zkr-circuit-card" data-circuit="${s.id}"><h4>${s.name}</h4><p>${s.description}</p></div>`;a+="</div></div>"}e.innerHTML=a,e.querySelectorAll(".zkr-circuit-card").forEach(i=>{i.addEventListener("click",()=>{let o=i.dataset.circuit;this.selectedCircuit=o,this.stage="input",this.onCircuitSelect(o),this.renderModal()})})}renderInputForm(e){let r=u[this.selectedCircuit];if(!r)return;let a="";for(let o of r.fields){let n=o.type==="timestamp"?"Unix timestamp":o.type==="hash"?"Numeric or 0x hex":"Number";a+=`
        <div class="zkr-field">
          <label>${o.label}${o.required?" *":""}</label>
          <div class="zkr-desc">${o.description}</div>
          <input type="text" name="${o.name}" placeholder="${n}" data-type="${o.type}" />
        </div>
      `}e.innerHTML=`
      <button class="zkr-back">&larr; ${this.selectedCircuit?"Change proof type":"Back"}</button>
      <p style="font-size:13px;color:${this.theme==="dark"?"#9ca3af":"#6b7280"};margin-bottom:16px">${r.description}</p>
      <form class="zkr-form">
        ${a}
        <div class="zkr-errors" style="display:none"></div>
        <button type="submit" class="zkr-submit">Generate & Verify Proof</button>
      </form>
    `,e.querySelector(".zkr-back").addEventListener("click",()=>{this.selectedCircuit=null,this.stage="select",this.renderModal()});let i=e.querySelector("form");i.addEventListener("submit",o=>{o.preventDefault();let n={};i.querySelectorAll("input").forEach(s=>{n[s.name]=s.value.trim()}),this.onSubmit(this.selectedCircuit,n)})}renderProgress(e){let r=this.shadow.querySelector(".zkr-body");r&&(r.innerHTML=`
      <div class="zkr-progress">
        <div class="zkr-spinner"></div>
        <div class="zkr-progress-label">
          ${e==="proving"?"Generating zero-knowledge proof...":"Verifying proof on server..."}
        </div>
        <div style="font-size:11px;color:${this.theme==="dark"?"#6b7280":"#9ca3af"}">
          ${e==="proving"?"This may take a few seconds. All data stays in your browser.":"Checking proof against trusted verification key."}
        </div>
      </div>
    `)}renderResult(e){let r=this.shadow.querySelector(".zkr-body");if(!r)return;let a=u[e.circuitName],i=e.verified;r.innerHTML=`
      <div class="zkr-result">
        <div class="zkr-result-icon">${i?"\u2713":"\u2717"}</div>
        <div class="zkr-result-title ${i?"zkr-result-pass":"zkr-result-fail"}">
          ${i?"Proof Verified":"Verification Failed"}
        </div>
        <div class="zkr-result-sub">
          ${i?`${a?.name??e.circuitName} proof is cryptographically valid.`:"The proof could not be verified. Inputs may be incorrect."}
        </div>
        <dl class="zkr-result-details">
          <dt>Circuit</dt><dd>${a?.name??e.circuitName}</dd>
          <dt>Proof Hash</dt><dd>${e.proofHash}</dd>
          <dt>Timestamp</dt><dd>${new Date(e.timestamp).toISOString()}</dd>
          <dt>Public Signals</dt><dd>[${e.publicSignals.join(", ")}]</dd>
        </dl>
        <button class="zkr-submit" style="margin-top:8px">Done</button>
      </div>
    `,r.querySelector(".zkr-submit").addEventListener("click",()=>this.closeModal())}renderError(e){let r=this.shadow.querySelector(".zkr-body");r&&(r.innerHTML=`
      <div class="zkr-result">
        <div class="zkr-result-icon">\u26A0</div>
        <div class="zkr-result-title zkr-result-fail">Error</div>
        <div class="zkr-result-sub">${e}</div>
        <button class="zkr-submit" style="margin-top:16px">Try Again</button>
      </div>
    `,r.querySelector(".zkr-submit").addEventListener("click",()=>{this.stage=this.selectedCircuit?"input":"select",this.renderModal()}))}clearContent(){for(;this.shadow.childNodes.length>1;)this.shadow.removeChild(this.shadow.lastChild)}};var O="https://cdn.jsdelivr.net/npm/snarkjs@0.7.4/build/snarkjs.min.js",R="https://zkrune.com/circuits",I="https://zkrune.com/api/verify-proof",m=null;function P(){return m||(typeof window.snarkjs<"u"?(m=Promise.resolve(window.snarkjs),m):(m=new Promise((t,e)=>{let r=document.createElement("script");r.src=O,r.onload=()=>{window.snarkjs?t(window.snarkjs):e(new Error("snarkjs loaded but not available on window"))},r.onerror=()=>e(new Error("Failed to load snarkjs from CDN")),document.head.appendChild(r)}),m))}async function E(t){let e=JSON.stringify(t),r=new TextEncoder().encode(e),a=await crypto.subtle.digest("SHA-256",r);return Array.from(new Uint8Array(a)).map(o=>o.toString(16).padStart(2,"0")).join("")}function M(t){let e=typeof t.container=="string"?document.querySelector(t.container):t.container;if(!e)throw new Error(`zkRune Widget: container "${t.container}" not found`);let r=t.theme??"dark",a=(t.circuitBaseUrl??R).replace(/\/$/,""),i=t.verifierUrl??I,o=t.buttonLabel??"Verify with zkRune",n=new x(e,r,o,t.circuit);return n.on("submit",async(s,f)=>{let l=y(s,f);if(!l.valid){let d={code:"INVALID_INPUTS",message:l.errors.join(", ")};t.onError?.(d),n.setStage("result",{error:l.errors.join(`
`)});return}try{n.setStage("proving");let d=await P(),[c,b]=await Promise.all([fetch(`${a}/${s}.wasm`),fetch(`${a}/${s}.zkey`)]);if(!c.ok||!b.ok)throw{code:"CIRCUIT_LOAD_FAILED",message:`Failed to load circuit files for ${s}`};let[w,h]=await Promise.all([c.arrayBuffer(),b.arrayBuffer()]),{proof:p,publicSignals:z}=await d.groth16.fullProve(f,new Uint8Array(w),new Uint8Array(h));n.setStage("verifying");let g=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({circuitName:s,proof:p,publicSignals:z})});if(!g.ok)throw{code:"NETWORK_ERROR",message:`Verifier returned ${g.status}`};let C=await g.json(),$=await E(p),S={verified:C.isValid===!0,circuitName:s,proof:p,publicSignals:z,proofHash:$,timestamp:Date.now()};n.setStage("result",{result:S}),t.onResult?.(S),window.parent!==window&&window.parent.postMessage({type:"zkrune-result",...S},"*")}catch(d){let c={code:d.code??"PROOF_GENERATION_FAILED",message:d.message??"Proof generation failed"};t.onError?.(c),n.setStage("result",{error:c.message})}}),{destroy:()=>n.destroy()}}function H(t,e,r){return new Promise((a,i)=>{let o=document.createElement("div");o.style.display="none",document.body.appendChild(o);let n=(r?.circuitBaseUrl??R).replace(/\/$/,""),s=r?.verifierUrl??I,f=y(t,e);if(!f.valid){o.remove(),i({code:"INVALID_INPUTS",message:f.errors.join(", ")});return}(async()=>{try{let l=await P(),[d,c]=await Promise.all([fetch(`${n}/${t}.wasm`),fetch(`${n}/${t}.zkey`)]);if(!d.ok||!c.ok)throw{code:"CIRCUIT_LOAD_FAILED",message:`Failed to load circuit files for ${t}`};let[b,w]=await Promise.all([d.arrayBuffer(),c.arrayBuffer()]),{proof:h,publicSignals:p}=await l.groth16.fullProve(e,new Uint8Array(b),new Uint8Array(w)),g=await(await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({circuitName:t,proof:h,publicSignals:p})})).json(),C=await E(h),$={verified:g.isValid===!0,circuitName:t,proof:h,publicSignals:p,proofHash:C,timestamp:Date.now()};o.remove(),a($)}catch(l){o.remove(),i({code:l.code??"PROOF_GENERATION_FAILED",message:l.message??"Failed"})}})()})}return V(j);})();
