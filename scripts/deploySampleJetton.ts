import { Address, Cell, toNano } from '@ton/core';
import { SampleJetton } from '../wrappers/SampleJetton';
import { NetworkProvider } from '@ton/blueprint';
import { buildOnchainMetadata } from './jetton-helpers';

export async function run(provider: NetworkProvider) {
    const owner = Address.parse('0QDJBCH9vPAO_g9l5LVsJQ2ojnfNk6QykL01bi0-i71XB8WB');
    const content = buildOnchainMetadata({
        name: 'US Dollar',
        description: 'This is description of Test Jetton Token in Tact-lang',
        symbol: 'USDT',
        image: 'https://avatars.githubusercontent.com/u/104382459?s=200&v=4',
    });
    const maxSupply = toNano(2000000000);
    const sampleJetton = provider.open(await SampleJetton.fromInit(owner, content, maxSupply));

    await sampleJetton.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        'Mint: 100',
    );

    await provider.waitForDeploy(sampleJetton.address);

    const metadata = await sampleJetton.getGetJettonData();
    console.log('metadata', metadata);
}
