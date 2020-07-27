<template>
  <div>LOGGED IN</div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import useWalletStore from 'src/store/wallet';

function useCancelTransaction() {
  const { signer } = useWalletStore();
  const a = ref(3);

  return { a };
}

export default defineComponent({
  name: 'CancelTransaction',

  setup() {
    return { ...useCancelTransaction() };
  },
});
</script>
