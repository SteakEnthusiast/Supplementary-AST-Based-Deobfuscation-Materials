/**
 * deobfuscator.js
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

  // helper function

  // Visitor for replacing sequence expressions

  const unrollSequenceExpressions = {
    SequenceExpression(path) {
      let replaceOneLevelAboveParent = false;
      const parentPath = path.parentPath;
      const { node } = parentPath;
      const { expressions } = path.node;

      if (t.isVariableDeclarator(node)) {
        replaceOneLevelAboveParent = true;
      }

      if (
        t.isIfStatement(node) ||
        t.isReturnStatement(node) ||
        t.isAssignmentExpression(node) ||
        t.isVariableDeclarator(node)
      ) {
        expressions.forEach((expression, index) => {
          if (index !== expressions.length - 1) {
            replaceOneLevelAboveParent
              ? parentPath.parentPath.insertBefore(expression)
              : parentPath.insertBefore(expression);
          } else {
            path.replaceWithMultiple(expression);
          }
        });
      } else if (
        t.isConditionalExpression(node) ||
        t.isLogicalExpression(node) ||
        t.isFor(node) ||
        t.isWhile(node) ||
        t.isCallExpression(node) ||
        t.isSequenceExpression(node) ||
        t.isArrayExpression(node)
      ) {
        return;
      } else {
        path.replaceWithMultiple(expressions);
      }
    },
  };
  // Execute the visitor
  traverse(ast, unrollSequenceExpressions);

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

deobfuscate(readFileSync("./sequenceExpr.js", "utf8"));
