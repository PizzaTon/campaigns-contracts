import {Address, Cell, toNano} from '@ton/core';
import { Campaign } from '../wrappers/Campaign';
import { compile, NetworkProvider } from '@ton/blueprint';
import {CampaignsCollection} from "../wrappers/CampaignsCollection";
import {TonRouter, tonRouterConfigToCell} from "../wrappers/TonRouter";
import {MAINNET_PTJ_MINTER} from "./deployTonRouter";

export async function run(provider: NetworkProvider) {

    const publicKey= Buffer.from('6eb3a718fa24e42330d74f179f93fd7ac2e829c3f8a56df36c7dbead50132dbe', 'hex');
    const router = provider.open(TonRouter.createFromAddress(Address.parse('EQBWdN1i-VJGAQ30Eg6ZrGeyWMvpcZNLKhVStGnhEQShPivp')));

    await router.sendUpdatePublicKey(provider.sender(), publicKey);
}
