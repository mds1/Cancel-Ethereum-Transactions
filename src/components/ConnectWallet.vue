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

import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Fortmatic from 'fortmatic';
import Torus from '@toruslabs/torus-embed';
import Authereum from 'authereum';
import UniLogin from '@unilogin/provider';
import Portis from '@portis/web3';

function useWallet() {
  const { setProvider } = useWalletStore();

  async function connectWallet() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.INFURA_ID,
        },
      },
      fortmatic: {
        package: Fortmatic,
        options: {
          key: process.env.FORTMATIC_API_KEY,
        },
      },
      torus: {
        package: Torus,
      },
      authereum: {
        package: Authereum, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      },
      unilogin: {
        package: UniLogin,
      },
      portis: {
        package: Portis,
        options: {
          id: process.env.PORTIS_API_KEY,
        },
      },
    };

    // eslint-disable-next-line
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      providerOptions,
      theme: Dark.isActive ? 'dark' : 'light',
    });

    // eslint-disable-next-line
    const provider = await web3Modal.connect();
    await setProvider(provider);
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
