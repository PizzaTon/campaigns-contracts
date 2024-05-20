import { Address, toNano } from '@ton/core';
import { CampaignsCollection } from '../wrappers/CampaignsCollection';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const collectionAddress = Address.parse("EQA8bKOD1a1mpZh9UUFdvXfAjqqwlihWaqvKHJZ5TbjjdY42");

    const campaignsCollection = provider.open(CampaignsCollection.createFromAddress(collectionAddress));

    await campaignsCollection.sendDeployNewNft(provider.sender(), toNano('0.05'), {
        campaignId: 1n,
        itemOwnerAddress: Address.parse("UQB8jfaLrvTKH6m5KFm9XkSEVC5KqRJyusNbp6tknvPv9Voh"),
        queryId: 0,
    });
}
