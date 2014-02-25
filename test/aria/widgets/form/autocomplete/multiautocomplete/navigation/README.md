Purpose of this test: test the navigation feature.

To know what has to be tested, refer to the specifications, and to the documentation too (which is a more user-friendly explanation of the specifications).





# Test description

The following is the explanation of the feature from testing point of view. It describes all the conditions to test, edge cases, etc., in a structured manner. It's somewhere between the specifications and the documentation.

Reading the following, it should be easy to translate it into functions, conditions and checking.

## Test: Navigation

Navigation can be done __only__ using the __left__ and __right__ __arrow keys__. Thus it moves _something_ among _a set of items_ towards the _previous_ direction or the _next_ direction.

### Context: Inside the input field

#### Direction: To the right

* if there is a character after the caret: moves the caret after it
* otherwise: does nothing (it reached the end of the input)

#### Direction: To the left

* if there is a character before the caret: moves the caret before it
* otherwise (we are at the beginning if the input)
	* if there is no selected option: does nothing
	* otherwise
		* enters the highlighted mode
		* highlights the last selected option

### Context: In highlighted mode

#### Direction: To the left

* navigating to the left highlights previous options until the first one is reached, then it does nothing

#### Direction: To the right

* if there is an option after the currently highlighted one: selects the former
* otherwise (currently selected one is the last one): gives focus to the input field, placing the caret at its beginning

## Test: Tab behavior

### Context: Inside the input field

Gives focus to the next focusable element in the page (if any).

### Context: In highlighted mode

Gives focus to the input field, placing the caret at its betginning.



# Test requirements

* tests
	* get caret position in input
	* know if highlighted mode is on
	* get currently highlighted item
* actions
	* set text of input field
	* insert/remove selected options
	* send keys:
		* left arrow
		* right arrow
		* tab



# States to test

* Currently focused element
* Position
	* caret
	* or highlighted item
* Highlighted mode on or not





# Test implementation notes

A test is a sequence of:

* do
* check: continue or not

With each step independent or not.

Moreover, each test can be either synchronous or asynchronous (this is important for programming style).

So since the `aria.core.Sequencer` is able to execute in series a set of tasks; either synchronous or asynchronous, I think testing a module is just a matter of putting tasks in a sequencer.

Then, how do we build tasks?

There are two things: the actual task implementation and the architecture of the tasks.

The latter is just a way to organize tasks in a logical way: a tree. So a task can be either a function, or another set of tasks, that is a sequencer in practice. Since the implementation of `aria.core.Sequencer` only accepts functions, those child sequences should be wrapped in functions which create them.




# Missing tests

* Probably the non-freetext mode.
* ...
