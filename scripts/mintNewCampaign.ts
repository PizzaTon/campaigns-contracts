import { Address, toNano } from '@ton/core';
import { CampaignsCollection } from '../wrappers/CampaignsCollection';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const collectionAddress = Address.parse("0QAh91IZTdT03P6ZmKucGeoAxv9CBT-xh32C5h15pyvJHAtd");

    const campaignsCollection = provider.open(CampaignsCollection.createFromAddress(collectionAddress));

    await campaignsCollection.sendDeployNewNft(provider.sender(), toNano('0.06'), {
        campaignId: 0n,
        passAmount: toNano('0.05'),
        itemOwnerAddress: Address.parse("UQB8jfaLrvTKH6m5KFm9XkSEVC5KqRJyusNbp6tknvPv9Voh"),
        queryId: 0,
    });
}
