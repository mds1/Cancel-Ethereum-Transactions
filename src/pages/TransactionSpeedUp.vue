<template>
  <q-page padding class="text-center">
    <div>
      <!-- Warnings -->
      <div class="is-beta">
        <div class="row justify-center items-center">
          <q-icon
            class="col-xs-1 q-mb-sm"
            color="warning"
            left
            name="fas fa-exclamation-triangle"
          />
          <div class="col-xs-10">
            Note: This functionality is in beta and may not work properly! If your transaction is
            not found, you will have to cancel your transaction instead until a solution is
            available.
          </div>
        </div>
      </div>
      <div class="is-beta">
        <div class="row justify-center items-center">
          <q-icon
            class="col-xs-1 q-mb-sm"
            color="warning"
            left
            name="fas fa-exclamation-triangle"
          />
          <div class="col-xs-10">
            Warning: Do not use this functionality to speed up trades, such as on Uniswap. Due to
            price changes your transaction is very likely to fail, and you will lose the transaction
            costs.
          </div>
        </div>
      </div>

      <!-- Header section -->
      <div class="text-h4">
        Speed Up Transaction
      </div>
      <div class="q-mb-md q-mt-sm">
        Enter a transaction hash, then click the button below
      </div>

      <!-- Advanced settings -->
      <settings-advanced class="q-mb-xl" />

      <!-- Get transaction hash -->
      <div style="margin: 0 auto;">
        <div class="q-mb-sm">
          Enter the transaction hash of the transaction you want to speed up
        </div>
        <div style="max-width: 500px; margin: 0 auto;">
          <q-input
            v-model="slowTxHash"
            filled
            hide-bottom-space
            label="Transaction Hash"
            @input="getSlowTxData"
          />
          <div v-if="slowTxRetrieved" class="row justify-start items-center q-mt-sm">
            <q-icon color="positive" left name="fas fa-check-circle" />
            <div class="text-caption">
              Transaction found
            </div>
          </div>
          <div
            v-else-if="slowTxHash && !slowTxRetrieved"
            class="row justify-start items-center q-mt-sm"
          >
            <q-icon color="warning" left name="fas fa-exclamation-triangle" />
            <div class="text-caption">
              Transaction not found
            </div>
          </div>
          <div v-else>
            &nbsp;
          </div>
        </div>
      </div>

      <!-- Cancel button -->
      <img
        class="cancel-button q-my-lg"
        src="~assets/easy-button.png"
        @click="speedUpTransaction"
      />

      <!-- Donation section -->
      <!-- 
        We implement this manually instead of with the component because we need
        to handle it differently here 
      -->
      <div v-if="!isLoading">
        <q-checkbox v-model="buyBeer" size="sm">
          <span style="font-size: 1rem;">Buy me a beer</span>
          <span class="q-ml-sm" style="font-size: 1.1rem;">🍺</span>
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
            to the developer as a second transaction
          </span>
        </div>
      </div>

      <!-- Transaction status -->
      <div v-if="isLoading" class="q-mt-xl">
        <q-icon class="text-gradient" name="fas fa-circle-notch fa-spin" size="3rem" />
        <div class="text-italic q-mt-md">Your transaction is processing...</div>
        <div class="text-caption">
          View on
          <a :href="etherscanUrl" target="_blank" class="hyperlink">Etherscan</a>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api';
import { ethers } from 'ethers';
import SettingsAdvanced from 'components/SettingsAdvanced.vue';
import useAlerts from 'src/utils/alerts';
import useEthUsdPrice from 'src/utils/ethUsdPrice';
import useWalletStore from 'src/store/wallet';
import useTxStore from 'src/store/tx';
import { Provider, Signer, TransactionResponse, Window } from 'components/models';

declare let window: Window;

function useSpeedUpTransaction() {
  const { notifyUser, showError } = useAlerts();
  const { signer } = useWalletStore();

  const txHash = ref('');
  const isLoading = ref(false);
  const etherscanUrl = computed(() => `https://etherscan.io/tx/${txHash.value}`);

  const slowTxHash = ref('');
  const slowTxRetrieved = ref(false);
  const slowTx = ref<TransactionResponse>();
  const { provider } = useWalletStore();

  const buyBeer = ref(true);
  const beerPrice = ref(0.01); // in ETH

  async function getSlowTxData() {
    const { setTxTo, setTxNonce, setTxGasLimit, setTxData, setTxValue } = useTxStore();
    try {
      // Fetch slow transaction
      slowTx.value = await (provider.value as Provider).getTransaction(slowTxHash.value.trim());
      if (slowTx.value === undefined || slowTx.value === null) {
        throw new Error('Transaction not found');
      }
      slowTxRetrieved.value = true;
      console.log('slowTx.value: ', slowTx.value);

      // Update the transaction payload
      setTxTo(String(slowTx.value.to));
      setTxNonce(slowTx.value.nonce);
      setTxGasLimit(slowTx.value.gasLimit);
      setTxData(slowTx.value.data);
      setTxValue(slowTx.value.value);
    } catch (e) {
      slowTx.value = undefined;
      slowTxRetrieved.value = false;
      console.error(e);
    }
  }

  /**
   * @notice Speeds up a pending transaction
   */
  async function speedUpTransaction() {
    try {
      if (typeof slowTx.value === 'undefined') {
        throw new Error('Please enter a transaction hash');
      }

      // We only reuse the to, gasLimit, value, and data fields from the slow transaction
      const { txPayload } = useTxStore();
      console.log('newTx: ', txPayload.value);
      const tx: TransactionResponse = await (signer.value as Signer).sendTransaction({
        to: txPayload.value.to,
        nonce: txPayload.value.nonce,
        gasLimit: txPayload.value.gasLimit,
        gasPrice: txPayload.value.gasPrice,
        value: txPayload.value.value,
        data: txPayload.value.data,
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

      // Speed up transaction sent, now we send donation transaction
      if (buyBeer.value) {
        await (signer.value as Signer).sendTransaction({
          to: '0x3a9bE12aB20Ef966f35325763C21EAa764D639C3',
          nonce: Number(txPayload.value.nonce) + 1,
          gasLimit: ethers.BigNumber.from('21000'),
          gasPrice: txPayload.value.gasPrice,
          value: ethers.utils.parseEther(String(beerPrice.value)),
        });
      }

      // Wait for sped up transaction to be mined
      await tx.wait();
      console.log('Transaction mined!');
      notifyUser('positive', 'Your transaction was successfully sped up!');
      isLoading.value = false;
    } catch (e) {
      showError(e);
      isLoading.value = false;
    }
  }

  return {
    speedUpTransaction,
    txHash,
    isLoading,
    etherscanUrl,
    slowTxHash,
    slowTxRetrieved,
    getSlowTxData,
    buyBeer,
    beerPrice,
  };
}

export default defineComponent({
  name: 'PageTransactionSpeedUp',

  components: {
    SettingsAdvanced,
  },

  setup() {
    return { ...useEthUsdPrice(), ...useSpeedUpTransaction() };
  },
});
</script>
