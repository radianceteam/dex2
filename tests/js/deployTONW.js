const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { TWContract } = require("./TONwrapperContract.js");
const { RContract } = require("./RootTokenContract.js");
const { TTWContract } = require("./TONTokenWalletContract.js");
const fs = require('fs');
const pathJsonR = './RootTokenContract.json';
const pathJsonTW = './TONwrapperContract.json';
const name = "57726170706564544f4e";
const symbol = "57544f4e";
const decimals = "9";
const root_public_key = "0";
const total_supply = "0";


TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
    // console.log(`params = ${JSON.stringify(params, null, 2)}`);
    // console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}


async function main(client) {
   const rootAbi = {
     type: 'Contract',
     value: RContract.abi
   }

   const wraperAbi = {
     type: 'Contract',
     value: TWContract.abi
   }

    const rootKeys = signerKeys(await TonClient.default.crypto.generate_random_sign_keys());
    const rootAcc = new Account(RContract, {
        signer: rootKeys,
        client,
    });
    const rootAddr = await rootAcc.getAddress();
    console.log(`Future address of the rootToken will be: ${rootAddr}`);


    const wrapperKeys = signerKeys(await TonClient.default.crypto.generate_random_sign_keys());
    const wrapperAcc = new Account(TWContract, {
        signer: wrapperKeys,
        client,
    });
    const wrapperAddr = await wrapperAcc.getAddress();
    console.log(`Future address of the wrapper will be: ${wrapperAddr}`);


    const giver = await Account.getGiverForClient(client);
    await giver.sendTo(rootAddr, 100_000_000_000);
    console.log(`Grams were transferred from giver to ${rootAddr}`);
    await giver.sendTo(wrapperAddr, 100_000_000_000);
    console.log(`Grams were transferred from giver to ${wrapperAddr}`);

    let rootJson = JSON.stringify({address:rootAddr, keys:rootKeys});
    fs.writeFileSync( pathJsonR, rootJson,{flag:'w'});
    console.log("Future address of the contract  and keys written successfully to:", pathJsonR);

    let wrapperJson = JSON.stringify({address:wrapperAddr, keys:wrapperKeys});
    fs.writeFileSync( pathJsonTW, wrapperJson,{flag:'w'});
    console.log("Future address of the contract  and keys written successfully to:", pathJsonTW);


    let shard_block_id;
    let deployMessage = await client.abi.encode_message(await wrapperAcc.getParamsOfDeployMessage({
        initFunctionName:"constructor",
        initInput:{
          rootWrappedTON:rootAddr,
        },
    }));
    shard_block_id = (await client.processing.send_message({
            message: deployMessage.message,
            send_events: true,
        }, logEvents,
    )).shard_block_id;
    console.log(`Deploy TONwrapper message was sent.`);

    // Monitor message delivery.
    // See more info about `wait_for_transaction` here
    // https://github.com/tonlabs/TON-SDK/blob/master/docs/mod_processing.md#wait_for_transaction
    let deploy_processing_result = await client.processing.wait_for_transaction({
            abi: abiContract(wrapperAcc.abi),
            message: deployMessage.message,
            shard_block_id: shard_block_id,
            send_events: true,
        },
        logEvents,
    );
    console.log(`Deploy transaction: ${JSON.stringify(deploy_processing_result.transaction, null, 2)}`);
    console.log(`Deploy fees: ${JSON.stringify(deploy_processing_result.fees, null, 2)}`);
    console.log(`Contract was deployed at address: ${wrapperAddr}`);

    let owner = wrapperAddr;
    owner = owner.replace(':','x');
    deployMessage = await client.abi.encode_message(await rootAcc.getParamsOfDeployMessage({
        initFunctionName:"constructor",
        initInput:{
          name:name,
          symbol:symbol,
          decimals:decimals,
          root_public_key:root_public_key,
          root_owner:owner,
          wallet_code: TTWContract.code,
          total_supply:total_supply,
        },
    }));
    shard_block_id = (await client.processing.send_message({
            message: deployMessage.message,
            send_events: true,
        }, logEvents,
    )).shard_block_id;
    console.log(`Deploy rootWrappedTON message was sent.`);

    // Monitor message delivery.
    // See more info about `wait_for_transaction` here
    // https://github.com/tonlabs/TON-SDK/blob/master/docs/mod_processing.md#wait_for_transaction
    deploy_processing_result = await client.processing.wait_for_transaction({
            abi: abiContract(rootAcc.abi),
            message: deployMessage.message,
            shard_block_id: shard_block_id,
            send_events: true,
        },
        logEvents,
    );
    console.log(`Deploy transaction: ${JSON.stringify(deploy_processing_result.transaction, null, 2)}`);
    console.log(`Deploy fees: ${JSON.stringify(deploy_processing_result.fees, null, 2)}`);
    console.log(`Contract was deployed at address: ${rootAddr}`);


    // Call `createZeroWallet` function
    let response = await wrapperAcc.run("createZeroWallet", {});
    console.log(`Contract run createZeroWallet with output ${response.decoded.output}, ${response.transaction.id}`);

    // Execute `getZeroAddress` get method  (execute the message locally on TVM)
    response = await wrapperAcc.runLocal("getZeroAddress", {});
    console.log("Contract reacted to your getZeroAddress:", response.decoded.output);

}

(async () => {
    const client = new TonClient({
        network: {
            // Local TON OS SE instance URL here
            endpoints: ["http://localhost"],
        },
    });
    try {
        console.log("Hello localhost TON!");
        await  (client);
        process.exit(0);
    } catch (error) {
        if (error.code === 504) {
            console.error(`
Network is inaccessible.
You have to start TON OS SE using \`tondev se start\`
`);
        } else {
            console.error(error);
        }
    }
    client.close();
})();
