const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { DEXClientContract } = require("./DEXClient.js");
const { RootTokenContract } = require("./RootTokenContract.js");
const { TONTokenWalletContract } = require("./TONTokenWallet.js");
const dotenv = require('dotenv').config();
const networks = ["http://localhost",'net.ton.dev','main.ton.dev','rustnet.ton.dev'];
const hello = ["Hello localhost TON!","Hello dev net TON!","Hello main net TON!","Hello rust dev net TON!"];
const networkSelector = process.env.NET_SELECTOR;

const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();

const fs = require('fs');
const pathJsonRoot = './DEXRootContract.json';
const pathJsonClient = './DEXClientContract.json';

const pathJsonPairTonUsdt = './DEXPairContractTonUsdt.json';
const pathJsonPairTonUsdc = './DEXPairContractTonUsdc.json';
const pathJsonPairBtcUsdt = './DEXPairContractBtcUsdt.json';
const pathJsonPairEthUsdt = './DEXPairContractEthUsdt.json';
const pathJsonPairBtcUsdc = './DEXPairContractBtcUsdc.json';
const pathJsonPairEthUsdc = './DEXPairContractEthUsdc.json';

const pathJsonPairTonBtc = './DEXPairContractTonBtc.json';
const pathJsonPairTonEth = './DEXPairContractTonEth.json';
const pathJsonPairUsdcUsdt = './DEXPairContractUsdcUsdt.json';

const pathJsonWTON = './WTONdata.json';
const pathJsonUSDT = './USDTdata.json';
const pathJsonUSDC = './USDCdata.json';
const pathJsonBTC = './BTCdata.json';
const pathJsonETH = './ETHdata.json';

function convert(number, decimal) {
  return Math.trunc(number)*(10**decimal) + Math.floor((number - Math.trunc(number))*(10**decimal));
}

TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
  // console.log(`params = ${JSON.stringify(params, null, 2)}`);
  // console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}

async function main(client) {
  let responce;

  let btcusdData = await CoinGeckoClient.coins.fetch('bitcoin', {});
  console.log('1 bitcoin = ', btcusdData.data.market_data.current_price.usd,' usd');
  let btcusd = Number(btcusdData.data.market_data.current_price.usd);
  let ethusdData = await CoinGeckoClient.coins.fetch('ethereum', {});
  console.log('1 ethereum = ',ethusdData.data.market_data.current_price.usd,' usd');
  let ethusd = Number(ethusdData.data.market_data.current_price.usd);
  let tonusdData = await CoinGeckoClient.coins.fetch('ton-crystal', {});
  console.log('1 ton = ',tonusdData.data.market_data.current_price.usd,' usd');


  const rootKeysA = JSON.parse(fs.readFileSync(pathJsonUSDT,{encoding: "utf8"})).keys;
  const rootAddrA = JSON.parse(fs.readFileSync(pathJsonUSDT,{encoding: "utf8"})).address;
  const rootAccA = new Account(RootTokenContract, {address: rootAddrA,signer: rootKeysA,client,});
  console.log("USDT root:", rootAddrA);


  const rootKeysB = JSON.parse(fs.readFileSync(pathJsonUSDC,{encoding: "utf8"})).keys;
  const rootAddrB = JSON.parse(fs.readFileSync(pathJsonUSDC,{encoding: "utf8"})).address;
  const rootAccB = new Account(RootTokenContract, {address: rootAddrB,signer: rootKeysB,client,});
  console.log("USDC root:", rootAddrB);

  const rootKeysC = JSON.parse(fs.readFileSync(pathJsonBTC,{encoding: "utf8"})).keys;
  const rootAddrC = JSON.parse(fs.readFileSync(pathJsonBTC,{encoding: "utf8"})).address;
  const rootAccC = new Account(RootTokenContract, {address: rootAddrC,signer: rootKeysC,client,});
  console.log("BTC root:", rootAddrC);

  const rootKeysD = JSON.parse(fs.readFileSync(pathJsonETH,{encoding: "utf8"})).keys;
  const rootAddrD = JSON.parse(fs.readFileSync(pathJsonETH,{encoding: "utf8"})).address;
  const rootAccD = new Account(RootTokenContract, {address: rootAddrD,signer: rootKeysD,client,});
  console.log("ETH root:", rootAddrD);



  const clientKeys = JSON.parse(fs.readFileSync(pathJsonClient,{encoding: "utf8"})).keys;
  const clientAddr = JSON.parse(fs.readFileSync(pathJsonClient,{encoding: "utf8"})).address;
  const clientAcc = new Account(DEXClientContract, {address:clientAddr,signer:clientKeys,client,});


  const pairAddr = JSON.parse(fs.readFileSync(pathJsonPairTonUsdc,{encoding: "utf8"})).address;


  response = await clientAcc.runLocal("rootWallet", {});
  console.log("Contract reacted to your rootWallet:", response.decoded.output);

  let walletRootA = response.decoded.output.rootWallet[rootAddrA];
  console.log("Contract reacted to your walletRootA:", walletRootA);
  const walletAccA = new Account(TONTokenWalletContract, {address: walletRootA,client,});

  let walletRootB = response.decoded.output.rootWallet[rootAddrB];
  console.log("Contract reacted to your walletRootB:", walletRootB);
  const walletAccB = new Account(TONTokenWalletContract, {address: walletRootB,client,});

  let walletRootC = response.decoded.output.rootWallet[rootAddrC];
  console.log("Contract reacted to your walletRootC:", walletRootC);
  const walletAccC = new Account(TONTokenWalletContract, {address: walletRootC,client,});

  let walletRootD = response.decoded.output.rootWallet[rootAddrD];
  console.log("Contract reacted to your walletRootD:", walletRootD);
  const walletAccD = new Account(TONTokenWalletContract, {address: walletRootD,client,});



  response = await walletAccA.runLocal("balance", {_answer_id:0});
  console.log("walletAccA reacted to your balance:", response.decoded.output);

  response = await walletAccB.runLocal("balance", {_answer_id:0});
  console.log("walletAccB reacted to your balance:", response.decoded.output);
  let usdAmount = 1000000000000000;

  response = await walletAccC.runLocal("balance", {_answer_id:0});
  console.log("walletAccC reacted to your balance:", response.decoded.output);
  let btcBal = response.decoded.output.value0;
  let btcBal1 = Math.round(btcBal / 2);
  let btcBal2 = btcBal - btcBal1;

  response = await walletAccD.runLocal("balance", {_answer_id:0});
  console.log("walletAccD reacted to your balance:", response.decoded.output);
  let ethBal = response.decoded.output.value0;
  let ethBal1 = Math.round(ethBal / 2);
  let ethBal2 = ethBal - ethBal1;

  const pairAddrA = JSON.parse(fs.readFileSync(pathJsonPairBtcUsdt,{encoding: "utf8"})).address;
  const pairAddrB = JSON.parse(fs.readFileSync(pathJsonPairEthUsdt,{encoding: "utf8"})).address;
  const pairAddrC = JSON.parse(fs.readFileSync(pathJsonPairBtcUsdc,{encoding: "utf8"})).address;
  const pairAddrD = JSON.parse(fs.readFileSync(pathJsonPairEthUsdc,{encoding: "utf8"})).address;

  responce = await clientAcc.run("processLiquidity", {pairAddr:pairAddrA,qtyA:btcBal1,qtyB:usdAmount});
  console.log("Contract reacted to your processLiquidity:", responce.decoded.output);

  responce = await clientAcc.run("processLiquidity", {pairAddr:pairAddrB,qtyA:ethBal1,qtyB:usdAmount});
  console.log("Contract reacted to your processLiquidity:", responce.decoded.output);

  responce = await clientAcc.run("processLiquidity", {pairAddr:pairAddrC,qtyA:btcBal2,qtyB:usdAmount});
  console.log("Contract reacted to your processLiquidity:", responce.decoded.output);

  responce = await clientAcc.run("processLiquidity", {pairAddr:pairAddrD,qtyA:ethBal2,qtyB:usdAmount});
  console.log("Contract reacted to your processLiquidity:", responce.decoded.output);


}

(async () => {
  const client = new TonClient({network: { endpoints: [networks[networkSelector]],},});
  try {
    console.log(hello[networkSelector]);
    await main(client);
    process.exit(0);
  } catch (error) {
    if (error.code === 504) {
      console.error(`Network is inaccessible. Pls check connection`);
    } else {
      console.error(error);
    }
  }
  client.close();
})();