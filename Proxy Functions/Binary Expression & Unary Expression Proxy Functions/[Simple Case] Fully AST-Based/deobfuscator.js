/**
 * Deobfuscator.js
 * The babel script used to deobfuscate the target file
 *
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
      if (id.name == "leftShift") debugger;
      if (!t.isReturnStatement(body.body[0])) return;
      const proxyExpression = body.body[0].argument;
      if (
        !t.isBinaryExpression(proxyExpression) &&
        !t.isUnaryExpression(proxyExpression)
      )
        return;
      let left, right, operator;
      let functionObj;
      if (t.isBinaryExpression(proxyExpression)) {
        if (params.length !== 2) return;
        let leftParamFirst;
        ({ left, right, operator } = proxyExpression);
        if (left.name == params[0].name && right.name == params[1].name) {
          leftParamFirst = true;
        } else if (
          left.name == params[1].name &&
          right.name == params[0].name
        ) {
          leftParamFirst = false;
        } else {
          console.log("Don't know how to handle: \n", generate(path.node).code);
          return;
        }

        functionObj = {
          operator: operator,
          type: "BinaryExpression",
          leftParamFirst: leftParamFirst,
        };
      } else if (t.isUnaryExpression(proxyExpression)) {
        if (params.length !== 1) return;
        ({ operator } = proxyExpression);
        functionObj = {
          operator: operator,
          type: "UnaryExpression",
        };
      }

      const { constant, referencePaths } = scope.getBinding(id.name);
      if (!constant) return;
      for (let referencePath of referencePaths) {
        let { parentPath } = referencePath;

        if (!t.isCallExpression(parentPath)) return;
        let { arguments } = parentPath.node;
        if (functionObj.type === "BinaryExpression") {
          if (functionObj.leftParamFirst) {
            parentPath.replaceWith(
              t.binaryExpression(
                functionObj.operator,
                arguments[0],
                arguments[1]
              )
            );
          } else {
            parentPath.replaceWith(
              t.binaryExpression(
                functionObj.operator,
                arguments[1],
                arguments[0]
              )
            );
          }
        } else if (functionObj.type === "UnaryExpression") {
          parentPath.replaceWith(
            t.unaryExpression(functionObj.operator, arguments[0])
          );
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
