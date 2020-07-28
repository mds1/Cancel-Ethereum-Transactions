<template>
  <div>
    <div class="text-h6">
      Easily cancel your pending transaction with the button below.
    </div>
    <img
      class="cancel-button q-mt-xl"
      src="~assets/easy-button.png"
      @click="cancelTransaction"
    />
    <div v-if="isLoading" class="q-mt-xl">
      <div class="text-italic">Your transaction is processing...</div>
      <div class="text-caption">
        View on
        <a :href="etherscanUrl" target="_blank" class="hyperlink">Etherscan</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api';
import useAlerts from 'src/utils/alerts';
import useWalletStore from 'src/store/wallet';
import { ethers } from 'ethers';
import { BigNumber, Signer, TransactionResponse } from 'components/models';

function useCancelTransaction() {
  const { notifyUser, showError } = useAlerts();
  const { signer, userAddress } = useWalletStore();
  const typedSigner = signer.value as Signer;

  const txHash = ref('');
  const isLoading = ref(false);
  const etherscanUrl = computed(
    () => `https://etherscan.io/tx/${txHash.value}`
  );

  /**
   * @notice Gets gas price from the node and doubles it to ensure it gets mined quicky
   */
  async function getGasPrice(): Promise<BigNumber> {
    const rawGasPrice = await typedSigner.getGasPrice();
    return rawGasPrice?.mul('2');
  }

  /**
   * @notice Cancels pending transaction
   */
  async function cancelTransaction() {
    try {
      const gasPrice = await getGasPrice();
      const nonce = await typedSigner.getTransactionCount();
      // Ignoring line below to silence: Type 'TransactionResponse' is missing the following
      // properties from type 'Promise<TransactionResponse>': then, catch, [Symbol.toStringTag], finally
      // @ts-ignore
      const tx: Promise<TransactionResponse> = await typedSigner.sendTransaction(
        {
          to: userAddress.value,
          gasPrice,
          gasLimit: ethers.BigNumber.from('21000'),
          nonce,
          value: ethers.BigNumber.from('0'),
        }
      );

      isLoading.value = true;
      const txr = (tx as unknown) as TransactionResponse; // force to type TransactionResponse
      txHash.value = String(txr.hash);
      console.log('Transaction sent', txr);

      const t = setInterval(function () {
        /* eslint-disable */
        // @ts-ignore
        if (window.goatcounter && window.goatcounter.count) {
          clearInterval(t);
          // @ts-ignore
          window.goatcounter.count({
            path: 'transaction-cancelled',
            event: true,
          });
        }
        /* eslint-disable */
      }, 100);

      await txr.wait();
      console.log('Transaction mined!');
      notifyUser('positive', 'Your cancellation was successful!');
      isLoading.value = false;
    } catch (e) {
      showError(e);
      isLoading.value = false;
    }
  }

  return { cancelTransaction, txHash, isLoading, etherscanUrl };
}

export default defineComponent({
  name: 'CancelTransaction',

  setup() {
    return { ...useCancelTransaction() };
  },
});
</script>
