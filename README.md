# Opinionated Project Overlord

**ALPHA STAGE ONLY** - _this project is not yet ready for use_

**Opol** lets you define your coding projects on top of opinionated stacks,
removing a lot of boilerplate and simplifying the process of updating project
structures and practices across multiple projects.

## Resources

Stacks register resources to provide utilities for other stacks to use. For instance,
the bedrock stack provides a File resource for creating files.

A resource is a function that _preps_ and _validates_ some state and returns a _executor_
function that will get executed after all stacks are executed. Both the resource function
itself and the executor it returns are bound to an object the provides API functions,
including for accessing and mutating a state object that is shared by all insstances
of the resource. Actually, it's not the same API for the resource function and the
executor function, they have different APIs. The executor API can report things like whether`
it's the first or last intance of the resource. Something like an NpmPackage resource might
allow the user to build up the package info a little at a time, and then only the last
executor actually generates the file.

Or maybe a resource should be an object that provides methods: prep, execute, beforeExecute,
afterExecute. Then how would the API be provided? It could extend a base class that provides
it? I think that will work.
