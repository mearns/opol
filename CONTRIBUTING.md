# Contributing to Opol

**Opol** is an _open source_ project, so we're happy to accept contributions for
anyone who wants to help! This document will help guide you if you want to
contribute to the project!

## Finding Work To Do

TODO


## Work Flow

TODO


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

### Common Things

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

Balance is the key to naming, not too long, not too short. A name is meant to be a symbol
for a concept or object, not a description of it. It gives you a quick and easy way
to represent that thing in your thinking and your communication. That's why they call
me "Brian", not "male engineer of medium height and thinning hair". The symbol
"Brian" isn't going to help anyone who doesn't know me to understand anything about me,
but once you do know me, "Brian" is a much more convenient symbol. TK.

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
