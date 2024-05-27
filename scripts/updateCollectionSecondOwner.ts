import {Address, Dictionary, toNano} from '@ton/core';
import {Campaign} from '../wrappers/Campaign';
import {compile, NetworkProvider} from '@ton/blueprint';
import {CampaignsCollection, campaignsCollectionConfigToCell} from "../wrappers/CampaignsCollection";
import {bufferToBigUint256, routersDictionaryValue} from "./utils/helper";

export async function run(provider: NetworkProvider) {
    const collection = provider.open(CampaignsCollection.createFromAddress(Address.parse('EQAwPTG-IAkVxQEkU1mLWKAoCGi7VEfoFhAMLUYekIr_GVEa')));

    await collection.sendChangeSecondOwner(provider.sender(), Address.parse('UQCk8-F6g38pNfnV7oyux3lmNpUMQ2fe951IvdFIk_fVKz0h'));
}
