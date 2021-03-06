'use strict';

// 1. init default namespace
// 2. create default namespace in types

const odp = Object.defineProperty;

const {
	SymbolConstructorName,
	SymbolDefaultNamespace,
	SymbolDefaultTypesCollection,
	SymbolConfig,
	MNEMONICA,
	MNEMOSYNE,
} = require('../../constants');

const {
	NAMESPACE_DOES_NOT_EXIST,
	ASSOCIATION_EXISTS,
} = require('../../descriptors/errors');

const {
	namespaces,
	[SymbolDefaultNamespace]: defaultNamespace,
	defaultOptionsKeys
} = require('../namespaces');

// here is TypesCollection.define() method
const {
	define,
	lookup
} = require('../../api').types;

const hooksAPI = require('../../api/hooks');

const proto = {
	define,
	lookup,
	...hooksAPI
};

const TypesCollection = function (namespace, config = Object.assign({}, defaultOptionsKeys)) {
	
	const self = this;

	const subtypes = new Map();
	
	// namespace config is less important than types collection config
	config = defaultOptionsKeys.reduce((o, key) => {
		if (typeof config[key] === 'boolean') {
			o[key] = config[key];
		} else {
			o[key] = namespace[SymbolConfig][key];
		}
		return o;
	}, {});
	
	odp(this, SymbolConfig, {
		get () {
			return config;
		}
	});
	
	odp(this, Symbol.hasInstance, {
		get () {
			return (instance) => {
				return instance[SymbolConstructorName] === namespace.name;
			};
		}
	});
	
	odp(this, 'subtypes', {
		get () {
			return subtypes;
		}
	});

	// For instanceof MNEMOSYNE
	odp(subtypes, MNEMOSYNE, {
		get () {
			// returning proxy
			return namespace.typesCollections.get(self);
		}
	});
	
	// For instanceof MNEMOSYNE
	odp(this, MNEMOSYNE, {
		get () {
			// returning proxy
			return namespace.typesCollections.get(self);
		}
	});

	odp(this, 'namespace', {
		get () {
			return namespace;
		}
	});
	
	odp(subtypes, 'namespace', {
		get () {
			return namespace;
		}
	});

	const hooks = Object.create(null);
	odp(this, 'hooks', {
		get () {
			return hooks;
		}
	});

};


odp(TypesCollection.prototype, MNEMONICA, {
	get () {
		// returning proxy
		return this.namespace.typesCollections.get(this);
		// return this;
	}
});

odp(TypesCollection.prototype, 'define', {
	get () {
		const {
			subtypes
		} = this;
		return function (...args) {
			// this - define function of mnemonica interface
			return proto.define.call(this, subtypes, ...args);
		};
	},
	enumerable : true
});

odp(TypesCollection.prototype, 'lookup', {
	get () {
		return function (...args) {
			return proto.lookup.call(this.subtypes, ...args);
		}.bind(this);
	},
	enumerable : true
});

odp(TypesCollection.prototype, 'registerHook', {
	get () {
		const proxy = this.namespace.typesCollections.get(this);
		return function (hookName, hookCallback) {
			return proto.registerHook.call(this, hookName, hookCallback);
		}.bind(proxy);
	},
	enumerable : true
});

odp(TypesCollection.prototype, 'invokeHook', {
	get () {
		const proxy = this.namespace.typesCollections.get(this);
		return function (hookName, hookCallback) {
			return proto.invokeHook.call(this, hookName, hookCallback);
		}.bind(proxy);
	}
});

odp(TypesCollection.prototype, 'registerFlowChecker', {
	get () {
		const proxy = this.namespace.typesCollections.get(this);
		return function (flowCheckerCallback) {
			return proto.registerFlowChecker.call(this, flowCheckerCallback);
		}.bind(proxy);
	}
});


const typesCollectionProxyHandler = {
	get (target, prop) {
		if (target.subtypes.has(prop)) {
			return target.subtypes.get(prop);
		}
		return Reflect.get(target, prop);
	},
	set (target, TypeName, Constructor) {
		return target.define(TypeName, Constructor);
	}
};

const createTypesCollection = (namespace = defaultNamespace, association, config) => {

	if (
		!(namespace instanceof Object) ||
		!namespace.hasOwnProperty('name') ||
		!namespaces.has(namespace.name)
	) {
		throw new NAMESPACE_DOES_NOT_EXIST;
	}

	if (namespace.typesCollections.has(association)) {
		throw new ASSOCIATION_EXISTS;
	}

	const typesCollection = new TypesCollection(namespace, config);
	const typesCollectionProxy = new Proxy(typesCollection, typesCollectionProxyHandler);
	
	namespace.typesCollections.set(typesCollection, typesCollectionProxy);
	namespace.typesCollections.set(typesCollectionProxy, typesCollection);
	
	if (association) {
		namespace.typesCollections.set(association, typesCollectionProxy);
	}

	return typesCollectionProxy;

};

const DEFAULT_TYPES = createTypesCollection(defaultNamespace, SymbolDefaultTypesCollection);
odp(DEFAULT_TYPES, SymbolDefaultTypesCollection, {
	get () {
		return true;
	}
});

const fascade = {};

odp(fascade, 'createTypesCollection', {
	get () {
		return function (namespace, association, config) {
			return createTypesCollection(namespace, association, config);
		};
	},
	enumerable : true
});

odp(fascade, 'defaultTypes', {
	get () {
		return DEFAULT_TYPES;
	},
	enumerable : true
});

module.exports = fascade;
