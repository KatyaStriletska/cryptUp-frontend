export interface NftSliceState {
    nft: string | null; // Base58 address
    errors: {
      fetchNft: string | null;
    };
  }
  