const fs = require("fs");

const serviceMap = JSON.parse(
    fs.readFileSync("./services.json", "utf8")
);

function normalizeGetService(code) {
    return code.replace(
        /game:GetService\(\s*\{[^,]+,\s*["']([^"']+)["']\s*\}\s*\)/g,
        'game:GetService("$1")'
    );
}

function standardizeGetService(code) {
    return code.replace(
        /game:GetService\(\s*["']([^"']+)["']\s*\)/g,
        (m, name) => `game:GetService("${name}")`
    );
}

function injectServiceVars(code) {
    const found = [...code.matchAll(/game:GetService\("([^"]+)"\)/g)];

    const used = [...new Set(found.map(m => m[1]))];

    let header = "";

    for (const s of used) {
        header += `local ${s} = game:GetService("${s}")\n`;
    }

    return header + "\n" + code;
}

function cleanFindFirstChild(code) {
    return code.replace(
        /:FindFirstChild\([^,]+,\s*([^)]+)\)/g,
        ":FindFirstChild($1)"
    );
}

function cleanWaitForChild(code) {
    return code.replace(
        /:WaitForChild\([^,]+,\s*([^)]+)\)/g,
        ":WaitForChild($1)"
    );
}

function removeDuplicateServiceVars(code) {
    const seen = new Set();

    return code
        .split("\n")
        .filter(line => {
            if (line.includes("game:GetService")) {
                if (seen.has(line)) return false;
                seen.add(line);
            }
            return true;
        })
        .join("\n");
}

function renameVariables(code) {
    let i = 1;
    return code.replace(/\badd_\d+\b/g, () => `tab_${i++}`);
}

function renameCode(code) {
    let out = code;

    out = normalizeGetService(out);
    out = standardizeGetService(out);

    out = cleanFindFirstChild(out);
    out = cleanWaitForChild(out);

    out = removeDuplicateServiceVars(out);

    out = injectServiceVars(out);

    out = renameVariables(out);

    return out;
}

module.exports = { renameCode };
