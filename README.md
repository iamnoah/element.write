# element.write

element.write is like `document.write`, but for DOM elements. The core is John Resig's
pure JavaScript [HTML parser](http://ejohn.org/blog/pure-javascript-html-parser/) but it's been
refactored so that incomplete HTML fragments can be submitted but still generate parse events, similar to the way browsers parse HTML and generate the DOM.

## Usage

    elementWrite.toElement(document.getElementByid('id')).
    	write('<p id=hi>Hello <').
    	write('i>World!').
    	close();

Result:

    <div id="id">
    	<p id="hi">Hello <i>World</id></p>
    </div>

## Ummm, so? You've reinvented innerHTML

Not exactly, but if you don't see a use case for it in your web apps, I'm not surprised. elementWrite is a library for libraries.

So how is this different from the original HTML parser?

    elementWrite.toElement(document.getElementByid('id')).
    	write('<p id=hi>Hello <'). # 1
    	write('i>World!'). # 2
    	close(); #3

 1. At this point the DOM looks like this:
   `<div id="id"><p>Hello </p></div>`. i.e., the `p` tag and text are already in the DOM.
 2. This completes the `i` tag and adds World.
 3. If you used innerHTML for both of these fragments, you might get something like:
    `<p id="hi">Hello </p>&lt;i&gt;World!`, since innerHTML assumes you're giving it a complete
    fragment.

So basically element.write gives you the power to pause the HTML->DOM process at any arbitrary point and manipulate the DOM elements that are available.

See the tests for more interesting examples.