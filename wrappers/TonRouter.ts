import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode, TupleItemCell,
    TupleItemInt
} from '@ton/core';
import {OperationCodes} from "../scripts/utils/op-codes";

export type TonRouterConfig = {
    publicKey: Buffer;
    minBurn: bigint;
    owner: Address;
    secondOwner: Address;
    jettonMasterAddress: Address;
    jettonWalletCode: Cell;
    factors: Factors;
    exchangeRate: Factor;
};

export function exchangeRateToCell(rate: Factor) {
    return beginCell()
        .storeUint(rate.factor, 16)
        .storeUint(rate.base, 16)
        .endCell();
}

export type Factor = {
    factor: bigint;
    base: bigint;
}

export type MinMaxFactor = {
    min: bigint;
    max: bigint;
}

export type Factors = {
    fee: Factor;
    burn: Factor;
    pureBurn: Factor;
    reward: Factor;
    exchangeRate: MinMaxFactor;
}


export function factorsToCell(factors: Factors) {
    return beginCell()
        .storeUint(factors.fee.factor, 16)
        .storeUint(factors.fee.base, 16)
        .storeUint(factors.burn.factor, 16)
        .storeUint(factors.burn.base, 16)
        .storeUint(factors.exchangeRate.min, 16)
        .storeUint(factors.exchangeRate.max, 16)
        .storeUint(factors.pureBurn.factor, 16)
        .storeUint(factors.pureBurn.base, 16)
        .storeUint(factors.reward.factor, 16)
        .storeUint(factors.reward.base, 16)
        .endCell();
}
export function tonRouterConfigToCell(config: TonRouterConfig): Cell {
    const cell =  beginCell()
        .storeUint(0, 32) // seqno
        .storeCoins(config.minBurn)
        .storeCoins(0) // burn storage
        .storeUint(0, 64) // Jetton ID (TON = 0)
        .storeBuffer(config.publicKey, 32) // external owner public key
        .storeAddress(config.owner)
        .storeAddress(config.secondOwner)
        .storeRef(
            beginCell()
                .storeAddress(config.jettonMasterAddress)
                .storeRef(config.jettonWalletCode)
                .endCell()
        )
        .storeRef(factorsToCell(config.factors))
        .storeRef(exchangeRateToCell(config.exchangeRate))
        .endCell();
    console.log(cell.bits.length);
    return cell;
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

    async sendDonate(provider: ContractProvider, via: Sender, value: bigint, params: { queryId?: bigint, campaignAddress: Address, isPure?: boolean }) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(OperationCodes.internal.router.donate, 32) // op_code
                .storeUint(params.queryId ?? 0, 64) // query_id
                .storeAddress(params.campaignAddress) // campaign_address
                .storeBit(params.isPure ?? true)
                .endCell(),
        });
    }

    async getBurnDetails(provider: ContractProvider) {
        const stack = (await provider.get('get_burn_details', [])).stack;
        const list = [stack.pop() as TupleItemInt, stack.pop() as TupleItemInt];
        return {
            minBurn: list.at(0)?.value,
            burnStorage: list.at(1)?.value
        };
    }

    async getAddresses(provider: ContractProvider) {
        const stack = (await provider.get('get_addresses', [])).stack;
        const list = [stack.pop() as TupleItemCell, stack.pop() as TupleItemCell, stack.pop() as TupleItemCell, stack.pop() as TupleItemCell];
        return {
            ownerAddress: list.at(0)?.cell.beginParse().loadAddress(),
            secondOwner: list.at(1)?.cell.beginParse().loadAddress(),
            burnerAddress: list.at(2)?.cell.beginParse().loadAddress(),
        };
    }
}
