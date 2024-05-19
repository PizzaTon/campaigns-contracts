import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Dictionary,
    Sender,
    SendMode, toNano
} from '@ton/core';
import {encodeOffChainContent} from "../scripts/utils/nft";
import {Queries} from "../scripts/utils/queries";

export type RoyaltyParams = {
    factor: bigint;
    base: bigint;
    address: Address;
}

export type CollectionData = {
    nextItemIndex: bigint;
    content: Cell;
    owner: Address;
};


export type CampaignsCollectionConfig = {
    owner: Address;
    secondOwner: Address;
    nextItemIndex: bigint;
    price: bigint;
    collectionContent: string;
    commonContent: string;
    nftItemCode: Cell;
    royalty: RoyaltyParams;
    routers: Dictionary<bigint, bigint>
};

export function campaignsCollectionConfigToCell(config: CampaignsCollectionConfig): Cell {
    let collectionContent = encodeOffChainContent(config.collectionContent);
    let commonContent = beginCell().storeBuffer(Buffer.from(config.commonContent)).endCell();
    let contentCell = beginCell().storeRef(collectionContent).storeRef(commonContent).endCell();

    let royaltyCell = beginCell()
        .storeUint(config.royalty.factor, 16)
        .storeUint(config.royalty.base, 16)
        .storeAddress(config.royalty.address)
        .endCell();

    return beginCell()
        .storeAddress(config.owner)
        .storeUint(config.nextItemIndex, 64)
        .storeAddress(config.secondOwner)
        .storeRef(contentCell)
        .storeRef(config.nftItemCode)
        .storeRef(royaltyCell)
        .storeDict(config.routers)
        .endCell()
}

export class CampaignsCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    static createFromAddress(address: Address) {
        return new CampaignsCollection(address);
    }

    static createFromConfig(config: CampaignsCollectionConfig, code: Cell, workchain = 0) {
        const data = campaignsCollectionConfigToCell(config);
        const init = {code, data};
        return new CampaignsCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendDeployNewNft(provider: ContractProvider, via: Sender, value: bigint, params: { queryId?: number, itemOwnerAddress: Address, campaignId: bigint }) {
        let msgBody = Queries.mint(params);

        await provider.internal(via, {
            value: value,
            body: msgBody
        })
    }

    async sendChangeOwner(provider: ContractProvider, via: Sender, newOwner: Address) {
        let msgBody = Queries.updateOwner({ newOwner });

        return await provider.internal(via,
            {
                value: toNano(1),
                bounce: false,
                body: msgBody,
            }
        );
    }

    async sendCodeUpgrade(provider: ContractProvider, via: Sender, newCode: Cell) {
        let msgBody = Queries.codeUpgrade({ newCode: newCode });

        return await provider.internal(via,
            {
                value: toNano('0.1'),
                body: msgBody,
            }
        );
    }

    async sendGetRoyaltyParams(provider: ContractProvider, via: Sender) {
        let msgBody = Queries.getRoyaltyParams({})

        return await provider.internal(via, {
            value: toNano(1),
            bounce: false,
            body: msgBody,
        });
    }

}
