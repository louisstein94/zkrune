import * as fs from "fs";
import * as path from "path";

export const CIRCUITS_DIR = path.join(__dirname, "../../public/circuits");

export const CIRCUITS: { id: number; name: string }[] = [
  { id: 0, name: "age-verification" },
  { id: 1, name: "balance-proof" },
  { id: 2, name: "membership-proof" },
  { id: 3, name: "credential-proof" },
  { id: 4, name: "private-voting" },
  { id: 5, name: "nft-ownership" },
  { id: 6, name: "range-proof" },
  { id: 7, name: "hash-preimage" },
  { id: 8, name: "quadratic-voting" },
  { id: 9, name: "anonymous-reputation" },
  { id: 10, name: "token-swap" },
  { id: 11, name: "patience-proof" },
  { id: 12, name: "signature-verification" },
  { id: 13, name: "whale-holder" },
];

export function loadVKey(circuitName: string) {
  const vkPath = path.join(CIRCUITS_DIR, `${circuitName}_vkey.json`);
  return JSON.parse(fs.readFileSync(vkPath, "utf-8"));
}

export function flattenIC(ic: string[][]): string[] {
  return ic.map((point: string[]) => [point[0], point[1]]).flat();
}
