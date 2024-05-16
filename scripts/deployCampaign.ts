import { toNano } from '@ton/core';
import { Campaign } from '../wrappers/Campaign';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const campaign = provider.open(Campaign.createFromConfig({}, await compile('Campaign')));

    await campaign.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(campaign.address);

    // run methods on `campaign`
}
