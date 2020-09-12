import fs from 'fs'
import { task } from "@nomiclabs/buidler/config"
import GelatoCoreLib from '@gelatonetwork/core'
import chalk from 'chalk'

export default task("fund-proxy", "Funds the Gelato User Proxy", async () => {
    
    const myUser = (await ethers.getSigners())[1];
    const myUserAddress = await myUser.getAddress();

    const executorNetwork = "0xa5A98a6AD379C7B578bD85E35A3eC28AD72A336b"
    const gelatoUserProxyProviderModule = "0x66a35534126B4B0845A2aa03825b95dFaaE88B0C"
    const gelatoUserProxyAddress = fs.readFileSync('./artifacts/UserProxy.address').toString()
    const gelatoCoreAddress = "0x733aDEf4f8346FD96107d8d6605eA9ab5645d632"

    const gelatoCore = await ethers.getContractAt(
        GelatoCoreLib.GelatoCore.abi, // fetches the contract ABI from artifacts/
        gelatoCoreAddress
    );
   
    const assignedExecutor = await gelatoCore.executorByProvider(
        gelatoUserProxyAddress 
    );

    let isDefaultExecutorAssigned =
        ethers.utils.getAddress(assignedExecutor) ===
            ethers.utils.getAddress(executorNetwork)
            ? true
            : false;
    if (isDefaultExecutorAssigned)
        console.log("\n Default Executor already assigned");

    const isUserProxyModuleWhitelisted = await gelatoCore.isModuleProvided(
        gelatoUserProxyAddress,
        gelatoUserProxyProviderModule
    );

    if (isUserProxyModuleWhitelisted)
        console.log("\n UserProxyModule already whitelisted");

    const gelatoUserProxy = await ethers.getContractAt(
        GelatoCoreLib.GelatoUserProxy.abi,
        gelatoUserProxyAddress
    )

    const iFace = new ethers.utils.Interface(GelatoCoreLib.GelatoCore.abi)

    // Encode Multiprovide function of GelatoCore.sol
    const multiProvideData = iFace.encodeFunctionData(
        "multiProvide",
        [
            isDefaultExecutorAssigned ? ethers.constants.AddressZero : myUserAddress,
            [],
            isUserProxyModuleWhitelisted ? [] : [gelatoUserProxyProviderModule]
        ]
    )
    const multiProvideAction = new GelatoCoreLib.Action({
        addr: gelatoCoreAddress,
        data: multiProvideData,
        value: ethers.utils.parseEther("1"),
        operation: GelatoCoreLib.Operation.Call,
        dataFlow: GelatoCoreLib.DataFlow.None,
        termsOkCheck: false
    })

    try {
        const tx = await gelatoUserProxy.execAction(multiProvideAction, {
            gasLimit: 1000000,
            gasPrice: ethers.utils.parseUnits("10", "gwei"),
            value: ethers.utils.parseEther("1"),
        })
        const receipt = await tx.wait()
        console.log(chalk.greenBright('SUCCESS'), 'TX Hash:', chalk.cyanBright(receipt.transactionHash))
    } catch (e) {
        console.log(e.message)
    }
})