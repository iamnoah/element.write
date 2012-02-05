require(['jquery','../element.write','qunit'],function($,elementWrite) {

	function exists(selector,count) {
		if(!count && count !== 0) {
			count = 1;
		}
		ok($(selector).length === count,selector+' exists.');
	}

	module('element.write',{
		setup: function() {
			$('#foo').html('');
		}
	});

	test('close',function() {
		var el = $('#foo'), writer = elementWrite.toElement(el[0]);

		writer.close('<p id=test>hello <i>world');

		equals(el.html(),'<p id="test">hello <i>world</i></p>');
	});

	test('multiple writes',function() {
		var el = $('#foo'), writer = elementWrite.toElement(el[0]);

		writer.write('<p id=test>hello <i>world');
		writer.close('</p><div id=baz>Hi mom!</div>');

		equals(el.html(),'<p id="test">hello <i>world</i></p><div id="baz">Hi mom!</div>');

		el.html('');

		writer = elementWrite.toElement(el[0]);

		writer.writeln('<div id=bar');
		writer.writeln('	class=foo>');
			writer.write('<p>Hi Mom!</p>');
			writer.write('<input name=baz value=123>');
			writer.write('<div class=something>');
				writer.write('<div class=wrapper>');
					writer.writeln('<img');
					writer.writeln(' src="foo.png">');
				writer.write('</div>');
			writer.write('</div>');
		writer.close('</div>');

		exists('#foo #bar p')
		equals($('#foo #bar p').text(),'Hi Mom!');
		equals($('#foo #bar input[name="baz"]').val(),'123');
		exists('#foo #bar .something .wrapper img[src="foo.png"]');
	});

	test('listeners',function() {
		var paused, writing,
			queue = [],
			caps = 0;
		// The goal here is to find elements with the caps class
		// and capitalize any text inside them.
		// Pretend that capitalizing text is an async operation,
		// so we have to pause writing while capitalizing text
		// then replay the actions that happened while we were paused.
		var el = $('#foo'), writer = elementWrite.toElement(el[0],{
			start: function(tag,attrs,unary,state) {
				if(paused) {
					queue.push(['start',[tag,attrs,unary]]);
					return false;
				} else if((attr(attrs,'class') || '').indexOf('caps') !== -1) {
					caps++;
				}
			},
			end: function(tag,state) {
				if(paused) {
					queue.push(['end',[tag]]);
					return false;
				} else if(caps > 0) {
					caps--;
				}
			},
			chars: function(text,state) {
				if(writing) return;

				if(paused) {
					queue.push(['chars',[text]]);
					return false;
				} else if(caps > 0) {
					paused = true;
					setTimeout(function() {
						paused = false;
						writing = true;
						writer.handlers.chars(text.toUpperCase());
						writing = false;
						resume();
					},500);
					return false;
				}
			},
			comment: function(text,state) {
				if(paused) {
					queue.push(['comment',[text]]);
					return false;
				}
			}
		});

		function attr(attrs,name) {
			for (var i = 0, len = attrs.length; i < len; i++) {
				if(attrs[i].name === name) {
					return attrs[i].value;
				}
			}
		}

		function resume() {
			while(!paused && queue.length) {
				var action = queue.shift();
				// replay the queued events
				writer.handlers[action[0]].apply(writer,action[1]);
			}
			if(!paused) {
				done();
			}
		}

		writer.writeln('<div id=bar>').
			write('<p class=caps>Hi Mom!</p>').
			write('<input name=baz value=123>').
			write('<div class=something>').
				write('<div class=wrapper>').
					writeln('<img').
					writeln(' src="foo.png">').
				write('</div>').
			write('</div>').
			write('<span class=caps>foo</span>').
		close('</div>');

		stop();
		function done() {
			exists('#foo #bar p')
			equals($('#foo #bar p.caps').text(),'HI MOM!');
			equals($('span.caps').text(),'FOO');
			equals($('#foo #bar input[name="baz"]').val(),'123');
			exists('#foo #bar .something .wrapper img[src="foo.png"]');
			start();
		}
	});

});