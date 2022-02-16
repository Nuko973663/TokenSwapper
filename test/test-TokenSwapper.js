const { expect } = require("chai");
const { ethers } = require("hardhat");

const getAccount = async () => {
  const accounts = await hre.ethers.getSigners();
  return accounts;
};

describe("Test for TokenSwapper", function () {
  it("TokenSwapper", async function () {
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

    await nftOld.connect(accounts[1]).mint(accounts[1].address);
    await nftOld.connect(accounts[1]).mint(accounts[1].address);
    await nftNew.mint(ts.address);
    await nftNew.mint(ts.address);

    await showBalance(accounts[0].address);
    await showBalance(accounts[1].address);
    await showBalance(ts.address);

    console.log("TokenSwapper swap");

    await nftOld.connect(accounts[1]).approve(ts.address, 0);
    await nftOld.connect(accounts[1]).approve(ts.address, 1);
    await ts.connect(accounts[1]).swap(1);

    await showBalance(accounts[0].address);
    await showBalance(accounts[1].address);
    await showBalance(ts.address);

    console.log("TokenSwapper Byebye");
    await ts.byebye(accounts[0].address);
    await showBalance(accounts[0].address);
    await showBalance(accounts[1].address);
    await showBalance(ts.address);
  });
});
