# Docs site tasks. Run `just` to list them.

set shell := ["zsh", "-cu"]

default:
    @just --list

# Serve the docs locally with hot reload (http://localhost:3000/pix-docs/)
docs: llms
    npm run start

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

# Typecheck config and components
check:
    npm run typecheck

# Remove build output and Docusaurus cache
clean:
    npm run clear
    rm -rf build
