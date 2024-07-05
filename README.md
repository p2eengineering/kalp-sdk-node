The `kalp-sdk-node` provides the *Kalpcontract interface*  a high level API for application developers to implement [Smart Contracts](https://hyperledger-fabric.readthedocs.io/en/release-2.1/glossary.html#smart-contract). Working with this API provides a high level entry point to writing business logic.

Within Hyperledger Fabric, Smart Contracts can also be referred to as [Chaincode](https://hyperledger-fabric.readthedocs.io/en/release-2.1/glossary.html#chaincode).  To be more specific, the term chaincode is preferred to be used to refer to the overall container that is hosting the contracts.

The `kalp-shim` provides the *chaincode interface*, a lower level API for implementing "Smart Contracts". It also _currently_ provides the implementation to support communication with Hyperledger Fabric peers for Smart Contracts written using the `kalp-sdk-node`.  To confirm that this is the same as the `kalp-shim` in previous versions of Hyperledger Fabric.

## Contract Interface

### Installation

### Add below mentioned packages in dependency section
"dependencies": {
        "kalp-sdk-node": "git@github.com:p2eengineering/kalp-sdk-node.git",
        "kalp-shim-sdk-new": "git@github.com:kamalp2e/kalp-shim-sdk-new.git"
    },```

### Usage

Implement a class that ends the `contract` class, a constructor is needed.
The other functions will be invokable functions of your Smart Contract

```javascript
// updatevalues.js
'use strict';

// SDK Library to asset with writing the logic
const { Contract } = require('fabric-contract-api');

// Business logic (well just util but still it's general purpose logic)
'use strict';

const { Kalpcontract, Kalpsdk } = require('kalp-sdk-node');
// const { Kalpsdk } = require('./klap ');

class FabCar extends Kalpcontract {

	/*** Constructor is used to intialize smart contract 
	@name //name of the smart contact
	@isPaybleContract //true -> to capture payment details in ledger with transaction details
	*/

    constructor() {
        console.info('============= START : FabCar constructor ===========');
    
		super('Myfabcar', true);
      }

	//smaple function using putStateWithoutKYC function of kalp-sdk-node
	async createCar(ctx, carData) {
		console.info('============= START : Create Car ===========');

		let input = JSON.parse(carData)
		console.info('input',input);


		let carNumber  = input.CarNumber
		console.info('carNumber',carNumber);

		await ctx.putStateWithoutKYC(carNumber, Buffer.from(JSON.stringify(input)));
		console.info('============= END : Create Car ===========');
	}

	//smaple function using putStateWithKYC function of kalp-sdk-node
	async createCarwithGasFee(ctx, carData) {
		console.info('============= START : Create Car ===========');

		let input = JSON.parse(carData)
		console.info('input',input);


		let carNumber  = input.CarNumber
		console.info('carNumber',carNumber);

		await ctx.putStateWithKYC(carNumber, Buffer.from(JSON.stringify(input)));
		console.info('============= END : Create Car ===========');
	}
};


