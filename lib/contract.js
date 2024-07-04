/*
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Logger = require('./logger');
const logger = Logger.getLogger('./lib/contract.js');
const Context = require('./context');
/**
 * The main Contact class is extended as Kalpcontract class which captures payment details additionally.
 *
 * Overriden of the `afterTransaction`, to capture payment details
 *
 * @memberof kalp-sdk-node
 */
class Kalpcontract {
    /**
     * Constructor - supplying a name is recommended but is not mandatory.
	 *
     * @param {String} name name for the logic within this contract
     * @param {Boolean} IsPayableContract to identify if contract is payble or no.
    */
    constructor(name, IsPayableContract) {
        Logger.info('Kalpcontract constructor!');
        this.__isContract = true;
        if (typeof name === 'undefined' || name === null) {
            this.name = this.constructor.name;
        } else {
            this.name = name.trim();
        }

        Logger.info('isPayableContract->', IsPayableContract);
        if (typeof IsPayableContract === 'undefined' || IsPayableContract === null) {
            this.IsPayableContract = false;
        } else {
            this.IsPayableContract = true;
        }
    }

    /**
     * isContract provides functionality to check if a passed object is a contract type. Enables
     * checking if its a contract for when contract-api is "required" by different modules
     * @param {Object} obj
     */
    static _isContract(obj) {
        return obj instanceof Contract || Boolean(obj.__isContract);
    }

    /**
	 * 'beforeTransaction' will be called before any of the transaction functions within your contract
	 * Override this method to implement your own processing. Examples of what you may wish to code
	 *  are Logging, Event Publishing or Permissions checks
	 *
	 * If an error is thrown, the whole transaction will be rejected
	 *
	 * @param {Context} ctx the transactional context
	 */
    async beforeTransaction(ctx) {
        // default implementation is do nothing
    }

    /**
	 * 'afterTransaction' will be called before any of the transaction functions within your contract
	 * Override this method to implement your own processing. Examples of what you may wish to code
	 *  are Logging, Event Publishing
	 *
	 * If an error is thrown, the whole transaction will be rejected
	 *
	 * @param {Context} ctx the transactional context
	 * @param {Object} result value that is returned from the transaction function
	 */
    async afterTransaction(ctx) {
        // default implementation is do nothing
        console.log("After Transaction:", ctx.stub.getTxID(), "IsPayable is:", this.IsPayableContract);
        const {fcn, params} = ctx.stub.getFunctionAndParameters()
        
        if  (this.IsPayableContract) {
            console.log(" inside blodck IsPayableContract")
            let paymentTracker = JSON.parse(params) 
            console.log(" parse paymentTracker", paymentTracker)

            let paymentData = paymentTracker.PaymentMetaData       
            if ((!paymentData.Amount || paymentData.Amount < 1) ||  (!paymentData.CurrencyCode || paymentData.CurrencyCode == "")) {
                throw new Error("payment transaction does not have valid amount or currencycode!")
            } 
            console.log("paymentData ", paymentData)
            paymentData.DocType= "PAYMENT-INFO"
			paymentData.TransactionId = ctx.stub.getTxID()
            paymentData.AssetId = paymentTracker.Id
            paymentData.AssetDocType = paymentTracker.DocType
            console.log("paymentData", paymentData)
            await ctx.stub.putState(paymentData.TransactionId, Buffer.from(JSON.stringify(paymentData)));
        }
    }



    /**
	 * 'aroundTransaction' wraps the call to the transaction function within your contract, allowing you
     *  to encapsulate it into a code block. Examples of what you could do overriding this include, but
     *  are not limited to: catching exceptions, logging, use a thread-store.
     *
     * When overriding this function, remember to call `super.aroundTransaction(ctx, fn, parameters)`!
     * If you don't, the contract won't be able to run any transaction.
     *
	 * If an error is thrown, the whole transaction will be rejected
	 *
	 * @param {Context} ctx the transactional context
     * @param {Function} fn the contract function to invoke
     * @param {any} paramters the parameters for the function to invoke
	 */
    async aroundTransaction(ctx, fn, parameters) {
        // use the spread operator to make this pass the arguments seperately not as an array
        // this is the point at which control is handed to the tx function
        return this[fn](ctx, ...parameters);
    }

    /**
	 * 'unknownTransaction' will be called if the required transaction function requested does not exist
	 * Override this method to implement your own processing.
	 * If an error is thrown, the whole transaction will be rejected
	 *
	 * @param {Context} ctx the transactional context
	 */
    async unknownTransaction(ctx) {
        const {fcn, params} = ctx.stub.getFunctionAndParameters();

        logger.error(`[${ctx.stub.getTxID()}] ${this.name} contract-api.Contract unknown transaction`, fcn, params);

        throw new Error(`You've asked to invoke a function that does not exist: ${fcn}`);
    }

    /**
     * 'createContext' is called before any after, before, unknown or user defined transaction function. This permits contracts
     * to use their own subclass of context to add additinal processing.
     *
     * After this function returns, the chaincodeStub and client identity objects will be injected.
     * No chaincode apis are available for calling directly within this function. Nor should the constructor of the subclasses context assume
     * any other setup.
     *
     * @return {Context} a context implementation that must subclass context
     */
    createContext() {
        return new Context();
    }

    /**
     * @return {String} returns the namespace
     */
    getName() {
        return this.name;
    }

}

module.exports = Kalpcontract;
