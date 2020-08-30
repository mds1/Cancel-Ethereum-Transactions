import { onMounted, ref } from '@vue/composition-api';

/**
 * @notice Gets ETH/USD price
 */
export default function useEthUsdPrice() {
  interface Price {
    ethereum: {
      usd: string;
    };
  }

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
