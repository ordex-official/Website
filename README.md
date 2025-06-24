# 🪙 Associated Token Accounts:

On the Solana blockchain, tokens aren’t held directly by wallet addresses. Instead, each token is stored in a separate account called an **Associated Token Account (ATA)**, which is uniquely linked to both the wallet and the token. To remain active on the network, each token account must hold a small amount of solana as **account rent** to stay active on the network — this prevents the account from being deleted over time.

- **ATA ~ 0.00203928 Sol**

Each token account holds one token type and stays open when its balance reaches zero.  
Closing it returns the locked solana to wallet.

#### 💸 Who pays for the rent:

When buying tokens, you pay rent if the token account does not exist. For tokens sent to you such as airdrops, spam tokens, or transfers, the sender typically covers the one-time rent to create your token account. After that, no additional rent is required to receive tokens.

Token accounts become empty when you transfer or sell all supply of a specific token held in that account. However, these accounts don’t close automatically. They remain open so they can receive tokens again without requiring you to pay rent each time the account is recreated. This design saves users from repeatedly paying the rent fee and makes receiving tokens easier and more efficient.

## ♻️ Reclaim Rent

#### 🔍 Checking empty token account:

To find vacant accounts tied to your wallet, simply enter your wallet address on the main page—there’s no need to connect your wallet. The tool scans for token accounts with zero token balance (empty ATAs) and shows you how many there are. It also calculates the total amount of SOL locked in those accounts that you can reclaim by closing them.

#### 🤔 How to Use This Tool:

To close empty token accounts (up to 50 at once), you need to connect your wallet using Phantom. After connecting, you will be able to review your wallet address, your current balance, and the total number of empty token accounts associated with your wallet. Once you review this information, you can approve and pay a minimal gas and service fee, the lowest fee in the ecosystem, charged only for tracking. After the process completes, locked solana in those accounts will be returned to your wallet and you will receive a report showing the total amount of SOL recovered and a transaction signature (TX) link so you can verify the transaction details on Solscan.