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

  const replaceSequenceInReturn = {
    ReturnStatement(path) {
      const { node } = path;

      if (t.isSequenceExpression(node.argument)) {
        const expressionArr = [];
        const { expressions } = node.argument;
        expressions.forEach((node, indx) => {
          if (indx !== expressions.length - 1) {
            expressionArr.push(node);
          } else {
            expressionArr.push(t.returnStatement(node));
          }
        });
        path.replaceWithMultiple(expressionArr);
      }
    },
  };

  // Execute the visitor
  traverse(ast, replaceSequenceInReturn);

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

deobfuscate(readFileSync("./sequenceExprInReturn.js", "utf8"));
