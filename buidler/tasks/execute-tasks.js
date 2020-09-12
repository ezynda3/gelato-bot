import fs from "fs"
import { task } from "@nomiclabs/buidler/config"
import chalk from "chalk"
import GelatoCoreLib from "@gelatonetwork/core"

export default task("execute-tasks", "Wait for new tasks and exec", async (taskArguments, bre, runSuper) => {
    const executorNetwork = "0xa5A98a6AD379C7B578bD85E35A3eC28AD72A336b"
    
    const gelatoCoreAddress = "0x733aDEf4f8346FD96107d8d6605eA9ab5645d632"

    const myUser = (await ethers.getSigners())[1]
    const myUserAddress = await myUser.getAddress()

    const gelatoCore = await ethers.getContractAt(
        GelatoCoreLib.GelatoCore.abi,
        gelatoCoreAddress
    )

    try {
      let tx, receipt, canExec
      const tasks = await gelatoCore.queryFilter(
        gelatoCore.filters.LogTaskSubmitted(),
        7182436
      );
      for (let i = 0; i < tasks.length; i++) {
        canExec = await gelatoCore.connect(myUser).canExec(
          tasks[i].args.taskReceipt,
          1000000,
          ethers.utils.parseUnits("100", "gwei")
        )
        console.log(canExec)
        if (canExec == 'OK') {
          tx = await gelatoCore.connect(myUser).exec(
            tasks[i].args.taskReceipt,
            {
              gasLimit: 1000000,
              gasPrice: ethers.utils.parseUnits("100", "gwei")
            }
          )
          receipt = await tx.wait()
          console.log(chalk.greenBright("TASK EXECUTED"), "TX Hash:", chalk.magenta(receipt.transactionHash))
        }
      }
    } catch (e) {
      console.log(chalk.redBright("FAIL"), e)
    }
  }
)
