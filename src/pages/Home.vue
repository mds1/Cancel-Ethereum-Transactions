<template>
  <q-page padding class="text-center">
    <connect-wallet v-if="!userAddress" />
    <cancel-transaction v-else />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import CancelTransaction from 'components/CancelTransaction.vue';
import ConnectWallet from 'components/ConnectWallet.vue';
import useWalletStore from 'src/store/wallet';

export default defineComponent({
  name: 'PageHome',
  components: { CancelTransaction, ConnectWallet },
  setup() {
    const { userAddress } = useWalletStore();
    return { userAddress };
  },
});
</script>
