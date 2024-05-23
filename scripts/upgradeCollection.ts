import {Address, Dictionary, toNano} from '@ton/core';
import {Campaign} from '../wrappers/Campaign';
import {compile, NetworkProvider} from '@ton/blueprint';
import {CampaignsCollection, campaignsCollectionConfigToCell} from "../wrappers/CampaignsCollection";
import {bufferToBigUint256, routersDictionaryValue} from "./utils/helper";

export async function run(provider: NetworkProvider) {
    const collection = provider.open(CampaignsCollection.createFromAddress(Address.parse('kQA8bKOD1a1mpZh9UUFdvXfAjqqwlihWaqvKHJZ5TbjjdTW8')));
    const newCode = await compile('CampaignsCollection');

    const sender = provider.sender().address!;
    const tonRouterAddress = Address.parse("kQBUI6gHTITNecVR-XZNZx6Zi8xPQlCzrxvFA309zmdHQaYt");

    const nftItemCode = await compile('Campaign');

    const routersDict = Dictionary.empty(Dictionary.Keys.BigUint(256), routersDictionaryValue);
    routersDict.set(bufferToBigUint256(tonRouterAddress.hash), 0n);

    await collection.sendCodeUpgrade(provider.sender(), {
        newCode,
        newData: campaignsCollectionConfigToCell(
            {
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
                secondOwner: sender,
                routers: routersDict,
            }
        )
    });
}
