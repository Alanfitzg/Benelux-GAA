# Contributing to PlayAway

## Pre-commit Hooks Setup

This project uses automated code quality checks to prevent lint issues from reaching Vercel builds.

### What's Automated

#### Pre-commit Hook

Runs automatically when you `git commit`:

- ✅ **ESLint** - Automatically fixes lint issues
- ✅ **Prettier** - Formats code consistently
- ✅ **TypeScript** - Checks for compilation errors

#### Pre-push Hook

Runs automatically when you `git push`:

- ✅ **Production Build** - Ensures code builds successfully

### Manual Commands

If you want to run checks manually:

```bash
# Fix linting issues
npm run lint:fix

# Format all files with Prettier
npm run format

# Check formatting without fixing
npm run format:check

# Run pre-commit checks manually
npm run pre-commit

# Full TypeScript check
npx tsc --noEmit
```

### How It Prevents Vercel Build Failures

1. **Pre-commit**: Catches and fixes lint issues before they're committed
2. **Pre-push**: Runs a full build test before code reaches Vercel
3. **Automatic fixing**: Most issues are auto-fixed, so you don't have to manually correct them

### What Happens If Checks Fail

- **Pre-commit fails**: Commit is blocked until issues are fixed
- **Pre-push fails**: Push is blocked until build/tests pass
- **Auto-fixing**: Many issues are automatically resolved

### Configuration Files

- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to exclude from formatting
- `package.json` - lint-staged configuration
- `.husky/pre-commit` - Pre-commit hook script
- `.husky/pre-push` - Pre-push hook script

### Troubleshooting

If you need to bypass hooks temporarily (not recommended):

```bash
git commit --no-verify
git push --no-verify
```

### File Types Checked

- **JavaScript/TypeScript**: `*.js`, `*.jsx`, `*.ts`, `*.tsx`
- **JSON/CSS/Markdown**: `*.json`, `*.css`, `*.md`

This setup ensures consistent code quality and prevents deployment failures due to linting issues!
