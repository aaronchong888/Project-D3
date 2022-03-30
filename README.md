# Project-D3

<p align="center">Decentralized Data Distribution with Ethereum &amp; IPFS</p>

<p align="center"><a href="https://d3faexd4dzuyve.cloudfront.net/"><img alt="" src="https://github.com/aaronchong888/Project-D3/blob/master/img/d3-home.png" width="60%"></a></p>

<p align="center"><a href="https://d3faexd4dzuyve.cloudfront.net/">https://d3faexd4dzuyve.cloudfront.net/</a></p>

<br> 

## Description

This project aims to present a new data distribution model that focuses on preserving data privacy and ownership in a decentralized manner. Trust points in the network are replaced by introducing independent worker nodes to provide simple decryption services with respect to the access control rules on the blockchain.

The online file sharing platform - [D3](https://d3faexd4dzuyve.cloudfront.net/) was built with [Ethereum](https://www.ethereum.org/) and [IPFS](https://ipfs.io/). It aims to provide a better data exchange model with the decentralization benefits of a blockchain system. In addition, D3 offers a solution for practical blockchain application usage by enabling traditional web users to seamlessly migrate to the new platform.

### Overview

<p align="center"><img alt="" src="https://github.com/aaronchong888/Project-D3/blob/master/img/overview.png" width="40%"></p>

- **Owners**: share data and have the right to control who can query the data
- **Recipients**: query data from the system
- **Workers**: provide data decryption services according to the access control rules set by owners
  - Workers are required to provide a web API interface for the recipients to query data, and to upload (*pin*) its public key on IPFS by registering the corresponding IPFS hash on the smart contract

<br>

#### Data Sharing 

<p align="center"><img alt="" src="https://github.com/aaronchong888/Project-D3/blob/master/img/sharing.png" width="40%"></p>

Owners start the sharing process by putting their data on IPFS to obtain an IPFS file hash. Then the owner queries the smart contract for the public keys of the verified workers, and fetches the corresponding IPFS objects to the local node. The file hash is split into *n* shares using Shamir’s Secret Sharing scheme, and *n* random keys (if *n* is less than the total number of workers) are chosen by the owner to encrypt the shares. Finally, the owner can safely store all the encrypted shares on the blockchain through a transaction, together with all the necessary information such as specifying the target recipients.

<br>

#### Data Retrieval

<p align="center"><img alt="" src="https://github.com/aaronchong888/Project-D3/blob/master/img/retrieval.png" width="60%"></p>

Upon receiving requests from a recipient, the workers have to first verify the identity of the recipient (e.g. using RSA signatures). Then the workers proceed to query the smart contract for all the encrypted shares on behalf of the recipient. If the recipient is not authorized to get the file, the transaction would be rejected by the smart contract automatically and the workers shall ignore the request. Otherwise, they would try to decrypt the *n* shares with their respective private keys, and to return the decrypted share to the recipient. Notice that it is possible for a particular worker to return no result if its public key is not chosen during the data sharing phase. After receiving *t* decrypted shares (only *t* out of *n* shares are required as in SSS), the recipient would then be able to reconstruct the original IPFS file hash, retrieving the data back through its local IPFS node.

<br>

### Implementation

To facilitate the use cases for online file sharing and to provide comprehensive access control features to the data owners, the use of an additional file meta is introduced on top of the original design.

<p align="center"><img alt="" src="https://github.com/aaronchong888/Project-D3/blob/master/img/modified.png" width="70%"></p>

Instead of splitting the IPFS hash to the original data, a file meta data is created to include the following information: *filename*, *size*, *type*, *creation date*, *owner*, *description*, and *IPFS hash* to the original file. In case of private encrypted uploads, *recipients* and the symmetric encryption *passphrase* are also added to the file meta.

The suggested modification is necessary for the online file sharing scenario because it would be more useful to display some basic file information to the users (e.g. filename, size, type, descriptions, etc.) before they decide to download a file. It can also prevent confusions when there are multiple different files, and to protect users from possible malicious files. Most importantly, the symmetric encryption key used (a randomly generated 64-character passphrase) during the end-to-end encryption process can be shared securely without the need to depend on any additional central trust points.

<br>

### System Architecture

<p align="center"><img alt="" src="https://github.com/aaronchong888/Project-D3/blob/master/img/sysarch.png" width="50%"></p>

<br>

### Worker API endpoints

> The source code used for worker nodes can be found at [Project-D3-Worker](https://github.com/aaronchong888/Project-D3-Worker)

- [https://project-d3.xyz/api/v1](https://project-d3.xyz/)
- [https://project-d3.azurewebsites.net/api/v1](https://project-d3.azurewebsites.net)
- [https://projectd3.herokuapp.com/api/v1](https://projectd3.herokuapp.com)
- [http://ec2-13-251-15-89.ap-southeast-1.compute.amazonaws.com/api/v1](http://ec2-13-251-15-89.ap-southeast-1.compute.amazonaws.com)
- [http://project-d3-worker.193b.starter-ca-central-1.openshiftapps.com/api/v1](http://project-d3-worker.193b.starter-ca-central-1.openshiftapps.com)

<br>

> To work around the HTTPS-HTTP mixed content error, two proxy routes are provided for the HTTP endpoints:
- `https://project-d3.xyz/proxy/worker2` for [http://ec2-13-251-15-89.ap-southeast-1.compute.amazonaws.com/api/v1](http://ec2-13-251-15-89.ap-southeast-1.compute.amazonaws.com)
- `https://project-d3.xyz/proxy/worker3` for [http://project-d3-worker.193b.starter-ca-central-1.openshiftapps.com/api/v1](http://project-d3-worker.193b.starter-ca-central-1.openshiftapps.com)

<br>

## Getting Started

### Prerequisites

- Node.js
- npm (Node.js package manager)
- Ethereum *
- IPFS *

> \* Required only if you are running your own local Ethereum & IPFS nodes

### Installation

```
npm install
npm install -g truffle
```

### Deployment

```
truffle compile
truffle migrate (--network infura)
```

### Usage

Check `app.js` and complete the missing parts (*API Keys*, *RSA key pairs*, *SSL certificates*, etc.) before running

```
npm start
```

## Authors

* **Aaron Chong** - *Initial work* - [aaronchong888](https://github.com/aaronchong888)

See also the list of [contributors](https://github.com/aaronchong888/Project-D3/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

This project is built using the following packages and libraries as listed [here](https://github.com/aaronchong888/Project-D3/network/dependencies)
