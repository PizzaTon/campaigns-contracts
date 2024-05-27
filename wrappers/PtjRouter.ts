import {
    Address,
    beginCell,
    Builder,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode, toNano
} from '@ton/core';
import {Factor, Factors, MinMaxFactor} from "./TonRouter";
import {Maybe} from "@ton/ton/dist/utils/maybe";
import {Queries} from "../scripts/utils/queries";

export type PtjRouterConfig = {
    isActive: boolean;
    minBurn: bigint;
    owner: Address;
    secondOwner: Address;
    jettonMasterAddress: Address;
    jettonWalletCode: Cell;
    factors: PtjRouterFactors;
};

export type PtjRouterFactors = {
    fee: Factor;
    burn: Factor;
}

export function ptjFactorsToCell(factors: PtjRouterFactors) {
    return beginCell()
        .storeUint(factors.fee.factor, 16)
        .storeUint(factors.fee.base, 16)
        .storeUint(factors.burn.factor, 16)
        .storeUint(factors.burn.base, 16)
        .endCell();
}

export function ptjRouterConfigToCell(config: PtjRouterConfig): Cell {
    return beginCell()
        .storeBit(config.isActive)
        .storeCoins(config.minBurn) // minimum burn
        .storeCoins(0) // burn storage
        .storeUint(0, 64)
        .storeAddress(config.owner)
        .storeAddress(config.secondOwner)
        .storeRef(
            beginCell()
                .storeAddress(config.jettonMasterAddress)
                .storeRef(config.jettonWalletCode)
                .endCell()
        )
        .storeRef(ptjFactorsToCell(config.factors))
        .endCell();
}

export class PtjRouter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    static createFromAddress(address: Address) {
        return new PtjRouter(address);
    }

    static createFromConfig(config: PtjRouterConfig, code: Cell, workchain = 0) {
        const data = ptjRouterConfigToCell(config);
        const init = {code, data};
        return new PtjRouter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendCodeUpgrade(provider: ContractProvider, via: Sender, params: {newCode: Cell, newData?: Maybe<Cell | Builder>}) {
        let msgBody = Queries.codeUpgrade(params);

        return await provider.internal(via,
            {
                value: toNano('0.01'),
                body: msgBody,
            }
        );
    }
}
