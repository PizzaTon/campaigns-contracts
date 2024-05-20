import { Address, Cell, toNano } from '@ton/core';
import { TonRouter } from '../wrappers/TonRouter';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const sender = provider.sender().address!;
  const tonRouterAddress = Address.parse("EQB7sFHqDCKJRRGkIvO-f_rzDmCuVVWQUxqK15L2QB-6nXvA");
  const campaignAddress = Address.parse("EQAWjN8_ypEzoVsqFVJQ1zPiL-HYpWISnyiWcJ6KGr0Tfz4S");

  const tonRouter = provider.open(TonRouter.createFromAddress(tonRouterAddress));

  await tonRouter.sendDonate(provider.sender(), toNano('5'), {
    campaignAddress: campaignAddress,
    isPure: false
  });

}
