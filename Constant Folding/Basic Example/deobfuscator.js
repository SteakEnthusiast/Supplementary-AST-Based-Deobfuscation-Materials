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
  const foldConstantsVisitor = {
    BinaryExpression(path) {
      debugger;
      let { confident, value } = path.evaluate(); // Evaluate the binary expression
      if (!confident) return; // Skip if not confident
      let actualVal = t.valueToNode(value); // Create a new node, infer the type
      if (!t.isLiteral(actualVal)) return; // Skip if not a Literal type (ex. StringLiteral, NumericLiteral, Boolean Literal etc.)
      path.replaceWith(actualVal); // Replace the BinaryExpression with the simplified value
    },
  };

  // Execute the visitor
  traverse(ast, foldConstantsVisitor);

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

deobfuscate(readFileSync("./splitConstantsObfuscated.js", "utf8"));
