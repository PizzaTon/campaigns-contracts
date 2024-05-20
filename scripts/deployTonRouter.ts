import {Address, Cell, toNano} from '@ton/core';
import { TonRouter } from '../wrappers/TonRouter';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender().address!;
    const minter = Address.parse("kQAGs82fyuPTvolTdKHWfutaoi7NGN71C4TvoHJ0D48Pwrip");

    const tonRouter = provider.open(TonRouter.createFromConfig({
        jettonBalance: toNano('1000'),
        isActive: true,
        publicKey: Buffer.from('e395c7331d79b85a718c25ac97163ed254c5b416e14a89d9568027fa69a19b5f', 'hex'),
        owner: sender,
        secondOwner: sender,
        jettonMasterAddress: minter,
        jettonWalletCode: Cell.fromBase64("te6ccgECEgEAAzQAART/APSkE/S88sgLAQIBYgIDAgLMBAUAG6D2BdqJofQB9IH0gahhAgHUBgcCAUgICQDDCDHAJJfBOAB0NMDAXGwlRNfA/AL4PpA+kAx+gAxcdch+gAx+gAwc6m0AALTH4IQD4p+pVIgupUxNFnwCOCCEBeNRRlSILqWMUREA/AJ4DWCEFlfB7y6k1nwCuBfBIQP8vCAAET6RDBwuvLhTYAIBIAoLAgEgEBEB8QD0z/6APpAIfAB7UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcPoCF8trE8yAMA/c7UTQ+gD6QPpA1DAI0z/6AFFRoAX6QPpAU1vHBVRzbXBUIBNUFAPIUAT6AljPFgHPFszJIsjLARL0APQAywDJ+QBwdMjLAsoHy//J0FANxwUcsfLiwwr6AFGooYIImJaAggiYloAStgihggjk4cCgGKEn4w8l1wsBwwAjgDQ4PAK6CEBeNRRnIyx8Zyz9QB/oCIs8WUAbPFiX6AlADzxbJUAXMI5FykXHiUAioE6CCCOThwKoAggiYloCgoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQAcFJ5oBihghBzYtCcyMsfUjDLP1j6AlAHzxZQB88WyXGAEMjLBSTPFlAG+gIVy2oUzMlx+wAQJBAjAA4QSRA4N18EAHbCALCOIYIQ1TJ223CAEMjLBVAIzxZQBPoCFstqEssfEss/yXL7AJM1bCHiA8hQBPoCWM8WAc8WzMntVADbO1E0PoA+kD6QNQwB9M/+gD6QDBRUaFSSccF8uLBJ8L/8uLCggjk4cCqABagFrzy4sOCEHvdl97Iyx8Vyz9QA/oCIs8WAc8WyXGAGMjLBSTPFnD6AstqzMmAQPsAQBPIUAT6AljPFgHPFszJ7VSAAgyAINch7UTQ+gD6QPpA1DAE0x+CEBeNRRlSILqCEHvdl94TuhKx8uLF0z8x+gAwE6BQI8hQBPoCWM8WAc8WzMntVIA=="),
        factors: {
            pureBurn: {
                factor: 5n,
                base: 10n,
            },
            burn: {
                factor: 5n,
                base: 10n,
            },
            fee: {
                factor: 1n,
                base: 10n,
            },
            exchangeRate: {
                min: 50n,
                max: 100n,
            },
            reward: {
                factor: 2n,
                base: 10n,
            }
        },
        exchangeRate: {
            factor: 80n,
            base: 1n
        },
        minBurn: toNano('1000')
    }, await compile('TonRouter')));

    await tonRouter.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tonRouter.address);

    // run methods on `tonRouter`
}
