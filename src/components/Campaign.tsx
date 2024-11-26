// TODO: SignMessage
import { verify } from '@noble/ed25519';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useCallback, useState } from 'react';
import { notify } from "../utils/notifications";

import { Program, AnchorProvider, web3, utils, BN, setProvider} from "@coral-xyz/anchor";
import idl from "./crowd_fund.json";
import { CrowdFund } from "./crowd_fund";
import { PublicKey } from '@solana/web3.js';
import create from 'zustand';
import ProgressBar from './ProgressBar'; // Import the ProgressBar component

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.address);

export const Campaign: FC = () => {
    const ourWallet = useWallet();
    const {connection} = useConnection();
    const [campaigns, setCampaigns] = useState([]);

    const getProvider = () => {
        const provider = new AnchorProvider(connection, ourWallet, AnchorProvider.defaultOptions());
        setProvider(provider);
        return provider;
    }

    const createCampaign = async () => {
        try {
            const anchorProvider = getProvider();
            const program = new Program<CrowdFund>(idl_object, anchorProvider)

            await program.methods.createCampaign(
                "Brian's Test Campaign", 
                "This is a campaign to fund the production of this trustless application on the solana mainnet", 
                new BN(20)
            )
                .accounts({
                    updateAuthority: anchorProvider.publicKey
                }).rpc()
            
            console.log("🎉 Wow, New Campaign was created");

        } catch (error) {
            console.error("Error while creating a campaign: " + error);
        }
    }
    
    const getCampaigns = async () => {
        try {
            const anchorProvider = getProvider(); 
            const program = new Program<CrowdFund>(idl_object, anchorProvider)

            Promise.all((await connection.getParsedProgramAccounts(programID)).map(async campaign => ({
                ...(await program.account.campaign.fetch(campaign.pubkey)),
                pubkey: campaign.pubkey
            }))).then(campaigns => {
                console.log("Campaigns: ", campaigns);
                setCampaigns(campaigns);
            })

        } catch (error) {
            console.error("Error while getting campaigns: " + error);
        }
    }

    const donateToCampaign = async (publicKey) => {
        try {
            const anchorProvider = getProvider(); 
            const program = new Program<CrowdFund>(idl_object, anchorProvider)
            
            await program.methods.donateToCampaign(new BN(0.1 * web3.LAMPORTS_PER_SOL))
                .accounts({
                    // @ts-ignore
                    campaignPda: publicKey,
                    updateAuthority: anchorProvider.publicKey,
                    signer: anchorProvider.publicKey,
                }).rpc();

        } catch (error) {
            console.error("Error while donating to campaign: " + error);
        }
    }
    
    const withdrawFromCampaign = async (publicKey) => {
        try {
            const anchorProvider = getProvider(); 
            const program = new Program<CrowdFund>(idl_object, anchorProvider)

            // const campaignBalance = connection.getBalance(publicKey);
            // const accountSize = await getAccountSize(publicKey);
            // const rentExemptionFee = await getRentExemptionFee(accountSize)

            // const withdrawalBalance = campaignBalance? - rentExemptionFee;

            await program.methods.withdrawFromCampaign(new BN(0.1 * web3.LAMPORTS_PER_SOL))
                .accounts({
                    // @ts-ignore
                    campaignPda: publicKey,
                    updateAuthority: anchorProvider.publicKey,
                }).rpc();

        } catch (error) {
            console.error("Error while withdrawing from campaign: " + error);
        }
    }
    
    const closeCampaign = async (publicKey) => {
        try {
            const anchorProvider = getProvider(); 
            const program = new Program<CrowdFund>(idl_object, anchorProvider)

            await program.methods.closeCampaign()
                .accounts({
                    // @ts-ignore
                    campaignPda: publicKey,
                    updateAuthority: anchorProvider.publicKey,
                }).rpc();
            
            console.log("✅ Campaign close successfully")

        } catch (error) {
            console.error("Error while closing campaign: " + error);
        }
    }

    async function getAccountSize(publicKey) {
        try {
            const accountInfo = await connection.getAccountInfo(publicKey);
    
            if (accountInfo === null) {
                console.error('Account not found or does not exist.');
                return null;
            }
    
            // Get the size of the account in bytes
            const accountSize = accountInfo.data.length;
    
            console.log(`Account Size: ${accountSize} bytes`);
            return accountSize;
        } catch (error) {
            console.error('Error fetching account size:', error);
        }
    }

    async function getRentExemptionFee(accountSize) {
        try {
            // Get the minimum balance for rent exemption for the given account size
            const rentExemptionFee = await connection.getMinimumBalanceForRentExemption(accountSize);

            // Convert from lamports to SOL
            const rentExemptionFeeInSOL = rentExemptionFee / 1000000000;

            console.log(`Rent Exemption Fee: ${rentExemptionFee} lamports (${rentExemptionFeeInSOL} SOL)`);
            return rentExemptionFeeInSOL;
        } catch (error) {
            console.error('Error fetching rent exemption fee:', error);
        }
    }

    return (
        <div>
            {
                campaigns.map((campaign) => {
                    // TODO: check if the campaign belongs to the current wallet
                    const isUpdateAuthority = ourWallet.publicKey?.toString() === campaign.updateAuthority.toString();

                    console.log("💳 our Wallet = ", ourWallet.publicKey?.toString());
                    console.log("🚨 Campaign Update Authority = ", campaign.updateAuthority.toString());

                    return (
                        <div
                            className="flex flex-col"
                            key={ campaign.pubkey }
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: "10px",
                                padding: "20px",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                maxWidth: "400px",
                                margin: "20px auto",
                                backgroundColor: "##0000FF",
                            }}
                            >
                            <h1 style={{ marginBottom: "10px" }}>
                                <b><u> {campaign.name.toString()} </u></b>
                            </h1>
                            <span style={{ marginBottom: "10px", fontSize: "12px" }}>
                                {campaign.description.toString()}
                            </span>
                            <span style={{ marginBottom: "2px", fontSize: "12px" }}>
                                Target Amount: {campaign.targetAmount?.toString() || "N/A"} SOL
                            </span>
                            <span style={{ marginBottom: "20px", fontSize: "12px" }}>
                                Amount Donated: {campaign.amountDonated?.toString() || "N/A"} SOL
                            </span>

                            <ProgressBar currentAmount={ campaign.amountDonated } targetAmount={ campaign.targetAmount } />

                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "10px", marginTop: "10px"}}>
                                <div style={{ display: "flex", gap: "5px" }}>
                                    <input
                                        type="text"
                                        // value={ 1 }
                                        // onChange={ console.log("Default Donation Amount Changed") }
                                        placeholder="Enter donation amount"
                                        style={{
                                        padding: "10px",
                                        flex: "7",
                                        borderRadius: "5px",
                                        border: "1px solid #ccc",
                                        width: "100%",
                                        color: "black",
                                        marginBottom: "10px",
                                        }}
                                    />
                                    <button
                                        className="group btn animate-pulse"
                                        style={{
                                            flex: "3",
                                            padding: "10px",
                                            borderRadius: "5px",
                                            border: "none",
                                            color: "#fff",
                                            backgroundImage: "linear-gradient(to right, #6366F1, #C026D3)",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => donateToCampaign(campaign.pubkey)}
                                    >
                                        Donate
                                    </button>
                                </div>
                                    
                                {isUpdateAuthority && ( 
                                    <button
                                        className="group btn animate-pulse"
                                        style={{
                                            flex: "1",
                                            padding: "10px",
                                            borderRadius: "5px",
                                            border: "none",
                                            color: "#fff",
                                            backgroundImage: "linear-gradient(to right, #6366F1, #C026D3)",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => console.log("About to call withdraw from campaign method")}
                                    >
                                        Withdraw
                                    </button>
                                )}

                                {isUpdateAuthority && ( 
                                    <button
                                        className="group btn animate-pulse"
                                        style={{
                                            flex: "1",
                                            padding: "10px",
                                            borderRadius: "5px",
                                            border: "none",
                                            color: "#fff",
                                            backgroundColor: "red",
                                            // backgroundImage: "linear-gradient(to right, white, red)",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => closeCampaign(campaign.pubkey)}
                                    >
                                        Close Campaign
                                    </button>
                                )}
                            </div>
                            </div>

                    )
                })
            }

            <hr />
            <div className="flex flex-row justify-center">
                <div className="relative group items-center">
                    <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                    rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <button
                        className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                        onClick={ createCampaign } // disabled={!publicKey}
                    >
                        <div className="hidden group-disabled:block">
                            Wallet not connected
                        </div>
                        <span className="block group-disabled:hidden" > 
                            Create Campaign
                        </span>
                    </button>
                    <button
                        className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                        onClick={ getCampaigns } // disabled={!publicKey}
                    >
                        <div className="hidden group-disabled:block">
                            Wallet not connected
                        </div>
                        <span className="block group-disabled:hidden" > 
                            Fetch Campaigns
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
