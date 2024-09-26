import { Cell } from '@ton/core';
import axios from 'axios';

const indexerUrl = 'https://testnet.toncenter.com/api/v3/messages';

const bridgeGateAddress = 'kQBWf-_e243JMDqLQopK_F2xp1vc4Si2qYlwTWfMvo-K5dsM';
const TransferEventOPCode = '0xd02bdf21';

async function fetchJettonTransfers(
    opcode: string,
    startTime: number,
    endTime: number,
) {
    const params = {
        source: bridgeGateAddress,
        start_utime: startTime,
        end_utime: endTime,
        sort: 'asc',
    };

    try {
        const response = await axios.get(indexerUrl, {
            headers: {
                accept: 'application/json',
            },
            params: params,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching jetton transfers:', error);
        throw error;
    }
}

interface TransferEvent {
    hash: string;
    opcode: string;
    message_content: {
        hash: string;
        body: string;
    };
}

function analyzeTransferMessage(message: TransferEvent) {
    decodeTransferEvent(message.message_content.body);
}

function decodeTransferEvent(body: string) {
    const cell = Cell.fromBase64(body);
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
        console.log('no text comment in transfer_notification');
    }
    const comment = payload.loadStringTail();

    console.log(msgSender, tokenSender, jettonAmount, comment);
}

let startTime = 1727344791;
let endTime = Math.floor(Date.now() / 1000);

setInterval(async () => {
    console.log(`query transfer from ${startTime} to ${endTime}`);

    const transfers = await fetchJettonTransfers(
        TransferEventOPCode,
        startTime,
        endTime,
    );

    for (const message of transfers.messages) {
        analyzeTransferMessage(message);
    }

    startTime = endTime + 1;
    endTime = Math.floor(Date.now() / 1000);
}, 30000);
