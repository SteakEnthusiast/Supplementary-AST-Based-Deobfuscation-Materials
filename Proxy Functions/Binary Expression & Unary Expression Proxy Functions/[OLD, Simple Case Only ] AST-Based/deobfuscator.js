/**
 * Deobfuscator.js
 * The babel script used to deobfuscate the target file
 * THIS IS OLD AND WILL NOT BE INCLUDED IN THE FINAL ARTICLE
 * This deobfuscator only handles a specific simple case. I've added an error check to show where this deobfuscator would break. The one in "../AST-Based Simplfication" should do the trick better.
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
      // Make sure function returns immediately
      if (!t.isReturnStatement(body.body[0])) return;
      const proxyExpression = body.body[0].argument;
      // Only apply this function to BinaryExpressions and UnaryExpressions
      if (
        !t.isBinaryExpression(proxyExpression) &&
        !t.isUnaryExpression(proxyExpression)
      )
        return;
      let left, right, operator;
      /**
       * We'll modify this object based on if it's a BinaryExpression or UnaryExpression
       * If it's a BinaryExpression, functionObj will have a property 'leftParamFirst' that indicates whether the first argument is first
       * ex.
       * function add(a, b) {
       *    return a + b;
       * }
       * => leftParamFirst = true
       *
       * function subtract(a, b) {
       *   return b - a;
       * }
       * => leftParamFirst = false
       *
       * We don't need to worry about this for a UnaryExpression
       */

      let functionObj;

      if (t.isBinaryExpression(proxyExpression)) {
        // This only handles 2 parameter functions
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
          /**Unfortunately, this function cannot handle more complex operations like:
           *
           * function multiple(a, b) {
           *    return a + !b;
           * }
           *
           */
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
      // Iterate over all times the proxy function is referenced.
      // referencePath will be a path to an Identifier. To get the CallExpression path, we should get it's parentPath

      // This will become false if the function is referenced, but not within a CallExpression. In that case, we can't remove the original function, but we can still simplify all calls to it
      let shouldDelete = true;
      for (let referencePath of referencePaths) {
        let { parentPath } = referencePath;

        if (!t.isCallExpression(parentPath)) {
          shouldDelete = false;
        }
        let { arguments } = parentPath.node;
        if (functionObj.type === "BinaryExpression") {
          // Case: left parameter goes first
          if (functionObj.leftParamFirst) {
            parentPath.replaceWith(
              t.binaryExpression(
                functionObj.operator,
                arguments[0],
                arguments[1]
              )
            );
          } else {
            // Case: right parameter goes first
            parentPath.replaceWith(
              t.binaryExpression(
                functionObj.operator,
                arguments[1],
                arguments[0]
              )
            );
          }
          // Case: UnaryExpression
        } else if (functionObj.type === "UnaryExpression") {
          parentPath.replaceWith(
            t.unaryExpression(functionObj.operator, arguments[0])
          );
        }
      }
      if (shouldDelete) {
        path.remove();
      }
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
