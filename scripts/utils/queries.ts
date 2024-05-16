import {Address, beginCell} from "@ton/core";
import {OperationCodes} from "./op-codes";

export const Queries = {
    mint: (params: { queryId?: number, itemOwnerAddress: Address, activeUntil?: bigint, campaignId: bigint }) => {
        return beginCell()
            .storeUint(OperationCodes.internal.campaign.mint, 32)
            .storeUint(params.queryId || 0, 64)
            .storeRef(
                beginCell()
                    .storeAddress(params.itemOwnerAddress)
                    .storeUint(params.campaignId, 64)
                    .storeUint(params.activeUntil ?? 0, 64)
                    .endCell()
            ).endCell();
    },
    updateOwner: (params: { queryId?: number, newOwner: Address }) => {
        return beginCell()
            .storeUint(OperationCodes.internal.updateOwner, 32)
            .storeUint(params.queryId || 0, 64)
            .storeAddress(params.newOwner)
            .endCell();
    },
    getRoyaltyParams: (params: { queryId?: number }) => {
        return beginCell()
            .storeUint(OperationCodes.internal.campaign.getRoyaltyParams, 32)
            .storeUint(params.queryId || 0, 64)
            .endCell();
    },
    withdrawBalance: (params: { queryId?: number, to: Address }) => {
        return beginCell()
            .storeUint(OperationCodes.internal.withdrawBalance, 32)
            .storeUint(params.queryId || 0, 64)
            .storeAddress(params.to)
            .endCell();
    },
}