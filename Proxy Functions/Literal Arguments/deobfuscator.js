/**
 * Deobfuscator.js
 * The babel script used to deobfuscate the target file
 * This script unfortunately doesn't directly remove the proxy functions.
 * Created this because the binaryAndUnaryProxyFuncs deobfuscator I made broke in a certain scenario.
 * Still figuring out the best way to reduce proxy functions
 */
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generate = require("@babel/generator").default;
const beautify = require("js-beautify");
const { readFileSync, writeFile } = require("fs");

/**
 * Main function to deobfuscate the code.
 * @param source The source code of the file to be deobfuscated
 *
 */
function deobfuscate(source) {
  //Parse AST of Source Code
  const ast = parser.parse(source);

  // Visitor for proxy function replacement
  const simplifyProxyCalls = {
    CallExpression: {
      enter(path) {
        const { node } = path;

        if (!t.isIdentifier(node.callee)) return;

        // The following section makes sure that all arguments are literals, binary expressions, or unaryexpressions.
        // Ideally, we want each value to be a literal. So:
        // If it's a binary expression, we attempt to simplify it into a literal value.
        // TODO: Add check for if there is an identifier nested in a unary expression

        let args = path.get("arguments");

        for (const [argIndx, argVal] of args.entries()) {
          if (t.isBinaryExpression(argVal)) {
            const { confident, value } = argVal.evaluate();
            if (!confident) return;
            args[argIndx].replaceWith(t.valueToNode(value));
          } else if (!t.isLiteral(argVal) && !t.isUnaryExpression(argVal))
            return;
        }
        // Get the scope the CallExpression is in
        // Maybe I can directly use 'path.scope.getBinding' instead of getting the parent?
        const parentPath = path.findParent((p) => t.isScopable(p.node));
        if (!parentPath) return;
        const binding = parentPath.scope.getBinding(node.callee.name);
        if (!binding) return;
        // Get the binding of the callee
        const { path: initPath, constant } = binding;

        if (!initPath || !constant) return;
        // Get the init node of the callee

        let init;
        if (t.isFunctionDeclaration(initPath.node)) {
          init = initPath.node;
        } else if (t.isVariableDeclarator(initPath.node)) {
          init = initPath.node.init;
        }

        if (!init) return;
        // Get params and body of the callee functions
        const { params, body } = init;
        if (!params || !body) return;
        const proxyReturn = body.body[0];
        // Make sure that the first/only line of the function is a return statement
        if (!t.isReturnStatement(proxyReturn)) return;

        // Clone the return statement into an AST
        // I still can't figure out a more efficient way of doing this.
        const proxyReturnStatementCopyAst = parser.parse(
          generate(proxyReturn.argument).code
        );

        // We'll use this visitor to replace all of the references to the parameters in the original function body with the literal arguments from the CallExpression.

        const replaceVarsInExpressionWithArguments = {
          Identifier(_path) {
            // Loop through all identifiers in the list of parameters and compare it with the current identifier
            for (let i = 0; i < params.length; i++) {
              if (params[i]?.name == _path.node.name) {
                // Replace the reference to the parameter with it's literal argument from the CallExpression
                _path.replaceWith(args[i].node);
                return;
              }
            }
          },
        };

        // Execute the visitor
        traverse(
          proxyReturnStatementCopyAst,
          replaceVarsInExpressionWithArguments
        );

        // Replace the CallExpression with the modified proxy expression
        path.replaceWithMultiple(proxyReturnStatementCopyAst.program.body);
        parentPath.scope.crawl();
      },
      exit({ scope }) {
        scope.crawl();
      },
    },
  };

  // Execute the visitor
  traverse(ast, simplifyProxyCalls);

  // Code Beautification
  let deobfCode = generate(ast, { comments: false }).code;
  deobfCode = beautify(deobfCode, {
    indent_size: 2,
    space_in_empty_paren: true,
  });
  // Output the deobfuscated result
  writeCodeToFile(deobfCode);
}
/**
 * Writes the deobfuscated code to output.js
 * @param code The deobfuscated code
 */
function writeCodeToFile(code) {
  let outputPath = "output.js";
  writeFile(outputPath, code, (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log(`Wrote file to ${outputPath}`);
    }
  });
}

deobfuscate(readFileSync("./proxyFuncsObfuscated.js", "utf8"));
