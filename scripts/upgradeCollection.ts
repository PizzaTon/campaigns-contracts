import {Address, toNano} from '@ton/core';
import { Campaign } from '../wrappers/Campaign';
import { compile, NetworkProvider } from '@ton/blueprint';
import {CampaignsCollection} from "../wrappers/CampaignsCollection";

export async function run(provider: NetworkProvider) {
    const collection = provider.open(CampaignsCollection.createFromAddress(Address.parse('EQA8bKOD1a1mpZh9UUFdvXfAjqqwlihWaqvKHJZ5TbjjdY42')));
    const newCode =  await compile('CampaignsCollection');
    await collection.sendCodeUpgrade(provider.sender(), newCode);
}
