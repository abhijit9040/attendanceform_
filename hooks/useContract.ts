"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractABI, contractAddress } from "@/lib/contract"

export interface ContractData {
  contractOwner: string | null
  attendeeCount: number
  attendees: string[]
  myAttendanceTimestamp: number | null
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
  markAttendance: () => Promise<void>
  clearAttendance: () => Promise<void>
  refetch: () => Promise<void>
}

export const useAttendanceContract = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [attendees, setAttendees] = useState<string[]>([])

  const {
    data: contractOwner,
    refetch: refetchOwner
  } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "owner",
  })

  const {
    data: attendeeCount,
    refetch: refetchAttendeeCount
  } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getAttendeeCount",
  })

  const {
    data: allAttendees,
    refetch: refetchAllAttendees
  } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getAllAttendees",
  })

  const {
    data: myTimestamp,
    refetch: refetchMyTimestamp
  } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getAttendanceTimestamp",
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    } as any,
  } as any)

  const { writeContractAsync, data: hash, error, isLoading: isWritePending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: hash as any,
  } as any)

  useEffect(() => {
    if (allAttendees && Array.isArray(allAttendees)) {
      setAttendees((allAttendees as string[]).map((a) => (a as string)))
    }
  }, [allAttendees])

  useEffect(() => {
    if (isConfirmed) {
      // refresh reads
      refetchOwner()
      refetchAttendeeCount()
      refetchAllAttendees()
      if (address) refetchMyTimestamp()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed])

  const markAttendance = async () => {
    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "markAttendance",
        args: [],
      })
    } catch (err) {
      console.error("Error marking attendance:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearAttendance = async () => {
    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "clearAttendance",
        args: [],
      })
    } catch (err) {
      console.error("Error clearing attendance:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = async () => {
    await Promise.all([
      refetchOwner?.(),
      refetchAttendeeCount?.(),
      refetchAllAttendees?.(),
      address ? refetchMyTimestamp?.() : Promise.resolve(),
    ])
  }

  const data: ContractData = {
    contractOwner: contractOwner ? (contractOwner as string) : null,
    attendeeCount: attendeeCount ? Number(attendeeCount as bigint) : attendees.length,
    attendees,
    myAttendanceTimestamp: myTimestamp ? Number(myTimestamp as bigint) : null,
  }

  const actions: ContractActions = {
    markAttendance,
    clearAttendance,
    refetch,
  }

  const state: ContractState = {
    isLoading: isLoading || Boolean(isWritePending) || Boolean(isConfirming),
    isPending: Boolean(isWritePending),
    isConfirming: Boolean(isConfirming),
    isConfirmed: Boolean(isConfirmed),
    hash: hash as `0x${string}` | undefined,
    error: error as Error | null,
  }

  return {
    data,
    actions,
    state,
  }
}

export default useAttendanceContract
