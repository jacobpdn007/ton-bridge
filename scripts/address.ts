import { WalletContractV4 } from "@ton/ton";
import { mnemonicNew, mnemonicToWalletKey } from "@ton/crypto";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

import fs from "fs";
import path from "path";

const bridgeAccountsPath = path.resolve(
    __dirname,
    "../data/bridge_account.json"
);

interface Account {
    index: number;
    network: string;
    priv: string;
    address: string;
}

export async function getBridgeAccounts(network: string) {
    const data = await fs.promises.readFile(bridgeAccountsPath, "utf-8");
    const accounts: Account[] = JSON.parse(data);

    let result: Account[] = [];
    for (const account of accounts) {
        if (account.network === network) {
            result.push(account);
        }
    }
    return result;
}

async function generateTonAddresses(count: number, network: string) {
    for (let i = 0; i < count; i++) {
        const mnemonic = await mnemonicNew();
        const key = await mnemonicToWalletKey(mnemonic);
        const wallet = WalletContractV4.create({
            publicKey: key.publicKey,
            workchain: 0,
        });
        console.log({
            index: i,
            network: network,
            priv: mnemonic,
            address: wallet.address.toString(),
        });
    }
}

function generateSolanaAddress(count: number, network: string) {
    for (let i = 0; i < count; i++) {
        const keypair = Keypair.generate();
        console.log({
            index: i,
            network: network,
            priv: bs58.encode(keypair.secretKey),
            address: keypair.publicKey.toBase58(),
        });
    }
}

function restoreSonalaAddress(priv: string) {
    const keypair = Keypair.fromSecretKey(bs58.decode(priv));
    console.log(keypair.publicKey.toBase58());
}

async function main() {
    const bridgeAccounts = await getBridgeAccounts("ton-testnet");
    console.log(bridgeAccounts);
    // await generateTonAddresses(2, "ton-testnet");
    // generateSolanaAddress(2, "solana-testnet");
}

main();
