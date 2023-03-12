
.PHONY: all test browser


# build targets targeting node
build_node = build/node

# build targets targeting browser
build_browser = build/browser

# build targets for testing
build_test = build/test


all: browser/bundle.js browser/bundle.min.js browser/index.html

browser/bundle.js: $(build_browser)/sinclair.web.js $(build_browser)/sinclair.js $(build_browser)/redom.es.js
	npx rollup --context this $< --file $@ --format iife

test: $(build_test)/test_sinclair.js $(build_test)/sinclair.js
	npx node $<

$(build_browser)/bundle.js: $(build_browser)/sinclair.web.js $(build_browser)/sinclair.js $(build_browser)/redom.es.js
	npx rollup $< --file $@ --format iife

browser/%.min.js: browser/%.js
	npx minify --js < $< > $@

browser/index.html:
	ln -s ../index.html $@

$(build_browser)/redom.es.js:
	ln -s ../../redom.es.js $@

$(build_browser)/%.js: $(build_node)/%.js
	npx babel -o $@ $<

$(build_node)/%.mjs: $(build_node)/%.js
	cp $< $@

$(build_node)/%.js: %.ts
	npx tsc --module es2020 --outDir $(build_node) $<

$(build_test)/%.js: %.ts
	npx tsc --outDir $(build_test) $<

clean:
	rm -rf browser build

