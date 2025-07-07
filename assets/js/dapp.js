const { Connection, Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram } = solanaWeb3;
const { TOKEN_PROGRAM_ID, Token } = splToken;

const connection = new Connection("https://solana-rpc.publicnode.com");
const coffee = new PublicKey("G4o9SvD8ad2CTpK63NufWxLWA1oox2pbTjN32UaCz6bS");

const emptyAccounts = [];

let signer;

document.addEventListener("DOMContentLoaded", () => {
    const msg = document.getElementById('alert');
    
    const connectBtn = document.getElementById("connect-btn");
    const closeBtn = document.getElementById("close-btn");

    // Close empty token accounts
    async function closeAccounts() {
        const chunkSize = 25;
        const transactionChunks = [];

        const { blockhash } = await connection.getLatestBlockhash();

        for (let i = 0; i < emptyAccounts.length; i += chunkSize) {
            const tx = new Transaction({
                feePayer: signer,
                recentBlockhash: blockhash,
            });

            const chunk = emptyAccounts.slice(i, i + chunkSize);

            const chunkAmount = chunk.length * 0.00203928;             
            const feeSol = chunkAmount * 0.05;                   
            const lamportsFee = Math.floor(feeSol * LAMPORTS_PER_SOL);

            tx.add(
                SystemProgram.transfer({
                    fromPubkey: signer,
                    toPubkey: coffee,
                    lamports: lamportsFee,
                })
            );


            chunk.forEach((acc) => {
                tx.add(
                    Token.createCloseAccountInstruction(
                        TOKEN_PROGRAM_ID,
                        acc, // source ATA
                        signer, // destination (to receive rent back)
                        signer, // authority
                        []
                    )
                );
            });

            transactionChunks.push(tx);
        }

        const provider = window.solana;
        await provider.connect();

        const signedTxs = await provider.signAllTransactions(transactionChunks);

        const sigs = [];

        for (const signed of signedTxs) {
            const sig = await connection.sendRawTransaction(signed.serialize());
            await connection.confirmTransaction(sig, "confirmed");
            sigs.push(sig);
        }

        const totalRe = emptyAccounts.length * 0.00203928;
        const object = document.getElementById('result');
        object.style.display = "flex";

        let tx = "https://solscan.io/account/" + signer;

        msg.innerHTML = `
                <h4>
                    Report
                </h4>
                <div>
                    <p>
                        Reclaimed <span>${totalRe.toFixed(3)} SOL</span> by closing empty token accounts. <br>
                        View the <span>${sigs.length}</span> transactions on <a target="_blank" href="${tx}">[ solscan.io ].</a> 
                    </p>
                </div>
                <div class="action">
                    <a onclick="location.reload()">
                        <i class="fa-solid fa-rotate-left"></i>
                    </a>
                    <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/intent/tweet?text=Reclaimed%20${totalRe.toFixed(3)}%20$SOL,%20empty%20token%20accounts.%0A%40OrdexOfficial%20Dust%20Buster...%20%F0%9F%AA%99%F0%9F%94%A5">
                        <i class="fa-solid fa-share-nodes"></i>
                    </a>
                </div>
            `
        ;

        getAccounts();



    }

    // Close accounts on button click
    closeBtn.addEventListener("click", async () => {
        if (emptyAccounts.length == 0) {
            return;
        } else {
            closeAccounts();
        }
    });

    // Update button and data
    async function getAccounts() {
        const balanceEl = document.getElementById("balance");
        const valueEl = document.getElementById("rent");
        const totalEl = document.getElementById("num");

        if (signer) {
            const addy = signer.toString();
            connectBtn.textContent = `${addy.slice(0, 2)}...${addy.slice(-4)}`;
            closeBtn.disabled = false;
        } else {
            connectBtn.textContent = "Connect Wallet";
            balanceEl.textContent = "Not Connected";
            valueEl.textContent = "~0.000 Reclaimable";
            totalEl.textContent = "";
            closeBtn.disabled = true;
            return;
        }

        emptyAccounts.length = 0;

        const accounts = await connection.getParsedTokenAccountsByOwner(
            signer, { programId: TOKEN_PROGRAM_ID }
        );

        accounts.value.forEach(({ pubkey, account }) => {
            const ATA = account.data?.parsed?.info;
            const balance = ATA.tokenAmount.uiAmount;

            if (balance === 0) {
                emptyAccounts.push(pubkey);
            }
        });

        const balanceLamports = await connection.getBalance(signer);
        const balanceSol = balanceLamports / LAMPORTS_PER_SOL;

        const total = emptyAccounts.length;

        balanceEl.textContent = balanceSol.toFixed(3) + " SOL";
        totalEl.textContent = total;

        if (total > 0) {
            valueEl.textContent = "~" + (total * 0.002).toFixed(3) + " Reclaimable";
        } else {
            valueEl.textContent = "Clean or definitely broke...";
        }

    }


    // Connect on button click
    connectBtn.addEventListener("click", async () => {
        try {
            const resp = await window.solana.connect();
            signer = resp.publicKey;
            getAccounts();
        } catch (err) {
            alert("Connection failed: " + err.message);
        }
    });


    // Listen for account changes
    window.solana.on("accountChanged", (newPublicKey) => {
        if (newPublicKey) {
            signer = newPublicKey;
            getAccounts();
        } else {
            signer = null;
            getAccounts();
        }
    });


    async function main() {
        if (window.solana) {
            try {
                const resp = await window.solana.connect(
                    { onlyIfTrusted: true });
                signer = resp.publicKey;
                getAccounts();
            } catch (err) {
                getAccounts(null);
            }
        } else {

            connectBtn.disabled = true;
            connectBtn.textContent = "Not Found";

            const isMobile = /Mobi|Android/i.test(navigator.userAgent);

            if (isMobile) {
                alert("Use Phantom's browser inside application on your mobile device.");
            } else {
                alert("Please install the Phantom Wallet Extension in your browser.");
            }

            return;

        }
    }

    main();


});