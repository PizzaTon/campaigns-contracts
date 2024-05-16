import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

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
}
