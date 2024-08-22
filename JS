document.addEventListener("DOMContentLoaded", function () {
  const headerTitle = document.querySelector("header h1");
  const fileInput = document.getElementById("wormdrive-upload");
  const fileInfo = document.getElementById("file-info");
  const priceDisplay = document.getElementById("price-display");
  const uploadButton = document.getElementById("upload-button");
  const agreeTerms = document.getElementById("agree-terms");
  const connectWalletButton = document.getElementById("connectWalletButton");
  const uploadList = document.getElementById("upload-list");
  let userAddress = null;

  // Smooth header title fade-in with scaling effect
  headerTitle.style.opacity = 0;
  headerTitle.style.transform = "translateY(-20px) scale(0.8)";

  setTimeout(() => {
    headerTitle.style.transition = "opacity 1s ease-out, transform 1s ease-out";
    headerTitle.style.opacity = 1;
    headerTitle.style.transform = "translateY(0) scale(1)";
  }, 500);

  // Connect Wallet
  connectWalletButton.addEventListener("click", async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts"
        });
        userAddress = accounts[0];
        connectWalletButton.textContent = `Connected: ${userAddress.slice(
          0,
          6
        )}...${userAddress.slice(-4)}`;
        connectWalletButton.disabled = true;
        connectWalletButton.classList.add("connected");
        loadUploadHistory(); // Load user's upload history after connecting wallet
      } catch (error) {
        console.error("User rejected the request:", error);
      }
    } else {
      alert(
        "MetaMask is not installed. Please install it to use this feature."
      );
    }
  });

  // Activate file selection change listener
  fileInput.addEventListener("change", calculateFileSize);

  // Toggle upload button based on terms agreement
  agreeTerms.addEventListener("change", () => {
    uploadButton.disabled = !agreeTerms.checked;
  });

  // Handle drag and drop
  fileInput.addEventListener("dragover", (e) => {
    e.preventDefault();
    fileInput.parentElement.classList.add("drag-over");
  });

  fileInput.addEventListener("dragleave", (e) => {
    fileInput.parentElement.classList.remove("drag-over");
  });

  fileInput.addEventListener("drop", (e) => {
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;
    calculateFileSize();
    fileInput.parentElement.classList.remove("drag-over");
  });

  // Calculate file size and update UI
  function calculateFileSize() {
    const file = fileInput.files[0];
    if (file) {
      const fileSizeInGB = Math.ceil(file.size / (1024 * 1024 * 1024)); // Convert to GB, round up
      const price = fileSizeInGB * 25; // $25 per GB
      fileInfo.textContent = `Selected File: ${file.name} (${fileSizeInGB} GB)`;
      priceDisplay.textContent = `Price: $${price} or equivalent in crypto`;
      // Add neon glow effect to file info and price display
      fileInfo.style.textShadow = "0 0 10px #00FF00, 0 0 20px #00FFFF";
      priceDisplay.style.textShadow = "0 0 10px #00FF00, 0 0 20px #00FFFF";
    } else {
      fileInfo.textContent = "No file selected";
      priceDisplay.textContent = "Price: $0";
      fileInfo.style.textShadow = "";
      priceDisplay.style.textShadow = "";
    }
  }

  // Open payment form
  uploadButton.addEventListener("click", openPaymentForm);

  async function openPaymentForm() {
    if (!fileInput.files[0]) {
      alert("Please select a file first!");
      return;
    }

    if (!userAddress) {
      alert("Please connect your wallet to proceed with payment.");
      return;
    }

    // Simulate payment processing with crypto wallet
    document.body.innerHTML += `
            <div class="payment-modal">
                <div class="payment-content">
                    <h2>Processing Payment...</h2>
                    <p>Please wait while we secure your transaction with your crypto wallet.</p>
                    <div class="loader"></div>
                </div>
            </div>
        `;

    try {
      // Replace with actual smart contract interaction code
      const fileSizeInGB = Math.ceil(
        fileInput.files[0].size / (1024 * 1024 * 1024)
      );
      const priceInEther = web3.utils.toWei(
        (fileSizeInGB * 0.015).toString(),
        "ether"
      ); // Assuming $25/GB and $1 = 0.0006 ETH

      const transactionParameters = {
        to: "YOUR_SMART_CONTRACT_ADDRESS", // Replace with your contract's address
        from: userAddress,
        value: priceInEther
      };

      const txHash = await ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters]
      });

      console.log("Transaction Hash:", txHash);

      // Simulate successful payment
      setTimeout(() => {
        document.querySelector(".payment-modal").innerHTML = `
                    <div class="payment-content">
                        <h2>Payment Successful!</h2>
                        <p>Your file is being uploaded securely.</p>
                        <p><strong>Permanent Link:</strong> <a href="#">http://wormdrive.io/yourfile</a></p>
                    </div>
                `;
        saveUploadHistory(
          fileInput.files[0].name,
          `http://wormdrive.io/yourfile`
        );
      }, 3000);
    } catch (error) {
      console.error("Payment failed:", error);
      document.querySelector(".payment-modal").innerHTML = `
                <div class="payment-content">
                    <h2>Payment Failed</h2>
                    <p>There was an issue processing your payment. Please try again.</p>
                    <button onclick="window.location.reload()">Try Again</button>
                </div>
            `;
    }
  }

  // Save upload history to local storage (simulating a backend database)
  function saveUploadHistory(fileName, fileLink) {
    let history = JSON.parse(localStorage.getItem(userAddress)) || [];
    history.push({ fileName, fileLink });
    localStorage.setItem(userAddress, JSON.stringify(history));
    displayUploadHistory(history);
  }

  // Load upload history from local storage
  function loadUploadHistory() {
    let history = JSON.parse(localStorage.getItem(userAddress)) || [];
    displayUploadHistory(history);
  }

  // Display upload history on the page
  function displayUploadHistory(history) {
    uploadList.innerHTML = "";
    history.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<a href="${item.fileLink}" target="_blank">${item.fileName}</a>`;
      uploadList.appendChild(listItem);
    });
  }

  // Utility: create a neon loader for visual flair
  document.body.innerHTML += `
        <style>
            .loader {
                border: 16px solid #f3f3f3;
                border-radius: 50%;
                border-top: 16px solid #00FF00;
                border-right: 16px solid #00FFFF;
                width: 120px;
                height: 120px;
                animation: spin 2s linear infinite;
                margin: 50px auto;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .payment-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.85);
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .payment-content {
                background: linear-gradient(135deg, #00FF00, #00FFFF);
                padding: 30px;
                border-radius: 20px;
                box-shadow: 0 0 20px #00FF00, 0 0 30px #00FFFF;
                text-align: center;
                color: #000000;
            }

            .payment-content h2 {
                font-size: 2em;
                margin-bottom: 20px;
                text-shadow: 0 0 10px #000000;
            }

            .payment-content p {
                font-size: 1.2em;
            }

            .payment-content a {
                color: #000000;
                text-decoration: underline;
                font-weight: bold;
            }
        </style>
    `;
});
