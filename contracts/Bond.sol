// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Bond {
    struct BondData {
        address creator;
        uint256 amount;
        bytes32 passwordHash;
        bool isRedeemed;
    }

    mapping(bytes32 => BondData) public bonds;

    event BondCreated(bytes32 indexed keyId, address indexed creator, uint256 amount);
    event BondRedeemed(bytes32 indexed keyId, address indexed redeemer);

    function createBond(bytes32 keyId, bytes32 passwordHash) public payable {
        require(msg.value >= 0.01 ether && msg.value <= 8 ether, "Bond amount must be between 0.01 and 8 MON");
        require(bonds[keyId].creator == address(0), "Bond with this Key ID already exists");

        bonds[keyId] = BondData({
            creator: msg.sender,
            amount: msg.value,
            passwordHash: passwordHash,
            isRedeemed: false
        });

        emit BondCreated(keyId, msg.sender, msg.value);
    }

    function redeemBond(bytes32 keyId, string memory password) public {
        BondData storage bond = bonds[keyId];
        require(bond.creator != address(0), "Bond does not exist");
        require(!bond.isRedeemed, "Bond has already been redeemed");
        require(bond.passwordHash == keccak256(abi.encodePacked(password)), "Incorrect password");

        bond.isRedeemed = true;
        payable(msg.sender).transfer(bond.amount);

        emit BondRedeemed(keyId, msg.sender);
    }

    function getBond(bytes32 keyId) public view returns (address, uint256, bool) {
        BondData storage bond = bonds[keyId];
        return (bond.creator, bond.amount, bond.isRedeemed);
    }
}
