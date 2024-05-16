import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type TonRouterConfig = {};

export function tonRouterConfigToCell(config: TonRouterConfig): Cell {
    return beginCell().endCell();
}

export class TonRouter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TonRouter(address);
    }

    static createFromConfig(config: TonRouterConfig, code: Cell, workchain = 0) {
        const data = tonRouterConfigToCell(config);
        const init = { code, data };
        return new TonRouter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
