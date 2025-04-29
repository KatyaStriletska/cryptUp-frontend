export interface NftAttribute {
    trait_type: string;
    value: string;
  }
  
  export interface NftJson {
    name: string;
    symbol: string;
    description: string;
    image: string;
    attributes: NftAttribute[];
  }
  
  export interface EditionInfo {
    model: string;
    isOriginal: boolean;
    address: string;
    supply: string;
    maxSupply: string;
  }
  
  export interface NftMetadata {
    address: string;
    edition: EditionInfo;
    json: NftJson;
    mint: {
      address: string;
      mintAuthorityAddress: string;
      freezeAuthorityAddress: string;
      decimals: number;
    };
  }
  