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
        // The VariableDeclaration node must declare only ONE variable.
        declarations.length !== 1 ||
        // It's corresponding VariableDeclarator node must have an init property of type ArrayExpression
        !t.isArrayExpression(declarations[0].init)
      )
        return; //skip

      const stringArrayElements = [];
      for (const elementNode of declarations[0].init.elements) {
        // ALL of the elements of the ArrayExpression_must be of type StringLiteral
        if (!t.isStringLiteral(elementNode)) return;
        else {
          // Store a copy of all its elements in a variable
          stringArrayElements.push(elementNode);
        }
      }
      // Store the string array's name in a variable
      const stringArrayName = declarations[0].id.name;
      // Get the path of the identifier. By using this path, we ensure we will ALWAYS correctly refer to the scope of the array
      const idPath = path.get("declarations.0.id");
      // Get the binding of the array.
      const binding = idPath.scope.getBinding(stringArrayName);

      if (!binding) return;

      const { constant, referencePaths } = binding;

      // This wouldn't be safe if the array was not constant.
      if (!constant) return;
      // This decides if we can remove the array or not.
      // If there are any references to the array that cannot be replaced, it is unsafe to remove the original VariableDeclaration.
      let shouldRemove = true;

      for (const referencePath of referencePaths) {
        const { parentPath: refParentPath } = referencePath;
        const { object, computed, property } = refParentPath.node;
        // Criteria to be a valid path for replacement:
        // The refParent must be of type MemberExpression
        // The "object" field of the refParent must be a reference to the array (the original referencePath)
        // The "computed" field of the refParent must be true (indicating use of bracket notation)
        // The "property" field of the refParent must be a numeric literal, so we can access the corresponding element of the array by index.
        if (
          !(
            t.isMemberExpression(refParentPath.node) &&
            object == referencePath.node &&
            computed == true &&
            t.isNumericLiteral(property)
          )
        ) {
          // If the above conditions aren't met, we've run into a reference that can't be replaced.
          // Therefore, it'd be unsafe to remove the original variable declaration, since it will still be referenced after our transformation has completed.
          shouldRemove = false;
          continue;
        }

        // If the above conditions are met:

        // Replace the parentPath of the referencePath (the actual MemberExpression) with it's actual value.

        refParentPath.replaceWith(stringArrayElements[property.value]);
      }

      if (shouldRemove) path.remove();
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
