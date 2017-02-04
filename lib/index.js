"use strict";
const visitor_1 = require("./visitor");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "JSONSchema",
    annotations: {
        /*records: {
            gotags: {
                arguments: '[string]|string',
                description: "Generate struct tags on all fields"
            },
            doc: {
                arguments: "string",
                description: "Generate documenting comments"
            }
        },*/
        properties: {
            schemaformat: {
                arguments: 'string',
                description: ""
            },
            doc: {
                arguments: "string"
            }
        }
    },
    transform: (item, options) => {
        let visitor = new visitor_1.JSONSchemaVisitor();
        let json = visitor.parse(item);
        return Promise.resolve(json);
    }
};
