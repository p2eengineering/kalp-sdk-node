/*
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';

/**
 * The Context class provides the transactional context for transactional execution.
 *
 * This class is customised to support additional functional requirement of KYC.
 *
 * class ScenarioContext extends Context{

	constructor(){
		super();
	}


	generateKey(){
		return this.stub.createCompositeKey('type',['keyvalue']);
	}

  }
 *
 * @memberof -kalp-sdk-node
 */
class Context {

    constructor() {
    }

    /**
	 * This sets the chaincode stub object with api to use for worldstate access.
	 * MUST NOT BE CALLED FROM SMART CONTRACT CODE
	 *
	 * @param {ChaincodeStub} stub chaincode stub instance
	 */
    setChaincodeStub(stub) {
        this.stub = stub;
    }

    /**
	 * This sets the ClientIdentity object to use for information on the transaction invoking identity
	 * MUST NOT BE CALLED FROM SMART CONTRACT CODE
	 *
	 * @param {ClientIdentity} clientIdentity chaincode stub instance
	 */
    setClientIdentity(clientIdentity) {
        this.clientIdentity = clientIdentity;
    }


	/** Function created to fetch and return the enrollment id from transaction context */
	async getUserId() {

		let userid =   this.clientIdentity.getID()
		let begin = userid.indexOf("/CN=");
        let end = userid.lastIndexOf("::/C=");
        let userEnrollmentId = userid.substring(begin + 4, end);
	
        return userEnrollmentId ;
    }

	/** Function created to return the msp id from transaction context */
	async getMSPID() {

		let mspid =   this.clientIdentity.getMSPID()
        return mspid ;
    }

	/** Function created to fetch the kyc status of the given user*/
    async getKYC(userEnrollmentId) {		

		let crossCCFunc = "KycExists"
        let crossCCName = "kyc"
        let channelName = this.stub.getChannelID()

		let response = await this.stub.invokeChaincode(crossCCName, [crossCCFunc, userEnrollmentId], channelName)
		if (response.status !== 200) {
			throw new Error(`failed to query kyc chaincode for user ${userId}. Got status ${response.status} and error message: ${response.message}`);
		}

		let kycCheck = JSON.parse(response.payload.toString('utf8'));
        return kycCheck;
    }

	/** Function created to delete record without kyc status check*/
	async delStateWithoutKYC(key) {	
			// default implementation is do nothing
		   return await this.stub.delState(key);	
		}

	/** Function created to delete record with kyc status check*/	
	async delStateWithKYC(key) {
		let userId = await this.getUserId()

		let kycCheck = await this.getKYC(userId)
		if (kycCheck !== true) {
			throw new Error(`user ${userId} has not completed KYC`);
		}

		// default implementation is do nothing
		return await this.stub.delState(key);			
	}

	/** Function created to save record in ledger without kyc status check*/
	async putStateWithoutKYC(key, value) {
        // default implementation is do nothing
       return await this.stub.putState(key, value);	   
    }

	/** Function created to save record in ledger with kyc status check*/
	async putStateWithKYC(key, value) {
		let userId = await this.getUserId()
		let mspId = await this.getMSPID()

		let kycCheck = await this.getKYC(userId)
		if (kycCheck !== true) {
			throw new Error(`user ${userId} has not completed KYC`);
		}

		// default implementation is do nothing
		return await this.stub.putState(key, value);
	}
}

module.exports = Context;
