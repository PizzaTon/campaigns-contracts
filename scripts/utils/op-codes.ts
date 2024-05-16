export const OperationCodes = {
    internal: {
        campaign: {
            transfer: 0x5fcc3d14,
            ownershipAssigned: 0x05138d91,
            getStaticData: 0x2fcb26a2,
            reportStaticData: 0x8b771735,
            getRoyaltyParams: 0x693d3950,
            reportRoyaltyParams: 0xa8cb00ad,
            mint: 0x1,
            batchMint: 0x2,
            take_excess: 0xd136d3b3,
            destroy: 0x1f04537a,
            revoke: 0x6f89f5e3,
            close_campaign: 0x11f5b38a,
            open_campaign: 0x11f5b49b,
            add_router: 0x11f5b60a,
            del_router: 0x11f5b61b,
        },
        router: {
            hurray: 0x0761e92a,
            hurray_ton: 0x32f00b8a,
            donate: 0x11f5b26f,
        },
        jetton: {
            transfer: 0xf8a7ea5,
            notification: 0x7362d09c,
            burn: 0x595f07bc
        },
        updateOwner: 0x3,
        changeContent: 0x4,
        withdrawBalance: 0x5,
        updateSecondOwner: 0x6,
        upgradeContract: 0x7,
        updateFactors: 0x8,
        excesses: 0xd53276db,
    },
    external: {
        updateExchangeRate: 0x9df10277,
    }
}