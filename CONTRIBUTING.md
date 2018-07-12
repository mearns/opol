# Contributing to Opol

**Opol** is an _open source_ project, so we're happy to accept contributions for
anyone who wants to help! This document will help guide you if you want to
contribute to the project!

## Finding Work To Do

TODO


## Work Flow

TK

### Get a Ticket

Find a ticket on our [Kan Ban board](https://github.com/mearns/opol/projects/1) that
is _unassigned_ in the _"Priority Queue"_ column. If you're a project member, you can
assign the ticket to yourself and pull the ticket into the "Execution" column.
Otherwise, add a comment on the issue stating that you're working on it, and a project
member will assign it to you and pull it into the "Execution" column.

TK: If there is no ticket for the work you want to do, your best bet it to
[create a new one](https://github.com/mearns/opol/issues/new) to describe the changes
you want to make, and wait for it to be approved as described below under "Ticket is Approved".
Otherwise, you risk duplicating effort that is already going on, or doing work on changes
that ultimately will not be accepted into the project.

If there's no ticket and you still want to roll the dice on submitting the changes without
a ticket, or getting started on the changes before your ticket has been approved,
you cna proceed, but at your own risk 😉.

### Fork the Repo

[Fork the repository](https://github.com/mearns/opol/fork), if you don't already have a fork
(you don't need a separate fork for each issue you work on).

### Create A Branch

In your fork, create a branch dedicated to this work. If you have a ticket, the branch
should be named as follows:

```
ticket/${number}-${brief-description}
```

The `${number}` is the issue number, and `${brief-description}` is a few words (written in
daisy-case) to clue in someone what the issue is about. For instance, the branch for issue #10
("Setup unittest code coverage") was named
[`ticket/10-unit-test-coverage`](https://github.com/mearns/opol/tree/ticket/10-unit-test-coverage).

If the issue has previously been worked on, there may already be a branch for it. Unless you are
picking up the work where it left off, _do not continue the branch_, create a new one and make sure
it has a different name (e.g., add a "-2") to the end of the branch name.

If you don't have a ticket for your work, name the branch as follows:

```
unticketed/${username}-${brief-description}
```

where `${username}` is your github username.

Branches should be made from the latest commit in master at the time the branch is taken.
Try to make sure your fork is up to date with upstream before branching.

Add a comment to the issue with a link to your fork and the branch name, indicating
that this is where you're doing your work.

### WIP Pull Request

As discussed below, we recommend submitting a WIP pull request immediately to gain
visibility and also automated feedback from CI as your push changes.

### Development Cycle

TK: XXX

Make changes, commit them to your branch, and push your changes to your fork.

As a general bet practice, we recommend making frequent local commits, and pushing
multiple times through out the day.




## Conventions, styles, and patterns

This section describes some of the "best practices" we try to follow in this
project. When submitted code to the project, please keep these in mind as they
will be considered before accepting any changes.

If any of these are unclear to you, just ask! We're happy to help, and if you submit
some code that doesn't follow these guidelines, we'll do our best to point you
in the right direction. We assume good faith; no penalties for trying and getting
it wrong.

**Opol** is a _JavaScript_ project, written according to the [standard JS](https://standardjs.com/)
style. We use [babel](https://babeljs.io/) to transpile all code, and generally
allow any language features and syntax that is supported by babel and that don't
conflict with _standard JS_ or other guidelines explicitly set forth for the project.

### Character Sets and Line Endings

Unicode characters only, encoded in utf-8.

Line endings are LF only (unix style).

If your editor supports [EditorConfig](http://editorconfig.org/), you're all set.

### Standard JS

If you aren't familiar with standard JS, the easiest way to get familiar with it is
to [configure your editor](https://standardjs.com/awesome.html#editor-plugins) to
highlight any violations while you type. Short of that, you can [install](https://standardjs.com/index.html#install)
the `standard` command line linter and get into the habbit
of [running it](https://standardjs.com/index.html#usage) from the command line against your code
(or from within the opol project, you can run `npm run check:lint:js`, which will lint all source
code through `standard`).

To get you started, here are a few highlights:

*   indent 2 spaces
*   camelCase
*   single quotes for string (where reasonable)
*   no semicolons
*   brackets on the same line
*   `else` on same line as closing brace
*   space after keywords, commas, and function names, and surrounding infix operators
*   use `===` over `==`
*   declare one variable at a time

If you want to peruse the rest of the rules, see [the standard](https://github.com/standard/standard/blob/master/docs/RULES-en.md).

### Editor Config

We use [EditorConfig](http://editorconfig.org/) to automatically configure compatible
editors to match some aspects of our style guidelines. If your editor doesn't support it natively,
there may be a [plugin](http://editorconfig.org/#download) available for it. This can save a lot of
frustration when your submission gets sent back because you used the wrong line-endings.

### Readability

Code readability and maintainability are among the highest virtues of good code. If you
want to show off how clever you are, it's much more clever to write code that solves the
problem _and_ is easy to understand than it is to write an opaque and arcane hack that
nobody can understand.

At the same time, we assume anyone who needs to make sense of the code has a reasonable
knowledge of contemporary JavaScript practices, so there's no need to shy away from
more advanced constructs.

**Encapsulation** helps turn code into an outline that lets a reader dive in at whatever
level of detail they want. Taking a long block of code and replacing it with an
uninterrupted series of calls to functions that each do one step of the process makes
it easier to grasp at a high level. If someone needs more details about a particular
step, they can dive into the implementations of each function.

### Comments

With very few exceptions, code should not need comments to explain what it's doing, because
it should be written with readability in mind, such that anyone with a reasonable amount
of relevant knowledge can understand it _without_ commentary.

In addition to being hopefully unecessary, comments can be detrimental as they can
very quickly and easily get out of sync with the code, and can make it more confusing
for someone trying to understand the code.

### Language Features

We generally prefer fat-arrow functions for inline anonymous functions, over keyword `function`s.

Get used to used spread operators for arrays and objects.

### Misc.

Use `const` as much as possible. You should default to `const` and only change it to
`let` in the rare cases that you actually _need_ to reassign the variable. Remember
that `const` does not make an object unmodifiable, it just means you can't reassign
the variable.

Prefer _immutable_ objects as much as possible. For instance, cloning an object and
adding/replacing/removing a property is often preferable to modifying the original
object. Similarly, concatenating, slicing, or filtering arrays is generally
preferred over modifying the existing array.

Using [`Array::reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce?v=a)
is often useful for building a dynamically populated object without mutating an object
or reassigning a variable.

Prefer [`Array::forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach),
[`Array::map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), and other visitor
patterns over explicit loops.

Do not prematurely-optimize. Get a simple, easy to understand, functioning solution
first, and only worry about performance if you have some good envidence or compelling
reason to believe that it will be a problem.

Avoid creating unnecessary variables. Every additional variable is an additional name
you have to come up with, and naming is widely considered to be one of the hardest
problems in computer science. If calculation of a temporary value can reasonably be
done inline, do it. Often, variables are used as a way of breaking down a complicated
algorithm into steps, where the name of the variable is used as a way of labelling
the different steps. It is often preferable to break these out into separate functions,
and the function name can serve the purpose of labeling the steps.

To avoid unnecessary variables, object and array destructuring can be very useful,
but not at the expense of readability. For instance, a deeply nested object may not
be reasonable to unpack all at once. Helper functions to pull specific items out
of objects or arrays can often solve the problem by encapsulating the intermediate
variables in a dedicated function where they won't impair anyone's ability to read
and make sense of the main function.

Avoid magic numbers. A magic number is a numeric literal whose meaning is not
obvious. Instead of putting such a number in a statement, assign it to a `const`
first, giving the const a meaningful name to demystify the value.

There are some reasonable exceptions to the magic number rule. Using a `0` to
access the first element of an array, or `-1` to offset the size of an array to get
the last element, are both reasonable. Incrementing or decrementing a value with `+= 1`
and `-= 1` are generally preferable to using the `++` or `--` operators.

The same applies to _magic strings_, though there are arguably more exceptions to this
since the value of the string itself may provide enough information to make the meaning
clear. Even still, keep it mind when adding a string-literal: if it's not obvious what
the string represents, you might want to put it in an appropriately named `const`
instead.

Along the same lines, numeric and string constants are often used in multiple places,
and are often not really constant. Putting them in a const and using that const
in multiple places will make it easier and safer to change the value if necessary.

### Naming

Balance is the key to naming, not too long, not too short. A name for a variable,
function, or class should not be an opaque shibolleth, demanding deep knowledge
of the system before you can have the slightest idea of what the named item is
or does. Nor should a name be a detailed description of the item. In the best case,
a name gives you a hint about what an item is or does; it facilitates gaining an
understanding of the code at any desired level, but does not hinder someone already
familiar with the code. Ideally, names should be _sight words_, recognizable and
distinguishable at a glance. I shouldn't have to read through a name like a sentence
in order to distinguish it from other similar names that are contextually relevant.

Class names should be TitleCase, function names and variable/const names should be
camelCase. File, directory, and module/package names should be daisy-case. The imports
for a module or package should generally use the same name, converted from daisy-case
to camelCase. E.g., a file named `foo-bar.js` defined a module named `foo-bar`, and
should be imported as `fooBar`.

Function names should be an _action_, variable and const names should be a _noun_.

For the most part, the type or classname is not useful as the name of a variable or
const. For instance, naming an `Object` as "object" is not useful. The exception to
this is when there is only one object of this type in the context, and its meaning
and purpose are clear. For instance, a function that converts a string to lower case
may only take one argument, the string to convert. In this case, calling
the argument `string` or even `s` is reasonable.

### Asynchronous Patterns

We generally prefer [Promises](https://www.promisejs.org/) over Node's traditional
callback-pattern for asynchronous work, and specifically we primarily use the
[bluebird](http://bluebirdjs.com/) implementation of Promises.

An imported function with a callback interface should generally be
[promisifed](http://bluebirdjs.com/docs/api/promise.promisify.html),
particularly when it is used multiple times.

The use of `new Promise(...)` is generally considered an
[antipattern](http://bluebirdjs.com/docs/anti-patterns.html#the-explicit-construction-anti-pattern),
but we have seen use cases for it in the past, and it is still preferred over
a callback based solution.

It is _not_ necessary to convert a returned Promise into a bluebird promise; the
responsibility is on the calling code to ensure a Promise is a bluebird promise
before using any bluebird specific API.

Observables are also preferred over alternative patterns, such as event emitters.
However, it is generally preferred to use a Promise over an observable, where
a Promise will suffice.


## Getting Help

TODO


## Your Work Wasn't Accepted 😩

Don't despair! Very few pull requests get accepted on the first try. Hopefully
the reviewer left helpful comments on what changes you should consider making. If not,
or if anything is unclear, follow up with them to find out why your changes weren't
accepted and what changes would help.

In some cases, it could be that your changes aren't _approved_, meaning the project
members have decided that the changes don't align with the goals or long-term
vision of the project (for this reason, we recommend only working on _ticketed_ items
that have made it past the "Approval" state). But this doesn't mean you're
work is necessarily a dead end. Project members may be able to help you modify your
idea or your approach to better align with the project and get approved.

Whatever the case, we truly appreciate your desire to contribute to the project,
and we hope you'll consider picking up some more work!


## Acceptance Criteria

Before accepting a pull request, project members will consider the following
criteria:

### Changes are on an Appropriate Branch

TK:

### Ticket is Approved

We use a ticketing system to track work that needs to be done, but not all
tickets are actually approved. Since this is a volunteer-based project,
"approval" in this case just means that the changes called for by the ticket
have been approved to be included in the project.

Obviously it isn't our role to approve what you spend your time one; that's not
the purpose of "approval". However, there may be some ideas and feature requests
that come in that ultimately don't fit into the long-term vision of the project,
so changes must be approved before they will be accepted. To keep track of this,
we have an "Approval" state in ticket workflow, which should happen before the
ticket is prioritized or picked up for execution.

To avoid doing work that won't actually get accepted into the project, please
only pick up tickets that have made it _past_ (to the right of) the "Approval"
column in our [Kan Ban board](https://github.com/mearns/opol/projects/1).

Similarly, if you have an idea for a change that doesn't have a ticket yet, we
suggest that you [create an issue](https://github.com/mearns/opol/issues/new)
for it first, and wait for the ticket to be approved before investing too much
effort into it.

### Automated Testing Successful

We use [Travis CI](https://travis-ci.org/mearns/opol) to run automated tests
against our code base. When you submit a pull request, Travis will automatically
create a new build to run these tests against your code. We will not typically
consider any pull requests that are not passing.

You can push additional changes to your branch/fork to address any issues
revealed during testing. Your pull request will be updated to include the new
commits, triggering new builds in Travis.

You can also create an early pull request marked with "\[WIP\]" ("work in
progress") at the beginning of the PR title, even before you are ready to have
it considered for merge. This will allow you to push incremental changes to your
branch and see the results of the automated builds, instead of doing a big-bang
push and possibly being faced with a mountain of issues that need to be
resolved. Project members will not consider PR's marked as WIP for merge.

In addition to getting early feedback from CI, an early WIP pull request gives
others in the project some visibility as to what you're working on, and how it's
going. This increases the chances that you might get some help with the work,
that the work could get incorporated into the project roadmap and prioritized,
or that you'll be notified of possible overlap with other work going on, or even
that the changes you're working on don't fit well with the vision for the
project and aren't likely going to get accepted as is. But don't despair! Please
see ["Your Work Wasn't Accepted"](#youre-work-wasnt-accepted), above, for
information on what to do now.

### Test Coverage

We have high expectations around automated testing. If you're adding a new
function, module, or class, you're probably going to need appropriate unit tests
for it. If you're adding new features, you'll need feature tests and possibly
system tests for it.

That said, we try hard not to chase the false idol of "100%" code coverage.
There are numerous considerations that should go into deciding what tests are
appropriate, and more tests aren't automatically a good thing. For information
about testing, including some guidance on how to decide whether or not you
should write a particular test case, see the [testing
page](https://github.com/mearns/opol/wiki/testing) on our wiki.

### Code Quality

Although code quality can be very subjective, project members should be
relatively well aligned on this, and it is at the discretion of the person
reviewing a pull request whether or not the quality is acceptable. Additionally,
we have various checks that run as part of our automated tests to assert around
some of the more objective aspects of code quality.

Code quality is a broad category and has many facets. This includes things like
formatting and style, but also design patterns, coding paradigms, system
architecture, etc. Don't be surpised if you get comments back on your pull
request asking you to make changes. Many of these may seem minor or trivial,
even nit-picky, but it's a standard that we hold the code to, in part to ensure
consistency throughout the code base.
