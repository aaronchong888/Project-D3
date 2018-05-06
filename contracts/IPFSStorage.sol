pragma solidity ^0.4.10;

contract IPFSStorage {

    address public contract_owner;
    bytes32[5] public workers;

    struct File {
	bool visible;
	address owner;
	uint timestamp;	
	uint reported;
	bytes32[] shares;
	mapping (address => bool) recipients;
    }

    bytes32[] FileList;
    mapping (bytes32 => File) FileMap;
    mapping (address => bool) blacklist;

    event confirmFileIndexID(uint index, bytes32 indexed id);
    event confirmFileDeletion(uint index, bytes32 indexed id);
    event blacklistLog(uint timestamp, address indexed target, bool status);
    event reportedLog(uint timestamp, address indexed sender, bytes32 indexed id, uint total);

    //Constructor
    function IPFSStorage() public {
	contract_owner = msg.sender;
	workers[0] = 0xd06361139dfdf70906e9db380de27dccb31fa57b96000dbdefe83a06c246af53;
	workers[1] = 0xab10f20af234460cf3c13fe4e6c2c9af19c20571f96c0b951d9bcf2271a04986;
	workers[2] = 0x1e92e59e518ef5a8658abfe45d3d747f5131822ed17a9eb35351af4818282d80;
	workers[3] = 0x7376b6fcfe73dc1f897943d78a937dc2703f7c26ab9a816d628a8443cd947e28;
	workers[4] = 0xc1a24118664ee439e4989866093562e9f1e79d98a351f7ec41697d73b84d500b;
    }

    function setBlacklist(address target, bool value) public {
	require(msg.sender == contract_owner);
	blacklist[target] = value;
	blacklistLog( now, target, value);
    }

    function addFile(bytes32 id, bool isVisible, bytes32[] shares, address[] addr) public {
	require(!blacklist[msg.sender] && FileMap[id].timestamp == 0);
	File memory temp = File( isVisible, msg.sender, now, 0, shares);
        FileMap[id] = temp;
	for (uint i = 0; i < addr.length; i++) {
		FileMap[id].recipients[ addr[i] ] = true;
        }
	FileList.push(id);
	confirmFileIndexID( FileList.length-1, id);
    }

    function getFileCount() public constant returns(uint) {
        return FileList.length;
    }

    function getFileID(uint index) public constant returns(bytes32) {
	require(index < FileList.length);
        return FileList[index];
    }

    function getOwnFile(bytes32 id) public constant returns(bytes32, bool, uint, uint) {
	require(msg.sender == FileMap[id].owner && FileMap[id].timestamp != 0);
	return (id, FileMap[id].visible, FileMap[id].timestamp, FileMap[id].reported);
    }

    function getFile(bytes32 id) public constant returns(bytes32, address, uint, uint) {
	require((FileMap[id].visible || FileMap[id].recipients[msg.sender]) && FileMap[id].timestamp != 0);
	return (id, FileMap[id].owner, FileMap[id].timestamp, FileMap[id].reported);
    }

    function getFileShares(bytes32 id, address requester) public constant returns(bytes32[]) {
	require((FileMap[id].visible || FileMap[id].recipients[requester] || FileMap[id].owner == requester) && FileMap[id].timestamp != 0);
	return (FileMap[id].shares);
    }

    function setVisible(bytes32 id, bool visible) public {
	require(msg.sender == FileMap[id].owner && FileMap[id].timestamp != 0);
	FileMap[id].timestamp = now;
	FileMap[id].visible = visible;
    }

    function setReported(bytes32 id) public {
	require(!blacklist[msg.sender] && FileMap[id].timestamp != 0);
	FileMap[id].reported += 1;
	reportedLog( now, msg.sender, id, FileMap[id].reported);
    }

    function setRecipients(bytes32 id, bytes32[] newShares, address[] addr, bool value) public {
	require(msg.sender == FileMap[id].owner && FileMap[id].timestamp != 0);
	FileMap[id].timestamp = now;
	for (uint i = 0; i < newShares.length; i++) {
		FileMap[id].shares[i] = newShares[i];
        }
	for (uint j = 0; j < addr.length; j++) {
		FileMap[id].recipients[ addr[j] ] = value;
        }
    }

    function deleteFile(uint index, bytes32 id, address[] addr) public {
	require((msg.sender == FileMap[id].owner || msg.sender == contract_owner) && id == FileList[index]);
	FileMap[id].visible = false;
	FileMap[id].owner = contract_owner;
	FileMap[id].timestamp = 0;
	FileMap[id].reported = 0;
	for (uint i = 0; i < FileMap[id].shares.length; i++) {
		FileMap[id].shares[i] = 0;
        }
	for (uint j = 0; j < addr.length; j++) {
		FileMap[id].recipients[ addr[j] ] = false;
        }
	FileList[index] = 0;
	confirmFileDeletion( index, id);
    }
}

