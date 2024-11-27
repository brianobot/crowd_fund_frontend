/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/crowd_fund.json`.
 */
export type CrowdFund = {
  "address": "3Por2Tkg1cv11vBYz58Kxq56H6RAuAX6HJznscZrp2ih",
  "metadata": {
    "name": "crowdFund",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "closeCampaign",
      "discriminator": [
        65,
        49,
        110,
        7,
        63,
        238,
        206,
        77
      ],
      "accounts": [
        {
          "name": "campaignPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "updateAuthority"
              }
            ]
          }
        },
        {
          "name": "updateAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createCampaign",
      "discriminator": [
        111,
        131,
        187,
        98,
        160,
        193,
        114,
        244
      ],
      "accounts": [
        {
          "name": "campaignPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "updateAuthority"
              }
            ]
          }
        },
        {
          "name": "updateAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "targetAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "donateToCampaign",
      "discriminator": [
        11,
        213,
        34,
        2,
        196,
        121,
        15,
        216
      ],
      "accounts": [
        {
          "name": "campaignPda",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawFromCampaign",
      "discriminator": [
        51,
        1,
        151,
        234,
        128,
        166,
        167,
        192
      ],
      "accounts": [
        {
          "name": "campaignPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "updateAuthority"
              }
            ]
          }
        },
        {
          "name": "updateAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "campaign",
      "discriminator": [
        50,
        40,
        49,
        11,
        157,
        220,
        229,
        192
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "campaignNameTooLong",
      "msg": "Campaign name may only hold characters below 50 of Length"
    },
    {
      "code": 6001,
      "name": "campaignDescrTooLong",
      "msg": "Campaign description may only hold characters below 50 of Length"
    },
    {
      "code": 6002,
      "name": "invalidAmount",
      "msg": "Donation Amount must be greater than zero"
    },
    {
      "code": 6003,
      "name": "campaignAlreadyExists",
      "msg": "User already has an active campaign."
    },
    {
      "code": 6004,
      "name": "invalidOwner",
      "msg": "PDA is owned by an invalid owner"
    },
    {
      "code": 6005,
      "name": "insufficientCampaignBalance",
      "msg": "insufficient balance in the campaign account"
    }
  ],
  "types": [
    {
      "name": "campaign",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "updateAuthority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "targetAmount",
            "type": "u64"
          },
          {
            "name": "amountDonated",
            "type": "u64"
          },
          {
            "name": "amountWithdrawn",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
