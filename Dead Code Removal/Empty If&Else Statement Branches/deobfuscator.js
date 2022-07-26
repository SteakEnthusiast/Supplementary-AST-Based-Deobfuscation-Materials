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
 
   // Visitor for dead branch removal
   const removeDeadIfBranch = {
     IfStatement: {
       exit(path) {
         ast;
         let { consequent, alternate, test } = path.node;
         if (shouldRemove(alternate)) {
           delete path.node.alternate;
         }
         if (shouldRemove(consequent) && alternate != null) {
           delete path.node.alernate;
           if (t.isBlockStatement(alternate)) {
             path.replaceWith(
               t.ifStatement(t.unaryExpression("!", test), alternate)
             );
           } else if (t.isIfStatement(alternate)) {
             path.replaceWith(
               t.ifStatement(t.unaryExpression("!", test), alternate)
             );
           }
           
         } else if (shouldRemove(consequent) && alternate == null) {
           path.remove();
         }
       },
     },
   };
   const removeEmptyBlockStatements = {
     BlockStatement(path) {
       if (path.node.body.length == 0) path.remove();
     },
   };
   function shouldRemove(node) {
     if (t.isBlockStatement(node)) {
       if (node.body.length == 0) {
         return true;
       } else if (
         node.body.every(t.isEmptyStatement) ||
         node.body.every(shouldRemove)
       ) {
         return true;
       }
     } else if (t.isEmptyStatement(node)) {
       return true;
     }
     return false;
   }
   // Execute the visitor
   traverse(ast, removeDeadIfBranch);
   // cleanup empty block statements resulting from removal
   traverse(ast, removeEmptyBlockStatements);
 
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
 
 deobfuscate(readFileSync("./emptyIfElseBranches.js", "utf8"));
 