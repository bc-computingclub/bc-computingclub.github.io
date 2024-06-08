/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('code-otter-dev');

// Search for documents in the current collection.
db.getCollection('challenge_submissions').deleteMany({});
db.getCollection('challenges').deleteMany({});
db.getCollection('lesson_progs').deleteMany({});
db.getCollection('projects').deleteMany({});
db.getCollection('users').deleteMany({});