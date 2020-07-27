<template>
  <q-btn color="primary" label="Connect wallet" @click="connectWallet" />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import useWalletStore from 'src/store/wallet';

function useWallet() {
  const { setProvider } = useWalletStore();

  async function connectWallet() {
    // MetaMask only for now
    // @ts-ignore
    await setProvider(window.ethereum);
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
