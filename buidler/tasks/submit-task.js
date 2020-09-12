import fs from 'fs'
import { task } from "@nomiclabs/buidler/config"
import chalk from 'chalk'
import GelatoCoreLib from '@gelatonetwork/core'

export default task("submit-task", "Submits task to Gelato Network", async (taskArguments, bre, runSuper) => {
    
    const KNC = bre.network.config.addressBook.erc20.KNC;
    const ETH = bre.network.config.addressBook.kyber.ETH;
    const KNC_AMOUNT_PER_TRADE = ethers.utils.parseUnits("1", 18)

    const [myUser] = await ethers.getSigners()
    const myUserAddress = await myUser.getAddress()
   
    // KNC ABI
    const kncAbi = ['function approve(address spender, uint256 amount) returns (bool)']
    const kncToken = await ethers.getContractAt(
        kncAbi,
        KNC
    )

    // Condition ABI
    const conditionAddress = fs.readFileSync('./artifacts/MyTimeCondition.address').toString()
    const conditionAbi = ["function timeCheck(uint256 _timestamp) view returns(string memory)"]
    // const conditionIFace = new ethers.utils.Interface(conditionAbi)
    // const futureTimestamp = 1599800000;

    // Create the condition object
    const condition = new GelatoCoreLib.Condition({
      inst: conditionAddress,
      data: ethers.utils.defaultAbiCoder.encode(['uint256'], [0])
    });

    // Action ABI
    const actionAddress = fs.readFileSync('./artifacts/MyKyberAction.address').toString()
    const actionAbi = [`
        function action(
            address _origin,
            address _sendToken,
            uint256 _sendAmount,
            address _receiveToken,
            address _receiver
        )
            public
            returns (uint256 receiveAmount)
    `]
    const actionIFace = new ethers.utils.Interface(actionAbi)

    // Create the action object
    const action = new GelatoCoreLib.Action({
        addr: actionAddress,
        data: actionIFace.encodeFunctionData("action", [
            myUserAddress, // origin
            KNC, // sendToken
            KNC_AMOUNT_PER_TRADE, // sendAmount (1 KNC)
            ETH, // receiveToken
            myUserAddress // receiver
        ]),
        operation: GelatoCoreLib.Operation.Delegatecall,
        dataFlow: GelatoCoreLib.DataFlow.None,
        value: 0,
        termsOkCheck: true
    })

    // Create task object
    const task = new GelatoCoreLib.Task({
        conditions: [condition],
        actions: [action],
        selfProviderGasLimit: 0,
        selfProviderGasPriceCeil: 0
    })

    // Gelato User Proxy
    const gelatoUserProxyAddress = fs.readFileSync('./artifacts/UserProxy.address').toString()
    const providerModuleGelatoUserProxy = "0x66a35534126B4B0845A2aa03825b95dFaaE88B0C"

    // Gelato provider object
    const gelatoProvider = new GelatoCoreLib.GelatoProvider({
        addr: gelatoUserProxyAddress,
        module: providerModuleGelatoUserProxy
    })

    const gelatoUserProxy = await ethers.getContractAt(
        GelatoCoreLib.GelatoUserProxy.abi,
        gelatoUserProxyAddress
    )

    try {
        let tx, receipt

        // Approve KNC token
        tx = await kncToken.approve(
            gelatoUserProxyAddress,
            ethers.utils.parseUnits("1", 18).toString()
        )
        receipt = await tx.wait()
        console.log(chalk.greenBright('SUCCESS'), 'TX Hash:', chalk.magenta(receipt.transactionHash))
        
        // Submit one-time task
        tx = await gelatoUserProxy.submitTask(gelatoProvider, task, 0, {
            gasLimit: 1000000,
            gasPrice: ethers.utils.parseUnits("10", "gwei"),
        })
        receipt = await tx.wait()
        console.log(chalk.greenBright('SUCCESS'), 'TX Hash:', chalk.magenta(receipt.transactionHash))
    } catch (e) {
        console.log(chalk.redBright('FAIL'), e.message)
    }
})