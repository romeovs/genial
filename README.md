
# Genial

While other generator/templating/scaffolding tools like [yeoman](http://yeoman.io) and 
[plop][plop] are really good at what they do, I felt
they somehow still get in the way of the programmer and could be made much
simpler.

I really liked how [plop][plop] colocates the templates with the project, making
them much more maintainable (each project manages its own templates).  What I
don't like, however, is that I need to go trough a menu int the terminal every
time I want to invoke a generator, answering the questions one by one.  I prefer
giving the generator all it needs to go to work immediatly. So instead of:

```
$ plop foo
[FOO] What is the foo's name? Bar
[FOO] More baz or not? Y
[FOO] Imports? fleep
[FOO] Imports? floop
[FOO] Imports? flap
[FOO] Imports?
...
```

I like to write:
```
$ genial foo --name Bar --baz --import fleep --import floop --import flap
```

With `genial` you can define all the templates parameters and how they should
be invoked, `genial` takes care of the rest.  Everything that is specified on
the command line will not be asked, everything that isn't will be asked just
like with [plop][plop].  All a template writer needs to do is specify the
names and types of the parameters and possibly add a description.

# Usage 

**todo**

# Todo

- [ ] think really hard about array type semantics.  When should a required
  array trigger a question? Perhaps switch to
  ```
   --import [ fleep, floop, flap ]
   ```
   style of array parameters to allow disambiguation between `undefined` (no
   array given) and `[]` (empty array given). In the current semantics, they
   both look the same.

- [ ] allow for other options to be set in `genfile` (eg. `no-color`, `verbose`,
  ...)

[plop]: https://github.com/amwmedia/plop
