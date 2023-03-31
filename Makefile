
.PHONY: bundle min build test lint lint-fix release


bundle: dist/bundle.js

min: dist/bundle.min.js

release: dist/bundle.js dist/bundle.min.js
	mkdir -p release/
	cp $^ release/

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
