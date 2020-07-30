<template>
  <div>
    <div class="text-h6 q-mb-xl">
      Connect a wallet to cancel any pending transactions
    </div>
    <q-btn color="primary" label="Connect wallet" @click="connectWallet" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { Dark } from 'quasar';
import useWalletStore from 'src/store/wallet';
import Onboard from 'bnc-onboard';

function useWallet() {
  const { setProvider } = useWalletStore();

  async function connectWallet() {
    const rpcUrl = `https://mainnet.infura.io/v3/${String(
      process.env.INFURA_ID
    )}`;

    const wallets = [
      { walletName: 'metamask', preferred: true },
      { walletName: 'coinbase', preferred: true },
      { walletName: 'torus', preferred: true },
      {
        walletName: 'ledger',
        rpcUrl,
      },
      // {
      //   walletName: 'trezor',
      //   appUrl: APP_URL,
      //   email: CONTACT_EMAIL,
      //   rpcUrl,
      // },
      {
        walletName: 'fortmatic',
        apiKey: process.env.FORTMATIC_API_KEY,
        preferred: true,
      },
      {
        walletName: 'portis',
        apiKey: process.env.PORTIS_API_KEY,
        preferred: true,
      },
      { walletName: 'authereum' },
      {
        walletName: 'walletConnect',
        infuraKey: process.env.INFURA_ID,
      },
      { walletName: 'trust', rpcUrl },
      { walletName: 'dapper' },
      // {
      //   walletName: 'squarelink',
      //   apiKey: SQUARELINK_KEY,
      // },
      { walletName: 'walletLink', rpcUrl },
      { walletName: 'opera' },
      { walletName: 'operaTouch' },
      { walletName: 'status' },
      { walletName: 'unilogin' },
      { walletName: 'imToken', rpcUrl },
    ];

    const onboard = Onboard({
      dappId: process.env.BLOCKNATIVE_API_KEY,
      darkMode: Dark.isActive,
      networkId: 1,
      walletSelect: {
        wallets: wallets,
      },
      subscriptions: {
        wallet: async (wallet) => {
          await setProvider(wallet.provider);
        },
      },
    });

    await onboard.walletSelect();
    await onboard.walletCheck();
  }

  return { connectWallet };
}

export default defineComponent({
  name: 'ConnectWallet',

  setup() {
    return { ...useWallet() };
  },
});
</script>