<template>
  <div>
    <div>Override the default gas price</div>
    <div>
      <q-input
        v-model.number="maxPriorityFeePerGasGwei"
        class="q-mt-md"
        dense
        filled
        label="Max priority fee per gas"
        style="max-width: 150px; display: inline-block;"
        type="number"
        @input="setGasPrice"
      />
    </div>
    <div>
      <q-input
        v-model.number="maxFeePerGasGwei"
        class="q-mt-md"
        dense
        filled
        label="Max fee per gas"
        style="max-width: 150px; display: inline-block;"
        type="number"
        @input="setGasPrice"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from '@vue/composition-api';
import { ethers } from 'ethers';
import { fetchJson } from '@ethersproject/web';
import useTxStore from 'src/store/tx';
import { BigNumber } from 'components/models';

// Shape of data returned from the TxPrice API
type TxPriceResponse = {
  system: string;
  network: string;
  unit: string;
  maxPrice: number;
  currentBlockNumber: number;
  msSinceLastBlock: number;
  blockPrices: BlockPrice[];
};

type BlockPrice = {
  blockNumber: number;
  baseFeePerGas: number;
  estimatedTransactionCount: number;
  estimatedPrices: EstimatedPrice[];
};

type EstimatedPrice = {
  confidence: number;
  price: number;
  maxPriorityFeePerGas: number;
  maxFeePerGas: number;
};

// Valid confidence values
type TxPriceConfidence = 99 | 95 | 90 | 80 | 70;

// Gas estimation method return type
type GasEstimate = {
  maxPriorityFeePerGas: BigNumber;
  maxFeePerGas: BigNumber;
};

function useGasPrice() {
  const maxPriorityFeePerGas = ref<BigNumber>(ethers.constants.Zero); // wei
  const maxFeePerGas = ref<BigNumber>(ethers.constants.Zero); // wei

  const maxPriorityFeePerGasGwei = ref(0); // gwei
  const maxFeePerGasGwei = ref(0); // gwei

  const { setTxGasPrice } = useTxStore();
  const { formatUnits, parseUnits } = ethers.utils;

  onMounted(async () => {
    const gas = await getGasPrice(); // BigNumber
    maxPriorityFeePerGasGwei.value = Number(formatUnits(gas.maxPriorityFeePerGas, 'gwei'));
    maxFeePerGasGwei.value = Number(formatUnits(gas.maxFeePerGas, 'gwei'));
    setTxGasPrice(gas);
  });

  async function getGasPrice(gasPriceConfidence: TxPriceConfidence = 99): Promise<GasEstimate> {
    try {
      // Send request and find the object with a 99% chance of being included in the next block
      const response = <TxPriceResponse>await fetchJson('https://api.TxPrice.com/');
      const estimatedPrice = response.blockPrices[0]?.estimatedPrices?.find(
        (price) => price.confidence === gasPriceConfidence
      );

      // Validate API response
      const { maxPriorityFeePerGas, maxFeePerGas } = <EstimatedPrice>estimatedPrice;
      if (!maxPriorityFeePerGas || !maxFeePerGas) {
        console.log(estimatedPrice);
        throw new Error('Error fetching gas price: API did not return valid gas prices');
      }

      // Convert prices to wei
      const maxPriorityFeePerGasWei = parseUnits(String(maxPriorityFeePerGas * 2), 'gwei'); // double priority fee to improve inclusion chance, since prices can change quickly
      const maxFeePerGasWei = parseUnits(String(maxFeePerGas), 'gwei');
      return { maxPriorityFeePerGas: maxPriorityFeePerGasWei, maxFeePerGas: maxFeePerGasWei };
    } catch (e) {
      const message = (e as { message: string }).message;
      throw new Error(`Error fetching gas price from TxPrice API: ${message}`);
    }
  }

  function setGasPrice() {
    maxPriorityFeePerGas.value = parseUnits(String(maxPriorityFeePerGasGwei.value), 'gwei');
    maxFeePerGas.value = parseUnits(String(maxFeePerGasGwei.value), 'gwei');
    setTxGasPrice({ maxPriorityFeePerGas: maxPriorityFeePerGas.value, maxFeePerGas: maxFeePerGas.value });
  }

  return { maxPriorityFeePerGasGwei, maxFeePerGasGwei, setGasPrice };
}

export default defineComponent({
  name: 'TransactionPayloadGasPrice',
  setup() {
    return { ...useGasPrice() };
  },
});
</script>
