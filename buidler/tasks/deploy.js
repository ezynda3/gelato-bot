import { task } from "@nomiclabs/buidler/config"
import fs from 'fs'
import chalk from 'chalk'

export default task("deploy", "Deploy smart contracts", async (taskArgs, bre) => {
    console.log('Deploying...📡')

    const [myUser] = await ethers.getSigners()
    const myUserAddress = await myUser.getAddress()
   
    const MyTimeCondition = await ethers.getContractFactory("MyTimeCondition")
    const condition = await MyTimeCondition.deploy()
    await condition.deployed()
   
    fs.writeFileSync(`artifacts/MyTimeCondition.address`, condition.address)
    console.log(chalk.cyan('MyTimeCondition'), 'deployed to:', chalk.magenta(condition.address))
    
    const MyKyberAction = await ethers.getContractFactory("MyKyberAction")
    const action = await MyKyberAction.deploy(bre.network.config.addressBook.kyber.networkProxy)
    await action.deployed()

    fs.writeFileSync(`artifacts/MyKyberAction.address`, action.address)
    console.log(chalk.cyan('MyKyberAction'), 'deployed to:', chalk.magenta(action.address))

    const CREATE_2_SALT = 52069

    // Quick and dirty UserProxy
    const gelatoUserProxyFactory = await ethers.getContractAt(
        "IGelatoUserProxyFactory",
        "0x0309EC714C7E7c4C5B94bed97439940aED4F0624"
    )
    const myUserProxyAddress = await gelatoUserProxyFactory.predictProxyAddress(
        myUserAddress,
        CREATE_2_SALT
    )
    const proxyIsDeployedAlready = await gelatoUserProxyFactory.isGelatoUserProxy(
        myUserProxyAddress
    )
    if (!proxyIsDeployedAlready) {
        
        const proxyTx = await gelatoUserProxyFactory.createTwo(
            CREATE_2_SALT,
            {
                gasLimit: 4000000,
                gasPrice: ethers.utils.parseUnits("10", "gwei"),
            }
        )
        await proxyTx.wait()
    }
    fs.writeFileSync(`artifacts/UserProxy.address`, myUserProxyAddress)
    console.log(chalk.cyan('UserProxy'), 'deployed to:', chalk.magenta(myUserProxyAddress))
})