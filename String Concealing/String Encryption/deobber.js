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
const vm = require("vm");
const { create } = require("chrome-remote-interface-extra/lib/page/Page");
/**
 * Main function to deobfuscate the code.
 * @param source The source code of the file to be deobfuscated
 *
 */
function deobfuscate(source) {
  //Parse AST of Source Code
  const ast = parser.parse(source);

  const decryptFuncCtx = vm.createContext();
  // Visitor for populating the VM context
  const createDecryptFuncCtxVisitor = {
    FunctionDeclaration(path) {
      const node = path.node;
      if (node.id.name == "_0x2720d7") {// Hard-coded decryption function name for simplification
        const decryptFuncCode = generate(node).code; // Generate the code to execute in context
        vm.runInContext(decryptFuncCode, decryptFuncCtx); // Execute the decryption function delcaration in VM context
        path.remove() // Remove the decryption function since it has served its use
        path.stop(); // stop traversing once the decryption function has been added to the context

      }
    },
  };

  // Visitor for decrypting the string
  const deobfuscateEncryptedStringsVisitor = {
    CallExpression(path) {
      const node = path.node;
      if (node.callee.name == "_0x2720d7") { // Hard-coded decryption function name for simplification
        const expressionCode = generate(node).code; // Convert the CallExpression to code
        const value = vm.runInContext(expressionCode, decryptFuncCtx); // Evaluate the code
        path.replaceWith(t.valueToNode(value)); // Replace the node with the resulting value.
      }
    },
  };
  // Create the context
  traverse(ast, createDecryptFuncCtxVisitor);
  // Decrypt all strings
  traverse(ast, deobfuscateEncryptedStringsVisitor);

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

deobfuscate(readFileSync("./stringEncryptionObfuscated.js", "utf8"));
