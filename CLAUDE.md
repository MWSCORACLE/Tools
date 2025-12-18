# CLAUDE.md - AI Assistant Guidelines for Tools Repository

## Repository Overview

This is the **Tools** repository - a collection of utility tools and scripts. The repository is currently in its initial state and will be expanded over time.

## Repository Structure

```
Tools/
├── README.md          # Project description and documentation
├── CLAUDE.md          # AI assistant guidelines (this file)
└── (future modules)   # Additional tools to be added
```

## Development Guidelines

### General Principles

1. **Keep it Simple**: Tools should be focused, single-purpose utilities
2. **Documentation**: Every tool should have clear documentation on usage
3. **Cross-Platform**: When possible, design tools to work across operating systems
4. **No External Dependencies**: Prefer standard library solutions when feasible

### Code Style

- Use clear, descriptive names for functions and variables
- Include inline comments for complex logic
- Write modular, reusable code
- Follow the language-specific conventions for any language used

### File Organization

- Place related tools in logical subdirectories
- Keep configuration files in the root or a dedicated `config/` directory
- Store tests alongside the code they test or in a `tests/` directory

## Git Workflow

### Branch Naming

- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- AI assistant branches: `claude/<session-id>`

### Commit Messages

- Use clear, imperative mood messages
- Format: `<type>: <description>`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Example:
```
feat: add file compression utility
fix: resolve path handling on Windows
docs: update README with usage examples
```

### Before Committing

1. Ensure code is tested and working
2. Remove debug statements and commented-out code
3. Update documentation if behavior changes

## Common Tasks

### Adding a New Tool

1. Create a new directory or file for the tool
2. Include a README or header documentation
3. Add usage examples
4. Update the main README.md if needed

### Testing

- Test tools manually before committing
- Document expected inputs and outputs
- Include edge case handling

## Important Notes for AI Assistants

### Do's

- Read existing code before making modifications
- Follow established patterns in the repository
- Make incremental, focused changes
- Commit changes with clear messages
- Update CLAUDE.md when repository structure changes significantly

### Don'ts

- Don't add unnecessary dependencies
- Don't over-engineer simple solutions
- Don't leave TODO comments without addressing them
- Don't modify unrelated code when fixing a specific issue

### Security Considerations

- Never commit sensitive data (API keys, passwords, credentials)
- Validate and sanitize inputs in tools that process user data
- Be cautious with file system operations (read/write/delete)
- Review code for potential injection vulnerabilities

## Quick Reference

| Task | Command/Location |
|------|-----------------|
| View project | `ls -la` |
| Git status | `git status` |
| Commit changes | `git commit -m "message"` |
| Push to branch | `git push -u origin <branch>` |

---

*Last updated: December 2024*
*Repository: MWSCORACLE/Tools*
