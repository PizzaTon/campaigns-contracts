import { toNano } from '@ton/core';
import { CampaignsCollection } from '../wrappers/CampaignsCollection';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const campaignsCollection = provider.open(CampaignsCollection.createFromConfig({}, await compile('CampaignsCollection')));

    await campaignsCollection.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(campaignsCollection.address);

    // run methods on `campaignsCollection`
}
