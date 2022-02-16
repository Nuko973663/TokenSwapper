const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const accounts = await getAccount();

  const showBalance = async (address) => {
    console.log("NFT OLD (", address, ") ", await nftOld.balanceOf(address));
    console.log("NFT NEW (", address, ") ", await nftNew.balanceOf(address));
  };

  /*
   * Deploy and mint ERC721
   */
  const ERC721 = await ethers.getContractFactory("ERC721BE");

  const nftOld = await ERC721.connect(accounts[1]).deploy("OLD", "OLD");
  await nftOld.deployed();
  console.log("NFT OLD deployed to", nftOld.address);

  const nftNew = await ERC721.deploy("NEW", "NEW");
  await nftNew.deployed();
  console.log("NFT NEW deployed to", nftNew.address);

  const TS = await ethers.getContractFactory("TokenSwapper");
  const ts = await TS.deploy(nftOld.address, nftNew.address, true);
  await ts.deployed();
  console.log("TokenSwapper deployed to", ts.address);

  fs.writeFile(
    "./webinterface/tokenswapper.json",
    JSON.stringify({
      OLD: nftOld.address,
      NEW: nftNew.address,
      TokenSwapper: ts.address,
    }),
    () => {}
  );

  await nftOld.connect(accounts[1]).mint(accounts[1].address);
  await nftOld.connect(accounts[1]).mint(accounts[1].address);
  await nftNew.mint(ts.address);
  await nftNew.mint(ts.address);

  await showBalance(accounts[0].address);
  await showBalance(accounts[1].address);
  await showBalance(ts.address);
}

const getAccount = async () => {
  const accounts = await hre.ethers.getSigners();
  return accounts;
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
