import {ImportedPackageExpression, TranspileOptions, IResult} from 'ceveral-compiler'
import {JSONSchemaVisitor} from './visitor';

export default {
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
    transform: (item: ImportedPackageExpression, options: TranspileOptions): Promise<IResult[]> => {
        let visitor = new JSONSchemaVisitor();
        let json = visitor.parse(item);

        return Promise.resolve(json);
    }
}
