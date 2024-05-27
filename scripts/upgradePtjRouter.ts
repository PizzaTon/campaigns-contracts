import {Address, Cell, toNano} from '@ton/core';
import {compile, NetworkProvider} from '@ton/blueprint';
import {PtjRouter, ptjRouterConfigToCell} from "../wrappers/PtjRouter";
import {MAINNET_PTJ_MINTER} from "./deployTonRouter";

export async function run(provider: NetworkProvider) {

    const sender = provider.sender().address!;
    const minter = {
        mainnet: Address.parse(MAINNET_PTJ_MINTER),
        testnet: Address.parse('kQAGs82fyuPTvolTdKHWfutaoi7NGN71C4TvoHJ0D48Pwrip')
    };
    const ptjRouterAddress = {
        testnet: Address.parse('kQDfD-GvTmIKMvpuLdpWKyPKUN9iSBO3R-FRELzIDPqvCswt'),
        mainnet: Address.parse('EQA5fe-q37e-pYfEAWrpIG_4WilviveGvdGWvg2tvrf7_qdL')
    }
    const router = provider.open(PtjRouter.createFromAddress(
        provider.network() == 'mainnet' ? ptjRouterAddress.mainnet : ptjRouterAddress.testnet
    ));

    const newCode = await compile('PtjRouter');

    await router.sendCodeUpgrade(provider.sender(), {
        newCode,
        newData: ptjRouterConfigToCell(
            {
                isActive: true,
                owner: sender,
                secondOwner: sender,
                jettonMasterAddress: provider.network() == 'mainnet' ? minter.mainnet : minter.testnet,
                jettonWalletCode: Cell.fromBase64("te6ccgECEgEAAzQAART/APSkE/S88sgLAQIBYgIDAgLMBAUAG6D2BdqJofQB9IH0gahhAgHUBgcCAUgICQDDCDHAJJfBOAB0NMDAXGwlRNfA/AL4PpA+kAx+gAxcdch+gAx+gAwc6m0AALTH4IQD4p+pVIgupUxNFnwCOCCEBeNRRlSILqWMUREA/AJ4DWCEFlfB7y6k1nwCuBfBIQP8vCAAET6RDBwuvLhTYAIBIAoLAgEgEBEB8QD0z/6APpAIfAB7UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcPoCF8trE8yAMA/c7UTQ+gD6QPpA1DAI0z/6AFFRoAX6QPpAU1vHBVRzbXBUIBNUFAPIUAT6AljPFgHPFszJIsjLARL0APQAywDJ+QBwdMjLAsoHy//J0FANxwUcsfLiwwr6AFGooYIImJaAggiYloAStgihggjk4cCgGKEn4w8l1wsBwwAjgDQ4PAK6CEBeNRRnIyx8Zyz9QB/oCIs8WUAbPFiX6AlADzxbJUAXMI5FykXHiUAioE6CCCOThwKoAggiYloCgoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQAcFJ5oBihghBzYtCcyMsfUjDLP1j6AlAHzxZQB88WyXGAEMjLBSTPFlAG+gIVy2oUzMlx+wAQJBAjAA4QSRA4N18EAHbCALCOIYIQ1TJ223CAEMjLBVAIzxZQBPoCFstqEssfEss/yXL7AJM1bCHiA8hQBPoCWM8WAc8WzMntVADbO1E0PoA+kD6QNQwB9M/+gD6QDBRUaFSSccF8uLBJ8L/8uLCggjk4cCqABagFrzy4sOCEHvdl97Iyx8Vyz9QA/oCIs8WAc8WyXGAGMjLBSTPFnD6AstqzMmAQPsAQBPIUAT6AljPFgHPFszJ7VSAAgyAINch7UTQ+gD6QPpA1DAE0x+CEBeNRRlSILqCEHvdl94TuhKx8uLF0z8x+gAwE6BQI8hQBPoCWM8WAc8WzMntVIA=="),
                factors: {
                    burn: {
                        factor: 1n,
                        base: 1n,
                    },
                    fee: {
                        factor: 5n,
                        base: 100n,
                    },
                },
                minBurn: toNano('1000')
            }
        )
    });
}
