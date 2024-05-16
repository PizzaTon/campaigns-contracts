import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type PtjRouterConfig = {};

export function ptjRouterConfigToCell(config: PtjRouterConfig): Cell {
    return beginCell().endCell();
}

export class PtjRouter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new PtjRouter(address);
    }

    static createFromConfig(config: PtjRouterConfig, code: Cell, workchain = 0) {
        const data = ptjRouterConfigToCell(config);
        const init = { code, data };
        return new PtjRouter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
