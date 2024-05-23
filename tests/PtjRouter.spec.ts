import {Blockchain, printTransactionFees, SandboxContract, TreasuryContract} from '@ton/sandbox';
import {Address, beginCell, Cell, toNano} from '@ton/core';
import {PtjRouter} from '../wrappers/PtjRouter';
import '@ton/test-utils';
import {compile} from '@ton/blueprint';
import {JettonMinter} from "../wrappers/JettonMinter";
import {CampaignsCollection} from "../wrappers/CampaignsCollection";
import {encodeOffChainContent} from "../scripts/utils/nft";
import {JettonWallet} from "../wrappers/JettonWallet";
import {randomAddress} from "@ton/test-utils";

describe('PtjRouter', () => {
    let code: Cell;
    let walletCode: Cell;
    let minterCode: Cell;
    let nftItemCode: Cell;
    let collectionCode: Cell;

    beforeAll(async () => {
        code = await compile('PtjRouter');

        nftItemCode = await compile('Campaign');
        collectionCode = await compile('CampaignsCollection');

        walletCode = Cell.fromBase64("te6cckECEgEAAz8AART/APSkE/S88sgLAQIBYgMCABug9gXaiaH0AfSB9IGoYQICzA8EAgFICAUCASAHBgCDIAg1yHtRND6APpA+kDUMATTH4IQF41FGVIguoIQe92X3hO6ErHy4sXTPzH6ADAToFAjyFAE+gJYzxYBzxbMye1UgANs7UTQ+gD6QPpA1DAH0z/6APpAMFFRoVJJxwXy4sEnwv/y4sKCCOThwKoAFqAWvPLiw4IQe92X3sjLHxXLP1AD+gIizxYBzxbJcYAYyMsFJM8WcPoCy2rMyYBA+wBAE8hQBPoCWM8WAc8WzMntVIAIBIA0JA/UgHj+IDDtRND6APpA+kDUMAjTP/oAUVGgBfpA+kBTW8cFVHNtcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMn5AHB0yMsCygfL/8nQUA3HBRyx8uLDCvoAUaihggiYloCCCJiWgBK2CKGCCOThwKAYoSfjDyWAMCwoAgtcLAcMAI8IAsI4hghDVMnbbcIAQyMsFUAjPFlAE+gIWy2oSyx8Syz/JcvsAkzVsIeIDyFAE+gJYzxYBzxbMye1UAA4QSRA4N18EAHBSeaAYoYIQc2LQnMjLH1Iwyz9Y+gJQB88WUAfPFslxgBDIywUkzxZQBvoCFctqFMzJcfsAECQQIwHxAPTP/oA+kAh8AHtRND6APpA+kDUMFE2oVIqxwXy4sEowv/y4sJUNEJwVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAySD5AHB0yMsCygfL/8nQBPpA9AQx+gAg10nCAPLixHeAGMjLBVAIzxZw+gIXy2sTzIA4AroIQF41FGcjLHxnLP1AH+gIizxZQBs8WJfoCUAPPFslQBcwjkXKRceJQCKgToIII5OHAqgCCCJiWgKCgFLzy4sUEyYBA+wAQI8hQBPoCWM8WAc8WzMntVAIB1BEQABE+kQwcLry4U2AAzyB2AH+IDAgxwCSXwTgAdDTAwFxsJUTXwPwC+D6QPpAMfoAMXHXIfoAMfoAMHOptAAC0x+CEA+KfqVSILqVMTRZ8AjgghAXjUUZUiC6ljFERAPwCeA1ghBZXwe8upNZ8ArgXwSED/LwgpQbrGA==");
        minterCode = Cell.fromBase64("te6cckECDgEAAqMAART/APSkE/S88sgLAQIBYgUCAgN6YAQDAB+vFvaiaH0AfSBqahg/qpBAAH2tvPaiaH0AfSBqahg2GPwUALgqEAmqCgHkKAJ9ASxniwDni2ZkkWRlgIl6AHoAZYBk/IA4OmRlgWUD5f/k6EACAswHBgCTs/BQiAbgqEAmqCgHkKAJ9ASxniwDni2ZkkWRlgIl6AHoAZYBkkHyAODpkZYFlA+X/5Og7wAxkZYKsZ4soAn0BCeW1iWZmZLj9gEB9dkGOASS+B8ADoaYGAuNhJL4HwfSB9IBj9ABi465D9ABj9ABg51NoAAWmP6Z/2omh9AH0gamoYQAqpOF1HGZqamxsommOC+XAkgX0gfQBqGBBoQDBrkP0AGBKIGigheASKUCgZ5CgCfQEsZ4tmZmT2qnBBCD3uy+8pOF1AgE9I7gNjc3AfoA+kD4KFQSBnBUIBNUFAPIUAT6AljPFgHPFszJIsjLARL0APQAywDJ+QBwdMjLAsoHy//J0FAGxwXy4EqhA0VFyFAE+gJYzxbMzMntVAH6QDAg1wsBwwCRW+MN4IIQLHa5c1JwuuMCNTc3I8AD4wI1AsAEDQsKCQBCjhhRJMcF8uBJ1DBDAMhQBPoCWM8WzMzJ7VTgXwWED/LwADQzUDXHBfLgSQP6QDBZyFAE+gJYzxbMzMntVAH+Nl8DggiYloAVoBW88uBLAvpA0wAwlcghzxbJkW3ighDRc1QAcIAYyMsFUAXPFiT6AhTLahPLHxTLPyP6RDBwuo4z+ChEA3BUIBNUFAPIUAT6AljPFgHPFszJIsjLARL0APQAywDJ+QBwdMjLAsoHy//J0M8WlmwicAHLAeL0AAwACsmAQPsAAD6CENUydttwgBDIywVQA88WIvoCEstqyx/LP8mAQvsA5XYBZA==");
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;
    let donor: SandboxContract<TreasuryContract>;
    let creator: SandboxContract<TreasuryContract>;
    let secondOwner: SandboxContract<TreasuryContract>;

    let ptjRouter: SandboxContract<PtjRouter>;
    let minterContract: SandboxContract<JettonMinter>;
    let collection: SandboxContract<CampaignsCollection>;

    function mapAddressToName(address?: Address) {
        if (!address) {
            return 'UNKNOWN';
        }

        if (address.equals(creator.address)) {
            return 'CREATOR';
        }
        if (address.equals(owner.address)) {
            return 'OWNER';
        }
        if (address.equals(deployer.address)) {
            return 'DEPLOYER';
        }
        if (address.equals(secondOwner.address)) {
            return 'SECOND_OWNER';
        }
        if (address.equals(ptjRouter.address)) {
            return 'PTJ_ROUTER';
        }
        if (address.equals(minterContract.address)) {
            return 'MINTER';
        }
        if (address.equals(collection.address)) {
            return 'COLLECTION';
        }
        if (address.equals(donor.address)) {
            return 'DONOR';
        }
    }

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        donor = await blockchain.treasury('donor');
        creator = await blockchain.treasury('creator');
        owner = await blockchain.treasury('owner');
        secondOwner = await blockchain.treasury('second-owner');
        deployer = await blockchain.treasury('deployer');

        minterContract = blockchain.openContract(JettonMinter.createFromConfig({
            wallet_code: walletCode,
            admin: deployer.address,
            content: encodeOffChainContent('https://pizzaton.me/jetton/jetton-meta.json')
        }, minterCode));
        await minterContract.sendDeploy(deployer.getSender(), toNano('0.1'));

        ptjRouter = blockchain.openContract(PtjRouter.createFromConfig({
            isActive: true,
            owner: owner.address,
            secondOwner: secondOwner.address,
            jettonMasterAddress: minterContract.address,
            jettonWalletCode: walletCode,
            factors: {
                burn: {
                    factor: 5n,
                    base: 10n,
                },
                fee: {
                    factor: 1n,
                    base: 10n,
                },
            },
            minBurn: toNano('1000')
        }, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await ptjRouter.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: ptjRouter.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and ptjRouter are ready to use
    });

    it('should accept PTJ donation', async () => {
        // Top Up donor's PTJ balance
        await minterContract.sendMint(deployer.getSender(), donor.address, toNano('1'), toNano('0.09'), toNano('0.15'));

        // get donor jetton wallet address
        const donorJWallet = await minterContract.getWalletAddress(donor.address);
        const res = await blockchain.openContract(JettonWallet.createFromAddress(donorJWallet))
            .sendTransfer(
                donor.getSender(),
                toNano('0.15'), // Message Value
                toNano('1'), // Jetton amount
                ptjRouter.address, // Receiver
                donor.address, // Excess response_address
                null, // custom payload
                toNano('0.1'), // forward ton
                beginCell().storeAddress(randomAddress()).endCell() // CAMPAIGN NFT ADDRESS
            );

        printTransactionFees(res.transactions);

    });
});
