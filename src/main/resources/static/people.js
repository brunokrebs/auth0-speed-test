/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
"use strict";

var $protobuf = require("protobufjs/runtime");

// Common aliases
var $Reader = $protobuf.Reader,
    $Writer = $protobuf.Writer,
    $util   = $protobuf.util;

// Lazily resolved type references
var $lazyTypes = [];

// Exported root namespace
var $root = {};

$root.demo = (function() {

    /**
     * Namespace demo.
     * @exports demo
     * @namespace
     */
    var demo = {};

    demo.People = (function() {

        /**
         * Constructs a new People.
         * @exports demo.People
         * @constructor
         * @param {Object} [properties] Properties to set
         */
        function People(properties) {
            if (properties) {
                var keys = Object.keys(properties);
                for (var i = 0; i < keys.length; ++i)
                    this[keys[i]] = properties[keys[i]];
            }
        }

        /**
         * People person.
         * @type {Array.<demo.Person>}
         */
        People.prototype.person = $util.emptyArray;

        // Lazily resolved type references
        var $types = {
            0: "demo.Person"
        }; $lazyTypes.push($types);

        /**
         * Creates a new People instance using the specified properties.
         * @param {Object} [properties] Properties to set
         * @returns {demo.People} People instance
         */
        People.create = function create(properties) {
            return new People(properties);
        };

        /**
         * Encodes the specified People message.
         * @param {demo.People|Object} message People message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        People.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.person !== undefined && message.hasOwnProperty("person"))
                for (var i = 0; i < message.person.length; ++i)
                    $types[0].encode(message.person[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified People message, length delimited.
         * @param {demo.People|Object} message People message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        People.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a People message from the specified reader or buffer.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.People} People
         */
        People.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.demo.People();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.person && message.person.length))
                        message.person = [];
                    message.person.push($types[0].decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a People message from the specified reader or buffer, length delimited.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.People} People
         */
        People.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a People message.
         * @param {demo.People|Object} message People message or plain object to verify
         * @returns {?string} `null` if valid, otherwise the reason why it is not
         */
        People.verify = function verify(message) {
            if (message.person !== undefined) {
                if (!Array.isArray(message.person))
                    return "person: array expected";
                for (var i = 0; i < message.person.length; ++i) {
                    var error = $types[0].verify(message.person[i]);
                    if (error)
                        return "person." + error;
                }
            }
            return null;
        };

        /**
         * Creates a People message from a plain object. Also converts values to their respective internal types.
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.People} People
         */
        People.fromObject = function fromObject(object) {
            if (object instanceof $root.demo.People)
                return object;
            var message = new $root.demo.People();
            if (object.person) {
                message.person = [];
                for (var i = 0; i < object.person.length; ++i)
                    message.person[i] = $types[0].fromObject(object.person[i]);
            }
            return message;
        };

        /**
         * Creates a People message from a plain object. Also converts values to their respective internal types.
         * This is an alias of {@link demo.People.fromObject}.
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.People} People
         */
        People.from = People.fromObject;

        /**
         * Creates a plain object from a People message. Also converts values to other types if specified.
         * @param {demo.People} message People
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        People.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.person = [];
            if (message.person !== undefined && message.person !== null && message.hasOwnProperty("person")) {
                object.person = [];
                for (var j = 0; j < message.person.length; ++j)
                    object.person[j] = $types[0].toObject(message.person[j], options);
            }
            return object;
        };

        /**
         * Creates a plain object from this People message. Also converts values to other types if specified.
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        People.prototype.toObject = function toObject(options) {
            return this.constructor.toObject(this, options);
        };

        /**
         * Converts this People to JSON.
         * @returns {Object.<string,*>} JSON object
         */
        People.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return People;
    })();

    demo.Person = (function() {

        /**
         * Constructs a new Person.
         * @exports demo.Person
         * @constructor
         * @param {Object} [properties] Properties to set
         */
        function Person(properties) {
            if (properties) {
                var keys = Object.keys(properties);
                for (var i = 0; i < keys.length; ++i)
                    this[keys[i]] = properties[keys[i]];
            }
        }

        /**
         * Person name.
         * @type {string}
         */
        Person.prototype.name = "";

        /**
         * Person address.
         * @type {Array.<demo.Address>}
         */
        Person.prototype.address = $util.emptyArray;

        /**
         * Person mobile.
         * @type {Array.<string>}
         */
        Person.prototype.mobile = $util.emptyArray;

        /**
         * Person email.
         * @type {Array.<string>}
         */
        Person.prototype.email = $util.emptyArray;

        // Lazily resolved type references
        var $types = {
            1: "demo.Address"
        }; $lazyTypes.push($types);

        /**
         * Creates a new Person instance using the specified properties.
         * @param {Object} [properties] Properties to set
         * @returns {demo.Person} Person instance
         */
        Person.create = function create(properties) {
            return new Person(properties);
        };

        /**
         * Encodes the specified Person message.
         * @param {demo.Person|Object} message Person message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Person.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name !== undefined && message.hasOwnProperty("name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.address !== undefined && message.hasOwnProperty("address"))
                for (var i = 0; i < message.address.length; ++i)
                    $types[1].encode(message.address[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.mobile !== undefined && message.hasOwnProperty("mobile"))
                for (var i = 0; i < message.mobile.length; ++i)
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.mobile[i]);
            if (message.email !== undefined && message.hasOwnProperty("email"))
                for (var i = 0; i < message.email.length; ++i)
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.email[i]);
            return writer;
        };

        /**
         * Encodes the specified Person message, length delimited.
         * @param {demo.Person|Object} message Person message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Person.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Person message from the specified reader or buffer.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.Person} Person
         */
        Person.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.demo.Person();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    if (!(message.address && message.address.length))
                        message.address = [];
                    message.address.push($types[1].decode(reader, reader.uint32()));
                    break;
                case 3:
                    if (!(message.mobile && message.mobile.length))
                        message.mobile = [];
                    message.mobile.push(reader.string());
                    break;
                case 4:
                    if (!(message.email && message.email.length))
                        message.email = [];
                    message.email.push(reader.string());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Person message from the specified reader or buffer, length delimited.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.Person} Person
         */
        Person.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Person message.
         * @param {demo.Person|Object} message Person message or plain object to verify
         * @returns {?string} `null` if valid, otherwise the reason why it is not
         */
        Person.verify = function verify(message) {
            if (message.name !== undefined)
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.address !== undefined) {
                if (!Array.isArray(message.address))
                    return "address: array expected";
                for (var i = 0; i < message.address.length; ++i) {
                    var error = $types[1].verify(message.address[i]);
                    if (error)
                        return "address." + error;
                }
            }
            if (message.mobile !== undefined) {
                if (!Array.isArray(message.mobile))
                    return "mobile: array expected";
                for (var i = 0; i < message.mobile.length; ++i)
                    if (!$util.isString(message.mobile[i]))
                        return "mobile: string[] expected";
            }
            if (message.email !== undefined) {
                if (!Array.isArray(message.email))
                    return "email: array expected";
                for (var i = 0; i < message.email.length; ++i)
                    if (!$util.isString(message.email[i]))
                        return "email: string[] expected";
            }
            return null;
        };

        /**
         * Creates a Person message from a plain object. Also converts values to their respective internal types.
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.Person} Person
         */
        Person.fromObject = function fromObject(object) {
            if (object instanceof $root.demo.Person)
                return object;
            var message = new $root.demo.Person();
            if (object.name !== undefined && object.name !== null)
                message.name = String(object.name);
            if (object.address) {
                message.address = [];
                for (var i = 0; i < object.address.length; ++i)
                    message.address[i] = $types[1].fromObject(object.address[i]);
            }
            if (object.mobile) {
                message.mobile = [];
                for (var i = 0; i < object.mobile.length; ++i)
                    message.mobile[i] = String(object.mobile[i]);
            }
            if (object.email) {
                message.email = [];
                for (var i = 0; i < object.email.length; ++i)
                    message.email[i] = String(object.email[i]);
            }
            return message;
        };

        /**
         * Creates a Person message from a plain object. Also converts values to their respective internal types.
         * This is an alias of {@link demo.Person.fromObject}.
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.Person} Person
         */
        Person.from = Person.fromObject;

        /**
         * Creates a plain object from a Person message. Also converts values to other types if specified.
         * @param {demo.Person} message Person
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Person.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.address = [];
                object.mobile = [];
                object.email = [];
            }
            if (options.defaults)
                object.name = "";
            if (message.name !== undefined && message.name !== null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.address !== undefined && message.address !== null && message.hasOwnProperty("address")) {
                object.address = [];
                for (var j = 0; j < message.address.length; ++j)
                    object.address[j] = $types[1].toObject(message.address[j], options);
            }
            if (message.mobile !== undefined && message.mobile !== null && message.hasOwnProperty("mobile")) {
                object.mobile = [];
                for (var j = 0; j < message.mobile.length; ++j)
                    object.mobile[j] = message.mobile[j];
            }
            if (message.email !== undefined && message.email !== null && message.hasOwnProperty("email")) {
                object.email = [];
                for (var j = 0; j < message.email.length; ++j)
                    object.email[j] = message.email[j];
            }
            return object;
        };

        /**
         * Creates a plain object from this Person message. Also converts values to other types if specified.
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Person.prototype.toObject = function toObject(options) {
            return this.constructor.toObject(this, options);
        };

        /**
         * Converts this Person to JSON.
         * @returns {Object.<string,*>} JSON object
         */
        Person.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Person;
    })();

    demo.Address = (function() {

        /**
         * Constructs a new Address.
         * @exports demo.Address
         * @constructor
         * @param {Object} [properties] Properties to set
         */
        function Address(properties) {
            if (properties) {
                var keys = Object.keys(properties);
                for (var i = 0; i < keys.length; ++i)
                    this[keys[i]] = properties[keys[i]];
            }
        }

        /**
         * Address street.
         * @type {string}
         */
        Address.prototype.street = "";

        /**
         * Address number.
         * @type {number}
         */
        Address.prototype.number = 0;

        /**
         * Creates a new Address instance using the specified properties.
         * @param {Object} [properties] Properties to set
         * @returns {demo.Address} Address instance
         */
        Address.create = function create(properties) {
            return new Address(properties);
        };

        /**
         * Encodes the specified Address message.
         * @param {demo.Address|Object} message Address message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Address.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.street !== undefined && message.hasOwnProperty("street"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.street);
            if (message.number !== undefined && message.hasOwnProperty("number"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.number);
            return writer;
        };

        /**
         * Encodes the specified Address message, length delimited.
         * @param {demo.Address|Object} message Address message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Address.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Address message from the specified reader or buffer.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.Address} Address
         */
        Address.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.demo.Address();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.street = reader.string();
                    break;
                case 2:
                    message.number = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Address message from the specified reader or buffer, length delimited.
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.Address} Address
         */
        Address.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Address message.
         * @param {demo.Address|Object} message Address message or plain object to verify
         * @returns {?string} `null` if valid, otherwise the reason why it is not
         */
        Address.verify = function verify(message) {
            if (message.street !== undefined)
                if (!$util.isString(message.street))
                    return "street: string expected";
            if (message.number !== undefined)
                if (!$util.isInteger(message.number))
                    return "number: integer expected";
            return null;
        };

        /**
         * Creates an Address message from a plain object. Also converts values to their respective internal types.
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.Address} Address
         */
        Address.fromObject = function fromObject(object) {
            if (object instanceof $root.demo.Address)
                return object;
            var message = new $root.demo.Address();
            if (object.street !== undefined && object.street !== null)
                message.street = String(object.street);
            if (object.number !== undefined && object.number !== null)
                message.number = object.number | 0;
            return message;
        };

        /**
         * Creates an Address message from a plain object. Also converts values to their respective internal types.
         * This is an alias of {@link demo.Address.fromObject}.
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.Address} Address
         */
        Address.from = Address.fromObject;

        /**
         * Creates a plain object from an Address message. Also converts values to other types if specified.
         * @param {demo.Address} message Address
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Address.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.street = "";
                object.number = 0;
            }
            if (message.street !== undefined && message.street !== null && message.hasOwnProperty("street"))
                object.street = message.street;
            if (message.number !== undefined && message.number !== null && message.hasOwnProperty("number"))
                object.number = message.number;
            return object;
        };

        /**
         * Creates a plain object from this Address message. Also converts values to other types if specified.
         * @param {$protobuf.ConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Address.prototype.toObject = function toObject(options) {
            return this.constructor.toObject(this, options);
        };

        /**
         * Converts this Address to JSON.
         * @returns {Object.<string,*>} JSON object
         */
        Address.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Address;
    })();

    return demo;
})();

// Resolve lazy type references to actual types
$util.lazyResolve($root, $lazyTypes);

module.exports = $protobuf.roots["default"] = $root;
