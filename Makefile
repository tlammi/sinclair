
.PHONY: all test browser

all: browser/sinclair.js browser/sinclair_minified.js

browser/%_minified.js: browser/%.js
	npx minify --js < $< > $@

browser/%.js: build/%.js
	babel -o $@ $<

test: build/test_sinclair.js build/sinclair.js
	node $<

build/%.js: %.ts
	tsc --outDir build $<

clean:
	rm -rf browser build

