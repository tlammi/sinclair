
.PHONY: bundle min build test lint lint-fix


bundle: dist/bundle.js

min: dist/bundle.min.js

dist/bundle.js: build
	npx rollup -c

dist/bundle.min.js: dist/bundle.js
	npx minify --js < $< > $@
	
build:
	npm run build

test:
	tsdx test

lint:
	tsdx lint --fix
