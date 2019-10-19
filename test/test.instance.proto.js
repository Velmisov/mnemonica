'use strict';

const { assert, expect } = require('chai');

const {
	errors,
} = require('..');

const test = (opts) => {

	const {
		user,
		userPL1,
		userTC,
		UserType,
		evenMore,
		USER_DATA,
		overMore,
		moreOver,
		UserTypeConstructor,
		OverMore,
		EvenMoreProto,
		evenMoreArgs,
		strFork,
		strForkOfFork,
		overMoreFork,
		evenMoreFork,
		evenMoreForkFork,
		userWPWithAdditionalSign,
	} = opts;

	describe('instance .proto props tests', () => {

		it('should have proper prototype .__args__', () => {
			assert.equal(user.__args__[0], USER_DATA);
		});
		it('should have proper prototype .__type__', () => {
			assert.equal(user.__type__.TypeProxy, UserType);
			assert.equal(user.__type__.TypeName, UserType.TypeName);
		});
		it('should have proper prototype .__namespace__', () => {
			assert.equal(user.__namespace__, UserType.namespace);
		});
		it('should have proper prototype .__collection__', () => {
			assert.equal(user.__collection__, UserType.collection);
		});
		it('should have proper prototype .__subtypes__', () => {
			assert.equal(user.__subtypes__, UserType.subtypes);
		});
		it('should have proper prototype .__parent__', () => {
			assert.equal(evenMore.__parent__, overMore);
			assert.notEqual(evenMore.__parent__, moreOver);
		});

		it('should have proper first .clone old style', () => {

			const userClone = user.clone;

			assert.notEqual(
				Object.getPrototypeOf(Object.getPrototypeOf(user)),
				Object.getPrototypeOf(Object.getPrototypeOf(userClone))
			);

			assert.notEqual(user, userClone);
			assert.deepInclude(user, userClone);
			assert.deepInclude(userClone, user);
			assert.deepEqual(userClone, user);

		});

		it('should have proper first .fork() old style', () => {

			const forkData = {
				email: 'went.out@gmail.com',
				password: 'fork old style password'
			};
			const userArgs = user.__args__;

			const userFork = new user.fork(forkData);

			const userPP =
				Object.getPrototypeOf(Object.getPrototypeOf(user));
			const userForkPP =
				Object.getPrototypeOf(Object.getPrototypeOf(userFork));

			assert.notEqual(userPP, userForkPP);

			assert.notEqual(user, userFork);
			assert.deepEqual(userArgs[0], USER_DATA);
			assert.deepEqual(new UserType(forkData), userFork);
			assert.notDeepEqual(userArgs, userFork.__args__);
			expect(userFork).instanceof(UserType);
			assert.deepEqual(Object.keys(userFork), Object.keys(user));

		});

		it('should have proper first .fork() regular style', () => {

			const forkData = {
				email: 'went.out@gmail.com',
				password: 'fork regular style password'
			};
			const userTCArgs = userTC.__args__;
			const userTCFork = new userTC.fork(forkData);

			const userTCPP =
				Object.getPrototypeOf(Object.getPrototypeOf(userTC));
			const userTCForkPP =
				Object.getPrototypeOf(Object.getPrototypeOf(userTCFork));
			assert.notEqual(userTCPP, userTCForkPP);

			assert.notEqual(userTC, userTCFork);
			assert.deepEqual(userTCArgs[0], USER_DATA);
			assert.deepEqual(new UserTypeConstructor(forkData), userTCFork);
			assert.notDeepEqual(userTCArgs, userTCFork.__args__);
			expect(userTCFork).instanceof(UserTypeConstructor);
			assert.deepEqual(Object.keys(userTCFork), Object.keys(userTC));

		});

		it('should have proper nested .fork() old style', () => {

			const userPL1Fork = new userPL1.fork();

			const userPL1PP =
				Object.getPrototypeOf(Object.getPrototypeOf(userPL1));
			const userPL1ForkPP =
				Object.getPrototypeOf(Object.getPrototypeOf(userPL1Fork));

			assert.equal(userPL1PP, userPL1ForkPP);

			assert.notEqual(userPL1, userPL1Fork);
			assert.deepInclude(userPL1, userPL1Fork);
			assert.deepInclude(userPL1Fork, userPL1);
			assert.deepEqual(userPL1Fork, userPL1);

		});

		it('should have proper nested .clone regular style', () => {

			const evenMoreClone = evenMore.clone;
			assert.deepEqual(
				Object.getPrototypeOf(Object.getPrototypeOf(evenMore)),
				Object.getPrototypeOf(Object.getPrototypeOf(evenMoreClone))
			);
			assert.notEqual(evenMore, evenMoreClone);
			assert.deepInclude(evenMore, evenMoreClone);
			assert.deepInclude(evenMoreClone, evenMore);
			assert.deepEqual(evenMoreClone.extract(), evenMore.extract());

		});

		it('should not mutate()', () => {
			assert.notEqual(evenMore.__proto_proto__, EvenMoreProto);
		});


		it('should have proper nested .fork()', () => {
			assert.notEqual(overMore.__proto_proto__, overMoreFork.__proto_proto__);

			assert.notEqual(evenMore.__proto_proto__, evenMoreFork.__proto_proto__);
			assert.notEqual(evenMore.__timestamp__, evenMoreFork.__timestamp__);

			assert.notEqual(evenMore, evenMoreFork);
			assert.notEqual(evenMoreForkFork, evenMoreFork);

			const evenMorePP =
				Object.getPrototypeOf(Object.getPrototypeOf(evenMore));
			const evenMoreForkPP =
				Object.getPrototypeOf(Object.getPrototypeOf(evenMoreFork));

			assert.notEqual(evenMorePP, evenMoreForkPP);
			assert.equal(evenMoreFork.str, strFork);
			assert.equal(evenMoreForkFork.str, strForkOfFork);

			// debugger;

			assert.deepEqual(evenMore.__args__, evenMoreArgs);
			assert.notDeepEqual(evenMore.__args__, evenMoreFork.__args__);

			const nativeFork = overMore.EvenMore(strFork);

			assert.notEqual(nativeFork, evenMoreFork);
			assert.deepInclude(nativeFork, evenMoreFork);
			assert.deepInclude(evenMoreFork, nativeFork);
			assert.notEqual(overMore.__args__, evenMore.__args__);
			expect(evenMoreFork).instanceof(OverMore.lookup('EvenMore'));
			assert.deepEqual(Object.keys(evenMore), Object.keys(evenMoreFork));

		});

		describe('shared proto must fail', () => {
			debugger;
			try {
				userWPWithAdditionalSign.fork('should fail');
			} catch (error) {
				it('should respect construction rules', () => {
					expect(error).instanceOf(Error);
				});
				it('thrown error instanceof WRONG_TYPE_DEFINITION', () => {
					expect(error).instanceOf(errors.WRONG_TYPE_DEFINITION);
				});
				it('thrown error should be ok with props', () => {
					expect(error.message).exist.and.is.a('string');
					const checkStr = [
						'wrong type definition : shared proto usage is prohibited',
						'\t[ WithAdditionalSign ]',
						'should fail',
						'\tnot equal to',
						'userWithoutPassword_2.WithAdditionalSign',
					].join('\n');

					assert.equal(error.message, checkStr);
				});
			}
		});
	});

};

module.exports = test;