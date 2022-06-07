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
  const simplifyBinaryExpressions = {
    FunctionDeclaration(path) {
      const { node, scope } = path;
      const { id, body, params } = node;
      if (!t.isReturnStatement(body.body[0])) return;
      const proxyExpression = body.body[0].argument;
      if (
        !t.isBinaryExpression(proxyExpression) &&
        !t.isUnaryExpression(proxyExpression)
      )
        return;

      const { constant, referencePaths } = scope.getBinding(id.name);
      if (!constant) return;
      for (let referencePath of referencePaths) {
        let { parentPath } = referencePath;

        if (!t.isCallExpression(parentPath)) return;

        const proxyExpressionCopyAst = parser.parse(
          generate(proxyExpression).code
        );
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
        traverse(proxyExpressionCopyAst, replaceVarsInExpressionWithArguments);
        parentPath.replaceWithMultiple(proxyExpressionCopyAst.program.body);
      }
      path.remove();
    },
  };

  // Execute the visitor
  traverse(ast, simplifyBinaryExpressions);

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
