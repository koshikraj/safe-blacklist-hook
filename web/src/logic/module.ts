import { Contract, EventLog, ZeroAddress, parseEther, parseUnits } from "ethers";
import { ethers } from 'ethersv5';
import { BaseTransaction } from '@safe-global/safe-apps-sdk';
import { getSafeInfo, isConnectedToSafe, submitTxs } from "./safeapp";
import { getJsonRpcProvider, getProvider } from "./web3";
import BlacklistHook from "./BlacklistHook.json"


// Plugin and Manager address

const moduleAddress = "0xeB282672d30cD4E22848286F2B689745d59C7935"


export const loadBlacklistedAddresses = async(): Promise<string[]> => {


    // Initialize the sdk with the address of the EAS Schema contract address
    const provider = await getProvider()
    // Updating the provider RPC if it's from the Safe App.
    const chainId =  (await provider.getNetwork()).chainId.toString()
    const bProvider = await getJsonRpcProvider(chainId)
    const pluginSettings =  new Contract(
        moduleAddress,
        BlacklistHook.abi,
        bProvider
    )
    const safeInfo = await getSafeInfo()

    const addedEvents = (await pluginSettings.queryFilter(pluginSettings.filters.AddressBlacklisted)) as EventLog[]

    let addedAddresses = addedEvents.filter((event: EventLog) => event.args.safeAccount == safeInfo.safeAddress || event.args.safeAccount == ZeroAddress).map((event: EventLog)  => event.args.account)

    const removedEvents = (await pluginSettings.queryFilter(pluginSettings.filters.AddressRemovedFromBlacklist)) as EventLog[]
    // const removedAddresses = removedEvents.map((event: EventLog) => event.args.account)
    const removedAddresses = removedEvents.filter((event: EventLog) => event.args.safeAccount == safeInfo.safeAddress || event.args.safeAccount == ZeroAddress).map((event: EventLog)  => event.args.account)

    for(let i=0; i< removedAddresses.length; i++) {
        const index = addedAddresses.indexOf(removedAddresses[i])
        if (index !== -1) {
           addedAddresses.splice(index, 1);
       }   
     }
    return addedAddresses 
}

const buildAddToBlacklist = async(addresses: string[]): Promise<BaseTransaction> => {
    

    // Initialize the sdk with the address of the EAS Schema contract address
    const provider = await getProvider()
    // Updating the provider RPC if it's from the Safe App.
    const chainId =  (await provider.getNetwork()).chainId.toString()
    const bProvider = await getJsonRpcProvider(chainId)

    const safeInfo = await getSafeInfo()

    const pluginSettings =  new Contract(
        moduleAddress,
        BlacklistHook.abi,
        bProvider
    )

    return {
        to: moduleAddress,
        value: "0",
        data: (await pluginSettings.addToBlacklist.populateTransaction(addresses)).data
    }
}

const buildRemoveFromBlacklist = async(addresses: string[]): Promise<BaseTransaction> => {
    

    // Initialize the sdk with the address of the EAS Schema contract address
    const provider = await getProvider()
    // Updating the provider RPC if it's from the Safe App.
    const chainId =  (await provider.getNetwork()).chainId.toString()
    const bProvider = await getJsonRpcProvider(chainId)

    const safeInfo = await getSafeInfo()

    const pluginSettings =  new Contract(
        moduleAddress,
        BlacklistHook.abi,
        bProvider
    )

    return {
        to: moduleAddress,
        value: "0",
        data: (await pluginSettings.removeFromBlacklist.populateTransaction(addresses)).data
    }
} 

export const updateBlacklistedAddress = async( addedAddresses: string[], removedAddresses: string[]) => {

    if (!await isConnectedToSafe()) throw Error("Not connected to a Safe")

    const info = await getSafeInfo()
    const txs: BaseTransaction[] = []


    txs.push(await buildAddToBlacklist(addedAddresses))
    txs.push(await buildRemoveFromBlacklist(removedAddresses))
    
    if (txs.length == 0) return
    await submitTxs(txs)
}


