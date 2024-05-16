import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Campaign } from '../wrappers/Campaign';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Campaign', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Campaign');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let campaign: SandboxContract<Campaign>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        campaign = blockchain.openContract(Campaign.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await campaign.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: campaign.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and campaign are ready to use
    });
});
