import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type CampaignsCollectionConfig = {};

export function campaignsCollectionConfigToCell(config: CampaignsCollectionConfig): Cell {
    return beginCell().endCell();
}

export class CampaignsCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new CampaignsCollection(address);
    }

    static createFromConfig(config: CampaignsCollectionConfig, code: Cell, workchain = 0) {
        const data = campaignsCollectionConfigToCell(config);
        const init = { code, data };
        return new CampaignsCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
