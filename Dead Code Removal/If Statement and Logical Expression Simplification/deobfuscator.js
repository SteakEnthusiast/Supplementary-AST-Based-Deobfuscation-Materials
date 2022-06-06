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
   const simplifyIfAndLogicalVisitor = {
     "ConditionalExpression|IfStatement"(path) {
       let { consequent, alternate } = path.node;
       let testPath = path.get("test");
       const value = testPath.evaluateTruthy();
       if (value === true) {
         if (t.isBlockStatement(consequent)) {
           consequent = consequent.body;
         }
         path.replaceWithMultiple(consequent);
       } else if (value === false) {
         if (alternate != null) {
           if (t.isBlockStatement(alternate)) {
             alternate = alternate.body;
           }
           path.replaceWithMultiple(alternate);
         } else {
           path.remove();
         }
       }
     },
   };
 
   // Execute the visitor
   traverse(ast, simplifyIfAndLogicalVisitor);
 
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
 
 deobfuscate(readFileSync("./unreachableLogicalCodeObfuscated.js", "utf8"));
 