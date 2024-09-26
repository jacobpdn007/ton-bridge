import { Address, toNano } from '@ton/core';
import { SampleJetton } from '../wrappers/SampleJetton';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('SampleJetton address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const sampleJetton = provider.open(SampleJetton.fromAddress(address));

    await sampleJetton.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Mint',
            receiver: Address.parse('0QDJBCH9vPAO_g9l5LVsJQ2ojnfNk6QykL01bi0-i71XB8WB'),
            amount: toNano(1000000),
        },
    );
}
