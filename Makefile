
.PHONY: all test

all: sinclair.js

test: test_sinclair.js sinclair.js
	node $<

%.js: %.ts
	tsc $<

