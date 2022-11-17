import { useEffect, useState } from 'react'
import { useWeb3Contract, useMoralis } from 'react-moralis'
import { contractAddresses, abi } from '../constants'
import { ethers } from 'ethers'
import { useNotification } from 'web3uikit'

const RaffleEntrance = () => {
  // constants
  const { chainId: chainIdHex, isWeb3Enabled, web3 } = useMoralis()
  const chainId = parseInt(chainIdHex)
  const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
  const dispatch = useNotification()

  // useStates
  const [entranceFee, setEntranceFee] = useState('0')
  const [numPlayers, setNumPlayers] = useState(0)
  const [recentWinner, setRecentWinner] = useState('0x')
  const [userEntered, setUserEntered] = useState(false)

  // transactions
  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'getEntranceFee',
    params: {},
  })

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'getNumberOfPlayers',
    params: {},
  })

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'getRecentWinner',
    params: {},
  })

  const {
    runContractFunction: enterRaffle,
    // data: enterTxResponse,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'enterRaffle',
    msgValue: entranceFee,
    params: {},
  })

  // event listeners
  async function listenForRaffleEntrance() {
    const raffle = new ethers.Contract(raffleAddress, abi, web3)
    console.log('Listen for raffle entrace...')
    await new Promise((resolve, reject) => {
      raffle.once('raffleEnter', async () => {
        console.log('Raffle entered!')
        try {
          dispatch({
            type: 'info',
            message: 'Transaction complete, raffle entered 👍',
            title: 'Transaction Notification',
            position: 'topR',
            icon: 'bell',
          })
          await updateUI()
          resolve
        } catch (error) {
          console.log(error)
          reject(error)
        }
      })
    })
  }

  async function listenForWinnerPicked() {
    const raffle = new ethers.Contract(raffleAddress, abi, web3)
    console.log('Waiting for a winner...')
    await new Promise((resolve, reject) => {
      raffle.once('winnerPicked', async () => {
        console.log('Winner picked!')
        try {
          await updateUI()
          resolve
        } catch (error) {
          console.log(error)
          reject(error)
        }
      })
    })
  }

  // use effects
  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI()
      listenForWinnerPicked()
    }
  }, [isWeb3Enabled, numPlayers])

  // methods
  async function updateUI() {
    const entranceFeeFromCall = (await getEntranceFee()).toString()
    const numPlayersFromCall = (await getNumberOfPlayers()).toString()
    const recentWinnerFromCall = await getRecentWinner()
    setEntranceFee(entranceFeeFromCall)
    setNumPlayers(numPlayersFromCall)
    setRecentWinner(recentWinnerFromCall)
  }

  const handleEnterRaffle = async () => {
    setUserEntered(true)
    await enterRaffle({ onError: handleMetamaskError })
    await listenForRaffleEntrance()
    setUserEntered(false)
  }

  const handleMetamaskError = async () => {
    setUserEntered(false)
  }

  // render
  return (
    <div>
      <p className='py-4 px-4 '>
        Push <i>Enter Raffle</i> below to pay the entrance fee and join the current raffle. Every 30
        seconds a random winner will be drawn. If you win, the pool of ETH will automatically be
        sent back to you!
      </p>
      <br />
      {raffleAddress ? (
        <div>
          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto'
            onClick={handleEnterRaffle}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className='animate-spin spinner-border h-8 w-8 border-b-2 rounded-full'></div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
          <p>Entrance fee: {ethers.utils.formatUnits(entranceFee, 'ether')} ETH</p>
          <p>Number of players: {numPlayers}</p>
          <p>The last winner: {recentWinner}</p>
        </div>
      ) : (
        <div>No raffle contract address detected!</div>
      )}
    </div>
  )
}

export default RaffleEntrance
