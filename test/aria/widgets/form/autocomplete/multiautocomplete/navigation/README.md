Purpose of this test: test the navigation feature in the MultiAutoComplete.

To know what has to be tested, refer to the specifications, and to the documentation too (which is a more user-friendly explanation of the specifications).





# Architecture of the tests

This is mainly GUI test, which means that simulating user actions is necessary. This is an asynchronous process.

After a user action has been simulated, some checks have to be done. This is usually a synchronous process.

It is usually quite painful to handle mix of synchronous and asynchronous from a pure programming point of view. However, there is a class in the framework which handles the two in a quite nice way: `aria.core.Sequencer`. The thing is that I think it would have been enhanced, so I rebuilt a Sequencing system based on this one. Those are the files:

* [`Sequencer.js`](./Sequencer.js)
* [`Sequence.js`](./Sequence.js)
* [`Task.js`](./Task.js)

Please refer to those files for embedded documentation.

Concerning [`Helpers.js`](./Helpers.js), as its name suggests, it holds a set of standard functions enhancing what is already present in the framework utilities.

## The actual test file

[`MultiAutoCompleteNavigation.js`](./MultiAutoCompleteNavigation.js)

The first part of the file contains a lot of utility functions dealing with both user actions and checks for the tests. They all support the invocation through the sequencing system invoked above (proper synchronization is done).

The rest is simply the definition of the hierarchy of tasks to be executed to play the test, according to how the sequencing system works. It's quite straightforward to understand.

## Future improvements

### Use objects instead of positional arguments

This is an issue for synchronous methods mostly.

Indeed, an asynchronous method will need to receives something to notify its end: usually a callback, and in our sequencing system a task (with a `end` method behind).

However, a synchronous method doesn't care about that, and some of them might get called in a context completely different from the one of a sequence.

> But where is the problem if anyway they don't use the task?

The problem is about passing the reference to the task. For now by convention it's the very first argument of the function. So if the function is invoked without a task but with other arguments, the first one must be set to `null` or `undefined`.

This is in fact a more common issue: __dealing with dynamic number of arguments__.

There are two possibilities: using positional arguments or using a single argument with an object. I suggest the second one maybe.




# Missing tests

The scenario in non-freetext mode has not been tested yet...
