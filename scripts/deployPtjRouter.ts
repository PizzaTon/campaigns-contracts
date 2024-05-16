import { toNano } from '@ton/core';
import { PtjRouter } from '../wrappers/PtjRouter';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ptjRouter = provider.open(PtjRouter.createFromConfig({}, await compile('PtjRouter')));

    await ptjRouter.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(ptjRouter.address);

    // run methods on `ptjRouter`
}
