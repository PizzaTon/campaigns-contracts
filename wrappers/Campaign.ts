import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode, TupleItemCell,
    TupleItemInt, TupleItemSlice
} from '@ton/core';

export type CampaignConfig = {};

export function campaignConfigToCell(config: CampaignConfig): Cell {
    return beginCell().endCell();
}

export class Campaign implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Campaign(address);
    }

    static createFromConfig(config: CampaignConfig, code: Cell, workchain = 0) {
        const data = campaignConfigToCell(config);
        const init = { code, data };
        return new Campaign(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getNftData(provider: ContractProvider): Promise<{ init?: bigint, index: bigint, collectionAddress: Address, ownerAddress?: Address, content: Cell }> {
        let res = await provider.get('get_nft_data', [])

        let [init, index, collectionAddress, ownerAddress, content] = [res.stack.pop() as TupleItemInt, res.stack.pop() as TupleItemInt, res.stack.pop() as TupleItemSlice, res.stack.pop() as TupleItemSlice, res.stack.pop() as TupleItemCell]

        return {
            init: init.value,
            index: index.value,
            collectionAddress: collectionAddress.cell.beginParse().loadAddress(),
            ownerAddress: ownerAddress.cell?.beginParse().loadAddress(),
            content: content.cell
        }
    }
}
