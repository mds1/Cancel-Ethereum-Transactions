<template>
  <div>
    <div>
      <!-- Header section -->
      <div class="text-h6">
        Easily cancel your pending transaction with the button below.
      </div>
      <div class="text-caption hyperlink" @click="showAdvanced = !showAdvanced">
        <span v-if="!showAdvanced">Show</span>
        <span v-else>Hide</span>
        advanced settings
      </div>
    </div>

    <!-- Advanced settings -->
    <div
      v-if="showAdvanced"
      class="q-mt-lg"
      style="max-width: 800px; margin-left: auto; margin-right: auto;"
    >
      <div>
        You can edit the nonce below. Note that some wallets, such as MetaMask, will
        <a
          href="https://docs.metamask.io/guide/sending-transactions.html#nonce-ignored"
          target="_blank"
          class="hyperlink"
        >
          ignore the value
        </a>
        entered here. For MetaMask, you must manually change the nonce through the
        <span class="text-italic">Settings > Advanced > Customize transaction nonce</span>.
      </div>
      <q-input
        v-model="nonce"
        class="q-mt-md"
        dense
        filled
        label="Nonce"
        style="max-width: 100px; display: inline-block;"
        type="number"
      />
    </div>

    <!-- Cancel button -->
    <img class="cancel-button q-mt-xl" src="~assets/easy-button.png" @click="cancelTransaction" />

    <!-- Donation section -->
    <div v-if="!isLoading" class="q-mt-xl">
      <q-checkbox v-model="buyBeer">
        <span style="font-size: 1.1rem;">Buy me a beer 🍺</span>
      </q-checkbox>
      <div class="text-caption">
        <span>
          Sends&nbsp;
          <q-input
            v-model.number="beerPrice"
            dense
            input-class="text-center text-caption"
            step="0.01"
            style="max-width: 50px; display: inline-block;"
            type="number"
          />&nbsp;ETH
          <span v-if="ethUsdPrice !== 0">
            (about ${{ Math.round(Number(ethUsdPrice * beerPrice)) }})
          </span>
          to the developer as part of the cancellation
        </span>
      </div>
    </div>

    <!-- Transaction status -->
    <div v-if="isLoading" class="q-mt-xl">
      <div class="text-italic q-mt-md">Your transaction is processing...</div>
      <div class="text-caption">
        View on
        <a :href="etherscanUrl" target="_blank" class="hyperlink">Etherscan</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from '@vue/composition-api';
import useAlerts from 'src/utils/alerts';
import useWalletStore from 'src/store/wallet';
import { ethers } from 'ethers';
import { BigNumber, Signer, TransactionResponse, Window } from 'components/models';

declare let window: Window;

interface Price {
  ethereum: {
    usd: string;
  };
}

function useEthUsdPrice() {
  const ethUsdPrice = ref(0);

  onMounted(async () => {
    try {
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
      const response = await fetch(url);
      const json = (await response.json()) as Price;
      ethUsdPrice.value = Number(json.ethereum.usd);
    } catch (e) {
      console.error(e);
    }
  });

  return { ethUsdPrice };
}

function useCancelTransaction() {
  const { notifyUser, showError } = useAlerts();
  const { signer, userAddress } = useWalletStore();
  const typedSigner = signer.value as Signer;

  const nonce = ref(0);
  const showAdvanced = ref(false);
  const buyBeer = ref(true);
  const beerPrice = ref(0.01); // in ETH
  const txHash = ref('');
  const isLoading = ref(false);
  const etherscanUrl = computed(() => `https://etherscan.io/tx/${txHash.value}`);

  onMounted(async () => {
    // Get current nonce
    nonce.value = await typedSigner.getTransactionCount();
  });

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

      const donationAddress = '0x3a9bE12aB20Ef966f35325763C21EAa764D639C3';
      const recipient = buyBeer.value ? donationAddress : userAddress.value;
      const amount = buyBeer.value
        ? ethers.utils.parseEther(String(beerPrice.value))
        : ethers.constants.Zero;

      const tx: TransactionResponse = await typedSigner.sendTransaction({
        to: recipient,
        gasPrice,
        gasLimit: ethers.BigNumber.from('21000'),
        nonce: Number(nonce.value),
        value: amount,
      });

      isLoading.value = true;
      txHash.value = String(tx.hash);
      console.log('Transaction sent', tx);

      const t = setInterval(function () {
        if (window.goatcounter && window.goatcounter.count) {
          clearInterval(t);
          window.goatcounter.count({
            path: 'transaction-cancelled',
            event: true,
          });
        }
      }, 100);

      await tx.wait();
      console.log('Transaction mined!');
      notifyUser('positive', 'Your cancellation was successful!');
      isLoading.value = false;
    } catch (e) {
      showError(e);
      isLoading.value = false;
    }
  }

  return {
    nonce,
    showAdvanced,
    cancelTransaction,
    buyBeer,
    beerPrice,
    txHash,
    isLoading,
    etherscanUrl,
  };
}

export default defineComponent({
  name: 'CancelTransaction',

  setup() {
    return { ...useCancelTransaction(), ...useEthUsdPrice() };
  },
});
</script>
