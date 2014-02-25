Aria.classDefinition({
    $classpath : "test.aria.widgets.form.autocomplete.multiautocomplete.navigation.Sequence_test",

    $dependencies: [
        "test.aria.widgets.form.autocomplete.multiautocomplete.navigation.Sequence"
    ],

    $constructor: function() {
        var Sequence = test.aria.widgets.form.autocomplete.multiautocomplete.navigation.Sequence;


        this.scopeProperty = 'I am in the scope';


        var root = new Sequence('Root sequence');
        this.root = root;

        root.addTask({
            name: 'First task (synchronous)',
            scope: this,
            args: [1, 2],
            fn: this.first,
            asynchronous: false
        });

        root.addTask({
            name: 'Second task (asynchronous)',
            scope: this,
            args: [3, 4],
            fn: this.second,
            asynchronous: true
        });

        var sequence = root.addSequence('Last task: sequence');

        sequence.addTask({
            name: 'Nested task - in sequence (asynchronous)',
            scope: this,
            args: [5, 6],
            fn: this.nested,
            asynchronous: true
        });
    },

    $prototype : {
        run: function(onend) {
            this.root.run(onend);
        },

        first : function(task, a, b) {
            console.log('First function');
            console.log(this.scopeProperty);
            console.log(a);
            console.log(b);
        },

        second : function(task, a, b) {
            console.log('Second function');
            console.log(this.scopeProperty);
            console.log(a);
            console.log(b);

            task.end();
        },

        nested : function(task, a, b) {
            console.log('Nested function');
            console.log(this.scopeProperty);
            console.log(a);
            console.log(b);

            task.end();
        }
    }
});
