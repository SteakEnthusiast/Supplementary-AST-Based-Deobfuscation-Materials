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
  const simplifyAssignmentProxyFunctions = {
    FunctionDeclaration(path) {
      let { node, scope } = path;
      let { params } = node;
      let bodyPath = path.get("body");

      let { referenced, referencePaths } = scope.getBinding(node.id.name);
      // Optional: Check if function is referenced anywhere first to avoid to unecessary work
      if (!referenced) {
        // Dead code!
        path.remove();
      }

      // Make sure that all lines in body are variable assignments
      for (const innerBodyPath of bodyPath.get("body")) {
        if (
          !(
            innerBodyPath.isExpressionStatement() &&
            innerBodyPath.get("expression").isAssignmentExpression()
          )
        )
          return;
      }

      // Make sure parameters aren't referenced
      for (param of params) {
        if (bodyPath.scope.getBinding(param.name)) {
          return;
        }
      }

      //params not referenced
      for (let referencePath of referencePaths) {
        let { parentPath } = referencePath;
        if (!parentPath.isCallExpression()) return;

        parentPath.replaceWithMultiple(bodyPath.node.body);
      }
      path.remove();
    },
  };

  // Execute the visitor
  traverse(ast, simplifyAssignmentProxyFunctions);

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
