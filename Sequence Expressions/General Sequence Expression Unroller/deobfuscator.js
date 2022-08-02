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

  // Visitor for replacing sequence expressions

  const unroll = {
    SequenceExpression(path) {
      const parentPath = path.parentPath;
      const { node } = parentPath;

      if (t.isIfStatement(node)) {
        if (!t.isSequenceExpression(test)) return;
        const { test } = node;
        const { expressions } = test;

        expressions.forEach((expression, index) => {
          if (index !== expressions.length - 1) {
            parentPath.insertBefore(expression);
          } else {
            node.test = expression;
          }
        });
      } else if (t.isReturnStatement(node)) {
        if (t.isSequenceExpression(node.argument)) {
          const { expressions } = node.argument;
          expressions.forEach((node, indx) => {
            if (indx !== expressions.length - 1) {
              parentPath.insertBefore(node);
            } else {
              path.replaceInline(node);
            }
          });
        }
      } else if (t.isVariableDeclarator(node)) {
        const { expressions } = node.init;
        expressions.forEach((node, indx) => {
          if (indx !== expressions.length - 1) {
            parentPath.parentPath.insertBefore(node);
          } else {
            path.replaceInline(node);
          }
        });
      } else if (
        t.isAssignmentExpression(node) ||
        t.isConditionalExpression(node) ||
        t.isLogicalExpression(node) ||
        t.isIfStatement(node) ||
        t.isForStatement(node)
      ) {
        return;
      } else {
        const expressions = path.node.expressions;
        path.replaceInline(expressions);
      }
    },
  };
  // Execute the visitor
  traverse(ast, unroll);

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
