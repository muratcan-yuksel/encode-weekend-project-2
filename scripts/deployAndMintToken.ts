import { ethers } from "ethers";
import "dotenv/config";
import * as tokenJson from "../artifacts/contracts/Token.sol/MyToken.json";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

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

async function main() {
  const wallet = generateAddress(0);
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

  console.log("Deploying Token contract");
  const tokenFactory = new ethers.ContractFactory(
    tokenJson.abi,
    tokenJson.bytecode,
    signer
  );

  const tokenContract = await tokenFactory.deploy();
  console.log("Awaiting confirmations");
  await tokenContract.deployed();
  console.log("Completed");
  console.log(`Contract deployed at ${tokenContract.address}`);

  console.log("generating addresses from derivation path: wallet one");
  const wallet1 = generateAddress(1);

  console.log("generating addresses from derivation path: wallet one");
  const wallet2 = generateAddress(2);

  const mintTx = await tokenContract.mint(
    wallet.address,
    ethers.utils.parseEther("500")
  );
  await mintTx.wait();
  console.log(`successfully mint token to ${wallet.address}`);

  const mintTx1 = await tokenContract.mint(
    wallet1.address,
    ethers.utils.parseEther("300")
  );
  await mintTx1.wait();
  console.log(`successfully mint token to ${wallet1.address}`);

  const mintTx2 = await tokenContract.mint(
    wallet2.address,
    ethers.utils.parseEther("100")
  );
  await mintTx2.wait();
  console.log(`successfully mint token to ${wallet2.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
