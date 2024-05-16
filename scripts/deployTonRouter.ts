import { toNano } from '@ton/core';
import { TonRouter } from '../wrappers/TonRouter';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const tonRouter = provider.open(TonRouter.createFromConfig({}, await compile('TonRouter')));

    await tonRouter.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tonRouter.address);

    // run methods on `tonRouter`
}
