/**
 * Deobfuscator.js
 * The babel script used to deobfuscate the target file
 * This is much more useful than the old version, as it can handle multiple operations and parameters.
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

  // Visitor for constant folding
  const simplifyBinaryAndUnaryProxyFunctions = {
    FunctionDeclaration(path) {
      const { node, scope } = path;
      const { id, body, params } = node;
      // Check that function has a one-line body, and returns immediately.
      if (!t.isReturnStatement(body.body[0])) return;
      const proxyExpression = body.body[0].argument;
      // Handle only BinaryExpressions or UnaryExpressions.
      if (
        !t.isBinaryExpression(proxyExpression) &&
        !t.isUnaryExpression(proxyExpression)
      )
        return;

      // This will become false if the function is referenced, but not within a CallExpression. In that case, we can't remove the original function, but we can still simplify all calls to it
      let shouldDelete = true;

      const { constant, referencePaths } = scope.getBinding(id.name);
      // If function is redefined somewhere, don't
      if (!constant) return;

      // Iterate over all times the proxy function is referenced.

      for (let referencePath of referencePaths) {
        // referencePath will be a path to an Identifier. To check if it's contained in a CallExpression, we should check it's parentPath.
        let { parentPath } = referencePath;

        // Don't delete if referenced, but not in a call expression.
        // This is implemented for sake of generality. Perhaps your obfuscated file has a self-integrity check somewhere idk lol
        if (!t.isCallExpression(parentPath)) {
          shouldDelete = false;
        }

        // Clone the expression into it's own AST so we can modify it
        const proxyExpressionCopyAst = parser.parse(
          generate(proxyExpression).code
        );

        // This visitor replaces the variables in the proxy expression with the actual arguments. Correct ordering of the arguments is maintained.
        const replaceVarsInExpressionWithArguments = {
          Identifier(_path) {
            for (let i = 0; i < params.length; i++) {
              if (params[i].name == _path.node.name) {
                _path.replaceWith(parentPath.node.arguments[i]);
                return;
              }
            }
          },
        };

        // Execute the visitor
        traverse(proxyExpressionCopyAst, replaceVarsInExpressionWithArguments);

        // Replace the CallExpression with the modified proxy expression
        parentPath.replaceWithMultiple(proxyExpressionCopyAst.program.body);
      }
      if (shouldDelete) {
        path.remove();
      }
    },
  };

  // Execute the visitor
  traverse(ast, simplifyBinaryAndUnaryProxyFunctions);

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

deobfuscate(readFileSync("./binaryAndUnaryProxyFuncsObfuscated.js", "utf8"));
