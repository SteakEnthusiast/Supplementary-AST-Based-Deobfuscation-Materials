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
  /**
   * Visitor for removing encoding.
   */

  const deobfuscateStringArrayVisitor = {
    VariableDeclaration(path) {
      const { declarations } = path.node;
      if (
        declarations.length !== 1 || // The VariableDeclaration node must declare only ONE variable.
        !t.isArrayExpression(declarations[0].init) // It's corresponding VariableDeclarator node must have an init property of type ArrayExpression
      ) {
        return; //skip
      }

      const stringArrayElements = [];
      for (const elementNode of declarations[0].init.elements) {
        // ALL of the elements of the ArrayExpression_must be of type StringLiteral
        if (!t.isStringLiteral(elementNode)) {
          return;
        } else {
          stringArrayElements.push(elementNode); // Store a copy of all its elements in a variable
        }
      }
      const stringArrayName = declarations[0].id.name; // Store the string array's name in a variable

      // Traverse the container the string array resides in
      path.parentPath.traverse({
        MemberExpression(innerPath) {
          const { object, property, computed } = innerPath.node;
          if (
            !t.isIdentifier(object) || // Is the referenced object is of type Identifier?
            !computed || // Is the computed property set to true?
            object.name !== stringArrayName || // Is the name of the object's identifier is equal to the name of the string array's identifier?
            !t.isNumericLiteral(property) // Is the property node of type NumericLiteral?
          ) {
            return; // skip
          }
          innerPath.replaceWith(stringArrayElements[property.value]); // Replace MemberExpression with computed value
        },
      });

      path.remove(); // Delete the string array since it's useless now
      path.stop();
    },
  };

  //Parse AST of Source Code
  const ast = parser.parse(source);

  // Execute the visitor
  traverse(ast, deobfuscateStringArrayVisitor);

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

deobfuscate(readFileSync("./stringArrayObfuscated.js", "utf8"));
