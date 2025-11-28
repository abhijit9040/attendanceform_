# On-Chain Attendance — Flare Coston2

**Contract Address:** `0x25bF5E5293782163e6580394A8a8e2C83a957536`  
Explorer: https://coston2-explorer.flare.network/address/0x25bF5E5293782163e6580394A8a8e2C83a957536
<img width="1861" height="1022" alt="image" src="https://github.com/user-attachments/assets/0499643b-37b4-4da7-96fc-a6c4f0166389" />

---

## Description

This project is a lightweight front-end integration for an on-chain attendance smart contract deployed on the Flare Coston2 test network. The smart contract allows addresses to mark their attendance on-chain (with an associated timestamp), read the list of attendees, query attendance timestamps for addresses, and — if they are the contract owner — clear the attendance list.

The UI and hook in this repository are designed to be wallet-gated, providing a simple, user-friendly interface for marking attendance, viewing attendees, and performing owner-only maintenance actions. The code is written with developer-friendly patterns so it can be integrated into larger dApps or used as a learning example for interacting with contracts via viem/wagmi.

---

## Features

- Wallet-gated interactions (connect with a Web3 wallet to use the UI)
- Mark attendance on-chain (records address + timestamp)
- Read attendee list and attendee count from the contract
- Query your own attendance timestamp from the contract
- Owner-only action to clear all attendance
- Loading, pending and confirmation state handling for transactions
- Error handling and user-visible status messages

---

## How It Solves the Problem

### Problem
Event organizers, classes, or DAOs often need a tamper-resistant record of who attended an event or action. Traditional attendance methods (paper lists, spreadsheets, or centralized databases) can be altered, lose provenance, or lack decentralization. There is a demand for an auditable, immutable, and transparent attendance record that can be trusted by participants.

### Solution
The on-chain attendance contract provides a simple and auditable way to record attendance:

- **Immutable record:** Once marked, attendance entries are recorded on-chain and cannot be tampered with.
- **Transparent list:** Anyone can read the attendance list and verify participation.
- **Accountable owners:** The contract owner can manage lists (e.g., clear between events).
- **Decentralized verification:** Participants can independently verify timestamps and entries using the blockchain.

### Typical Use Cases
- Classroom attendance and participation logs.
- Event check-ins for meetups and conferences.
- DAO participation snapshots for off-chain incentives.
- Volunteer or shift tracking where an immutable proof-of-participation is desired.

### Benefits
- Strong provenance and auditability of attendance records.
- Simple UX for participants (one-click mark attendance).
- Permissioned maintenance via owner-only actions reduces abusive modifications.
- Easy integration with other tooling (analytics, badges, or reputation systems).

---

## Technical Notes

- The contract ABI is present in `lib/contract.ts`. The hook `hooks/useContract.ts` (exported as `useAttendanceContract`) wraps contract reads and writes using wagmi and viem primitives.
- The sample UI component (`components/sample.tsx`) demonstrates:
  - Marking attendance.
  - Clearing attendance (owner).
  - Viewing the attendee list and attendee count.
  - Querying the connected user's attendance timestamp.

### Important functions (from the contract)
- `markAttendance()` — mark the caller as an attendee with current timestamp.
- `getAllAttendees()` — returns an array of attendee addresses.
- `getAttendeeCount()` — returns the number of attendees.
- `getAttendanceTimestamp(address)` — returns the timestamp of when `address` marked attendance (0 if never).
- `clearAttendance()` — owner-only; clears the attendance list.
- `owner()` — returns the contract owner address.

---

## Getting Started

1. Clone the repository and install dependencies (your project likely uses `wagmi`, `viem`, and a React/Next.js environment).
2. Ensure your wallet (e.g., MetaMask) is configured for the Flare Coston2 test network.
3. Start your development server and connect your wallet.
4. Open the sample UI to interact with the contract:
   - Mark attendance with your connected wallet.
   - If you're the contract owner, use the "Clear Attendance" button to reset the list.

---

## Contributing & Extensibility

This repository focuses on a minimal, safe integration. You can extend it by:

- Fetching per-attendee timestamps (looping `getAttendanceTimestamp` for each attendee) and showing them in the attendees list.
- Adding event listeners to respond to `AttendanceMarked` and `AttendanceCleared` events for real-time UI updates.
- Implementing pagination or a backend indexer for large attendee lists.
- Integrating badges/credentials for attendees based on timestamp or event metadata.

---

## License

This project is provided as-is for learning and integration purposes. Check contract ownership and network conditions before using on mainnets.


