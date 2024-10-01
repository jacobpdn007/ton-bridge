import { Address, beginCell, toNano, comment } from "@ton/core";
import { JettonMaster, JettonWallet } from "@ton/ton";
import { NetworkProvider } from "@ton/blueprint";

const receiver = Address.parse(
    "kQBWf-_e243JMDqLQopK_F2xp1vc4Si2qYlwTWfMvo-K5dsM"
);
export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(
        "kQBTOHgaM-bwicGISKqJovc6byWqGUkrKq55hTCu_xPapu-l"
    );

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }
    const sampleJetton = provider.open(JettonMaster.create(address));
    const senderAddress = provider.sender().address;
    if (!senderAddress) {
        ui.write("Error: Sender address is undefined!");
        return;
    }
    const senderJettonWalletAddress =
        await sampleJetton.getWalletAddress(senderAddress);
    const senderJettonWallet = provider.open(
        JettonWallet.create(senderJettonWalletAddress)
    );

    const text = comment(`1:7rhxnLV8C77o6d8oz26AgK8x8m5ePsdeRawjqvojbjnQ`);

    const transferBody = beginCell()
        .storeUint(0xf8a7ea5, 32) // request_transfer op
        .storeUint(0, 64) // query_id
        .storeCoins(toNano(100000)) // jetton amount
        .storeAddress(receiver) // receiver
        .storeAddress(senderAddress) // responseAddress
        .storeMaybeRef(null) // null custom_payload
        .storeCoins(toNano("0.01")) // forward_ton_amount
        .storeMaybeRef(text) // storeMaybeRef put 1 bit before cell (forward_payload in cell) or 0 for null (forward_payload in slice)
        .endCell();

    await provider.sender().send({
        value: toNano("0.1"),
        to: senderJettonWallet.address,
        body: transferBody,
    });
}
