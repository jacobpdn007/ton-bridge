import { Address } from "@ton/core";
import { JettonMaster, JettonWallet, TonClient4 } from "@ton/ton";

const client = new TonClient4({
    //create client for testnet sandboxv4 API - alternative endpoint
    endpoint: "https://sandbox-v4.tonhubapi.com",
});

const bridgeGateAddress = "kQBWf-_e243JMDqLQopK_F2xp1vc4Si2qYlwTWfMvo-K5dsM";
const usdtTokenAddress = "kQBTOHgaM-bwicGISKqJovc6byWqGUkrKq55hTCu_xPapu-l";

async function getJettonWalletAddress(token: string, user: string) {
    const tokenContract = JettonMaster.create(Address.parse(token));

    const userJettonWalletAddress = await client
        .open(tokenContract)
        .getWalletAddress(Address.parse(user));

    const userJettonWalletContract = JettonWallet.create(
        userJettonWalletAddress
    );
    return await client.open(userJettonWalletContract).getBalance();
}

async function main() {
    console.log(
        await getJettonWalletAddress(usdtTokenAddress, bridgeGateAddress)
    );
}

main();
