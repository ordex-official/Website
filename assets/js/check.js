const { PublicKey, Connection } = solanaWeb3;

document.addEventListener("DOMContentLoaded", () => {

  const connection = new Connection(
    "https://solana-rpc.publicnode.com",
    "confirmed"
  );

  const TOKEN_PROGRAM_ID = new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  );
  const TOKEN_2022_PROGRAM_ID = new PublicKey(
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
  );

  const walletInput = document.getElementById("wallet");
  const checkButton = document.getElementById("check-button");
  const countEl = document.getElementById("count");

  checkButton.addEventListener("click", async () => {
    const address = walletInput.value.trim();

    if (!/^([1-9A-HJ-NP-Za-km-z]{32,44})$/.test(address)) {
      countEl.textContent = "Invalid wallet format.";
      return;
    }

    countEl.textContent = "";
    checkButton.disabled = true;

    try {
      const publicKey = new PublicKey(address);
      const emptyAccounts = await checkEmptyTokenAccounts(publicKey);
      const fee = emptyAccounts.length * 0.002;

      countEl.textContent = `[ ${emptyAccounts.length} ] ~ ${fee.toFixed(
        3
      )} SOL`;
    } catch (err) {
      console.error("Error:", err);
      countEl.textContent = "Error checking wallet.";
    } finally {
      checkButton.disabled = false;
    }
  });

  async function checkEmptyTokenAccounts(wallet) {
    countEl.textContent = "Checking...";

    const emptyList = [];

    async function check(programId) {
      const res = await connection.getParsedTokenAccountsByOwner(wallet, {
        programId,
      });
      res.value.forEach(({ pubkey, account }) => {
        const info = account.data?.parsed?.info;
        const amount = info?.tokenAmount?.uiAmount;
        if (amount === 0) {
          emptyList.push(pubkey.toString());
        }
      });
    }

    await check(TOKEN_PROGRAM_ID);

    await check(TOKEN_2022_PROGRAM_ID);

    return emptyList;
  }

});
