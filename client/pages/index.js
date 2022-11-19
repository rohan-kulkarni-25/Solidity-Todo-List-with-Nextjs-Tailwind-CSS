import WrongNetworkMessage from '../components/WrongNetworkMessage'
import ConnectWalletButton from '../components/ConnectWalletButton'
import TodoList from '../components/TodoList'
import { TaskContractAddress } from '../config.js'
import TaskAbi from '../../backend/build/contracts/TaskContract.json'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

/* 
const tasks = [
  { id: 0, taskText: 'clean', isDeleted: false }, 
  { id: 1, taskText: 'food', isDeleted: false }, 
  { id: 2, taskText: 'water', isDeleted: true }
]
*/

export default function Home() {

  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [isUserLoggedIn, setUserLoggedIn] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState([]);

  useEffect(() => {
    connectWallet();
    getAllTasks();
  }, [])

  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Metamask not deteched');
        return;
      }
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log('connected to chain', chainId);
      const goerliChainId = '0x5'
      if (chainId !== goerliChainId) {
        alert('You are not connected to the goerli Test net');
        setCorrectNetwork(false);
        return;
      }
      else {
        setCorrectNetwork(true);
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setUserLoggedIn(true);

    } catch (error) {
      console.log(error);
    }
  }

  // Just gets all the tasks from the contract
  const getAllTasks = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer,
        )

        let allTasks = await TaskContract.getMyTasks();
        setTasks(allTasks)
      }
      else {
        console.log('Obje donot exist ')
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  // Add tasks from front-end onto the blockchain
  const addTask = async e => {
    e.preventDefault();
    let task = {
      taskText: input,
      isDeleted: false
    }
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer,
        )
        TaskContract.addTask(task.taskText, task.isDeleted).then(res => {
          setTasks([...tasks, task]);
          console.log('added task')
        })
      }
      else {
        console.log('ethe do not exist');
      }
    } catch (error) {
      console.log(error);
    }
    setInput('');
  }

  // Remove tasks from front-end by filtering it out on our "back-end" / blockchain smart contract
  const deleteTask = key => async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer,
        )
        await TaskContract.deleteTasks(key, true);
        let allTasks = await TaskContract.getMyTasks();
        setTasks(allTasks)
      }
      else {
        console.log('ethe do not exist');
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className='bg-[#97b5fe] h-screen w-screen flex justify-center py-6'>
      {!isUserLoggedIn ? <ConnectWalletButton connectWallet={connectWallet} /> :
        setCorrectNetwork ? <TodoList tasks={tasks} input={input} setInput={setInput} addTask={addTask} deleteTask={deleteTask}/> : <WrongNetworkMessage />}
    </div>
  )
}

