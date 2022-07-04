import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import { CustomBallot } from "../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

const BALLOT_ADDRESS = "0x3BCbCe042E5c6A198c0d970F0aDdbBc6670E8196";

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
  let CustomBallotContract: CustomBallot;

  const signer0 = await getSigner(0);
  CustomBallotContract = new Contract(
    BALLOT_ADDRESS,
    ballotJson.abi,
    signer0
  ) as CustomBallot;

  // let votingPower = await CustomBallotContract.votingPower();

  // console.log(`${signer0.address}has ${Number(votingPower)} voting power`);

  // await CustomBallotContract.vote(0, ethers.utils.parseEther("500"));
  // console.log(
  //   `${signer0.address} successfully voted for proposal 0 with 500 points`
  // );

  // const signer1 = await getSigner(1);

  // CustomBallotContract = new Contract(
  //   BALLOT_ADDRESS,
  //   ballotJson.abi,
  //   signer1
  // ) as CustomBallot;

  // votingPower = await CustomBallotContract.votingPower();

  // console.log(`${signer1.address}has ${Number(votingPower)} voting power`);

  // await CustomBallotContract.vote(1, ethers.utils.parseEther("300"));
  // console.log(
  //   `${signer1.address} successfully voted for proposal 1 with 300 points`
  // );
  // const signer2 = await getSigner(2);

  // CustomBallotContract = new Contract(
  //   BALLOT_ADDRESS,
  //   ballotJson.abi,
  //   signer2
  // ) as CustomBallot;

  // votingPower = await CustomBallotContract.votingPower();

  // console.log(`${signer2.address} has ${Number(votingPower)} voting power`);

  // await CustomBallotContract.vote(2, ethers.utils.parseEther("100"));
  // console.log(
  //   `${signer2.address} successfully voted for proposal 2 with 100 points`
  // );

  const winningProposal = await CustomBallotContract.winnerName();
  const proposalNumer = await CustomBallotContract.winningProposal();
  const voteNumber = await (
    await CustomBallotContract.proposals(Number(proposalNumer))
  ).voteCount;

  console.log(
    `The proposal number ${Number(
      proposalNumer
    )} with name ${ethers.utils.parseBytes32String(
      winningProposal
    )} is winning with ${ethers.utils.formatEther(`${voteNumber}`)} votes`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
