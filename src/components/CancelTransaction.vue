<template>
  <div>LOGGED IN</div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import useWalletStore from 'src/store/wallet';
import { ethers } from 'ethers';
import { BigNumber, Signer, TransactionResponse } from 'components/models';

function useCancelTransaction() {
  const { signer, userAddress } = useWalletStore();
  const typedSigner = (signer as unknown) as Signer;
  const txHash = ref('');

  /**
   * @notice Gets gas price from the node and doubles it to ensure it gets mined quicky
   */
  async function getGasPrice(): Promise<BigNumber> {
    const rawGasPrice = await typedSigner.getGasPrice();
    return rawGasPrice.mul('2');
  }

  /**
   * @notice Cancels pending transaction
   */
  async function cancelTransaction() {
    const gasPrice = await getGasPrice();
    const nonce = await typedSigner.getTransactionCount();
    // Ignoring line below to silence: Type 'TransactionResponse' is missing the following
    // properties from type 'Promise<TransactionResponse>': then, catch, [Symbol.toStringTag], finally
    // @ts-ignore
    const tx: Promise<TransactionResponse> = await typedSigner.sendTransaction({
      to: (userAddress as unknown) as string,
      gasPrice,
      gasLimit: ethers.BigNumber.from('21000'),
      nonce,
      value: ethers.BigNumber.from('0'),
    });
    const txr = (tx as unknown) as TransactionResponse; // force to type TransactionResponse
    txHash.value = String(txr.hash);
    console.log('Transaction sent', txr);
    await txr.wait();
    console.log('Transaction mined!');
  }

  return { cancelTransaction, txHash };
}

export default defineComponent({
  name: 'CancelTransaction',

  setup() {
    return { ...useCancelTransaction() };
  },
});
</script>
