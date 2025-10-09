#!/bin/bash
set -e  # Exit on error

echo "🔧 Setting up public repository with clean history..."
echo ""

# Safety check
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Verify we have the private remote
if ! git remote get-url private &>/dev/null; then
    echo "❌ Error: 'private' remote not found"
    exit 1
fi

echo "📋 Current status:"
git status --short
echo ""

# Fetch all remotes to ensure we have latest
echo "📥 Fetching from remotes..."
git fetch private
git fetch origin
echo ""

# Stash any uncommitted changes (just in case)
if ! git diff-index --quiet HEAD --; then
    echo "💾 Stashing uncommitted changes..."
    git stash push -m "Auto-stash before public repo setup"
    STASHED=1
else
    STASHED=0
fi

# Switch to develop branch to get all current files
echo "🔀 Switching to develop branch..."
git checkout develop
git pull private develop --no-rebase
echo ""

# Create a new orphan branch with clean history
echo "🌱 Creating new orphan branch for public release..."
git checkout --orphan public-clean
echo ""

# Remove docs/ from staging if it exists (it's in .gitignore)
echo "🗑️  Removing ignored files from staging..."
git rm -r --cached docs/ 2>/dev/null || true
git rm -r --cached private-docs/ 2>/dev/null || true
git rm -r --cached coverage/ 2>/dev/null || true
git rm -r --cached dist/ 2>/dev/null || true

# Stage all files according to .gitignore
echo "📦 Staging all files for public release..."
git add -A
echo ""

# Show what will be committed
echo "📋 Files to be committed:"
git status --short | head -20
if [ $(git status --short | wc -l) -gt 20 ]; then
    echo "... and $(($(git status --short | wc -l) - 20)) more files"
fi
echo ""

# Create the clean initial commit
echo "✍️  Creating clean initial commit..."
git commit -m "Initial public release v1.0.0

Loggical - Universal logging library with progressive complexity

Features:
- Complete log levels (debug, info, warn, error, highlight, fatal)
- Automatic sensitive data redaction
- Universal Node.js and browser support
- Context attachment with immutable API
- Plugin system for optional complexity
- Environment-based configuration
- Format presets (compact, readable, server)
- TypeScript support with full type definitions
- 291 tests with 100% passing
- ~34KB optimized bundle

This is the first public release with a clean commit history.
For full development history, see the private repository."
echo ""

# Verify the commit
echo "✅ New commit created:"
git log --oneline -1
echo ""

echo "🔍 Verifying commit contents..."
echo "Total files in commit: $(git ls-tree -r HEAD --name-only | wc -l)"
echo ""

# Show if private-docs is excluded (should be)
if git ls-tree -r HEAD --name-only | grep -q "private-docs/"; then
    echo "⚠️  WARNING: private-docs/ is in the commit! Checking .gitignore..."
    cat .gitignore | grep -A 2 -B 2 "private-docs"
else
    echo "✅ private-docs/ correctly excluded"
fi
echo ""

# Replace main branch with this clean commit
echo "🔄 Replacing main branch with clean history..."
git branch -D main 2>/dev/null || true
git checkout -b main
echo ""

echo "📊 Final verification:"
echo "Commits in main branch:"
git log --oneline
echo ""
echo "Branch status:"
git branch
echo ""

# Restore stashed changes if any
if [ $STASHED -eq 1 ]; then
    echo "📥 Restoring stashed changes..."
    git stash pop || echo "⚠️  Could not restore stash (may not be needed on new branch)"
fi

echo ""
echo "✅ Public repository setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review the commit: git show HEAD"
echo "2. Verify files: git ls-tree -r HEAD --name-only | less"
echo "3. When ready, push to origin: git push origin main --force"
echo ""
echo "⚠️  IMPORTANT: The --force push will replace the current main branch on origin"
echo "⚠️  Make sure your private repository has all the history backed up!"
echo ""

