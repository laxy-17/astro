#!/bin/bash

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Scanning for secrets..."

# Check if detect-secrets is installed
if ! command -v detect-secrets-hook &> /dev/null; then
    echo "⚠️ detect-secrets not found. Use 'pip install detect-secrets' to install."
    echo "Skipping secret scan (NOT RECOMMENDED for production commits)."
    exit 0
fi

# Run scan
# Only scan added/modified files
FILES=$(git diff --staged --name-only)
if [ -z "$FILES" ]; then
    exit 0
fi

detect-secrets-hook --baseline .secrets.baseline $FILES

if [ $? -ne 0 ]; then
    echo ""
    echo "⛔️ SECRETS DETECTED - Commit blocked!"
    echo ""
    echo "If this is a false positive, update baseline:"
    echo "  detect-secrets scan --update .secrets.baseline"
    echo ""
    exit 1
fi

echo "✅ No secrets detected"
EOF

# Make executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook installed successfully!"
