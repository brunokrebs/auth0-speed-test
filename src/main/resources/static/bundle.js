(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/**
 * A minimal base64 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var base64 = exports;

/**
 * Calculates the byte length of a base64 encoded string.
 * @param {string} string Base64 encoded string
 * @returns {number} Byte length
 */
base64.length = function length(string) {
    var p = string.length;
    if (!p)
        return 0;
    var n = 0;
    while (--p % 4 > 1 && string.charAt(p) === "=")
        ++n;
    return Math.ceil(string.length * 3) / 4 - n;
};

// Base64 encoding table
var b64 = new Array(64);

// Base64 decoding table
var s64 = new Array(123);

// 65..90, 97..122, 48..57, 43, 47
for (var i = 0; i < 64;)
    s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;

/**
 * Encodes a buffer to a base64 encoded string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} Base64 encoded string
 */
base64.encode = function encode(buffer, start, end) {
    var string = []; // alt: new Array(Math.ceil((end - start) / 3) * 4);
    var i = 0, // output index
        j = 0, // goto index
        t;     // temporary
    while (start < end) {
        var b = buffer[start++];
        switch (j) {
            case 0:
                string[i++] = b64[b >> 2];
                t = (b & 3) << 4;
                j = 1;
                break;
            case 1:
                string[i++] = b64[t | b >> 4];
                t = (b & 15) << 2;
                j = 2;
                break;
            case 2:
                string[i++] = b64[t | b >> 6];
                string[i++] = b64[b & 63];
                j = 0;
                break;
        }
    }
    if (j) {
        string[i++] = b64[t];
        string[i  ] = 61;
        if (j === 1)
            string[i + 1] = 61;
    }
    return String.fromCharCode.apply(String, string);
};

var invalidEncoding = "invalid encoding";

/**
 * Decodes a base64 encoded string to a buffer.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Number of bytes written
 * @throws {Error} If encoding is invalid
 */
base64.decode = function decode(string, buffer, offset) {
    var start = offset;
    var j = 0, // goto index
        t;     // temporary
    for (var i = 0; i < string.length;) {
        var c = string.charCodeAt(i++);
        if (c === 61 && j > 1)
            break;
        if ((c = s64[c]) === undefined)
            throw Error(invalidEncoding);
        switch (j) {
            case 0:
                t = c;
                j = 1;
                break;
            case 1:
                buffer[offset++] = t << 2 | (c & 48) >> 4;
                t = c;
                j = 2;
                break;
            case 2:
                buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
                t = c;
                j = 3;
                break;
            case 3:
                buffer[offset++] = (t & 3) << 6 | c;
                j = 0;
                break;
        }
    }
    if (j === 1)
        throw Error(invalidEncoding);
    return offset - start;
};

/**
 * Tests if the specified string appears to be base64 encoded.
 * @param {string} string String to test
 * @returns {boolean} `true` if probably base64 encoded, otherwise false
 */
base64.test = function test(string) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
};

},{}],2:[function(require,module,exports){
"use strict";
module.exports = inquire;

/**
 * Requires a module only if available.
 * @memberof util
 * @param {string} moduleName Module to require
 * @returns {?Object} Required module if available and not empty, otherwise `null`
 */
function inquire(moduleName) {
    try {
        var mod = eval("quire".replace(/^/,"re"))(moduleName); // eslint-disable-line no-eval
        if (mod && (mod.length || Object.keys(mod).length))
            return mod;
    } catch (e) {} // eslint-disable-line no-empty
    return null;
}

},{}],3:[function(require,module,exports){
"use strict";
module.exports = pool;

/**
 * An allocator as used by {@link util.pool}.
 * @typedef PoolAllocator
 * @type {function}
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */

/**
 * A slicer as used by {@link util.pool}.
 * @typedef PoolSlicer
 * @type {function}
 * @param {number} start Start offset
 * @param {number} end End offset
 * @returns {Uint8Array} Buffer slice
 * @this {Uint8Array}
 */

/**
 * A general purpose buffer pool.
 * @memberof util
 * @function
 * @param {PoolAllocator} alloc Allocator
 * @param {PoolSlicer} slice Slicer
 * @param {number} [size=8192] Slab size
 * @returns {PoolAllocator} Pooled allocator
 */
function pool(alloc, slice, size) {
    var SIZE   = size || 8192;
    var MAX    = SIZE >>> 1;
    var slab   = null;
    var offset = SIZE;
    return function pool_alloc(size) {
        if (size < 1 || size > MAX)
            return alloc(size);
        if (offset + size > SIZE) {
            slab = alloc(SIZE);
            offset = 0;
        }
        var buf = slice.call(slab, offset, offset += size);
        if (offset & 7) // align to 32 bit
            offset = (offset | 7) + 1;
        return buf;
    };
}

},{}],4:[function(require,module,exports){
"use strict";

/**
 * A minimal UTF8 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var utf8 = exports;

/**
 * Calculates the UTF8 byte length of a string.
 * @param {string} string String
 * @returns {number} Byte length
 */
utf8.length = function utf8_length(string) {
    var len = 0,
        c = 0;
    for (var i = 0; i < string.length; ++i) {
        c = string.charCodeAt(i);
        if (c < 128)
            len += 1;
        else if (c < 2048)
            len += 2;
        else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
            ++i;
            len += 4;
        } else
            len += 3;
    }
    return len;
};

/**
 * Reads UTF8 bytes as a string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} String read
 */
utf8.read = function utf8_read(buffer, start, end) {
    var len = end - start;
    if (len < 1)
        return "";
    var parts = null,
        chunk = [],
        i = 0, // char offset
        t;     // temporary
    while (start < end) {
        t = buffer[start++];
        if (t < 128)
            chunk[i++] = t;
        else if (t > 191 && t < 224)
            chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
        else if (t > 239 && t < 365) {
            t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000;
            chunk[i++] = 0xD800 + (t >> 10);
            chunk[i++] = 0xDC00 + (t & 1023);
        } else
            chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
        if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
        }
    }
    if (parts) {
        if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
    }
    return i ? String.fromCharCode.apply(String, chunk.slice(0, i)) : "";
};

/**
 * Writes a string as UTF8 bytes.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Bytes written
 */
utf8.write = function utf8_write(string, buffer, offset) {
    var start = offset,
        c1, // character 1
        c2; // character 2
    for (var i = 0; i < string.length; ++i) {
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
            buffer[offset++] = c1;
        } else if (c1 < 2048) {
            buffer[offset++] = c1 >> 6       | 192;
            buffer[offset++] = c1       & 63 | 128;
        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = string.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
            ++i;
            buffer[offset++] = c1 >> 18      | 240;
            buffer[offset++] = c1 >> 12 & 63 | 128;
            buffer[offset++] = c1 >> 6  & 63 | 128;
            buffer[offset++] = c1       & 63 | 128;
        } else {
            buffer[offset++] = c1 >> 12      | 224;
            buffer[offset++] = c1 >> 6  & 63 | 128;
            buffer[offset++] = c1       & 63 | 128;
        }
    }
    return offset - start;
};

},{}],5:[function(require,module,exports){
(function (global){
// This file exports just the bare minimum required to work with statically generated code.
// Can be used as a drop-in replacement for the full library as it has the same general structure.
"use strict";
var protobuf = global.protobuf = exports;

protobuf.Writer       = require("../src/writer");
protobuf.BufferWriter = require("../src/writer_buffer");
protobuf.Reader       = require("../src/reader");
protobuf.BufferReader = require("../src/reader_buffer");
protobuf.util         = require("../src/util/runtime");
protobuf.roots        = {};
protobuf.configure    = configure;

function configure() {
    protobuf.Reader._configure();
}

if (typeof define === "function" && define.amd)
    define(["long"], function(Long) {
        if (Long) {
            protobuf.util.Long = Long;
            configure();
        }
        return protobuf;
    });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../src/reader":6,"../src/reader_buffer":7,"../src/util/runtime":9,"../src/writer":10,"../src/writer_buffer":11}],6:[function(require,module,exports){
"use strict";
module.exports = Reader;

var util      = require("./util/runtime");

var BufferReader; // cyclic

var LongBits  = util.LongBits,
    utf8      = util.utf8;

/* istanbul ignore next */
function indexOutOfRange(reader, writeLength) {
    return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
}

/**
 * Constructs a new reader instance using the specified buffer.
 * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 * @param {Uint8Array} buffer Buffer to read from
 */
function Reader(buffer) {

    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    this.buf = buffer;

    /**
     * Read buffer position.
     * @type {number}
     */
    this.pos = 0;

    /**
     * Read buffer length.
     * @type {number}
     */
    this.len = buffer.length;
}

/**
 * Creates a new reader using the specified buffer.
 * @function
 * @param {Uint8Array} buffer Buffer to read from
 * @returns {BufferReader|Reader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
 */
Reader.create = util.Buffer
    ? function create_buffer_setup(buffer) {
        /* istanbul ignore next */
        if (!BufferReader)
            BufferReader = require("./reader_buffer");
        return (Reader.create = function create_buffer(buffer) {
            return util.Buffer.isBuffer(buffer)
                ? new BufferReader(buffer)
                : new Reader(buffer);
        })(buffer);
    }
    /* istanbul ignore next */
    : function create_array(buffer) {
        return new Reader(buffer);
    };

/** @alias Reader.prototype */
var ReaderPrototype = Reader.prototype;

ReaderPrototype._slice = util.Array.prototype.subarray || /* istanbul ignore next */ util.Array.prototype.slice;

/**
 * Reads a varint as an unsigned 32 bit value.
 * @function
 * @returns {number} Value read
 */
ReaderPrototype.uint32 = (function read_uint32_setup() {
    var value = 4294967295; // optimizer type-hint, tends to deopt otherwise (?!)
    return function read_uint32() {
        value = (         this.buf[this.pos] & 127       ) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) <<  7) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] &  15) << 28) >>> 0; if (this.buf[this.pos++] < 128) return value;

        /* istanbul ignore next */
        if ((this.pos += 5) > this.len) {
            this.pos = this.len;
            throw indexOutOfRange(this, 10);
        }
        return value;
    };
})();

/**
 * Reads a varint as a signed 32 bit value.
 * @returns {number} Value read
 */
ReaderPrototype.int32 = function read_int32() {
    return this.uint32() | 0;
};

/**
 * Reads a zig-zag encoded varint as a signed 32 bit value.
 * @returns {number} Value read
 */
ReaderPrototype.sint32 = function read_sint32() {
    var value = this.uint32();
    return value >>> 1 ^ -(value & 1) | 0;
};

/* eslint-disable no-invalid-this */

function readLongVarint() {
    // tends to deopt with local vars for octet etc.
    var bits = new LongBits(0 >>> 0, 0 >>> 0);
    var i = 0;
    if (this.len - this.pos > 4) { // fast route (lo)
        for (; i < 4; ++i) {
            // 1st..4th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 5th
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >>  4) >>> 0;
        if (this.buf[this.pos++] < 128)
            return bits;
        i = 0;
    } else {
        for (; i < 3; ++i) {
            /* istanbul ignore next */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 1st..3th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 4th
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
    }
    if (this.len - this.pos > 4) { // fast route (hi)
        for (; i < 5; ++i) {
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    } else {
        for (; i < 5; ++i) {
            /* istanbul ignore next */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    }
    /* istanbul ignore next */
    throw Error("invalid varint encoding");
}

function read_int64_long() {
    return readLongVarint.call(this).toLong();
}

/* istanbul ignore next */
function read_int64_number() {
    return readLongVarint.call(this).toNumber();
}

function read_uint64_long() {
    return readLongVarint.call(this).toLong(true);
}

/* istanbul ignore next */
function read_uint64_number() {
    return readLongVarint.call(this).toNumber(true);
}

function read_sint64_long() {
    return readLongVarint.call(this).zzDecode().toLong();
}

/* istanbul ignore next */
function read_sint64_number() {
    return readLongVarint.call(this).zzDecode().toNumber();
}

/* eslint-enable no-invalid-this */

/**
 * Reads a varint as a signed 64 bit value.
 * @name Reader#int64
 * @function
 * @returns {Long|number} Value read
 */

/**
 * Reads a varint as an unsigned 64 bit value.
 * @name Reader#uint64
 * @function
 * @returns {Long|number} Value read
 */

/**
 * Reads a zig-zag encoded varint as a signed 64 bit value.
 * @name Reader#sint64
 * @function
 * @returns {Long|number} Value read
 */

/**
 * Reads a varint as a boolean.
 * @returns {boolean} Value read
 */
ReaderPrototype.bool = function read_bool() {
    return this.uint32() !== 0;
};

function readFixed32(buf, end) {
    return (buf[end - 4]
          | buf[end - 3] << 8
          | buf[end - 2] << 16
          | buf[end - 1] << 24) >>> 0;
}

/**
 * Reads fixed 32 bits as a number.
 * @returns {number} Value read
 */
ReaderPrototype.fixed32 = function read_fixed32() {

    /* istanbul ignore next */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32(this.buf, this.pos += 4);
};

/**
 * Reads zig-zag encoded fixed 32 bits as a number.
 * @returns {number} Value read
 */
ReaderPrototype.sfixed32 = function read_sfixed32() {
    var value = this.fixed32();
    return value >>> 1 ^ -(value & 1);
};

/* eslint-disable no-invalid-this */

function readFixed64(/* this: Reader */) {

    /* istanbul ignore next */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);

    return new LongBits(readFixed32(this.buf, this.pos += 4), readFixed32(this.buf, this.pos += 4));
}

function read_fixed64_long() {
    return readFixed64.call(this).toLong(true);
}

/* istanbul ignore next */
function read_fixed64_number() {
    return readFixed64.call(this).toNumber(true);
}

function read_sfixed64_long() {
    return readFixed64.call(this).zzDecode().toLong();
}

/* istanbul ignore next */
function read_sfixed64_number() {
    return readFixed64.call(this).zzDecode().toNumber();
}

/* eslint-enable no-invalid-this */

/**
 * Reads fixed 64 bits.
 * @name Reader#fixed64
 * @function
 * @returns {Long|number} Value read
 */

/**
 * Reads zig-zag encoded fixed 64 bits.
 * @name Reader#sfixed64
 * @function
 * @returns {Long|number} Value read
 */

var readFloat = typeof Float32Array !== "undefined"
    ? (function() {
        var f32 = new Float32Array(1),
            f8b = new Uint8Array(f32.buffer);
        f32[0] = -0;
        return f8b[3] // already le?
            ? function readFloat_f32(buf, pos) {
                f8b[0] = buf[pos    ];
                f8b[1] = buf[pos + 1];
                f8b[2] = buf[pos + 2];
                f8b[3] = buf[pos + 3];
                return f32[0];
            }
            /* istanbul ignore next */
            : function readFloat_f32_le(buf, pos) {
                f8b[3] = buf[pos    ];
                f8b[2] = buf[pos + 1];
                f8b[1] = buf[pos + 2];
                f8b[0] = buf[pos + 3];
                return f32[0];
            };
    })()
    /* istanbul ignore next */
    : function readFloat_ieee754(buf, pos) {
        var uint = readFixed32(buf, pos + 4),
            sign = (uint >> 31) * 2 + 1,
            exponent = uint >>> 23 & 255,
            mantissa = uint & 8388607;
        return exponent === 255
            ? mantissa
              ? NaN
              : sign * Infinity
            : exponent === 0 // denormal
              ? sign * 1.401298464324817e-45 * mantissa
              : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
    };

/**
 * Reads a float (32 bit) as a number.
 * @function
 * @returns {number} Value read
 */
ReaderPrototype.float = function read_float() {

    /* istanbul ignore next */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    var value = readFloat(this.buf, this.pos);
    this.pos += 4;
    return value;
};

var readDouble = typeof Float64Array !== "undefined"
    ? (function() {
        var f64 = new Float64Array(1),
            f8b = new Uint8Array(f64.buffer);
        f64[0] = -0;
        return f8b[7] // already le?
            ? function readDouble_f64(buf, pos) {
                f8b[0] = buf[pos    ];
                f8b[1] = buf[pos + 1];
                f8b[2] = buf[pos + 2];
                f8b[3] = buf[pos + 3];
                f8b[4] = buf[pos + 4];
                f8b[5] = buf[pos + 5];
                f8b[6] = buf[pos + 6];
                f8b[7] = buf[pos + 7];
                return f64[0];
            }
            /* istanbul ignore next */
            : function readDouble_f64_le(buf, pos) {
                f8b[7] = buf[pos    ];
                f8b[6] = buf[pos + 1];
                f8b[5] = buf[pos + 2];
                f8b[4] = buf[pos + 3];
                f8b[3] = buf[pos + 4];
                f8b[2] = buf[pos + 5];
                f8b[1] = buf[pos + 6];
                f8b[0] = buf[pos + 7];
                return f64[0];
            };
    })()
    /* istanbul ignore next */
    : function readDouble_ieee754(buf, pos) {
        var lo = readFixed32(buf, pos + 4),
            hi = readFixed32(buf, pos + 8);
        var sign = (hi >> 31) * 2 + 1,
            exponent = hi >>> 20 & 2047,
            mantissa = 4294967296 * (hi & 1048575) + lo;
        return exponent === 2047
            ? mantissa
              ? NaN
              : sign * Infinity
            : exponent === 0 // denormal
              ? sign * 5e-324 * mantissa
              : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
    };

/**
 * Reads a double (64 bit float) as a number.
 * @function
 * @returns {number} Value read
 */
ReaderPrototype.double = function read_double() {

    /* istanbul ignore next */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);

    var value = readDouble(this.buf, this.pos);
    this.pos += 8;
    return value;
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @returns {Uint8Array} Value read
 */
ReaderPrototype.bytes = function read_bytes() {
    var length = this.uint32(),
        start  = this.pos,
        end    = this.pos + length;

    /* istanbul ignore next */
    if (end > this.len)
        throw indexOutOfRange(this, length);

    this.pos += length;
    return start === end // fix for IE 10/Win8 and others' subarray returning array of size 1
        ? new this.buf.constructor(0)
        : this._slice.call(this.buf, start, end);
};

/**
 * Reads a string preceeded by its byte length as a varint.
 * @returns {string} Value read
 */
ReaderPrototype.string = function read_string() {
    var bytes = this.bytes();
    return utf8.read(bytes, 0, bytes.length);
};

/**
 * Skips the specified number of bytes if specified, otherwise skips a varint.
 * @param {number} [length] Length if known, otherwise a varint is assumed
 * @returns {Reader} `this`
 */
ReaderPrototype.skip = function skip(length) {
    if (typeof length === "number") {
        /* istanbul ignore next */
        if (this.pos + length > this.len)
            throw indexOutOfRange(this, length);
        this.pos += length;
    } else {
        /* istanbul ignore next */
        do {
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
    }
    return this;
};

/**
 * Skips the next element of the specified wire type.
 * @param {number} wireType Wire type received
 * @returns {Reader} `this`
 */
ReaderPrototype.skipType = function(wireType) {
    switch (wireType) {
        case 0:
            this.skip();
            break;
        case 1:
            this.skip(8);
            break;
        case 2:
            this.skip(this.uint32());
            break;
        case 3:
            do { // eslint-disable-line no-constant-condition
                if ((wireType = this.uint32() & 7) === 4)
                    break;
                this.skipType(wireType);
            } while (true);
            break;
        case 5:
            this.skip(4);
            break;

        /* istanbul ignore next */
        default:
            throw Error("invalid wire type " + wireType + " at offset " + this.pos);
    }
    return this;
};

function configure() {
    /* istanbul ignore else */
    if (util.Long) {
        ReaderPrototype.int64 = read_int64_long;
        ReaderPrototype.uint64 = read_uint64_long;
        ReaderPrototype.sint64 = read_sint64_long;
        ReaderPrototype.fixed64 = read_fixed64_long;
        ReaderPrototype.sfixed64 = read_sfixed64_long;
    } else {
        ReaderPrototype.int64 = read_int64_number;
        ReaderPrototype.uint64 = read_uint64_number;
        ReaderPrototype.sint64 = read_sint64_number;
        ReaderPrototype.fixed64 = read_fixed64_number;
        ReaderPrototype.sfixed64 = read_sfixed64_number;
    }
}

Reader._configure = configure;

configure();

},{"./reader_buffer":7,"./util/runtime":9}],7:[function(require,module,exports){
"use strict";
module.exports = BufferReader;

// extends Reader
var Reader = require("./reader");
/** @alias BufferReader.prototype */
var BufferReaderPrototype = BufferReader.prototype = Object.create(Reader.prototype);
BufferReaderPrototype.constructor = BufferReader;

var util = require("./util/runtime");

/**
 * Constructs a new buffer reader instance.
 * @classdesc Wire format reader using node buffers.
 * @extends Reader
 * @constructor
 * @param {Buffer} buffer Buffer to read from
 */
function BufferReader(buffer) {
    Reader.call(this, buffer);
}

/* istanbul ignore else */
if (util.Buffer)
    BufferReaderPrototype._slice = util.Buffer.prototype.slice;

/**
 * @override
 */
BufferReaderPrototype.string = function read_string_buffer() {
    var len = this.uint32(); // modifies pos
    return this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len));
};

},{"./reader":6,"./util/runtime":9}],8:[function(require,module,exports){
"use strict";
module.exports = LongBits;

var util = require("../util/runtime");

/**
 * Any compatible Long instance.
 * 
 * This is a minimal stand-alone definition of a Long instance. The actual type is that exported by long.js.
 * @typedef Long
 * @type {Object}
 * @property {number} low Low bits
 * @property {number} high High bits
 * @property {boolean} unsigned Whether unsigned or not
 */

/**
 * Constructs new long bits.
 * @classdesc Helper class for working with the low and high bits of a 64 bit value.
 * @memberof util
 * @constructor
 * @param {number} lo Low bits
 * @param {number} hi High bits
 */
function LongBits(lo, hi) { // make sure to always call this with unsigned 32bits for proper optimization

    /**
     * Low bits.
     * @type {number}
     */
    this.lo = lo;

    /**
     * High bits.
     * @type {number}
     */
    this.hi = hi;
}

/** @alias util.LongBits.prototype */
var LongBitsPrototype = LongBits.prototype;

/**
 * Zero bits.
 * @memberof util.LongBits
 * @type {util.LongBits}
 */
var zero = LongBits.zero = new LongBits(0, 0);

zero.toNumber = function() { return 0; };
zero.zzEncode = zero.zzDecode = function() { return this; };
zero.length = function() { return 1; };

/**
 * Zero hash.
 * @memberof util.LongBits
 * @type {string}
 */
var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";

/**
 * Constructs new long bits from the specified number.
 * @param {number} value Value
 * @returns {util.LongBits} Instance
 */
LongBits.fromNumber = function fromNumber(value) {
    if (value === 0)
        return zero;
    var sign = value < 0;
    if (sign)
        value = -value;
    var lo = value >>> 0,
        hi = (value - lo) / 4294967296 >>> 0; 
    if (sign) {
        hi = ~hi >>> 0;
        lo = ~lo >>> 0;
        if (++lo > 4294967295) {
            lo = 0;
            if (++hi > 4294967295)
                hi = 0;
        }
    }
    return new LongBits(lo, hi);
};

/**
 * Constructs new long bits from a number, long or string.
 * @param {Long|number|string} value Value
 * @returns {util.LongBits} Instance
 */
LongBits.from = function from(value) {
    if (typeof value === "number")
        return LongBits.fromNumber(value);
    if (typeof value === "string") {
        /* istanbul ignore else */
        if (util.Long)
            value = util.Long.fromString(value);
        else
            return LongBits.fromNumber(parseInt(value, 10));
    }
    return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
};

/**
 * Converts this long bits to a possibly unsafe JavaScript number.
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {number} Possibly unsafe number
 */
LongBitsPrototype.toNumber = function toNumber(unsigned) {
    if (!unsigned && this.hi >>> 31) {
        var lo = ~this.lo + 1 >>> 0,
            hi = ~this.hi     >>> 0;
        if (!lo)
            hi = hi + 1 >>> 0;
        return -(lo + hi * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
};

/**
 * Converts this long bits to a long.
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {Long} Long
 */
LongBitsPrototype.toLong = function toLong(unsigned) {
    return util.Long
        ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned))
        /* istanbul ignore next */
        : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
};

var charCodeAt = String.prototype.charCodeAt;

/**
 * Constructs new long bits from the specified 8 characters long hash.
 * @param {string} hash Hash
 * @returns {util.LongBits} Bits
 */
LongBits.fromHash = function fromHash(hash) {
    if (hash === zeroHash)
        return zero;
    return new LongBits(
        ( charCodeAt.call(hash, 0)
        | charCodeAt.call(hash, 1) << 8
        | charCodeAt.call(hash, 2) << 16
        | charCodeAt.call(hash, 3) << 24) >>> 0
    ,
        ( charCodeAt.call(hash, 4)
        | charCodeAt.call(hash, 5) << 8
        | charCodeAt.call(hash, 6) << 16
        | charCodeAt.call(hash, 7) << 24) >>> 0
    );
};

/**
 * Converts this long bits to a 8 characters long hash.
 * @returns {string} Hash
 */
LongBitsPrototype.toHash = function toHash() {
    return String.fromCharCode(
        this.lo        & 255,
        this.lo >>> 8  & 255,
        this.lo >>> 16 & 255,
        this.lo >>> 24      ,
        this.hi        & 255,
        this.hi >>> 8  & 255,
        this.hi >>> 16 & 255,
        this.hi >>> 24
    );
};

/**
 * Zig-zag encodes this long bits.
 * @returns {util.LongBits} `this`
 */
LongBitsPrototype.zzEncode = function zzEncode() {
    var mask =   this.hi >> 31;
    this.hi  = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
    this.lo  = ( this.lo << 1                   ^ mask) >>> 0;
    return this;
};

/**
 * Zig-zag decodes this long bits.
 * @returns {util.LongBits} `this`
 */
LongBitsPrototype.zzDecode = function zzDecode() {
    var mask = -(this.lo & 1);
    this.lo  = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
    this.hi  = ( this.hi >>> 1                  ^ mask) >>> 0;
    return this;
};

/**
 * Calculates the length of this longbits when encoded as a varint.
 * @returns {number} Length
 */
LongBitsPrototype.length = function length() {
    var part0 =  this.lo,
        part1 = (this.lo >>> 28 | this.hi << 4) >>> 0,
        part2 =  this.hi >>> 24;
    return part2 === 0
         ? part1 === 0
           ? part0 < 16384
             ? part0 < 128 ? 1 : 2
             : part0 < 2097152 ? 3 : 4
           : part1 < 16384
             ? part1 < 128 ? 5 : 6
             : part1 < 2097152 ? 7 : 8
         : part2 < 128 ? 9 : 10;
};

},{"../util/runtime":9}],9:[function(require,module,exports){
(function (global){
"use strict";
var util = exports;

util.base64   = require("@protobufjs/base64");
util.inquire  = require("@protobufjs/inquire");
util.utf8     = require("@protobufjs/utf8");
util.pool     = require("@protobufjs/pool");

/**
 * An immuable empty array.
 * @memberof util
 * @type {Array.<*>}
 */
util.emptyArray = Object.freeze ? Object.freeze([]) : /* istanbul ignore next */ [];

/**
 * An immutable empty object.
 * @type {Object}
 */
util.emptyObject = Object.freeze ? Object.freeze({}) : /* istanbul ignore next */ {};

/**
 * Whether running within node or not.
 * @memberof util
 * @type {boolean}
 */
util.isNode = Boolean(global.process && global.process.versions && global.process.versions.node);

/**
 * Tests if the specified value is an integer.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an integer
 */
util.isInteger = Number.isInteger || /* istanbul ignore next */ function isInteger(value) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
};

/**
 * Tests if the specified value is a string.
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is a string
 */
util.isString = function isString(value) {
    return typeof value === "string" || value instanceof String;
};

/**
 * Tests if the specified value is a non-null object.
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is a non-null object
 */
util.isObject = function isObject(value) {
    return value && typeof value === "object";
};

/**
 * Node's Buffer class if available.
 * @type {?function(new: Buffer)}
 */
util.Buffer = (function() {
    try {
        var Buffer = util.inquire("buffer").Buffer;

        /* istanbul ignore next */
        if (!Buffer.prototype.utf8Write) // refuse to use non-node buffers (performance)
            return null;

        /* istanbul ignore next */
        if (!Buffer.from)
            Buffer.from = function from(value, encoding) { return new Buffer(value, encoding); };

        /* istanbul ignore next */
        if (!Buffer.allocUnsafe)
            Buffer.allocUnsafe = function allocUnsafe(size) { return new Buffer(size); };

        return Buffer;

    } catch (e) {
        /* istanbul ignore next */
        return null;
    }
})();

/**
 * Creates a new buffer of whatever type supported by the environment.
 * @param {number|number[]} [sizeOrArray=0] Buffer size or number array
 * @returns {Uint8Array} Buffer
 */
util.newBuffer = function newBuffer(sizeOrArray) {
    /* istanbul ignore next */
    return typeof sizeOrArray === "number"
        ? util.Buffer
            ? util.Buffer.allocUnsafe(sizeOrArray) // polyfilled
            : new util.Array(sizeOrArray)
        : util.Buffer
            ? util.Buffer.from(sizeOrArray) // polyfilled
            : typeof Uint8Array === "undefined"
                ? sizeOrArray
                : new Uint8Array(sizeOrArray);
};

/**
 * Array implementation used in the browser. `Uint8Array` if supported, otherwise `Array`.
 * @type {?function(new: Uint8Array, *)}
 */
util.Array = typeof Uint8Array !== "undefined" ? Uint8Array /* istanbul ignore next */ : Array;

util.LongBits = require("./longbits");

/**
 * Long.js's Long class if available.
 * @type {?function(new: Long)}
 */
util.Long = /* istanbul ignore next */ global.dcodeIO && /* istanbul ignore next */ global.dcodeIO.Long || util.inquire("long");

/**
 * Converts a number or long to an 8 characters long hash string.
 * @param {Long|number} value Value to convert
 * @returns {string} Hash
 */
util.longToHash = function longToHash(value) {
    return value
        ? util.LongBits.from(value).toHash()
        : util.LongBits.zeroHash;
};

/**
 * Converts an 8 characters long hash string to a long or number.
 * @param {string} hash Hash
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {Long|number} Original value
 */
util.longFromHash = function longFromHash(hash, unsigned) {
    var bits = util.LongBits.fromHash(hash);
    if (util.Long)
        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
    return bits.toNumber(Boolean(unsigned));
};

/**
 * Merges the properties of the source object into the destination object.
 * @param {Object.<string,*>} dst Destination object
 * @param {Object.<string,*>} src Source object
 * @param {boolean} [ifNotSet=false] Merges only if the key is not already set
 * @returns {Object.<string,*>} Destination object
 */
util.merge = function merge(dst, src, ifNotSet) { // used by converters
    for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
        if (dst[keys[i]] === undefined || !ifNotSet)
            dst[keys[i]] = src[keys[i]];
    return dst;
};

/**
 * Builds a getter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {function():string|undefined} Unbound getter
 */
util.oneOfGetter = function getOneOf(fieldNames) {
    var fieldMap = {};
    fieldNames.forEach(function(name) {
        fieldMap[name] = 1;
    });
    /**
     * @returns {string|undefined} Set field name, if any
     * @this Object
     * @ignore
     */
    return function() { // eslint-disable-line consistent-return
        for (var keys = Object.keys(this), i = keys.length - 1; i > -1; --i)
            if (fieldMap[keys[i]] === 1 && this[keys[i]] !== undefined && this[keys[i]] !== null)
                return keys[i];
    };
};

/**
 * Builds a setter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {function(?string):undefined} Unbound setter
 */
util.oneOfSetter = function setOneOf(fieldNames) {
    /**
     * @param {string} name Field name
     * @returns {undefined}
     * @this Object
     * @ignore
     */
    return function(name) {
        for (var i = 0; i < fieldNames.length; ++i)
            if (fieldNames[i] !== name)
                delete this[fieldNames[i]];
    };
};

/**
 * Lazily resolves fully qualified type names against the specified root.
 * @param {Root} root Root instanceof
 * @param {Object.<number,string|ReflectionObject>} lazyTypes Type names
 * @returns {undefined}
 */
util.lazyResolve = function lazyResolve(root, lazyTypes) {
    lazyTypes.forEach(function(types) {
        Object.keys(types).forEach(function(index) {
            var path = types[index |= 0].split("."),
                ptr  = root;
            while (path.length)
                ptr = ptr[path.shift()];
            types[index] = ptr;
        });
    });
};

/**
 * Default conversion options used for toJSON implementations.
 * @type {ConversionOptions}
 */
util.toJSONOptions = {
    longs: String,
    enums: String,
    bytes: String
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./longbits":8,"@protobufjs/base64":1,"@protobufjs/inquire":2,"@protobufjs/pool":3,"@protobufjs/utf8":4}],10:[function(require,module,exports){
"use strict";
module.exports = Writer;

var util      = require("./util/runtime");

var BufferWriter; // cyclic

var LongBits  = util.LongBits,
    base64    = util.base64,
    utf8      = util.utf8;

/**
 * Constructs a new writer operation instance.
 * @classdesc Scheduled writer operation.
 * @constructor
 * @param {function(*, Uint8Array, number)} fn Function to call
 * @param {number} len Value byte length
 * @param {*} val Value to write
 * @ignore
 */
function Op(fn, len, val) {

    /**
     * Function to call.
     * @type {function(Uint8Array, number, *)}
     */
    this.fn = fn;

    /**
     * Value byte length.
     * @type {number}
     */
    this.len = len;

    /**
     * Next operation.
     * @type {Writer.Op|undefined}
     */
    this.next = undefined;

    /**
     * Value to write.
     * @type {*}
     */
    this.val = val; // type varies
}

/* istanbul ignore next */
function noop() {} // eslint-disable-line no-empty-function

/**
 * Constructs a new writer state instance.
 * @classdesc Copied writer state.
 * @memberof Writer
 * @constructor
 * @param {Writer} writer Writer to copy state from
 * @private
 * @ignore
 */
function State(writer) {

    /**
     * Current head.
     * @type {Writer.Op}
     */
    this.head = writer.head;

    /**
     * Current tail.
     * @type {Writer.Op}
     */
    this.tail = writer.tail;

    /**
     * Current buffer length.
     * @type {number}
     */
    this.len = writer.len;

    /**
     * Next state.
     * @type {?State}
     */
    this.next = writer.states;
}

/**
 * Constructs a new writer instance.
 * @classdesc Wire format writer using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 */
function Writer() {

    /**
     * Current length.
     * @type {number}
     */
    this.len = 0;

    /**
     * Operations head.
     * @type {Object}
     */
    this.head = new Op(noop, 0, 0);

    /**
     * Operations tail
     * @type {Object}
     */
    this.tail = this.head;

    /**
     * Linked forked states.
     * @type {?Object}
     */
    this.states = null;

    // When a value is written, the writer calculates its byte length and puts it into a linked
    // list of operations to perform when finish() is called. This both allows us to allocate
    // buffers of the exact required size and reduces the amount of work we have to do compared
    // to first calculating over objects and then encoding over objects. In our case, the encoding
    // part is just a linked list walk calling operations with already prepared values.
}

/**
 * Creates a new writer.
 * @function
 * @returns {BufferWriter|Writer} A {@link BufferWriter} when Buffers are supported, otherwise a {@link Writer}
 */
Writer.create = util.Buffer
    ? function create_buffer_setup() {
        /* istanbul ignore next */
        if (!BufferWriter)
            BufferWriter = require("./writer_buffer");
        return (Writer.create = function create_buffer() {
            return new BufferWriter();
        })();
    }
    /* istanbul ignore next */
    : function create_array() {
        return new Writer();
    };

/**
 * Allocates a buffer of the specified size.
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */
Writer.alloc = function alloc(size) {
    return new util.Array(size);
};

// Use Uint8Array buffer pool in the browser, just like node does with buffers
/* istanbul ignore else */
if (util.Array !== Array)
    Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);

/** @alias Writer.prototype */
var WriterPrototype = Writer.prototype;

/**
 * Pushes a new operation to the queue.
 * @param {function(Uint8Array, number, *)} fn Function to call
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @returns {Writer} `this`
 */
WriterPrototype.push = function push(fn, len, val) {
    this.tail = this.tail.next = new Op(fn, len, val);
    this.len += len;
    return this;
};

function writeByte(val, buf, pos) {
    buf[pos] = val & 255;
}

function writeVarint32(val, buf, pos) {
    while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
    }
    buf[pos] = val;
}

/**
 * Constructs a new varint writer operation instance.
 * @classdesc Scheduled varint writer operation.
 * @extends Op
 * @constructor
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @ignore
 */
function VarintOp(len, val) {
    this.len = len;
    this.next = undefined;
    this.val = val;
}

VarintOp.prototype = Object.create(Op.prototype);
VarintOp.prototype.fn = writeVarint32;

/**
 * Writes an unsigned 32 bit value as a varint.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
WriterPrototype.uint32 = function write_uint32(value) {
    // here, the call to this.push has been inlined and a varint specific Op subclass is used.
    // uint32 is by far the most frequently used operation and benefits significantly from this.
    this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0)
                < 128       ? 1
        : value < 16384     ? 2
        : value < 2097152   ? 3
        : value < 268435456 ? 4
        :                     5,
    value)).len;
    return this;
};

/**
 * Writes a signed 32 bit value as a varint.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
WriterPrototype.int32 = function write_int32(value) {
    return value < 0
        ? this.push(writeVarint64, 10, LongBits.fromNumber(value)) // 10 bytes per spec
        : this.uint32(value);
};

/**
 * Writes a 32 bit value as a varint, zig-zag encoded.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
WriterPrototype.sint32 = function write_sint32(value) {
    return this.uint32((value << 1 ^ value >> 31) >>> 0);
};

function writeVarint64(val, buf, pos) {
    while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
    }
    while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
    }
    buf[pos++] = val.lo;
}

/**
 * Writes an unsigned 64 bit value as a varint.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
WriterPrototype.uint64 = function write_uint64(value) {
    var bits = LongBits.from(value);
    return this.push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a signed 64 bit value as a varint.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
WriterPrototype.int64 = WriterPrototype.uint64;

/**
 * Writes a signed 64 bit value as a varint, zig-zag encoded.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
WriterPrototype.sint64 = function write_sint64(value) {
    var bits = LongBits.from(value).zzEncode();
    return this.push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a boolish value as a varint.
 * @param {boolean} value Value to write
 * @returns {Writer} `this`
 */
WriterPrototype.bool = function write_bool(value) {
    return this.push(writeByte, 1, value ? 1 : 0);
};

function writeFixed32(val, buf, pos) {
    buf[pos++] =  val         & 255;
    buf[pos++] =  val >>> 8   & 255;
    buf[pos++] =  val >>> 16  & 255;
    buf[pos  ] =  val >>> 24;
}

/**
 * Writes a 32 bit value as fixed 32 bits.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
WriterPrototype.fixed32 = function write_fixed32(value) {
    return this.push(writeFixed32, 4, value >>> 0);
};

/**
 * Writes a 32 bit value as fixed 32 bits, zig-zag encoded.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
WriterPrototype.sfixed32 = function write_sfixed32(value) {
    return this.push(writeFixed32, 4, value << 1 ^ value >> 31);
};

/**
 * Writes a 64 bit value as fixed 64 bits.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
WriterPrototype.fixed64 = function write_fixed64(value) {
    var bits = LongBits.from(value);
    return this.push(writeFixed32, 4, bits.lo).push(writeFixed32, 4, bits.hi);
};

/**
 * Writes a 64 bit value as fixed 64 bits, zig-zag encoded.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
WriterPrototype.sfixed64 = function write_sfixed64(value) {
    var bits = LongBits.from(value).zzEncode();
    return this.push(writeFixed32, 4, bits.lo).push(writeFixed32, 4, bits.hi);
};

var writeFloat = typeof Float32Array !== "undefined"
    ? (function() {
        var f32 = new Float32Array(1),
            f8b = new Uint8Array(f32.buffer);
        f32[0] = -0;
        return f8b[3] // already le?
            ? function writeFloat_f32(val, buf, pos) {
                f32[0] = val;
                buf[pos++] = f8b[0];
                buf[pos++] = f8b[1];
                buf[pos++] = f8b[2];
                buf[pos  ] = f8b[3];
            }
            /* istanbul ignore next */
            : function writeFloat_f32_le(val, buf, pos) {
                f32[0] = val;
                buf[pos++] = f8b[3];
                buf[pos++] = f8b[2];
                buf[pos++] = f8b[1];
                buf[pos  ] = f8b[0];
            };
    })()
    /* istanbul ignore next */
    : function writeFloat_ieee754(value, buf, pos) {
        var sign = value < 0 ? 1 : 0;
        if (sign)
            value = -value;
        if (value === 0)
            writeFixed32(1 / value > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos);
        else if (isNaN(value))
            writeFixed32(2147483647, buf, pos);
        else if (value > 3.4028234663852886e+38) // +-Infinity
            writeFixed32((sign << 31 | 2139095040) >>> 0, buf, pos);
        else if (value < 1.1754943508222875e-38) // denormal
            writeFixed32((sign << 31 | Math.round(value / 1.401298464324817e-45)) >>> 0, buf, pos);
        else {
            var exponent = Math.floor(Math.log(value) / Math.LN2),
                mantissa = Math.round(value * Math.pow(2, -exponent) * 8388608) & 8388607;
            writeFixed32((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
        }
    };

/**
 * Writes a float (32 bit).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
WriterPrototype.float = function write_float(value) {
    return this.push(writeFloat, 4, value);
};

var writeDouble = typeof Float64Array !== "undefined"
    ? (function() {
        var f64 = new Float64Array(1),
            f8b = new Uint8Array(f64.buffer);
        f64[0] = -0;
        return f8b[7] // already le?
            ? function writeDouble_f64(val, buf, pos) {
                f64[0] = val;
                buf[pos++] = f8b[0];
                buf[pos++] = f8b[1];
                buf[pos++] = f8b[2];
                buf[pos++] = f8b[3];
                buf[pos++] = f8b[4];
                buf[pos++] = f8b[5];
                buf[pos++] = f8b[6];
                buf[pos  ] = f8b[7];
            }
            /* istanbul ignore next */
            : function writeDouble_f64_le(val, buf, pos) {
                f64[0] = val;
                buf[pos++] = f8b[7];
                buf[pos++] = f8b[6];
                buf[pos++] = f8b[5];
                buf[pos++] = f8b[4];
                buf[pos++] = f8b[3];
                buf[pos++] = f8b[2];
                buf[pos++] = f8b[1];
                buf[pos  ] = f8b[0];
            };
    })()
    /* istanbul ignore next */
    : function writeDouble_ieee754(value, buf, pos) {
        var sign = value < 0 ? 1 : 0;
        if (sign)
            value = -value;
        if (value === 0) {
            writeFixed32(0, buf, pos);
            writeFixed32(1 / value > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos + 4);
        } else if (isNaN(value)) {
            writeFixed32(4294967295, buf, pos);
            writeFixed32(2147483647, buf, pos + 4);
        } else if (value > 1.7976931348623157e+308) { // +-Infinity
            writeFixed32(0, buf, pos);
            writeFixed32((sign << 31 | 2146435072) >>> 0, buf, pos + 4);
        } else {
            var mantissa;
            if (value < 2.2250738585072014e-308) { // denormal
                mantissa = value / 5e-324;
                writeFixed32(mantissa >>> 0, buf, pos);
                writeFixed32((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + 4);
            } else {
                var exponent = Math.floor(Math.log(value) / Math.LN2);
                if (exponent === 1024)
                    exponent = 1023;
                mantissa = value * Math.pow(2, -exponent);
                writeFixed32(mantissa * 4503599627370496 >>> 0, buf, pos);
                writeFixed32((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + 4);
            }
        }
    };

/**
 * Writes a double (64 bit float).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
WriterPrototype.double = function write_double(value) {
    return this.push(writeDouble, 8, value);
};

var writeBytes = util.Array.prototype.set
    ? function writeBytes_set(val, buf, pos) {
        buf.set(val, pos); // also works for plain array values
    }
    /* istanbul ignore next */
    : function writeBytes_for(val, buf, pos) {
        for (var i = 0; i < val.length; ++i)
            buf[pos + i] = val[i];
    };

/**
 * Writes a sequence of bytes.
 * @param {Uint8Array|string} value Buffer or base64 encoded string to write
 * @returns {Writer} `this`
 */
WriterPrototype.bytes = function write_bytes(value) {
    var len = value.length >>> 0;
    if (!len)
        return this.push(writeByte, 1, 0);
    if (typeof value === "string") {
        var buf = Writer.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
    }
    return this.uint32(len).push(writeBytes, len, value);
};

/**
 * Writes a string.
 * @param {string} value Value to write
 * @returns {Writer} `this`
 */
WriterPrototype.string = function write_string(value) {
    var len = utf8.length(value);
    return len
        ? this.uint32(len).push(utf8.write, len, value)
        : this.push(writeByte, 1, 0);
};

/**
 * Forks this writer's state by pushing it to a stack.
 * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
 * @returns {Writer} `this`
 */
WriterPrototype.fork = function fork() {
    this.states = new State(this);
    this.head = this.tail = new Op(noop, 0, 0);
    this.len = 0;
    return this;
};

/**
 * Resets this instance to the last state.
 * @returns {Writer} `this`
 */
WriterPrototype.reset = function reset() {
    if (this.states) {
        this.head   = this.states.head;
        this.tail   = this.states.tail;
        this.len    = this.states.len;
        this.states = this.states.next;
    } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len  = 0;
    }
    return this;
};

/**
 * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
 * @returns {Writer} `this`
 */
WriterPrototype.ldelim = function ldelim() {
    var head = this.head,
        tail = this.tail,
        len  = this.len;
    this.reset().uint32(len);
    if (len) {
        this.tail.next = head.next; // skip noop
        this.tail = tail;
        this.len += len;
    }
    return this;
};

/**
 * Finishes the write operation.
 * @returns {Uint8Array} Finished buffer
 */
WriterPrototype.finish = function finish() {
    var head = this.head.next, // skip noop
        buf  = this.constructor.alloc(this.len),
        pos  = 0;
    while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
    }
    // this.head = this.tail = null;
    return buf;
};

},{"./util/runtime":9,"./writer_buffer":11}],11:[function(require,module,exports){
"use strict";
module.exports = BufferWriter;

// extends Writer
var Writer = require("./writer");
/** @alias BufferWriter.prototype */
var BufferWriterPrototype = BufferWriter.prototype = Object.create(Writer.prototype);
BufferWriterPrototype.constructor = BufferWriter;

var util = require("./util/runtime");

var Buffer = util.Buffer;

/**
 * Constructs a new buffer writer instance.
 * @classdesc Wire format writer using node buffers.
 * @extends Writer
 * @constructor
 */
function BufferWriter() {
    Writer.call(this);
}

/**
 * Allocates a buffer of the specified size.
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */
BufferWriter.alloc = function alloc_buffer(size) {
    return (BufferWriter.alloc = Buffer.allocUnsafe)(size);
};

var writeBytesBuffer = Buffer && Buffer.prototype instanceof Uint8Array && Buffer.prototype.set.name === "set"
    ? function writeBytesBuffer_set(val, buf, pos) {
        buf.set(val, pos); // faster than copy (requires node >= 4 where Buffers extend Uint8Array and set is properly inherited)
                           // also works for plain array values
    }
    /* istanbul ignore next */
    : function writeBytesBuffer_copy(val, buf, pos) {
        if (val.copy) // Buffer values
            val.copy(buf, pos, 0, val.length);
        else for (var i = 0; i < val.length;) // plain array values
            buf[pos++] = val[i++];
    };

/**
 * @override
 */
BufferWriterPrototype.bytes = function write_bytes_buffer(value) {
    if (typeof value === "string")
        value = Buffer.from(value, "base64"); // polyfilled
    var len = value.length >>> 0;
    this.uint32(len);
    if (len)
        this.push(writeBytesBuffer, len, value);
    return this;
};

function writeStringBuffer(val, buf, pos) {
    if (val.length < 40) // plain js is faster for short strings (probably due to redundant assertions)
        util.utf8.write(val, buf, pos);
    else
        buf.utf8Write(val, pos);
}

/**
 * @override
 */
BufferWriterPrototype.string = function write_string_buffer(value) {
    var len = Buffer.byteLength(value);
    this.uint32(len);
    if (len)
        this.push(writeStringBuffer, len, value);
    return this;
};

},{"./util/runtime":9,"./writer":10}],12:[function(require,module,exports){
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

},{"protobufjs/runtime":5}]},{},[12]);
