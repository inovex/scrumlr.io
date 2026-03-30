#!/bin/bash
# Setup script for Go formatting Git hooks

set -e

echo "Setting up Git hooks for Go code formatting..."

# Get the repository root directory
REPO_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$REPO_ROOT/.git/hooks"

# Create pre-commit hook for Go formatting
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash
# Pre-commit hook for Go code formatting

echo "Running Go code formatting..."

# Change to server/src directory
cd "$(git rev-parse --show-toplevel)/server/src"

# Get list of staged Go files
STAGED_GO_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.go$' | grep -v vendor/ || true)

if [ -z "$STAGED_GO_FILES" ]; then
    echo "No Go files to format"
    exit 0
fi

echo "Formatting Go files: $STAGED_GO_FILES"

# Format the files
echo "$STAGED_GO_FILES" | xargs goimports -w
echo "$STAGED_GO_FILES" | xargs gofmt -w

# Add the formatted files back to staging
cd "$(git rev-parse --show-toplevel)"
echo "$STAGED_GO_FILES" | sed 's|^|server/src/|' | xargs git add

echo "Go code formatting completed"
EOF

# Make the pre-commit hook executable
chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Git hooks setup completed!"
echo ""
echo "The pre-commit hook will now:"
echo "- Automatically format Go files with goimports and gofmt"
echo "- Only process staged Go files"
echo "- Re-stage formatted files"
echo ""
echo "To disable temporarily: git commit --no-verify"