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

  // Visitor for replacing constants

  const replaceRefsToConstants = {
    VariableDeclarator(path) {
      const { id, init } = path.node;
      // Ensure the the variable is initialized to a Literal type.
      if (!t.isLiteral(init)) return; 
      let {constant, referencePaths} = path.scope.getBinding(id.name);
      // Make sure it's constant
      if (!constant) return;
      // Loop through all references and replace them with the actual value.
      for (let referencedPath of referencePaths) { 
        referencedPath.replaceWith(init);
      }
      // Delete the now useless VariableDeclarator
      path.remove();
    },
  };

  // Execute the visitor
  traverse(ast, replaceRefsToConstants);

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

deobfuscate(readFileSync("./constantReferencesObfuscated.js", "utf8"));
