# PizzaTon Campaigns Protocol

PizzaTon is a decentralized donation platform built on the TON blockchain. It utilizes smart contracts to facilitate transparent and secure donations to specific campaigns. These campaigns are uniquely represented by NFT (Non-Fungible Token) items within a designated NFT collection.

This repository houses the core smart contract code that powers PizzaTon. With PizzaTon, users can:

- Donate cryptocurrency to support campaigns they care about.
- Gain confidence through the trustless and immutable nature of blockchain technology.
- Track the progress and impact of their donations on-chain.

# TonRouter

The `TonRouter` contract serves as the core functionality for processing donations within PizzaTon. It acts as a central hub for users to interact with campaigns and manage their contributions.

## Key functionalities of TONRouter include:

* **Donation Processing**: The `op::donate()` opcode facilitates user donations to specific campaigns. It takes two arguments:

`CampaignAddress`: This specifies the address of the target campaign the user wishes to support.

`isPure`: This boolean flag determines the type of donation:

*True (Pure Donation)*: In this case, the full donation amount, in TON, will be converted to PTJ (PizzaTon's utility token) equivalent and is directly forwarded to the campaign's NFT contract. This ensures the campaign creator receives the unadulterated donation.

*False (Commission Donation)*: The system deducts a pre-defined commission fee (n%) from the donation amount. The remaining amount is then sent to the campaign's NFT contract for eventual distribution to the campaign creator.

- **Burn Mechanism**: Additionally, a burn mechanism is implemented for both pure and impure donations.
  The burn amount is calculated as follows:

`burn_amount = (pure_burn_factor * fee_ptj_equivalent) / pure_burn_base`

- **Reward System**: To incentivize larger contributions, donors with a specefic donatoin amount will receive a reward in PTJ.

`donor_reward = muldiv(reward_factor, burn_amount, reward_base)` However, the reward is only distributed if donor_reward is greater than **10 PTJ**. This simplifies the reward logic and ensures a minimum value for the reward.
