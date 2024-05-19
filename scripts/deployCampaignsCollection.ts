import {Address, Dictionary, toNano} from '@ton/core';
import { CampaignsCollection } from '../wrappers/CampaignsCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import {bufferToBigUint256, routersDictionaryValue} from "./utils/helper";

export async function run(provider: NetworkProvider) {
    const sender = provider.sender().address!;
    const tonRouterAddress = Address.parse("EQB7sFHqDCKJRRGkIvO-f_rzDmCuVVWQUxqK15L2QB-6nXvA");

    const nftItemCode = await compile('Campaign');

    const routersDict = Dictionary.empty(Dictionary.Keys.BigUint(256), routersDictionaryValue);
    routersDict.set(bufferToBigUint256(tonRouterAddress.hash), 0n);

    const campaignsCollection = provider.open(CampaignsCollection.createFromConfig({
        nextItemIndex: 0n,
        collectionContent: 'https://api.pizzaton.me/v1/campaigns/collectionmeta',
        commonContent: 'https://api.pizzaton.me/v1/campaigns/meta/',
        price: toNano('0.06'),
        nftItemCode: nftItemCode,
        owner: sender,
        royalty: {
            address: provider.sender().address!,
            factor: 25n,
            base: 100n,
        },
        secondOwner:sender,
        routers: routersDict,
    }, await compile('CampaignsCollection')));

    await campaignsCollection.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(campaignsCollection.address);

    // run methods on `campaignsCollection`
}
