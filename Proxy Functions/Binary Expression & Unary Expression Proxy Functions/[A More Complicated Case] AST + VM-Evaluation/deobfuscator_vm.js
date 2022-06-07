/**
 * deobfuscator_vm.js
 * The babel script used to deobfuscate the target file
 *
 */
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generate = require("@babel/generator").default;
const beautify = require("js-beautify");
const { readFileSync, writeFile } = require("fs");
const vm = require("vm");

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
      const context = vm.createContext();
      // Add to context
      vm.runInContext(generate(path.node).code, context);
      const { constant, referencePaths } = scope.getBinding(id.name);
      if (!constant) return;
      for (let referencePath of referencePaths) {
        let { parentPath } = referencePath;

        if (!t.isCallExpression(parentPath)) return;
        try {
          let evaluatedValue = vm.runInContext(
            generate(parentPath.node).code,
            context
          );
          parentPath.replaceWith(t.valueToNode(evaluatedValue));
        } catch (e) {
          console.log(e);
          return;
        }
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
  let outputPath = "output_vm.js";
  writeFile(outputPath, code, (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log(`Wrote file to ${outputPath}`);
    }
  });
}

deobfuscate(readFileSync("./binaryAndUnaryProxyFuncsObfuscated.js", "utf8"));
