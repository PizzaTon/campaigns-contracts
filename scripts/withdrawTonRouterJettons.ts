import { Address, Cell, toNano } from '@ton/core';
import { TonRouter } from '../wrappers/TonRouter';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const sender = provider.sender().address!;
  const tonRouterAddress = Address.parse("EQBWdN1i-VJGAQ30Eg6ZrGeyWMvpcZNLKhVStGnhEQShPivp");

  const tonRouter = provider.open(TonRouter.createFromAddress(tonRouterAddress));

}
