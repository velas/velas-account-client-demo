import Web3 from 'web3';

import client from 'vortex-account-client-js';
import Agent  from 'vortex-account-webagent';

import StorageHandler from './storageHandler';
import KeyStorageHandler from './keyStorageHandler';

const abi_account = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_ownerAddress",
                "type": "address"
            },
            {
                "internalType": "contract IOwnerStorage",
                "name": "_ownerStorage",
                "type": "address"
            },
            {
                "internalType": "contract IOperationalStorage",
                "name": "_operationalStorage",
                "type": "address"
            },
            {
                "internalType": "contract IScopeStorage",
                "name": "_scopeStorage",
                "type": "address"
            },
            {
                "internalType": "contract IExternalContractAddressStorage",
                "name": "_externalContractAddressStorage",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "contractAddress",
                "type": "address"
            }
        ],
        "name": "ContractCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "enum IExternalContractCaller.ExternalContractOperation",
                "name": "_operation",
                "type": "uint8"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "_data",
                "type": "bytes"
            }
        ],
        "name": "Executed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "operational",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "accountAddress",
                "type": "address"
            }
        ],
        "name": "OperationalAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "operational",
                "type": "address"
            }
        ],
        "name": "OperationalLocked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "operational",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOperational",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "accountAddress",
                "type": "address"
            }
        ],
        "name": "OperationalReplaced",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "operational",
                "type": "address"
            }
        ],
        "name": "OperationalUnlocked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnerRegistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnerReplaced",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "contractAddress",
                "type": "address"
            }
        ],
        "name": "SupportedContractAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "contractAddress",
                "type": "address"
            }
        ],
        "name": "SupportedContractRemoved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes4",
                "name": "scope",
                "type": "bytes4"
            }
        ],
        "name": "SupportedScopeAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes4",
                "name": "scope",
                "type": "bytes4"
            }
        ],
        "name": "SupportedScopeRemoved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "ValueReceived",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_signatures",
                "type": "bytes"
            },
            {
                "internalType": "address",
                "name": "_operationalAddress",
                "type": "address"
            },
            {
                "internalType": "enum IBaseOperationalStorage.AgentType",
                "name": "_agentType",
                "type": "uint8"
            },
            {
                "internalType": "bytes4[]",
                "name": "_requestedScopes",
                "type": "bytes4[]"
            },
            {
                "internalType": "address[]",
                "name": "_requestedAllowedContracts",
                "type": "address[]"
            },
            {
                "internalType": "bool",
                "name": "_isMasterAddress",
                "type": "bool"
            }
        ],
        "name": "addOperationalAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_owenerSignatures",
                "type": "bytes"
            },
            {
                "internalType": "address",
                "name": "_contractAddress",
                "type": "address"
            }
        ],
        "name": "addSupportedContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_owenerSignatures",
                "type": "bytes"
            },
            {
                "internalType": "bytes4",
                "name": "_scope",
                "type": "bytes4"
            }
        ],
        "name": "addSupportedScope",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_signatures",
                "type": "bytes"
            },
            {
                "internalType": "enum IExternalContractCaller.ExternalContractOperation",
                "name": "_operation",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "_contractAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "_data",
                "type": "bytes"
            }
        ],
        "name": "executeExternalContractOperation",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_operationalAddress",
                "type": "address"
            }
        ],
        "name": "getOperationalAddressParameters",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "enum IBaseOperationalStorage.AddressStatus",
                        "name": "status",
                        "type": "uint8"
                    },
                    {
                        "internalType": "enum IBaseOperationalStorage.AgentType",
                        "name": "agentType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "bytes4[]",
                        "name": "scopes",
                        "type": "bytes4[]"
                    },
                    {
                        "internalType": "address[]",
                        "name": "allowedContractsCall",
                        "type": "address[]"
                    },
                    {
                        "internalType": "bool",
                        "name": "isMasterAddress",
                        "type": "bool"
                    }
                ],
                "internalType": "struct IBaseOperationalStorage.AddressParameters",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getOwnersList",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_operationalAddress",
                "type": "address"
            }
        ],
        "name": "isActiveOperational",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_ownerAddress",
                "type": "address"
            }
        ],
        "name": "isOwner",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_rootOwnerAddress",
                "type": "address"
            }
        ],
        "name": "isValidOwnersHierarchy",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_digest",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "_signatures",
                "type": "bytes"
            }
        ],
        "name": "isValidSignature",
        "outputs": [
            {
                "internalType": "bytes4",
                "name": "",
                "type": "bytes4"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_signatures",
                "type": "bytes"
            },
            {
                "internalType": "address",
                "name": "_operationalAddress",
                "type": "address"
            }
        ],
        "name": "lockOperationalAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nonce",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_owenerSignatures",
                "type": "bytes"
            },
            {
                "internalType": "address",
                "name": "_newOwnerAddress",
                "type": "address"
            }
        ],
        "name": "registerOwnerAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_owenerSignatures",
                "type": "bytes"
            },
            {
                "internalType": "address",
                "name": "_contractAddress",
                "type": "address"
            }
        ],
        "name": "removeSupportedContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_owenerSignatures",
                "type": "bytes"
            },
            {
                "internalType": "bytes4",
                "name": "_scope",
                "type": "bytes4"
            }
        ],
        "name": "removeSupportedScope",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_signatures",
                "type": "bytes"
            },
            {
                "internalType": "address",
                "name": "_operationalAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_newOperationalAddress",
                "type": "address"
            },
            {
                "internalType": "enum IBaseOperationalStorage.AgentType",
                "name": "_newAgentType",
                "type": "uint8"
            },
            {
                "internalType": "bytes4[]",
                "name": "_requestedScopes",
                "type": "bytes4[]"
            },
            {
                "internalType": "address[]",
                "name": "_requestedAllowedContracts",
                "type": "address[]"
            },
            {
                "internalType": "bool",
                "name": "_isMasterAddress",
                "type": "bool"
            }
        ],
        "name": "replaceOperationalAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_owenerSignatures",
                "type": "bytes"
            },
            {
                "internalType": "address",
                "name": "_ownerAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_newOwnerAddress",
                "type": "address"
            }
        ],
        "name": "replaceOwnerAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_signatures",
                "type": "bytes"
            },
            {
                "internalType": "address",
                "name": "_operationalAddress",
                "type": "address"
            }
        ],
        "name": "unlockOperationalAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
];

const abi_client = [
    {
        "inputs": [],
        "name": "getDomainName",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getIconCID",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "methodId",
                "type": "bytes4"
            },
            {
                "internalType": "bytes2",
                "name": "locationCode",
                "type": "bytes2"
            }
        ],
        "name": "getMethodIdLabel",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes2",
                "name": "locationCode",
                "type": "bytes2"
            }
        ],
        "name": "getName",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getRedirectURI",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

export const agent = new Agent({
    client_host: process.env.REACT_APP_NODE_HOST,
    client_provider: Web3,
    client_account_contract_abi: abi_account,
    client_clinet_contract_abi:  abi_client,
    StorageHandler,
    KeyStorageHandler,
});

export const client_redirect_mode = new client.Auth({
    mode:        'redirect',
    clientID:    process.env.REACT_APP_CLIENT_ID,
    agentDomain: process.env.REACT_APP_AGENT_DOMAIN,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    StorageHandler,
    KeyStorageHandler,
});

export const client_popup_mode = new client.Auth({
    mode:        'popup',
    clientID:    process.env.REACT_APP_CLIENT_ID,
    agentDomain: process.env.REACT_APP_AGENT_DOMAIN,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    StorageHandler,
    KeyStorageHandler,
});

export const client_direct_mode = new client.Auth({
    mode:        'direct',
    clientID:    process.env.REACT_APP_CLIENT_ID,
    agentDomain: process.env.REACT_APP_AGENT_DOMAIN,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    agent,
    StorageHandler,
    KeyStorageHandler,
});
