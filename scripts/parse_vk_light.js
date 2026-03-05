/**
 * Light Protocol's VK parser - adapted from groth16-solana
 * https://github.com/Lightprotocol/groth16-solana/blob/master/parse_vk_to_rust.js
 */

var ffjavascript = require('ffjavascript');
const {unstringifyBigInts, leInt2Buff} = ffjavascript.utils;
var fs = require("fs")
const path = require("path");

async function main() {
  const inputPath = process.argv[2] || path.join(__dirname, "../circuits/age-verification/verification_key.json");
  const outputPath = process.argv[3] || path.join(__dirname, "../solana-groth16-verifier/src/light_vk.rs");
  
  console.log("Input:", inputPath);
  console.log("Output:", outputPath);

  const fd = fs.readFileSync(inputPath, 'utf-8');
  var mydata = JSON.parse(fd);
  console.log("VK loaded, nPublic:", mydata.nPublic);

  // Process VK fields using Light Protocol's exact method
  for (var i in mydata) {
    if (i == 'vk_alpha_1') {
      for (var j in mydata[i]) {
        mydata[i][j] = leInt2Buff(unstringifyBigInts(mydata[i][j]), 32).reverse()
      }
    } else if (i == 'vk_beta_2') {
      for (var j in mydata[i]) {
        let tmp = Array.from(leInt2Buff(unstringifyBigInts(mydata[i][j][0]), 32)).concat(Array.from(leInt2Buff(unstringifyBigInts(mydata[i][j][1]), 32))).reverse()
        mydata[i][j][0] = tmp.slice(0,32)
        mydata[i][j][1] = tmp.slice(32,64)
      }
    } else if (i == 'vk_gamma_2') {
      for (var j in mydata[i]) {
        let tmp = Array.from(leInt2Buff(unstringifyBigInts(mydata[i][j][0]), 32)).concat(Array.from(leInt2Buff(unstringifyBigInts(mydata[i][j][1]), 32))).reverse()
        mydata[i][j][0] = tmp.slice(0,32)
        mydata[i][j][1] = tmp.slice(32,64)
      }
    } else if (i == 'vk_delta_2') {
      for (var j in mydata[i]) {
        let tmp = Array.from(leInt2Buff(unstringifyBigInts(mydata[i][j][0]), 32)).concat(Array.from(leInt2Buff(unstringifyBigInts(mydata[i][j][1]), 32))).reverse()
        mydata[i][j][0] = tmp.slice(0,32)
        mydata[i][j][1] = tmp.slice(32,64)
      }
    } else if (i == 'IC') {
      for (var j in mydata[i]) {
        for (var z in mydata[i][j]){
          mydata[i][j][z] = leInt2Buff(unstringifyBigInts(mydata[i][j][z]), 32).reverse()
        }
      }
    }
  }

  // Generate Rust file
  let s = `use groth16_solana::groth16::Groth16Verifyingkey;\n\npub const VERIFYINGKEY: Groth16Verifyingkey = Groth16Verifyingkey {\n\tnr_pubinputs: ${mydata.IC.length - 1},\n\n`
  
  s += "\tvk_alpha_g1: [\n"
  for (var j = 0; j < mydata.vk_alpha_1.length -1 ; j++) {
    s += "\t\t" + Array.from(mydata.vk_alpha_1[j]) + ",\n"
  }
  s += "\t],\n\n"
  
  s += "\tvk_beta_g2: [\n"
  for (var j = 0; j < mydata.vk_beta_2.length -1 ; j++) {
    for (var z = 0; z < 2; z++) {
      s += "\t\t" + Array.from(mydata.vk_beta_2[j][z]) + ",\n"
    }
  }
  s += "\t],\n\n"
  
  s += "\tvk_gamme_g2: [\n"  // Note: typo in groth16-solana crate
  for (var j = 0; j < mydata.vk_gamma_2.length -1 ; j++) {
    for (var z = 0; z < 2; z++) {
      s += "\t\t" + Array.from(mydata.vk_gamma_2[j][z]) + ",\n"
    }
  }
  s += "\t],\n\n"

  s += "\tvk_delta_g2: [\n"
  for (var j = 0; j < mydata.vk_delta_2.length -1 ; j++) {
    for (var z = 0; z < 2; z++) {
      s += "\t\t" + Array.from(mydata.vk_delta_2[j][z]) + ",\n"
    }
  }
  s += "\t],\n\n"
  
  s += "\tvk_ic: &[\n"
  for (var ic in mydata.IC) {
    s += "\t\t[\n"
    for (var j = 0; j < mydata.IC[ic].length - 1 ; j++) {
      s += "\t\t\t" + mydata.IC[ic][j] + ",\n"
    }
    s += "\t\t],\n"
  }
  s += "\t]\n};"

  fs.writeFileSync(outputPath, s);
  console.log("Rust VK written to:", outputPath);
}

main().catch(console.error);
