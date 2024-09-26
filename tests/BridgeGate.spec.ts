import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { BridgeGate } from '../wrappers/BridgeGate';
import '@ton/test-utils';

describe('BridgeGate', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let bridgeGate: SandboxContract<BridgeGate>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        bridgeGate = blockchain.openContract(await BridgeGate.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await bridgeGate.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: bridgeGate.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and bridgeGate are ready to use
    });
});
