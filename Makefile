
#build: init jshint

#init:
#	mkdir -p dist

templates: puglint
	./node_modules/.bin/pug-ssml --templates ./templates

jshint:
	jshint index.js ./test/

puglint:
	pug-lint ./templates/*.pug

build: jshint templates

remove:
	serverless remove

stack1: build
	serverless deploy --stage stack1

stack2: build
	serverless deploy --stage stack2

update-stack1: build
	serverless deploy --function skill --stage stack1

update-stack2: build
	serverless deploy --function skill --stage stack2

clean:
	rm -rf ./ssml-speech.js

.PHONY: init jshint puglint templates build remove beta prod update-beta update-prod clean