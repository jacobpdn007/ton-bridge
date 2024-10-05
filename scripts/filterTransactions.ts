import { Cell } from "@ton/core";
import axios from "axios";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

const indexerUrl = "https://testnet.toncenter.com/api/v3/transactions";

const bridgeGateAddress = "UQCYGovtmogjI_nVFLfu2QouyNLbwFQ9wxqorZUU6UTe5xND";
const BridgeOutOPCode = 3909295382n;
const RelayerExecuteOPCode = 3498294476n;

interface MessageContent {
    hash: string;
    body: string;
}

interface OutMsg {
    message_content: MessageContent;
}

interface Transaction {
    hash: string;
    trace_id: string;
    in_msg: {
        message_content: MessageContent;
    };
    out_msgs: OutMsg[];
    now: number;
}

function bigintToSolanaAddr(addr: bigint) {
    return bs58.encode(Buffer.from(addr.toString(16), "hex"));
}

async function fetchBridgeTransactions(startTime: number, endTime: number) {
    const params = {
        account: bridgeGateAddress,
        start_utime: startTime,
        end_utime: endTime,
        sort: "asc",
    };

    try {
        const response = await axios.get(indexerUrl, {
            headers: {
                accept: "application/json",
            },
            params: params,
        });
        return response.data.transactions;
    } catch (error) {
        console.error("Error fetching jetton transfers:", error);
        throw error;
    }
}

function analyzeBridgeTransactions(tx: Transaction) {
    for (const msg of tx.out_msgs) {
        const cell = Cell.fromBase64(msg.message_content.body);
        const slice = cell.beginParse();

        const op = slice.loadUintBig(32);
        const queryId = slice.loadUintBig(64);

        if (op == BridgeOutOPCode && queryId == BigInt(0)) {
            const remoteChainEndId = slice.loadUint(32);
            const localTokenAddr = slice.loadAddress();
            const remoteTokenAddr = bigintToSolanaAddr(
                slice.loadRef().beginParse().loadUintBig(512)
            );
            const counter = slice.loadUintBig(128);
            const from = slice.loadAddress();
            const remoteReceiverAddr = bigintToSolanaAddr(
                slice.loadRef().beginParse().loadUintBig(512)
            );

            const slice_1 = slice.loadRef().beginParse();
            const fixedFee = slice_1.loadUintBig(256);
            const volumeFee = slice_1.loadUintBig(256);
            const bridge_amount = slice_1.loadUintBig(256);
            const guid = slice.loadRef().beginParse().loadUintBig(256);

            console.log(
                `BridgeOut guid: ${guid}, remoteChainID: ${remoteChainEndId}, ton token address: ${localTokenAddr}, solana token address: ${remoteTokenAddr}, counter: ${counter}, from ton: ${from}, to solana: ${remoteReceiverAddr}`
            );
            console.log(
                `amount: ${bridge_amount}, fixedFee: ${fixedFee}, volumeFee: ${volumeFee}`
            );
        } else if (op == RelayerExecuteOPCode && queryId == BigInt(0)) {
            const guid = slice.loadUintBig(256);
            const bridgeAmount = slice.loadUintBig(256);
            const slice_1 = slice.loadRef().beginParse();
            const tokenAddr = slice_1.loadAddress();
            const receiverAddr = slice_1.loadAddress();
            console.log(
                `Relayer Executed guid: ${guid}, amount: ${bridgeAmount}, ton token address: ${tokenAddr}, ton receiver: ${receiverAddr}`
            );
        }
    }
}

let startTime = 1728109959;
let endTime = Math.floor(Date.now() / 1000);

setInterval(async () => {
    console.log(`query transfer from ${startTime} to ${endTime}`);

    const transactions = await fetchBridgeTransactions(startTime, endTime);

    for (const tx of transactions) {
        analyzeBridgeTransactions(tx);
    }

    startTime = endTime + 1;
    endTime = Math.floor(Date.now() / 1000);
}, 30000);
