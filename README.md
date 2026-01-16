# 🤝 Lisk Arisan DAO

**A Trustless, Transparent, and Fair Rotating Savings Application built on Lisk.**

ArisanDAO revolutionizes the traditional Indonesian "Arisan" (ROSCA) by moving it to the blockchain. We solve the decades-old problem of trust—no more organizers running away with funds.

## 🌟 Key Features

-   **🛡️ Trustless Security**: Funds are locked in Smart Contracts, not personal bank accounts.
-   **🎲 Fair & Transparent**: Winners are selected using on-chain randomness. Everyone can verify the results.
-   **💸 Instant Payouts**: Winners receive their prize immediately in their wallet (USDT/ETH).
-   **🌍 Global Access**: Participate from anywhere using your Web3 wallet.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite) + TypeScript
-   **Styling**: Tailwind CSS v4 (Glassmorphism Design)
-   **Blockchain**: Lisk Sepolia Testnet (EVM Compatible)
-   **Integration**: Ethers.js v6 + Web3Modal
-   **Backend**: Supabase (User Profiles & History)

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/arisan-dao.git
    cd arisan-dao
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment**
    Create a `.env` file based on the example (you'll need a Supabase project):
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📄 License
MIT License
