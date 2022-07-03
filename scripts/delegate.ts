import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as tokenJson from "../artifacts/contracts/Token.sol/MyToken.json";
import { MyToken } from "../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

const TOKEN_ADDRESS = "0x50A5dD4a1b5eC3548c56d839FE862c4877b4F7dD";

function setupProvider() {
  const provider = ethers.providers.getDefaultProvider("goerli");
  return provider;
}

function generateAddress(derivationPath: number) {
  return process.env.MNEMONIC && process.env.MNEMONIC.length > 0
    ? ethers.Wallet.fromMnemonic(
        process.env.MNEMONIC,
        `m/44'/60'/0'/0/${derivationPath}`
      )
    : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
}

async function getSigner(path: number) {
  const wallet = generateAddress(path);
  console.log(`Using address ${wallet.address}`);
  console.log("Generating other addresses from derivation path of mnemonic");
  const provider = setupProvider();
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);

  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  return signer;
}
async function main() {
  let MyTokenContract: MyToken;

  const signer0 = await getSigner(0);
  MyTokenContract = new Contract(
    TOKEN_ADDRESS,
    tokenJson.abi,
    signer0
  ) as MyToken;

  await MyTokenContract.delegate(signer0.address);
  console.log(`delegated successfully to ${signer0.address}`);

  const signer1 = await getSigner(1);

  MyTokenContract = new Contract(
    TOKEN_ADDRESS,
    tokenJson.abi,
    signer1
  ) as MyToken;

  await MyTokenContract.delegate(signer1.address);
  console.log(`delegated successfully to ${signer1.address}`);

  const signer2 = await getSigner(2);

  MyTokenContract = new Contract(
    TOKEN_ADDRESS,
    tokenJson.abi,
    signer2
  ) as MyToken;

  await MyTokenContract.delegate(signer2.address);
  console.log(`delegated successfully to ${signer2.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
