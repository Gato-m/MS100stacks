const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Expo SDK 55 can call Array.prototype.toReversed while loading Metro config.
// Node 18 does not have it, so add a minimal compatibility shim.
if (!Array.prototype.toReversed) {
	Object.defineProperty(Array.prototype, "toReversed", {
		value() {
			return [...this].reverse();
		},
		configurable: true,
		writable: true,
	});
}

const config = getDefaultConfig(__dirname);

// Exclude the MS100stacks-clean subfolder so Metro doesn't try to
// resolve modules from that directory's package.json
config.resolver.blockList = [/MS100stacks-clean\/.*/];

module.exports = config;
