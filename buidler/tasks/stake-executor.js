import fs from "fs";
import { task } from "@nomiclabs/buidler/config";
import chalk from "chalk";
import GelatoCoreLib from "@gelatonetwork/core";

export default task(
  "stake-executor",
  "Stake some eth as an executor",
  async (taskArguments, bre, runSuper) => {
    const executorNetwork = "0xa5A98a6AD379C7B578bD85E35A3eC28AD72A336b";
    const gelatoCoreAddress = "0x733aDEf4f8346FD96107d8d6605eA9ab5645d632";

    const myUser = (await ethers.getSigners())[1];
    const myUserAddress = await myUser.getAddress();

     const gelatoCore = await ethers.getContractAt(
       GelatoCoreLib.GelatoCore.abi, // fetches the contract ABI from artifacts/
       gelatoCoreAddress
     );

    const gelatoExectors = await ethers.getContractAt(
      require("@gelatonetwork/core/artifacts/IGelatoExecutors.json").abi,
      executorNetwork
    );

    try {
      const tx = await gelatoCore.connect(myUser).stakeExecutor({
        value: ethers.utils.parseEther("1"),
      });
      const receipt = await tx.wait();
      console.log(
        chalk.greenBright("SUCCESS"),
        "TX Hash:",
        chalk.magenta(receipt.transactionHash)
      );
    } catch (e) {
      console.log(chalk.redBright("FAIL"), e.message)
    }
  }
);
