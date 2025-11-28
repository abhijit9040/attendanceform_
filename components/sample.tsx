"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import useAttendanceContract from "@/hooks/useContract"
import { isAddress } from "viem"

const SampleIntregation = () => {
  const { isConnected, address } = useAccount()
  const [queryAddress, setQueryAddress] = useState("")
  const [queriedTimestamp, setQueriedTimestamp] = useState<number | null>(null)

  const { data, actions, state } = useAttendanceContract()

  useEffect(() => {
    // clear queried timestamp when address changes
    setQueriedTimestamp(null)
  }, [queryAddress, address])

  const handleMarkAttendance = async () => {
    try {
      await actions.markAttendance()
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const handleClearAttendance = async () => {
    try {
      await actions.clearAttendance()
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const handleQueryTimestamp = async () => {
    try {
      // since hook doesn't expose per-address read for arbitrary addresses,
      // attempt using the contract read by calling refetch and relying on backend read for connected user.
      // For arbitrary address timestamp we tell user to connect as that address or we show own timestamp.
      if (!queryAddress || !isAddress(queryAddress)) return
      // If user queries their own address, show from data
      if (address && queryAddress.toLowerCase() === address.toLowerCase()) {
        setQueriedTimestamp(data.myAttendanceTimestamp)
      } else {
        // For non-connected addresses: attempt to fetch via contract by calling getAttendanceTimestamp through a temporary read
        // Note: wagmi reads in this file are not available — instruct user to connect corresponding wallet to check.
        setQueriedTimestamp(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-foreground mb-3">Attendance Contract</h2>
          <p className="text-muted-foreground">Please connect your wallet to interact with the attendance contract.</p>
        </div>
      </div>
    )
  }

  const isOwner = address && data.contractOwner && address.toLowerCase() === data.contractOwner.toLowerCase()
  const myHasAttended = !!data.myAttendanceTimestamp && data.myAttendanceTimestamp > 0

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Attendance Contract</h1>
          <p className="text-muted-foreground text-sm mt-1">Mark and manage attendance on-chain</p>
        </div>

        {/* Contract Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Contract Owner</p>
            <p className="text-sm font-mono text-foreground break-all">{data.contractOwner ?? "—"}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Attendee Count</p>
            <p className="text-2xl font-semibold text-foreground">{data.attendeeCount}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Your Attendance</p>
            <p className="text-sm text-foreground">{myHasAttended ? new Date((data.myAttendanceTimestamp || 0) * 1000).toLocaleString() : "Not marked"}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </span>
              <label className="block text-sm font-medium text-foreground">Mark Attendance</label>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Mark your attendance on-chain. This action will record your address and a timestamp.</p>
            <button
              onClick={handleMarkAttendance}
              disabled={state.isLoading || state.isPending}
              className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {state.isLoading || state.isPending ? "Marking..." : myHasAttended ? "Update Attendance" : "Mark Attendance"}
            </button>
          </div>

          {isOwner && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                  !
                </span>
                <label className="block text-sm font-medium text-foreground">Clear Attendance (Owner)</label>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Clear the attendance list. Only the contract owner can perform this action.</p>
              <button
                onClick={handleClearAttendance}
                disabled={state.isLoading || state.isPending}
                className="w-full px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {state.isLoading || state.isPending ? "Clearing..." : "Clear Attendance"}
              </button>
            </div>
          )}
        </div>

        {/* Attendees List */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">Attendees</h2>
          <div className="bg-card border border-border rounded-lg p-4">
            {data.attendees.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendees yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.attendees.map((att, idx) => (
                  <li key={att + idx} className="flex items-center justify-between">
                    <span className="font-mono text-sm break-all">{att}</span>
                    <span className="text-xs text-muted-foreground">#{idx}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Query Timestamp */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-foreground mb-2">Query Attendance Timestamp</h3>
          <p className="text-sm text-muted-foreground mb-3">Enter an address to check its attendance timestamp. For arbitrary addresses, connect the wallet for that address or ask the owner to query.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="0x..."
              value={queryAddress}
              onChange={(e) => setQueryAddress(e.target.value)}
              className="col-span-2 w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <button
              onClick={handleQueryTimestamp}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Check
            </button>
          </div>
          {queriedTimestamp !== null ? (
            <p className="text-sm text-foreground">Timestamp: {queriedTimestamp > 0 ? new Date(queriedTimestamp * 1000).toLocaleString() : "Not marked"}</p>
          ) : queryAddress ? (
            <p className="text-sm text-muted-foreground">Unable to fetch timestamp for arbitrary address in this UI. Connect the queried wallet or use a read-only script to call <code>getAttendanceTimestamp(address)</code>.</p>
          ) : null}
        </div>

        {/* Status & Errors */}
        {state.hash && (
          <div className="mt-4 p-4 bg-card border border-border rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Transaction Hash</p>
            <p className="text-sm font-mono text-foreground break-all mb-3">{state.hash}</p>
            {state.isConfirming && <p className="text-sm text-primary">Waiting for confirmation...</p>}
            {state.isConfirmed && <p className="text-sm text-green-500">Transaction confirmed!</p>}
          </div>
        )}

        {state.error && (
          <div className="mt-4 p-4 bg-card border border-destructive rounded-lg">
            <p className="text-sm text-destructive-foreground">Error: {state.error.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SampleIntregation
