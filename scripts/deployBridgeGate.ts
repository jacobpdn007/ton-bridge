import { toNano, Address } from '@ton/core';
import { BridgeGate } from '../wrappers/BridgeGate';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const owner = Address.parse(
        '0QDJBCH9vPAO_g9l5LVsJQ2ojnfNk6QykL01bi0-i71XB8WB',
    );

    const bridgeGate = provider.open(await BridgeGate.fromInit(owner));

    await bridgeGate.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        'Init',
    );

    await provider.waitForDeploy(bridgeGate.address);
}
