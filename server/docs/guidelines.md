# Guidelines

Please make sure to use the [.editorconfig](./../../.editorconfig) in your editor.

## Code style

Each service should have an interface in which the public methods are defined.
This interface should be placed in the api file, where it is used.

If the service needs access to the database, an interface should be defined with the methods to access the database.
This interface should be defined in the service, where it is used.

## Naming conventions

The interface for the database access should end with `Database` and start with the name of the service.
The interface for the service should end with `Service` and start with the name of the service.

The names of the mothods should contain the following if needed

- *Create*: Creates a new object
- *Update*: Updates a object by its id
- *Delete*: Deletes a object by its id
- *Get*: Get a object by its id
- *GetAll*: Get a list of objects
- *Exists*: Check if an object exists
