"use client";

export function CodeExamples() {
  const examples = {
    javascript: `// JavaScript/TypeScript - DEPRECATED API
// Use client-side generation instead:
// import { generateClientProof } from '@/lib/clientZkProof';
// const result = await generateClientProof('age-verification', { ... });

const proof = await fetch('https://zkrune.com/api/generate-proof', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'age-verification',
    inputs: {
      birthYear: '1995',
      currentYear: '2024',
      minimumAge: '18'
    }
  })
}).then(r => r.json());

console.log(proof);`,

    python: `# Python - DEPRECATED API
# This endpoint has been removed.
# Use client-side generation in browser for better privacy.

import requests

response = requests.post(
    'https://zkrune.com/api/generate-proof',
    json={
        'templateId': 'age-verification',
        'inputs': {
            'birthYear': '1995',
            'currentYear': '2024',
            'minimumAge': '18'
        }
    }
)

proof = response.json()
print(proof)`,

    curl: `# cURL - DEPRECATED API (Endpoint Removed)
# Migration: Use browser-based client-side generation

curl -X POST https://zkrune.com/api/generate-proof \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "age-verification",
    "inputs": {
      "birthYear": "1995",
      "currentYear": "2024",
      "minimumAge": "18"
    }
  }'`,

    go: `// Go - DEPRECATED API
// This endpoint has been removed for better privacy.
// Use client-side generation in browser instead.

package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    payload := map[string]interface{}{
        "templateId": "age-verification",
        "inputs": map[string]string{
            "birthYear":   "1995",
            "currentYear": "2024",
            "minimumAge":  "18",
        },
    }
    
    body, _ := json.Marshal(payload)
    resp, _ := http.Post(
        "https://zkrune.com/api/generate-proof",
        "application/json",
        bytes.NewBuffer(body),
    )
    
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    fmt.Println(result)
}`,
  };

  return { examples };
}

