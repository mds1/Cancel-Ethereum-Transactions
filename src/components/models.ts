import { ethers } from 'ethers';

export type Signer = ethers.providers.JsonRpcSigner;
export type Provider = ethers.providers.Web3Provider;
export type BigNumber = ethers.BigNumber;
export type TransactionResponse = ethers.providers.TransactionResponse;

export interface Window {
  goatcounter: {
    count: (vars: { path: string; event: boolean }) => void;
  };
}
