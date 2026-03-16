import type { CircuitId, CircuitMeta, WidgetStage, VerifyResult, WidgetTheme } from './types';
import { CIRCUITS, CIRCUIT_CATEGORIES, getCircuitsByCategory } from './circuits';
import { getStyles } from './styles';

const LOGO_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`;

export class WidgetUI {
  private host: HTMLElement;
  private shadow: ShadowRoot;
  private theme: WidgetTheme;
  private stage: WidgetStage = 'idle';
  private selectedCircuit: CircuitId | null = null;
  private buttonLabel: string;

  private onCircuitSelect: (id: CircuitId) => void = () => {};
  private onSubmit: (circuitId: CircuitId, inputs: Record<string, string>) => void = () => {};
  private onClose: () => void = () => {};

  constructor(container: HTMLElement, theme: WidgetTheme, buttonLabel: string, preselectedCircuit?: CircuitId) {
    this.host = container;
    this.theme = theme;
    this.buttonLabel = buttonLabel;
    this.selectedCircuit = preselectedCircuit ?? null;

    this.shadow = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = getStyles(theme);
    this.shadow.appendChild(style);

    this.renderButton();
  }

  on(event: 'circuitSelect', cb: (id: CircuitId) => void): void;
  on(event: 'submit', cb: (circuitId: CircuitId, inputs: Record<string, string>) => void): void;
  on(event: 'close', cb: () => void): void;
  on(event: string, cb: (...args: any[]) => void): void {
    if (event === 'circuitSelect') this.onCircuitSelect = cb;
    if (event === 'submit') this.onSubmit = cb;
    if (event === 'close') this.onClose = cb;
  }

  setStage(stage: WidgetStage, data?: { result?: VerifyResult; error?: string }) {
    this.stage = stage;
    if (stage === 'proving' || stage === 'verifying') this.renderProgress(stage);
    else if (stage === 'result' && data?.result) this.renderResult(data.result);
    else if (stage === 'result' && data?.error) this.renderError(data.error);
  }

  destroy() {
    this.host.innerHTML = '';
  }

  // --- Render methods ---

  private renderButton() {
    this.clearContent();
    const btn = document.createElement('button');
    btn.className = 'zkr-btn';
    btn.innerHTML = `${LOGO_SVG} ${this.buttonLabel}`;
    btn.addEventListener('click', () => this.openModal());
    this.shadow.appendChild(btn);
  }

  private openModal() {
    if (this.selectedCircuit) {
      this.stage = 'input';
      this.renderModal();
    } else {
      this.stage = 'select';
      this.renderModal();
    }
  }

  private renderModal() {
    let overlay = this.shadow.querySelector('.zkr-overlay') as HTMLElement | null;
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'zkr-overlay';
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal();
      });
      this.shadow.appendChild(overlay);
    }

    const modal = document.createElement('div');
    modal.className = 'zkr-modal';
    overlay.innerHTML = '';
    overlay.appendChild(modal);

    modal.innerHTML = `
      <div class="zkr-header">
        <h2>${this.stage === 'select' ? 'Select Proof Type' : (CIRCUITS[this.selectedCircuit!]?.name ?? 'Verify')}</h2>
        <button class="zkr-close">&times;</button>
      </div>
      <div class="zkr-body"></div>
      <div class="zkr-footer">
        Powered by <a href="https://zkrune.com" target="_blank" rel="noopener">zkRune</a> — Privacy Infrastructure on Solana
      </div>
    `;

    modal.querySelector('.zkr-close')!.addEventListener('click', () => this.closeModal());

    const body = modal.querySelector('.zkr-body') as HTMLElement;

    if (this.stage === 'select') this.renderCircuitSelect(body);
    else if (this.stage === 'input') this.renderInputForm(body);
  }

  private closeModal() {
    const overlay = this.shadow.querySelector('.zkr-overlay');
    if (overlay) overlay.remove();
    this.stage = 'idle';
    this.onClose();
  }

  private renderCircuitSelect(body: HTMLElement) {
    const grouped = getCircuitsByCategory();
    let html = '';

    for (const [catKey, circuits] of Object.entries(grouped)) {
      const cat = CIRCUIT_CATEGORIES[catKey as keyof typeof CIRCUIT_CATEGORIES];
      html += `<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;color:${this.theme === 'dark' ? '#9ca3af' : '#6b7280'};margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">${cat?.icon ?? ''} ${cat?.label ?? catKey}</div>`;
      html += `<div class="zkr-circuits">`;
      for (const c of circuits) {
        html += `<div class="zkr-circuit-card" data-circuit="${c.id}"><h4>${c.name}</h4><p>${c.description}</p></div>`;
      }
      html += `</div></div>`;
    }

    body.innerHTML = html;

    body.querySelectorAll('.zkr-circuit-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = (card as HTMLElement).dataset.circuit as CircuitId;
        this.selectedCircuit = id;
        this.stage = 'input';
        this.onCircuitSelect(id);
        this.renderModal();
      });
    });
  }

  private renderInputForm(body: HTMLElement) {
    const circuit = CIRCUITS[this.selectedCircuit!];
    if (!circuit) return;

    let fieldsHtml = '';
    for (const field of circuit.fields) {
      const placeholder = field.type === 'timestamp' ? 'Unix timestamp' : field.type === 'hash' ? 'Numeric or 0x hex' : 'Number';
      fieldsHtml += `
        <div class="zkr-field">
          <label>${field.label}${field.required ? ' *' : ''}</label>
          <div class="zkr-desc">${field.description}</div>
          <input type="text" name="${field.name}" placeholder="${placeholder}" data-type="${field.type}" />
        </div>
      `;
    }

    body.innerHTML = `
      <button class="zkr-back">&larr; ${this.selectedCircuit ? 'Change proof type' : 'Back'}</button>
      <p style="font-size:13px;color:${this.theme === 'dark' ? '#9ca3af' : '#6b7280'};margin-bottom:16px">${circuit.description}</p>
      <form class="zkr-form">
        ${fieldsHtml}
        <div class="zkr-errors" style="display:none"></div>
        <button type="submit" class="zkr-submit">Generate & Verify Proof</button>
      </form>
    `;

    body.querySelector('.zkr-back')!.addEventListener('click', () => {
      this.selectedCircuit = null;
      this.stage = 'select';
      this.renderModal();
    });

    const form = body.querySelector('form')! as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs: Record<string, string> = {};
      form.querySelectorAll('input').forEach((input) => {
        inputs[input.name] = input.value.trim();
      });
      this.onSubmit(this.selectedCircuit!, inputs);
    });
  }

  private renderProgress(stage: 'proving' | 'verifying') {
    const body = this.shadow.querySelector('.zkr-body') as HTMLElement;
    if (!body) return;

    body.innerHTML = `
      <div class="zkr-progress">
        <div class="zkr-spinner"></div>
        <div class="zkr-progress-label">
          ${stage === 'proving' ? 'Generating zero-knowledge proof...' : 'Verifying proof on server...'}
        </div>
        <div style="font-size:11px;color:${this.theme === 'dark' ? '#6b7280' : '#9ca3af'}">
          ${stage === 'proving' ? 'This may take a few seconds. All data stays in your browser.' : 'Checking proof against trusted verification key.'}
        </div>
      </div>
    `;
  }

  private renderResult(result: VerifyResult) {
    const body = this.shadow.querySelector('.zkr-body') as HTMLElement;
    if (!body) return;

    const circuit = CIRCUITS[result.circuitName];
    const pass = result.verified;

    body.innerHTML = `
      <div class="zkr-result">
        <div class="zkr-result-icon">${pass ? '✓' : '✗'}</div>
        <div class="zkr-result-title ${pass ? 'zkr-result-pass' : 'zkr-result-fail'}">
          ${pass ? 'Proof Verified' : 'Verification Failed'}
        </div>
        <div class="zkr-result-sub">
          ${pass
            ? `${circuit?.name ?? result.circuitName} proof is cryptographically valid.`
            : 'The proof could not be verified. Inputs may be incorrect.'}
        </div>
        <dl class="zkr-result-details">
          <dt>Circuit</dt><dd>${circuit?.name ?? result.circuitName}</dd>
          <dt>Proof Hash</dt><dd>${result.proofHash}</dd>
          <dt>Timestamp</dt><dd>${new Date(result.timestamp).toISOString()}</dd>
          <dt>Public Signals</dt><dd>[${result.publicSignals.join(', ')}]</dd>
        </dl>
        <button class="zkr-submit" style="margin-top:8px">Done</button>
      </div>
    `;

    body.querySelector('.zkr-submit')!.addEventListener('click', () => this.closeModal());
  }

  private renderError(message: string) {
    const body = this.shadow.querySelector('.zkr-body') as HTMLElement;
    if (!body) return;

    body.innerHTML = `
      <div class="zkr-result">
        <div class="zkr-result-icon">⚠</div>
        <div class="zkr-result-title zkr-result-fail">Error</div>
        <div class="zkr-result-sub">${message}</div>
        <button class="zkr-submit" style="margin-top:16px">Try Again</button>
      </div>
    `;

    body.querySelector('.zkr-submit')!.addEventListener('click', () => {
      this.stage = this.selectedCircuit ? 'input' : 'select';
      this.renderModal();
    });
  }

  private clearContent() {
    while (this.shadow.childNodes.length > 1) {
      this.shadow.removeChild(this.shadow.lastChild!);
    }
  }
}
