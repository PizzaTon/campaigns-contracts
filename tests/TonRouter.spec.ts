import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { TonRouter } from '../wrappers/TonRouter';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TonRouter', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TonRouter');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let tonRouter: SandboxContract<TonRouter>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        tonRouter = blockchain.openContract(TonRouter.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await tonRouter.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonRouter.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and tonRouter are ready to use
    });
});
