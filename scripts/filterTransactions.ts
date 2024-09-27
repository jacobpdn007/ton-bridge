import { Cell } from "@ton/core";
import axios from "axios";

const indexerUrl = "https://testnet.toncenter.com/api/v3/transactions";

const bridgeGateAddress = "kQBWf-_e243JMDqLQopK_F2xp1vc4Si2qYlwTWfMvo-K5dsM";
const TransferEventOPCode = "0xd02bdf21";

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

function analyzeTransferMessage(tx: Transaction) {
    // Solana -> TON, 从 BridgeGate 发送 token 到用户
    // decodeInMsg(tx.in_msg.msg_content.body)

    // TON -> Solana, 用户 transfer token 到 BridgeGate
    decodeOutMsg(tx);
}

function decodeOutMsg(tx: Transaction) {
    for (const msg of tx.out_msgs) {
        const cell = Cell.fromBase64(msg.message_content.body);
        const slice = cell.beginParse();

        const op = slice.loadUint(32);
        if (op != parseInt(TransferEventOPCode, 16)) {
            return;
        }
        const msgSender = slice.loadAddress();
        const tokenSender = slice.loadAddress();
        const jettonAmount = slice.loadCoins();

        const maybeRef = slice.loadBit();

        const payload = maybeRef ? slice.loadRef().beginParse() : slice;
        const payloadOp = payload.loadUint(32);
        if (payloadOp != 0) {
            console.log("no text comment in transfer_notification");
        }
        const comment = payload.loadStringTail();

        console.log(tx.hash, msgSender, tokenSender, jettonAmount, comment);
    }
}

let startTime = 1727344791;
let endTime = Math.floor(Date.now() / 1000);

setInterval(async () => {
    console.log(`query transfer from ${startTime} to ${endTime}`);

    const transactions = await fetchBridgeTransactions(startTime, endTime);

    for (const tx of transactions) {
        analyzeTransferMessage(tx);
    }

    startTime = endTime + 1;
    endTime = Math.floor(Date.now() / 1000);
}, 30000);
