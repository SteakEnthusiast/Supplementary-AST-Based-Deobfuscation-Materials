/**
 * Encrypter.js
 * The babel script used to obfuscate the file with XOR string concealing.
 *
 */
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generate = require("@babel/generator").default;
const beautify = require("js-beautify");
const { readFileSync, writeFile } = require("fs");

function xorCrypt(str, key) {
  var output = "";

  if (!key) {
    key = 6;
  }

  for (var i = 0; i < str.length; ++i) {
    output += String.fromCharCode(key ^ str.charCodeAt(i));
  }

  return output;
}
/**
 * Main function to obfuscate the code.
 * @param source The source code of the file to be obfuscated
 *
 */
function encrypt(source) {
  //Parse AST of Source Code
  const ast = parser.parse(source);

  const encryptStrings = {
    StringLiteral(path) {
      let rand = Math.round(Math.random() * 100000000);
      let obbedString = xorCrypt(path.node.value, rand);
      path.replaceWith(
        t.callExpression(t.identifier("_0x2720d7"), [
          t.stringLiteral(obbedString),
          t.numericLiteral(rand),
        ])
      );
      path.skip();
    },
    MemberExpression(path) {
      let { object, property } = path.node;

      if (t.isIdentifier(property)) {
        let rand = Math.round(Math.random() * 1000000000000000);
        let obbedString = xorCrypt(property.name, rand);
        path.replaceWith(
          t.memberExpression(
            object,
            t.callExpression(t.identifier("_0x2720d7"), [
              t.stringLiteral(obbedString),
              t.numericLiteral(rand),
            ]),
            true
          )
        );
        path.skip();
      }
    },
  };

  // Execute the visitor

  traverse(ast, encryptStrings);

  // Code Beautification
  let deobfCode = generate(ast, { comments: false }).code;
  deobfCode = beautify(deobfCode, {
    indent_size: 2,
    space_in_empty_paren: true,
  });
  // Output the obfuscated result
  writeCodeToFile(deobfCode);
}
/**
 * Writes the obfuscated code to output.js
 * @param code The obfuscated code
 */
function writeCodeToFile(code) {
  let outputPath = "output1.js";
  writeFile(outputPath, code, (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log(`Wrote file to ${outputPath}`);
    }
  });
}

encrypt(readFileSync("./input.js", "utf8"));
