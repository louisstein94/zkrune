import { expect } from "chai";
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const CIRCUITS_DIR = path.join(__dirname, "../../public/circuits");

function loadVKey(name: string) {
  return JSON.parse(fs.readFileSync(path.join(CIRCUITS_DIR, `${name}_vkey.json`), "utf-8"));
}

function flattenIC(ic: string[][]): string[] {
  return ic.map((p: string[]) => [p[0], p[1]]).flat();
}

async function registerCircuit(verifier: any, id: number, name: string) {
  const vk = loadVKey(name);
  await verifier.registerCircuit(
    id, name,
    vk.vk_alpha_1[0], vk.vk_alpha_1[1],
    [vk.vk_beta_2[0][1], vk.vk_beta_2[0][0]],
    [vk.vk_beta_2[1][1], vk.vk_beta_2[1][0]],
    [vk.vk_gamma_2[0][1], vk.vk_gamma_2[0][0]],
    [vk.vk_gamma_2[1][1], vk.vk_gamma_2[1][0]],
    [vk.vk_delta_2[0][1], vk.vk_delta_2[0][0]],
    [vk.vk_delta_2[1][1], vk.vk_delta_2[1][0]],
    flattenIC(vk.IC),
  );
}

describe("Groth16Verifier", function () {
  let verifier: any;
  let owner: any;
  let other: any;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
  });

  describe("Deployment", function () {
    it("sets deployer as owner", async function () {
      expect(await verifier.owner()).to.equal(owner.address);
    });

    it("starts with zero circuits", async function () {
      expect(await verifier.circuitCount()).to.equal(0);
    });
  });

  describe("Circuit Registration", function () {
    it("registers age-verification circuit", async function () {
      await registerCircuit(verifier, 0, "age-verification");
      const [name, nPublic, registered] = await verifier.getCircuitInfo(0);
      expect(name).to.equal("age-verification");
      expect(nPublic).to.equal(3);
      expect(registered).to.be.true;
    });

    it("registers all 14 circuits", async function () {
      const circuits = [
        "age-verification", "balance-proof", "membership-proof",
        "credential-proof", "private-voting", "nft-ownership",
        "range-proof", "hash-preimage", "quadratic-voting",
        "anonymous-reputation", "token-swap", "patience-proof",
        "signature-verification", "whale-holder",
      ];
      for (let i = 0; i < circuits.length; i++) {
        await registerCircuit(verifier, i, circuits[i]);
      }
      expect(await verifier.circuitCount()).to.equal(14);

      for (let i = 0; i < circuits.length; i++) {
        const [name, , registered] = await verifier.getCircuitInfo(i);
        expect(name).to.equal(circuits[i]);
        expect(registered).to.be.true;
      }
    });

    it("rejects registration from non-owner", async function () {
      const vk = loadVKey("age-verification");
      await expect(
        verifier.connect(other).registerCircuit(
          0, "age-verification",
          vk.vk_alpha_1[0], vk.vk_alpha_1[1],
          [vk.vk_beta_2[0][1], vk.vk_beta_2[0][0]],
          [vk.vk_beta_2[1][1], vk.vk_beta_2[1][0]],
          [vk.vk_gamma_2[0][1], vk.vk_gamma_2[0][0]],
          [vk.vk_gamma_2[1][1], vk.vk_gamma_2[1][0]],
          [vk.vk_delta_2[0][1], vk.vk_delta_2[0][0]],
          [vk.vk_delta_2[1][1], vk.vk_delta_2[1][0]],
          flattenIC(vk.IC),
        ),
      ).to.be.revertedWith("Not owner");
    });

    it("rejects invalid IC length (odd)", async function () {
      const vk = loadVKey("age-verification");
      await expect(
        verifier.registerCircuit(
          0, "bad",
          vk.vk_alpha_1[0], vk.vk_alpha_1[1],
          [vk.vk_beta_2[0][1], vk.vk_beta_2[0][0]],
          [vk.vk_beta_2[1][1], vk.vk_beta_2[1][0]],
          [vk.vk_gamma_2[0][1], vk.vk_gamma_2[0][0]],
          [vk.vk_gamma_2[1][1], vk.vk_gamma_2[1][0]],
          [vk.vk_delta_2[0][1], vk.vk_delta_2[0][0]],
          [vk.vk_delta_2[1][1], vk.vk_delta_2[1][0]],
          ["1", "2", "3"],
        ),
      ).to.be.revertedWith("Invalid IC length");
    });
  });

  describe("Proof Verification", function () {
    it("rejects proof for unregistered circuit", async function () {
      await expect(
        verifier.verifyProof(99, [0, 0], [[0, 0], [0, 0]], [0, 0], []),
      ).to.be.revertedWith("Circuit not registered");
    });

    it("rejects proof with wrong input count", async function () {
      await registerCircuit(verifier, 0, "age-verification");
      // age-verification has nPublic=3, so needs 3 inputs but we send 1
      await expect(
        verifier.verifyProof(0, [0, 0], [[0, 0], [0, 0]], [0, 0], [1]),
      ).to.be.revertedWith("Input count mismatch");
    });

    it("rejects input exceeding field size", async function () {
      await registerCircuit(verifier, 0, "age-verification");
      const PRIME_R = "21888242871839275222246405745257275088548364400416034343698204186575808495617";
      await expect(
        verifier.verifyProof(0, [0, 0], [[0, 0], [0, 0]], [0, 0], [PRIME_R, 0, 0]),
      ).to.be.revertedWith("Input exceeds field size");
    });

    // A10: curve validation
    it("rejects proof A with coordinate >= PRIME_Q", async function () {
      await registerCircuit(verifier, 0, "age-verification");
      const PRIME_Q = "21888242871839275222246405745257275088696311157297823662689037894645226208583";
      await expect(
        verifier.verifyProof(0, [PRIME_Q, 0], [[0, 0], [0, 0]], [0, 0], [1, 2, 3]),
      ).to.be.revertedWith("A coord >= q");
    });

    it("rejects proof C with coordinate >= PRIME_Q", async function () {
      await registerCircuit(verifier, 0, "age-verification");
      const PRIME_Q = "21888242871839275222246405745257275088696311157297823662689037894645226208583";
      await expect(
        verifier.verifyProof(0, [0, 0], [[0, 0], [0, 0]], [PRIME_Q, 0], [1, 2, 3]),
      ).to.be.revertedWith("C coord >= q");
    });

    it("rejects proof B with coordinate >= PRIME_Q", async function () {
      await registerCircuit(verifier, 0, "age-verification");
      const PRIME_Q = "21888242871839275222246405745257275088696311157297823662689037894645226208583";
      await expect(
        verifier.verifyProof(0, [0, 0], [[PRIME_Q, 0], [0, 0]], [0, 0], [1, 2, 3]),
      ).to.be.revertedWith("B.x coord >= q");
    });

    it("rejects proof A not on BN254 curve", async function () {
      await registerCircuit(verifier, 0, "age-verification");
      // (1, 1) is not on y^2 = x^3 + 3 (1 != 4)
      await expect(
        verifier.verifyProof(0, [1, 1], [[0, 0], [0, 0]], [0, 0], [1, 2, 3]),
      ).to.be.revertedWith("A not on curve");
    });

    it("rejects proof C not on BN254 curve", async function () {
      await registerCircuit(verifier, 0, "age-verification");
      await expect(
        verifier.verifyProof(0, [0, 0], [[0, 0], [0, 0]], [1, 1], [1, 2, 3]),
      ).to.be.revertedWith("C not on curve");
    });

    it("accepts G1 point at infinity (0, 0)", async function () {
      await registerCircuit(verifier, 0, "age-verification");
      // (0, 0) is encoded as point at infinity per EIP-196 and should pass validation.
      // The pairing check will still fail (returning false), but validation should not revert.
      // The call reaches the pairing precompile which returns false for this bogus proof.
      // We only assert the validation step does not revert with "not on curve".
      try {
        await verifier.verifyProof(0, [0, 0], [[0, 0], [0, 0]], [0, 0], [1, 2, 3]);
      } catch (e: any) {
        // If it reverts, it must NOT be due to curve validation
        expect(e.message).to.not.include("not on curve");
        expect(e.message).to.not.include("coord >= q");
      }
    });
  });

  describe("Ownership", function () {
    it("transfers ownership", async function () {
      await verifier.transferOwnership(other.address);
      expect(await verifier.owner()).to.equal(other.address);
    });

    it("rejects transfer to zero address", async function () {
      await expect(
        verifier.transferOwnership(ethers.ZeroAddress),
      ).to.be.revertedWith("Zero address");
    });

    it("rejects transfer from non-owner", async function () {
      await expect(
        verifier.connect(other).transferOwnership(other.address),
      ).to.be.revertedWith("Not owner");
    });
  });
});
