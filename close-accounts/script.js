let signer;
const emptyAccounts = [];

const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = solanaWeb3;
const { TOKEN_PROGRAM_ID, Token } = splToken;

document.addEventListener('DOMContentLoaded', async function () {
    const msg = document.getElementById('alert');
    const connectBtn = document.getElementById("connect-button");
    const connection = new Connection("https://solana-rpc.publicnode.com", "confirmed");

    const fee = Math.floor(0.003 * LAMPORTS_PER_SOL);
    const coffee = new PublicKey("G4o9SvD8ad2CTpK63NufWxLWA1oox2pbTjN32UaCz6bS");

    if (window.solana) {

        try {
            const resp = await window.solana.connect({ onlyIfTrusted: true });
            updateBtn(resp.publicKey);

        } catch (err) {

            updateBtn(null);
        }

    } else {

        connectBtn.disabled = true;
        connectBtn.textContent = "Not Found";

        alert("Please install the Phantom wallet to use this tool.");

        return;

    }


    connectBtn.onclick = async () => {
        try {
            const resp = await window.solana.connect();
            updateBtn(resp.publicKey);
        } catch (err) {
            console.log(err.message);
        }
    };


    window.solana.on('accountChanged', (publicKey) => {
        updateBtn(publicKey || null);
    });

    function updateBtn(address) {
        if (address) {
            signer = address;
            const addy = address.toString().toUpperCase();
            connectBtn.textContent = `${addy.slice(0, 2)}...${addy.slice(-4)}`;
            connectBtn.disabled = true;
            getAccounts();
        } else {
            connectBtn.textContent = "Connect Wallet";
            connectBtn.disabled = false;
        }
    }

    async function updateData() {
        const balanceLamports = await connection.getBalance(signer);
        const balanceSol = balanceLamports / LAMPORTS_PER_SOL;

        const total = emptyAccounts.length;

        document.getElementById("balance").textContent = balanceSol.toFixed(4) + " Sol";

        document.getElementById("rent").innerHTML = "+ " + total * 0.002 + " ATA";

        document.getElementById("num").innerHTML = total;

    }





    async function getAccounts() {
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

        updateData();

    }





    async function closeAccounts() {

        if (emptyAccounts.length === 0) {
            return;
        }

        const list = emptyAccounts.slice(0, 50);

        const transaction = new Transaction();

        list.forEach(account => {
            const object = Token.createCloseAccountInstruction(
                TOKEN_PROGRAM_ID,
                account,
                signer,
                signer,
                [],
            );
            transaction.add(object);
        });

        transaction.add(
            SystemProgram.transfer({
                fromPubkey: signer,
                toPubkey: coffee,
                lamports: fee,
            })
        );

        transaction.feePayer = signer;

        const { blockhash } = await connection.getLatestBlockhash("finalized");
        transaction.recentBlockhash = blockhash;

        try {
            const signedTx = await window.solana.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTx.serialize());
            await connection.confirmTransaction(signature, "confirmed");

            const object = document.getElementById('hide');
            object.style.display = "flex";

            let amount = list.length * 0.002;
            let tx = "https://solscan.io/tx/" + signature;

            msg.innerHTML = `
                <h4>
                    Report
                </h4>
                <div>
                    <p>
                        Reclaimed <span>${amount.toFixed(3)} SOL</span> by closing empty token accounts. <br>
                        view the transaction on <a target="_blank" href="${tx}">[ solscan.io ].</a> 
                    </p>
                </div>
                <div>
                    <a onclick="location.reload()">
                        <i class="fa-solid fa-rotate-left"></i>
                    </a>
                    <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/intent/tweet?text=Reclaimed%20${amount.toFixed(3)}%20$SOL,%20Empty%20token%20accounts.%20%0A%40OrdexOfficial%20Dust%20Buster...%20%F0%9F%AA%99%F0%9F%94%A5%0A%0A%E2%9C%85%20Check%3A%20${tx}">
                        <i class="fa-solid fa-share-nodes"></i>
                    </a>
                </div>
            `;

            getAccounts();

        } catch (error) {
            console.error("Transaction failed:", error);
        }

    }

    document.getElementById("claim").addEventListener('click', closeAccounts);


});


/* 
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
*/