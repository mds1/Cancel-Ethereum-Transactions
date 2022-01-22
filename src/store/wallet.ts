import { computed, ref } from '@vue/composition-api';
import { ethers } from 'ethers';
import { Signer, Provider } from 'components/models';

/**
 * State is handled in reusable components, where each component is its own self-contained
 * file consisting of one function defined used the composition API.
 *
 * Since we want the wallet state to be shared between all instances when this file is imported,
 * we defined state outside of the function definition.
 */

// --- State ---
// We do not publicly expose the state to provide control over when and how it's changed. It
// can only be changed through actions and mutations, and it can only be accessed with getters.
// As a result, only actions, mutations, and getters are returned from this function.
const provider = ref<Provider | undefined>(undefined);
const signer = ref<Signer | undefined>(undefined);
const userAddress = ref<string | undefined>(undefined);
const ensName = ref<string | null>(null); // lookupAddress returns string | null

export default function useWalletStore() {
  // --- Actions ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function setProvider(p: any) {
    provider.value = new ethers.providers.Web3Provider(p);
    signer.value = provider.value.getSigner();

    const _userAddress = await signer.value.getAddress();
    const _ensName = await tryEnsLookup(_userAddress, provider.value);

    // Do all async state updates at the end for smoother UX (but we do provider/signer first so app still
    // functions if async calls error)
    userAddress.value = _userAddress;
    ensName.value = _ensName;
  }

  function disconnectWallet() {
    // To do this properly with nice UX, we need to move the Onboard instance out of
    // ConnectWallet.vue and into this component. As a quick hack for now, we just refresh
    // the page which disconnects the wallet and redirects to the home page
    window.location.reload();
  }

  return {
    provider: computed(() => provider.value),
    signer: computed(() => signer.value),
    userAddress: computed(() => userAddress.value),
    displayName: computed(() => ensName.value || userAddress.value),
    setProvider,
    disconnectWallet,
  };
}

async function tryEnsLookup(address: string, provider: Provider): Promise<string | null> {
  try {
    // await required for it to catch promise rejections
    return await provider.lookupAddress(address); // if this errors, network does not support ens
  } catch (err) {
    return null;
  }
}
