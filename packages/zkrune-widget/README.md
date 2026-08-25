# zkrune-widget

Embeddable zero-knowledge verification. Drop a script tag on a page and a
visitor can prove something about themselves — their age, a membership, a
balance, an issuer-attested credential — without handing over the data behind
it.

Proofs are generated in the visitor's browser. The inputs never reach a server,
so there is nothing to log, subpoena or leak.

## Script tag

```html
<div id="gate"></div>

<script src="https://cdn.jsdelivr.net/npm/zkrune-widget@latest/dist/zkrune-widget.global.js"></script>
<script>
  ZkRuneWidget.init({
    container: '#gate',
    circuit: 'age-verification',
    onResult: (result) => {
      if (result.verified) unlockTheThing();
    },
  });
</script>
```

## Bundlers

```bash
npm install zkrune-widget
```

```js
import { init } from 'zkrune-widget';

init({
  container: document.getElementById('gate'),
  circuit: 'age-verification',
  onResult: (result) => console.log(result.verified),
});
```

## Options

| Option           | Type                        | Default                | Notes                                       |
| ---------------- | --------------------------- | ---------------------- | ------------------------------------------- |
| `container`      | `string \| HTMLElement`     | required               | CSS selector or element to mount into       |
| `circuit`        | `CircuitId`                 | picker shown           | Pin the widget to one circuit               |
| `theme`          | `'dark' \| 'light'`         | `'dark'`               |                                             |
| `buttonLabel`    | `string`                    | `'Verify with zkRune'` |                                             |
| `circuitBaseUrl` | `string`                    | zkRune CDN             | Serve the WASM and proving keys yourself     |
| `verifierUrl`    | `string`                    | hosted verifier        | Point at your own verifier                  |
| `onResult`       | `(result) => void`          | —                      | Fires on a completed verification           |
| `onError`        | `(error) => void`           | —                      | Fires on a failed proof or network error    |

## Verify again on your backend

A result delivered to the browser is a result the browser can fabricate. Treat
`onResult` as a UI signal, and re-verify the proof server-side before granting
anything that matters. See the `server-verify-node` example in the repository.

## Circuits

```js
import { CIRCUITS, getCircuitsByCategory, validateInputs } from 'zkrune-widget';
```

`CIRCUITS` carries the field definitions for every supported circuit, so a
custom UI can render the right inputs without hardcoding them.

## Links

- Documentation — https://zkrune.com/docs
- Trust model and current limitations — https://zkrune.com/trust
