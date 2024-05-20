import {
    Address,
    beginCell,
    Builder,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    toNano,
    TupleItemCell,
    TupleItemInt
} from '@ton/core';
import {OperationCodes} from "../scripts/utils/op-codes";
import {Queries} from "../scripts/utils/queries";
import {Maybe} from "@ton/ton/dist/utils/maybe";
import {mnemonicToWalletKey, sign} from "@ton/crypto";

export type TonRouterConfig = {
    isActive: boolean;
    publicKey: Buffer;
    minBurn: bigint;
    owner: Address;
    secondOwner: Address;
    jettonMasterAddress: Address;
    jettonWalletCode: Cell;
    factors: Factors;
    exchangeRate: Factor;
    jettonBalance: bigint;
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
    return beginCell()
        .storeBit(config.isActive) // is_active
        .storeUint(0, 32) // seqno
        .storeCoins(config.jettonBalance) // jetton balance
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
}

export class TonRouter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    static createFromAddress(address: Address) {
        return new TonRouter(address);
    }

    static createFromConfig(config: TonRouterConfig, code: Cell, workchain = 0) {
        const data = tonRouterConfigToCell(config);
        const init = {code, data};
        return new TonRouter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendDonate(provider: ContractProvider, via: Sender, value: bigint, params: {
        queryId?: bigint,
        campaignAddress: Address,
        isPure?: boolean
    }) {
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

    async sendCodeUpgrade(provider: ContractProvider, via: Sender, params: {
        newCode: Cell,
        newData?: Maybe<Cell | Builder>
    },) {
        let msgBody = Queries.codeUpgrade(params);

        return await provider.internal(via,
            {
                value: toNano('0.1'),
                body: msgBody,
            }
        );
    }

    async sendUpdateExchangeRate(provider: ContractProvider, params: {
        validUntil: number,
        exchangeRate: Factor,
        adminMnemonic: string[]
    }) {
        const seqno = await this.getSeqno(provider);

        const admin_key = await mnemonicToWalletKey(params.adminMnemonic);

        const body = beginCell()
            .storeUint(seqno, 32)
            .storeUint(params.validUntil, 32)
            .storeUint(params.exchangeRate.factor, 16)
            .storeUint(params.exchangeRate.base, 16)
            .endCell();

        const signature = sign(
            body.hash(),
            admin_key.secretKey
        )

        return await provider.external(
            beginCell()
                .storeUint(0x9df10277, 32) // op-code
                .storeUint(0, 64) // query-id
                .storeBuffer(signature, 64) // signature
                .storeRef(body)
                .endCell()
        );
    }

    async getSeqno(provider: ContractProvider) {
        const res = (await provider.get('seqno', []));
        const stack = res.stack;
        const seqno = stack.pop() as TupleItemInt;

        return seqno.value;
    }

    async getIsActive(provider: ContractProvider) {
        const res = (await provider.get('is_active', []));
        const stack = res.stack;
        const isActive = stack.pop() as TupleItemInt;

        return isActive.value == -1n;
    }

    async getExchangeRate(provider: ContractProvider): Promise<Factor> {
        const res = (await provider.get('get_exchange_rate', []));
        const stack = res.stack;
        const rate = [stack.pop() as TupleItemInt, stack.pop() as TupleItemInt];

        return {
            factor: rate[0].value,
            base: rate[1].value,
        };
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
