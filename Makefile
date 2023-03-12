
.PHONY: all test browser
.PRECIOUS: build/%.js

all: browser/sinclair.js browser/sinclair.web.js \
	browser/sinclair.min.js browser/bundle.js browser/redom.es.js


browser/bundle.js: browser/sinclair.web.js browser/sinclair.js browser/redom.es.js
	npx rollup $< --file $@ --format iife #--name sinclair

browser/redom.es.js: redom.es.js
	cp redom.es.js browser/redom.es.js

browser/%.min.js: browser/%.js
	npx minify --js < $< > $@

browser/%.js: build/%.js
	npx babel -o $@ $<

test: build/test_sinclair.js build/sinclair.js
	npx node $<

build/%.js: %.ts
	npx tsc --module es2020 --outDir build $<

clean:
	rm -rf browser build

