import { Address } from '@ton/core';
import axios from 'axios';

const indexerUrl = 'https://testnet.toncenter.com/api/v3/jetton/transfers';

const vaultAddress = Address.parse(
    '0QC2J68994znTu-nciSo6MOWM_GkwDwu8Sf7Aike50W_xfxY',
);

async function fetchJettonTransfers(
    vaultAddress: string,
    startTime: number,
    endTime: number,
) {
    const params = {
        owner_address: vaultAddress,
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
    trace_id: string;
    jetton_master: string;
    source: string;
    destination: string;
    amount: string;
    forward_payload: string;
}

function analyzeTransfer(transfer: TransferEvent) {
    const token = Address.parse(transfer.jetton_master);
    const sender = Address.parse(transfer.source);
    const destination = Address.parse(transfer.destination);
    const amount = transfer.amount;

    if (sender.toString() === vaultAddress.toString()) {
        // bridge out from vault to user
        console.log(
            `Bridge Out: ${sender.toString()} transfer ${amount} ${token} to ${destination.toString()}`,
        );
    } else if (destination.toString() === vaultAddress.toString()) {
        // bridge in from user to vault
        console.log(
            `Bridge In: ${sender.toString()} transfer ${amount} ${token} to ${destination.toString()}`,
        );
    }
}

let startTime = 1726040017;
let endTime = 1727335909;

setInterval(async () => {
    console.log(`query transfer from ${startTime} to ${endTime}`);
    const transfers = await fetchJettonTransfers(
        vaultAddress.toString(),
        startTime,
        endTime,
    );

    for (const transfer of transfers.jetton_transfers) {
        analyzeTransfer(transfer);
    }

    startTime = endTime + 1;
    endTime = Math.floor(Date.now() / 1000);
}, 30000);
