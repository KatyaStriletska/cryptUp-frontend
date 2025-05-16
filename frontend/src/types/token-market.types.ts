import { BN, web3 } from '@coral-xyz/anchor';

/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/p2p_trade_program.json`.
 *//**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/p2p_trade_program.json`.
 */
export type P2pTradeProgram = {
  address: 'F6UDhDHeqvTrQRtaQPkTnwXf3NVCSYZniiMQbAMA1Q1T';
  metadata: {
    name: 'p2pTradeProgram';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'cancel';
      discriminator: [232, 219, 223, 41, 219, 236, 220, 190];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
          relations: ['escrowState'];
        },
        {
          name: 'escrowVault';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'escrowState';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'tradeTokenMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
          relations: ['escrowState'];
        },
        {
          name: 'escrowState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 114, 97, 100, 101];
              },
              {
                kind: 'account';
                path: 'owner';
              },
              {
                kind: 'arg';
                path: 'tradeId';
              },
            ];
          };
        },
        {
          name: 'ownerTradeTokenAta';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'owner';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'tradeTokenMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'tradeTokenMint';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
      ];
      args: [
        {
          name: 'tradeId';
          type: 'u64';
        },
      ];
    },
    {
      name: 'createTrade';
      discriminator: [183, 82, 24, 245, 248, 30, 204, 246];
      accounts: [
        {
          name: 'escrow';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 114, 97, 100, 101];
              },
              {
                kind: 'account';
                path: 'creator';
              },
              {
                kind: 'arg';
                path: 'params.trade_id';
              },
            ];
          };
        },
        {
          name: 'escrowVault';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'escrow';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'tokenForSale';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'creator';
          writable: true;
          signer: true;
        },
        {
          name: 'creatorAtaForSale';
          writable: true;
        },
        {
          name: 'tokenForSale';
        },
        {
          name: 'receivedTokenMintAccount';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'createParams';
            };
          };
        },
      ];
    },
    {
      name: 'exchange';
      discriminator: [47, 3, 27, 97, 215, 236, 219, 144];
      accounts: [
        {
          name: 'buyer';
          writable: true;
          signer: true;
        },
        {
          name: 'owner';
          writable: true;
          relations: ['escrowState'];
        },
        {
          name: 'escrowVault';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'escrowState';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'tradeTokenMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
          relations: ['escrowState'];
        },
        {
          name: 'escrowState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 114, 97, 100, 101];
              },
              {
                kind: 'account';
                path: 'owner';
              },
              {
                kind: 'arg';
                path: 'tradeId';
              },
            ];
          };
        },
        {
          name: 'buyerReceivesSaleTokenAta';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'buyer';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'tradeTokenMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'buyerPaysWithUsdcAta';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'buyer';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'receivedTokenMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'creatorAtaForUsdc';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'owner';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'receivedTokenMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'tradeTokenMint';
        },
        {
          name: 'receivedTokenMint';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
      ];
      args: [
        {
          name: 'tradeId';
          type: 'u64';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'escrow';
      discriminator: [31, 213, 123, 187, 186, 22, 218, 155];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'zeroValue';
      msg: 'The trade amount is zero';
    },
    {
      code: 6001;
      name: 'invalidCreator';
      msg: 'The ';
    },
    {
      code: 6002;
      name: 'invalidVault';
      msg: 'The trade is not in the correct stage';
    },
    {
      code: 6003;
      name: 'invalidMint';
      msg: 'The trade is not in the correct stage';
    },
    {
      code: 6004;
      name: 'invalidReceiveMint';
      msg: 'The trade is not in the correct stage';
    },
    {
      code: 6005;
      name: 'invalidStage';
      msg: 'The trade is not in the correct stage';
    },
  ];
  types: [
    {
      name: 'createParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'tradeId';
            type: 'u64';
          },
          {
            name: 'tradeAmount';
            type: 'u64';
          },
          {
            name: 'expectedAmount';
            type: 'u64';
          },
          {
            name: 'recipient';
            type: {
              option: 'pubkey';
            };
          },
        ];
      };
    },
    {
      name: 'escrow';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'owner';
            type: 'pubkey';
          },
          {
            name: 'recipient';
            type: {
              option: 'pubkey';
            };
          },
          {
            name: 'tradeTokenMint';
            type: 'pubkey';
          },
          {
            name: 'tradeAmount';
            type: 'u64';
          },
          {
            name: 'receivedTokenMint';
            type: 'pubkey';
          },
          {
            name: 'escrowVault';
            type: 'pubkey';
          },
          {
            name: 'stage';
            type: {
              defined: {
                name: 'escrowStage';
              };
            };
          },
          {
            name: 'tradeId';
            type: 'u64';
          },
          {
            name: 'stateBump';
            type: 'u8';
          },
          {
            name: 'expectedAmount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'escrowStage';
      repr: {
        kind: 'rust';
      };
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'readyExchange';
          },
          {
            name: 'exchanged';
          },
          {
            name: 'cancelTrade';
          },
        ];
      };
    },
  ];
};

export type EscrowStage = { readyExchange: {} } | { exchanged: {} } | { cancelTrade: {} };

export type Escrow = {
  owner: web3.PublicKey;
  recipient: web3.PublicKey | null;
  tradeTokenMint: web3.PublicKey;
  tradeAmount: BN;
  receivedTokenMint: web3.PublicKey;
  expectedAmount: BN;
  escrowVault: web3.PublicKey;
  stage: EscrowStage;
  tradeId: BN;
  stateBump: number;
};
