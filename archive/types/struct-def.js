import * as _ from "lodash";
let architecture = 0;
export var Types;
(function (Types) {
    Types[Types["INT"] = 0] = "INT";
    Types[Types["CHAR"] = 1] = "CHAR";
    Types[Types["VOID"] = 2] = "VOID";
    Types[Types["CUSTOM"] = 3] = "CUSTOM";
    Types[Types["INVALID"] = 4] = "INVALID";
})(Types || (Types = {}));
export class Struct {
    constructor(def, data) {
        this.def = def;
        this.data = data;
        this.fields = [];
        this.parse();
    }
    parse() {
        let i = 0;
        this.def.fields.forEach(fieldDef => {
            try {
                const field = new Field(fieldDef, this.data, i);
                this.fields.push(field);
                i += field.length;
            }
            catch (error) {
                console.log("Failed to parse field", error);
                console.log(JSON.stringify(fieldDef));
            }
        });
    }
}
export class Field {
    constructor(def, data, index) {
        this.def = def;
        this.name = def.name;
        this.data = data;
        this.parse(index);
    }
    parse(i) {
        if (this.def.pointer) {
            switch (architecture) {
                case 32:
                    this.value = this.data.readUInt32LE(i);
                    break;
                case 64:
                    this.value =
                        (this.data.readUInt32LE(i) << 32) | this.data.readUInt32LE(i + 4);
                    break;
                default:
                    throw new Error("invalid architecture");
            }
            this.length = architecture / 8;
        }
        else if (this.def.type === Types.INT) {
            switch (this.def.width) {
                case 8:
                    this.value = this.data.readUInt8(i);
                    break;
                case 16:
                    this.value = this.data.readUInt16LE(i);
                    break;
                case 32:
                    this.value = this.data.readUInt32LE(i);
                    break;
                case 64:
                    this.value =
                        (this.data.readUInt32LE(i) << 32) | this.data.readUInt32LE(i + 4);
                    break;
                default:
                    throw new Error("Invalid width");
            }
            this.length = this.def.width / 8;
        }
        else if (this.def.type === Types.CHAR) {
            if (this.def.arrayElements === 0) {
                this.value = String.fromCharCode(this.data.readInt8(i));
                this.length = 1;
            }
            else if (this.def.arrayElements > 0) {
                this.value = this.data
                    .slice(i, this.def.arrayElements)
                    .toString("ascii");
                this.length = this.def.arrayElements;
            }
        }
        // Set output/string value
        if (this.def.pointer) {
            const pointerValue = this.value;
            this.output = pointerValue.toString(16);
        }
        else {
            this.output = this.value.toString();
        }
    }
}
export class FieldDef {
    constructor(text) {
        this.unsigned = false;
        this.width = 0;
        this.pointer = false;
        this.arrayElements = 0;
        this.text = text;
        this.parse();
    }
    parse() {
        const tokens = _.isString(this.text) ? this.text.split(" ") : this.text;
        const type = tokens[0];
        this.name = tokens[1];
        let match;
        if (!!(match = type.match(/^[ui](8|16|32|64)/))) {
            this.type = Types.INT;
            this.unsigned = type[0] === "u";
            this.width = parseInt(match[1], 10);
        }
        else if (!!(match = type.match(/^u?char/))) {
            this.type = Types.CHAR;
            this.unsigned = type[0] === "u";
            this.width = 8;
        }
        else if (!!(match = type.match(/^void/))) {
            this.type = Types.VOID;
            this.unsigned = true;
            this.width = architecture;
        }
        else if (!!(match = type.match(/^[a-zA-Z0-9_\*\[\]]+$/))) {
            this.type = Types.CUSTOM;
        }
        else {
            throw Error("Invalid type");
        }
        if (!!(match = type.match(/\[([0-9]+)\]/))) {
            this.arrayElements = parseInt(match[1], 10);
        }
        if (!!(match = type.match(/\*/))) {
            this.pointer = true;
        }
        // Validate field
        // TODO: Better validation
        if (this.type === Types.VOID && !this.pointer) {
            throw new Error("Void type must be pointer");
        }
    }
}
export class StructDef {
    constructor(text) {
        this.fields = [];
        this.text = text;
        this.parse();
    }
    parse() {
        if (!architecture) {
            throw new Error("Must set architecture");
        }
        this.name = name;
        this.text.split("\n").forEach(line => {
            if (!line || line.length === 0) {
                return;
            }
            const tokens = line.trim().split(" ");
            if (tokens.length !== 2) {
                throw new Error(`Invalid field definition: ${tokens.length} tokens in ${line}`);
            }
            if (tokens[0] === "struct") {
                this.name = tokens[1];
            }
            else {
                if (!this.name) {
                    throw new Error("Field definitions not in struct");
                }
                const field = new FieldDef(tokens);
                this.fields.push(field);
            }
        });
    }
}
export const arch = arch => {
    if (arch !== 32 && arch !== 64) {
        throw new Error("Architecture must be 32 or 64 bit");
    }
    architecture = arch;
};
//# sourceMappingURL=struct-def.js.map