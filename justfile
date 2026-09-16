# Docs site tasks. Run `just` to list them.

set shell := ["zsh", "-cu"]

default:
    @just --list

# Serve the docs locally with hot reload at http://localhost:3000/
docs: llms
    npm run clear
    BASE_URL=/ npm run start

# Production build into ./build (regenerates static/llms.txt first)
build: llms
    npm run build

# Regenerate static/llms.txt from sidebars + frontmatter
llms:
    node scripts/llms.mjs

# Serve the production build (checks what GitHub Pages will publish)
serve: build
    npm run serve

# Rename the product everywhere: just rename Sangam [dir] [url]
rename name dir="" url="":
    node scripts/rename.mjs {{name}} {{ if dir != "" { "--dir " + dir } else { "" } }} {{ if url != "" { "--url " + url } else { "" } }}

# Regenerate the Mintlify site in ../pix-docs-mintlify from these docs
mintlify:
    node scripts/mintlify.mjs

# Drive headless Chrome through the live site and report React crashes
crash-check url="https://sakib.github.io/pix-docs":
    node scripts/crash-check.mjs {{url}}

# Typecheck config and components
check:
    npm run typecheck

# Remove build output and Docusaurus cache
clean:
    npm run clear
    rm -rf build
