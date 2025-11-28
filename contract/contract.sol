// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Simple Attendance Form
/// @author
/// @notice Beginner contract to record attendance. No constructor inputs at deployment.
/// @dev Deployer becomes owner. Suitable for small-class demos (returning full arrays on-chain is OK for small lists).
contract AttendanceForm {
    address public owner;

    // attendees list (keeps order)
    address[] private attendees;

    // quick lookup: has this address marked attendance?
    mapping(address => bool) private hasAttendedMap;

    // record timestamp when address marked attendance
    mapping(address => uint256) private attendanceTimestamp;

    // events
    event AttendanceMarked(address indexed attendee, uint256 timestamp);
    event AttendanceCleared(address indexed by);

    // --- modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    /// @notice Set the deployer as the owner. No deployment inputs required.
    constructor() {
        owner = msg.sender;
    }

    /// @notice Mark attendance for the sender. Can be called once per address.
    /// @dev Will revert if called again by same address.
    function markAttendance() external {
        require(!hasAttendedMap[msg.sender], "Already marked attendance");

        hasAttendedMap[msg.sender] = true;
        attendanceTimestamp[msg.sender] = block.timestamp;
        attendees.push(msg.sender);

        emit AttendanceMarked(msg.sender, block.timestamp);
    }

    /// @notice Check if an address has already marked attendance.
    /// @param user Address to check.
    /// @return true if user marked attendance, false otherwise.
    function hasAttended(address user) external view returns (bool) {
        return hasAttendedMap[user];
    }

    /// @notice Get timestamp when a user marked attendance (0 if not attended).
    /// @param user Address to query.
    /// @return unix timestamp of attendance or 0.
    function getAttendanceTimestamp(address user) external view returns (uint256) {
        return attendanceTimestamp[user];
    }

    /// @notice Number of attendees recorded.
    /// @return count of attendees.
    function getAttendeeCount() external view returns (uint256) {
        return attendees.length;
    }

    /// @notice Get attendee address by index (0-based).
    /// @param index Index into attendees array.
    /// @return address of attendee at given index.
    function getAttendee(uint256 index) external view returns (address) {
        require(index < attendees.length, "Index out of bounds");
        return attendees[index];
    }

    /// @notice Get all attendees (returns array). Good for small lists.
    /// @dev Avoid for very large lists (gas / UI concerns).
    function getAllAttendees() external view returns (address[] memory) {
        return attendees;
    }

    /// @notice Owner-only: clear all attendance records (resets state).
    /// @dev Emits AttendanceCleared. Use for starting a new session.
    function clearAttendance() external onlyOwner {
        // reset mapping entries for attendees to free space
        for (uint256 i = 0; i < attendees.length; i++) {
            address a = attendees[i];
            hasAttendedMap[a] = false;
            attendanceTimestamp[a] = 0;
        }
        // clear the array
        delete attendees;

        emit AttendanceCleared(msg.sender);
    }

    /// @notice Owner-only: change ownership if needed.
    /// @param newOwner new owner address.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }
}
