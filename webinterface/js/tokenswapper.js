let currentAccount = null;
let web3;
let abi;

let addressNew = "";
let addressOld = "";
let addressTS = "";

let miniAbi = {
  ERC721BE: [
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },

    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "getApproved",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },

    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
      ],
      name: "isApprovedForAll",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },

    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },

    {
      inputs: [
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "setApprovalForAll",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },

    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "tokenOfOwnerByIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "tokenURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
  TokenSwapper: [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_tokenId",
          type: "uint256",
        },
      ],
      name: "swap",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};

$.getJSON(
  "http://127.0.0.1:5500/webinterface/tokenswapper.json",
  function (result) {
    addressNew = result.NEW;
    addressOld = result.OLD;
    addressTS = result.TokenSwapper;
    $("#addressNew").text(addressNew);
    $("#addressOld").text(addressOld);
  }
);

function handleAccountsChanged(accounts) {
  console.log("Calling HandleChanged");

  if (accounts.length === 0) {
    console.log("Please connect to MetaMask.");
    $("#enableMetamask").html("Connect with Metamask");
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    $("#enableMetamask").html(currentAccount);
    $("#status").html("");

    if (currentAccount != null) {
      // Set the button label
      $("#enableMetamask").html(currentAccount);
    }
  }
  console.log("WalletAddress in HandleAccountChanged =" + currentAccount);
}

function connect() {
  console.log("Calling connect()");
  ethereum
    .request({ method: "eth_requestAccounts" })
    .then(handleAccountsChanged)
    .catch((err) => {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log("Please connect to MetaMask.");
        $("#status").html("You refused to connect Metamask");
      } else {
        console.error(err);
      }
    });
}

function detectMetaMask() {
  if (typeof window.ethereum !== "undefined") {
    return true;
  } else {
    return false;
  }
}

async function getSymbol() {
  const contractFirst = new web3.eth.Contract(abi, contractAddress);
  contractFirst.methods
    .symbol()
    .call()
    .then(function (result) {
      $("#symbol").text(result);
    });
}

function getNames() {
  getName(addressNew, "newTokenName");
  getName(addressOld, "oldTokenName");
}

async function getName(address, id) {
  const contractFirst = new web3.eth.Contract(abi, address);
  await contractFirst.methods
    .name()
    .call()
    .then(function (result) {
      $("#" + id).text(result);
    });
}

async function getBalance(address, currentAccount) {
  let ret;
  const contractFirst = new web3.eth.Contract(abi, address);
  await contractFirst.methods
    .balanceOf(currentAccount)
    .call()
    .then(function (result) {
      ret = result;
    });
  $("#numOldToken").text(ret);
  if (ret == 0) {
    $("#exchange").prop("disabled", true);
  } else {
    $("#exchangeContainer").show();
  }

  return ret;
}

async function getTokenId(address, currentAccount) {
  let ret;
  const contractFirst = new web3.eth.Contract(abi, address);
  await contractFirst.methods
    .tokenOfOwnerByIndex(currentAccount, 0)
    .call()
    .then(function (result) {
      ret = result;
    });
  return ret;
}

async function getEchangable(addressOld, addressNew, currentAccount) {
  let num = await getBalance(addressOld, currentAccount);
  if (num > 0) {
    let tokenId = await getTokenId(addressOld, currentAccount);
    getSVG(addressOld, tokenId, "oldTokenName", "imgOld", "descriptionOld");
    getSVG(addressNew, tokenId, "newTokenName", "imgNew", "descriptionNew");
  }
}

async function exchange() {
  let tokenId = await getTokenId(addressOld, currentAccount);

  try {
    web3M = new Web3(ethereum);
  } catch (error) {
    alert(error);
  }

  $("#exchange").prop("disabled", true);

  const contract = new web3M.eth.Contract(miniAbi.TokenSwapper, addressTS);
  await contract.methods
    .swap(tokenId)
    .send({ from: currentAccount })
    .on("transactionHash", (hash) => {
      console.log(hash);
      $("#hash").append(
        "<small><a href='https://polygonscan.com/tx/" +
          hash +
          "' target=_blank>polygonscan: " +
          hash +
          "</a></small><br/><br/>"
      );
      $("#exchange").text("Exchanging...");
    })
    .on("receipt", function (receipt) {
      $("#exchange").text("Exchanged!");
    })
    .on("error", function (error, receipt) {
      // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.log(error);
    });
}

async function approve() {
  try {
    web3M = new Web3(ethereum);
  } catch (error) {
    alert(error);
  }

  const contract = new web3M.eth.Contract(abi, addressOld);
  await contract.methods
    .setApprovalForAll(addressTS, true)
    .send({ from: currentAccount })
    .on("transactionHash", (hash) => {
      console.log(hash);
      $("#approve").prop("disabled", true);
      $("#approve").text("Approving...");
    })
    .on("receipt", function (receipt) {
      $("#approve").text("Approved");
      $("#exchange").prop("disabled", false);
    })
    .on("error", function (error, receipt) {
      // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.log(error);
    });
}

async function getSVG(address, tokenId, idName, idImg, idDesc) {
  const contractFirst = new web3.eth.Contract(abi, address);
  console.log("getValue" + currentAccount);
  contractFirst.methods
    .tokenURI(tokenId)
    .call()
    .then(function (result) {
      let d = result.split("base64,")[1];
      d = JSON.parse(atob(d));
      // console.log(d);
      $("#" + idName).text(d.name);
      $("#" + idDesc).text(d.description);
      $("#" + idImg).prop("src", d.image);
    });
}

async function checkApproved(address, currentAccount) {
  const contract = new web3.eth.Contract(abi, address);
  contract.methods
    .isApprovedForAll(currentAccount, addressTS)
    .call()
    .then(function (result) {
      if (result) {
        console.log("Approved");
        $("#approve").prop("disabled", true);
      } else {
        console.log("Not approved");
        $("#exchange").prop("disabled", true);
      }
    });
}

$(document).ready(async function () {
  abi = miniAbi.ERC721BE;

  m = detectMetaMask();
  if (m) {
    $("#metaicon").removeClass("meta-gray");
    $("#metaicon").addClass("meta-normal");
    $("#enableMetamask").attr("disabled", false);
    connect(); // Make sure the connected wallet is being returned
  } else {
    $("#enableMetamask").attr("disabled", true);
    $("#metaicon").removeClass("meta-normal");
    $("#metaicon").addClass("meta-gray");
  }

  $("#enableMetamask").click(function () {
    connect();
  });

  $("#exchange").click(async () => {
    await exchange();
  });

  $("#approve").click(async () => {
    await approve();
  });

  try {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  } catch (error) {
    alert(error);
  }

  setTimeout(() => {
    getNames();
    getBalance(addressOld, currentAccount);
    getEchangable(addressOld, addressNew, currentAccount);
    checkApproved(addressOld, currentAccount);
  }, 500);
});
