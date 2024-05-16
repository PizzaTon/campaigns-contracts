import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { CampaignsCollection } from '../wrappers/CampaignsCollection';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('CampaignsCollection', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('CampaignsCollection');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let campaignsCollection: SandboxContract<CampaignsCollection>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        campaignsCollection = blockchain.openContract(CampaignsCollection.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await campaignsCollection.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: campaignsCollection.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and campaignsCollection are ready to use
    });
});
