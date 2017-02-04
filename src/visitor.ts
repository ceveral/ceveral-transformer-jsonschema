import { BaseVisitor, IResult, ValidationError, Token, Type, ImportedPackageExpression, RecordExpression,
    AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression,
    RepeatedTypeExpression, MapTypeExpression, OptionalTypeExpression, RecordTypeExpression,
    StringEnumExpression,StringEnumMemberExpression,NumericEnumExpression, NumericEnumMemberExpression
} from 'ceveral-compiler';

export class JSONSchemaVisitor extends BaseVisitor {
    optional: boolean;
    required: string[];
    package: ImportedPackageExpression;
    parse(expression: ImportedPackageExpression): IResult[] {
        let results = this.visit(expression);

        return results.map(m => {
            return {
                filename: m.title.toLowerCase() + ".json",
                buffer: new Buffer(JSON.stringify(m, null, 2))
            }
        });
    }

    visitPackage(expression: ImportedPackageExpression): any {
        this.package = expression;
        let records = expression.children.filter(m => m.nodeType == Token.Record).map(m => this.visit(m));
        return records;
    }
    visitRecordType(expression: RecordTypeExpression): any {
        let oldOptional = this.optional;
        let oldRequired = this.required;
        this.optional = false;
        this.required = [];

        let r = this.package.children.find(m => m.nodeType == Token.Record && (<any>m).name == expression.name);

        let out = this.visit(r);
        delete out['$schema'];

        this.optional = oldOptional;
        this.required = oldRequired

        return out;
    }
    visitRecord(expression: RecordExpression): any {
        this.required = [];
        let properties: any = expression.properties.map(this.visit.bind(this));
        let props = {};
        for (let p of properties) {
            props[p.title] = p;
            delete props[p.title].title;
        }
        return {
            "$schema": "http://json-schema.org/draft-04/schema#",
            "type": "object",
            "title": expression.name,
            "properties": props,
            "required": this.required,
            "description": expression.get('doc') || ""
        }
    }
    visitProperty(expression: PropertyExpression): any {
        this.optional = false;
        let type = this.visit(expression.type);
        type.title = expression.name;
        let format = expression.get('schemaformat');
        if (format) type.format = format;
        if (!this.optional) {
            this.required.push(type.title)
        } else {
            type.type = [type.type, 'null'];
        }

        let doc = expression.get('doc');
        if (doc) type.description = doc;
        return type;
    }
    visitType(expression: TypeExpression): any {
        let out: any = {}
        out.type = (function () {
            switch (expression.type) {
                case Type.String: return "string";
                case Type.Date:
                    out.format = 'date-time';
                    return 'string';
                case Type.Boolean: return 'boolean';
                default: return "number";
            }
        })()

        return out;
    }
    visitImportType(expression: ImportTypeExpression): any {

        let i = this.package.imports.find(m => m.name == expression.packageName);
        let r = i.children.find(m => m.nodeType == Token.Record && (<any>m).name == expression.name);

        let oldOptional = this.optional;
        let oldRequired = this.required;
        let oldPackage = this.package

        this.optional = false;
        this.required = [];
        this.package = i;
        let out = this.visit(r);
        delete out['$schema'];

        this.optional = oldOptional;
        this.required = oldRequired;
        this.package = oldPackage;
        return out;
    }
    visitOptionalType(expression: OptionalTypeExpression): any {
        this.optional = true;
        return this.visit(expression.type);
    }
    visitRepeatedType(expression: RepeatedTypeExpression): any {
        return { type: 'array', items: this.visit(expression.type) };
    }
    visitMapType(expression: MapTypeExpression): any {
        if ((<any>expression.key).type !== Type.String) {
            throw new Error('map key must be a string')
        }
        return { type: 'object', additionalProperties: true };
    }
    visitAnnotation(expression: AnnotationExpression): any {
        let formats = ['uri', 'email', 'date-time'];
        if (expression.name === 'schemaformat') {
            if (formats.indexOf(expression.args) === -1)
                throw new ValidationError("schemaformat must be " + formats.join('|'));
        }
        return expression;
    }

    visitNumericEnum(expression: NumericEnumExpression): any {
        
        return 
    }

    visitNumericEnumMember(expression: NumericEnumMemberExpression): any {
        
        return
    }
    visitStringEnum(expression: StringEnumExpression): any {
        return
    }
    visitStringEnumMember(expression: StringEnumMemberExpression): any {
        return
    }



}