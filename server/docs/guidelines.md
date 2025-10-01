# Guidelines

Please make sure to use the [.editorconfig](./../../.editorconfig) in your editor.

## Code Formatting

To ensure consistent code formatting across all team members and development environments:

### Automatic Setup (Recommended)
1. **One-time setup**: Run `./scripts/setup-git-hooks.sh` from the `server/` directory
2. **That's it!** All commits will automatically format Go code

### Manual Commands
- **Auto-format code**: Run `make format` to automatically format all Go code
- **Before committing**: Run `make format-check` to verify your code is properly formatted
- **Linting**: Use `make go-lint` which includes formatting checks

### IDE Setup (Optional but Recommended)
Configure your editor to format on save:

**VS Code** (`.vscode/settings.json`):
```json
{
  "go.formatTool": "goimports",
  "editor.formatOnSave": true,
  "[go]": {
    "editor.formatOnSave": true
  }
}
```

**GoLand/IntelliJ**:
- Go to Settings → Tools → File Watchers
- Add "goimports" file watcher
- Or enable "Reformat code" in commit dialog

### How It Works
- **Git hooks**: Automatically format staged Go files before commit
- **CI checks**: Verify formatting in pull requests
- **Tools**: Uses `goimports` for import organization and `gofmt` for code formatting
- **Bypass**: Use `git commit --no-verify` to skip formatting (not recommended)

The project uses `goimports` for automatic import organization and `gofmt` for code formatting.

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
