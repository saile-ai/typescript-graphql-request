import { extname } from 'path';
import { concatAST, Kind } from 'graphql';
import { oldVisit } from '@graphql-codegen/plugin-helpers';
import { GraphQLRequestVisitor } from "./visitor";
export const plugin = (schema, documents, config) => {
    const allAst = concatAST(documents.map(v => v.document));
    const allFragments = [
        ...allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION).map(fragmentDef => ({
            node: fragmentDef,
            name: fragmentDef.name.value,
            onType: fragmentDef.typeCondition.name.value,
            isExternal: false,
        })),
        ...(config.externalFragments || []),
    ];
    const visitor = new GraphQLRequestVisitor(schema, allFragments, config);
    const visitorResult = oldVisit(allAst, { leave: visitor });
    return {
        prepend: visitor.getImports(),
        content: [
            visitor.fragments,
            ...visitorResult.definitions.filter(t => typeof t === 'string'),
            visitor.sdkContent,
        ].join('\n'),
    };
};
export const validate = async (schema, documents, config, outputFile) => {
    if (!['.ts', '.mts', '.cts'].includes(extname(outputFile))) {
        throw new Error(`Plugin "typescript-graphql-request" requires extension to be ".ts", ".mts" or ".cts"!`);
    }
};
export { GraphQLRequestVisitor };
//# sourceMappingURL=index.js.map