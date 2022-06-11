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

      // Check if the function references its parameters

      let paramsReferenced = false;
      for (param of params) {
        if (bodyPath.scope.getBinding(param.name)) {
          paramsReferenced = true;
        }
      }
      // This will become false if the function is referenced, but not within a CallExpression. In that case, we can't remove the original function, but we can still simplify all calls to it
      let shouldDelete = true;

      // Iterate through all references to the proxy function
      for (let referencePath of referencePaths) {
        let { parentPath } = referencePath;
        // Make sure it's a call expression
        if (!parentPath.isCallExpression()) {
          shouldDelete = false;
        }

        // If it references the parameters:
        if (paramsReferenced) {
          // Clone all nodes in the function
          let assignmentProxyFuncBodyClone = parser.parse(
            generate(bodyPath.node).code
          );

          // Iterate through all references to the identifiers and replace them with the arguments at time of call
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
          traverse(
            assignmentProxyFuncBodyClone,
            replaceVarsInExpressionWithArguments
          );

          parentPath.replaceWithMultiple(
            assignmentProxyFuncBodyClone.program.body[0].body
          );

          // We could also do:
          // parentPath.replaceWithMultiple(
          //   assignmentProxyFuncBodyClone.program.body
          // );
          // But this would put unecessary block statements in the final code
        }
        // If parameters aren't referenced:
        else {
          parentPath.replaceWithMultiple(bodyPath.node.body);
        }
      }
      if (shouldDelete) {
        path.remove();
      }
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
