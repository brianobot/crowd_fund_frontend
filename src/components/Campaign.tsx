import { verify } from '@noble/ed25519';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useCallback, useState } from 'react';
import { notify } from "../utils/notifications";
import { toast } from 'sonner';
import React, { useEffect } from "react";


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
    const [campaignName, setCampaignName]  = useState("Default Campaign Name");
    const [campaignDescr, setcampaignDescr]  = useState("Default Campaign Description");
    const [campaignTargetAmount, setcampaignTargetAmount]  = useState(1);
    const [donationAmount, setDonationAmount] = useState(0);
    const [withdrawalAmount, setWithdrawalAmount] = useState(0);

    const getProvider = () => {
        const provider = new AnchorProvider(connection, ourWallet, AnchorProvider.defaultOptions());
        setProvider(provider);
        return provider;
    }

    const createCampaign = async () => {
        try {
            const anchorProvider = getProvider();
            const program = new Program<CrowdFund>(idl_object, anchorProvider)

            const tx = await program.methods.createCampaign(
                campaignName, 
                campaignDescr, 
                new BN(campaignTargetAmount)
            )
                .accounts({
                    updateAuthority: anchorProvider.publicKey
                }).rpc()
            
            console.log("🎉 Wow, New Campaign was created");
            toast.success("Successfully Created a New Campaign");
            showOnSolanaToast(`${tx}`)

        } catch (error) {
            console.error("Error while creating a campaign: " + error);
            toast.error(`Failed to Create Campaign\n  ${error}`);
        }
    }
    
    const getCampaigns = async () => {
        // toast.info('Fetching Campaigns from the blockchain!');

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

        // toast.success('🎉 Successfully Fetched Campaigns!');

        } catch (error) {
            console.error("Error while getting campaigns: " + error);
            toast.error('Failed to Fetched Campaigns!');
        }
    }

    const donateToCampaign = async (publicKey) => {
        try {
            const anchorProvider = getProvider(); 
            const program = new Program<CrowdFund>(idl_object, anchorProvider)

            const tx = await program.methods.donateToCampaign(new BN(donationAmount))
                .accounts({
                    // @ts-ignore
                    campaignPda: publicKey,
                    signer: anchorProvider.publicKey,
                }).rpc();
            
            toast.success(`🎉 Successfully Donated ${donationAmount} SOL to Campaign`);
            showOnSolanaToast(`${tx}`)

        } catch (error) {
            console.error("Error while donating to campaign: " + error);
            toast.error("Failed to Donated 10 Sol to the Campaign");
        }
    }
    
    const withdrawFromCampaign = async (publicKey) => {
        try {
            const anchorProvider = getProvider(); 
            const program = new Program<CrowdFund>(idl_object, anchorProvider)

            const tx = await program.methods.withdrawFromCampaign(new BN(withdrawalAmount))
                .accounts({
                    // @ts-ignore
                    campaignPda: publicKey,
                    updateAuthority: anchorProvider.publicKey,
                }).rpc();
            
            toast.success(`Successfully Withdrew ${withdrawalAmount} from Campaign`)
            showOnSolanaToast(`${tx}`)

        } catch (error) {
            console.error("Error while withdrawing from campaign: " + error);
            toast.error(`Failed to withdraw ${withdrawalAmount} from campaign`)
        }
    }
    
    const closeCampaign = async (publicKey) => {
        try {
            const anchorProvider = getProvider(); 
            const program = new Program<CrowdFund>(idl_object, anchorProvider)

            const tx = await program.methods.closeCampaign()
                .accounts({
                    // @ts-ignore
                    campaignPda: publicKey,
                    updateAuthority: anchorProvider.publicKey,
                }).rpc();
            
            console.log("✅ Campaign close successfully");
            toast.success("🎉 Campaign close successfully");
            showOnSolanaToast(`${tx}`)

        } catch (error) {
            console.error("Error while closing campaign: " + error);
            toast.error("Error Closing Campaign");
        }
    }

    const handleDonationAmountChange = (event) => {
        const inputValue = event.target.value;
        const newValue = isNaN(inputValue) || inputValue === "" ? "" : String(Number(inputValue));
        console.log("New value = ", newValue);
        setDonationAmount(Number(newValue));
    };
    
    const handleWithdrawalAmountChange = (event) => {
        const inputValue = event.target.value;
        const newValue = isNaN(inputValue) || inputValue === "" ? "" : String(Number(inputValue));
        console.log("New value = ", newValue);
        setWithdrawalAmount(Number(newValue));
    };

    const handleCampaignNameChange = (event) => {
        const inputValue = event.target.value;
        // Example: double the input value
        console.log("New value = ", inputValue);
        setCampaignName(inputValue);
    };

    const handleCampaignDescrChange = (event) => {
        const inputValue = event.target.value;
        console.log("New value = ", inputValue);
        setcampaignDescr(inputValue);
    };

    const handleCampaignTargetAmountChange = (event) => {
        const inputValue = event.target.value;
        // Example: double the input value
        const newValue = isNaN(inputValue) || inputValue === "" ? "" : String(Number(inputValue));
        console.log("New value = ", newValue);
        setcampaignTargetAmount(Number(newValue));
    };

    useEffect(() => {
        // Set up the interval when the component mounts
        const intervalId = setInterval(getCampaigns, 2000); // 5000 ms = 5 seconds
    
        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
      }, []
    ); // Empty dependency array ensures this runs only once when the component mounts

    const showOnSolanaToast = (transactionSignature) => {
        const solanaExplorerLink = `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`;
      
        toast.success(
          <span>
            <a
              href={solanaExplorerLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'black', textDecoration: 'underline' }}
            >
              View Transaction on Solana Explorer
            </a>
          </span>
        );
      };

    return (
        <div>
            <hr />
            <input type="text" 
                placeholder="Enter Campaign name"
                value = { campaignName }
                onChange={ handleCampaignNameChange }
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
            <input type="text" 
                placeholder="Enter Campaign Description"
                value = { campaignDescr }
                onChange={ handleCampaignDescrChange }
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
            <input type="number" 
                placeholder="Enter Campaign Target Amount in SOL"
                value = { campaignTargetAmount }
                onChange={ handleCampaignTargetAmountChange }
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
            <div className="flex flex-row justify-center">

                <div className="relative group items-center">
                    <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                    rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <button
                        className="group w-60 m-2 mt-4 mb-4 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                        onClick={ createCampaign } // disabled={!publicKey}
                    >
                        <div className="hidden group-disabled:block">
                            Wallet not connected
                        </div>
                        <span className="block group-disabled:hidden" > 
                            Create Campaign
                        </span>
                    </button>
                </div>
            </div>
            <hr />
            <h2 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mt-10 mb-8">Active Campaigns</h2>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
                {
                    campaigns.map((campaign) => {
                        const isUpdateAuthority = ourWallet.publicKey?.toString() === campaign.updateAuthority.toString();

                        return (
                            <div
                                className="flex flex-col"
                                key={ campaign.pubkey }
                                style={{
                                    border: "1px solid #ccc",
                                    borderRadius: "10px",
                                    padding: "20px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                    maxWidth: "300px",
                                    margin: "20px 10px",
                                    backgroundColor: "##0000FF",
                                    flex: "1 1 30%", // This will make each item take up 30% of the container width
                                    
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
                                <span style={{ marginBottom: "2px", fontSize: "12px" }}>
                                    Amount Donated: {campaign.amountDonated?.toString() || "N/A"} SOL
                                </span>
                                <span style={{ marginBottom: "20px", fontSize: "12px" }}>
                                    Amount Withdrawn: {campaign.amountWithdrawn?.toString() || "N/A"} SOL
                                </span>

                                <ProgressBar currentAmount={ campaign.amountDonated } targetAmount={ campaign.targetAmount } />

                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "10px", marginTop: "10px"}}>
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        <input
                                            type="text"
                                            value={ donationAmount }
                                            onChange={ handleDonationAmountChange }
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
                                        <div style={{ display: "flex", gap: "5px" }}>
                                            <input
                                                type="text"
                                                value={ withdrawalAmount }
                                                onChange={ handleWithdrawalAmountChange }
                                                placeholder="Enter withdrawal amount"
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
                                                onClick={() => withdrawFromCampaign(campaign.pubkey)}
                                            >
                                                Withdraw
                                            </button>
                                        </div>
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
            </div>
        </div>
    );
};
