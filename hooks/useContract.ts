"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther, formatEther } from "viem"
import { contractABI, contractAddress } from "@/lib/contract"

export interface WillData {
  recipient: string
  amount: string
  claimed: boolean
}

export interface ContractData {
  contractBalance: string
  myWillsCount: number
  wills: WillData[]
}

export interface ContractState {
  isLoading: boolean
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  hash: `0x${string}` | undefined
  error: Error | null
}

export interface ContractActions {
  createWill: (recipient: string, amount: string) => Promise<void>
  claimWill: (owner: string, index: number) => Promise<void>
}

export const useWillContract = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [wills, setWills] = useState<WillData[]>([])

  const { data: contractBalance, refetch: refetchBalance } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getContractBalance",
  })

  const { data: myWillsCount, refetch: refetchWillsCount } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getMyWillsCount",
    query: {
      enabled: !!address,
    },
  })

  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isConfirmed) {
      refetchBalance()
      refetchWillsCount()
    }
  }, [isConfirmed, refetchBalance, refetchWillsCount])

  const createWill = async (recipient: string, amount: string) => {
    if (!recipient || !amount) return

    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "createWill",
        args: [recipient as `0x${string}`],
        value: parseEther(amount),
      })
    } catch (err) {
      console.error("Error creating will:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const claimWill = async (owner: string, index: number) => {
    if (!owner && !address) return

    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "claimWill",
        args: [(owner || address) as `0x${string}` , BigInt(index)],
      })
    } catch (err) {
      console.error("Error claiming will:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const data: ContractData = {
    contractBalance: contractBalance ? formatEther(contractBalance as bigint) : "0",
    myWillsCount: myWillsCount ? Number(myWillsCount as bigint) : 0,
    wills,
  }

  const actions: ContractActions = {
    createWill,
    claimWill,
  }

  const state: ContractState = {
    isLoading: isLoading || isPending || isConfirming,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  }

  return {
    data,
    actions,
    state,
  }
}
