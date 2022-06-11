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
      const left = path.get("left");
      const right = path.get("right");
      const operator = path.get("operator").node;

      if (t.isStringLiteral(left.node) && t.isStringLiteral(right.node)) {
        // In this case, we can use the old algorithm
        // Evaluate the binary expression
        let { confident, value } = path.evaluate();
        // Skip if not confident
        if (!confident) return;
        // Create a new node, infer the type
        let actualVal = t.valueToNode(value);
        // Skip if not a Literal type (ex. StringLiteral, NumericLiteral, Boolean Literal etc.)
        if (!t.isStringLiteral(actualVal)) return;
        // Replace the BinaryExpression with the simplified value
        path.replaceWith(actualVal);
      } else {
        // Check if the right side is a StringLiteral. If it isn't, skip this node by returning.
        if (!t.isStringLiteral(right.node)) return;
        //Check if the right sideis a StringLiteral. If it isn't, skip this node by returning.
        if (!t.isStringLiteral(left.node.right)) return;
        // Check if the operator is addition (+). If it isn't, skip this node by returning.
        if (operator !== "+") return;

        // If all conditions are fine:

        // Evaluate the _right-most edge of the left-side_ + the right side;
        let concatResult = t.StringLiteral(
          left.node.right.value + right.node.value
        );
        // Replace the _right-most edge of the left-side_ with `concatResult`.
        left.get("right").replaceWith(concatResult);
        //Remove the original right side of the expression as it is now a duplicate.
        right.remove();
      }
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

deobfuscate(readFileSync("./splitStringsObfuscated.js", "utf8"));
