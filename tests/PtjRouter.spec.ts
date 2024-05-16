import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { PtjRouter } from '../wrappers/PtjRouter';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('PtjRouter', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('PtjRouter');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let ptjRouter: SandboxContract<PtjRouter>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        ptjRouter = blockchain.openContract(PtjRouter.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await ptjRouter.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: ptjRouter.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and ptjRouter are ready to use
    });
});
