import { Blockchain, SandboxContract, TreasuryContract, printTransactionFees } from '@ton/sandbox';
import {Address, Cell, beginCell, toNano, Dictionary} from '@ton/core';
import { CampaignsCollection, CampaignsCollectionConfig } from '../wrappers/CampaignsCollection';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { flattenTransaction } from '@ton/test-utils';
import { Campaign } from '../wrappers/Campaign';
import { config } from 'process';
import { sha256_sync } from '@ton/crypto';
import {bufferToBigUint256, routersDictionaryValue} from "../scripts/utils/helper";

describe('CampaignsCollection', () => {
    let code: Cell;
    let nftItemCode: Cell;

    beforeAll(async () => {
        code = await compile('CampaignsCollection');
        nftItemCode = await compile('Campaign');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;
    let secondOwner: SandboxContract<TreasuryContract>;
    let collection: SandboxContract<CampaignsCollection>;
    let collectionConfig: CampaignsCollectionConfig;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        owner = await blockchain.treasury('owner');
        secondOwner = await blockchain.treasury('second-owner');

        const routersDict = Dictionary.empty(Dictionary.Keys.BigUint(256), routersDictionaryValue);
        const fakeRouter = await blockchain.treasury('fake-router');
        routersDict.set(bufferToBigUint256(fakeRouter.address.hash), 0n);

        collectionConfig = {
            collectionContent: 'collection_content',
            commonContent: 'common_content',
            secondOwner: secondOwner.address,
            nextItemIndex: 0n,
            price: toNano("0.5"),
            nftItemCode: nftItemCode,
            owner: deployer.address,
            royalty: {
                factor: 100n,
                base: 200n,
                address: deployer.address
            },
            routers: routersDict,
        };

        collection = blockchain.openContract(CampaignsCollection.createFromConfig(collectionConfig, code));

        const deployResult = await collection.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: collection.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and campaignsCollection are ready to use
    });

    it('should deploy new nft', async () => {
        let itemIndex = collectionConfig.nextItemIndex;

        let res = await collection.sendDeployNewNft(owner.getSender(), toNano('0.1'), {
            campaignId: 2n,
            itemOwnerAddress: owner.address,
        });

        expect(res.transactions).toHaveTransaction({
            exitCode(x) {
                return x == 0 || x == -1;
            },
        });

        // Basic nft item data
        let nftItemData = beginCell()
            .storeUint(itemIndex, 64)
            .storeAddress(collection.address)
            .endCell();

        printTransactionFees(res.transactions);

        // As a result of mint query, collection contract should send stateInit message to NFT item contract
        expect(res.events.length).toBe(3);

        const initMessage = flattenTransaction(res.transactions.at(2)!);

        expect(initMessage.initCode?.toString()).toEqual(collectionConfig.nftItemCode.toString());
        expect(initMessage.initData?.toString()).toEqual(nftItemData.toString());

        // check nft content
        const nftItemContract = blockchain.openContract(Campaign.createFromConfig({
            index: itemIndex,
            collectionAddress: collection.address
        }, nftItemCode));
        const nftData = await nftItemContract.getNftData();
        expect(nftData.collectionAddress).toEqualAddress(collection.address);
        expect(nftData.ownerAddress).toEqualAddress(owner.address);
        expect(nftData.index).toEqual(itemIndex);
        expect(nftData.init).toEqual(-1n);
        const test = nftData.content;
        const a = BigInt(test.beginParse().loadStringTail().split('/')[1]);
        expect(Address.parse('0:' + zeroFill(a.toString(16)))).toEqualAddress(owner.address);

    });
});

function zeroFill(str: string, targetLength: number = 64): string {
    return str.padStart(targetLength, '0');
}
