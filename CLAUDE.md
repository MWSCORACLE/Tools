# CLAUDE.md - AI Assistant Guide for Tools Repository

This document provides essential information for AI assistants working with this codebase.

## Repository Overview

**Project Name:** Tools
**Status:** Initial setup - empty repository
**Owner:** MWSCORACLE (mark.p.wilson@oracle.com)

This repository is intended for development of tools and utilities. Currently in initial setup phase with no source code yet added.

## Current Structure

```
Tools/
├── .git/              # Git repository metadata
├── README.md          # Project documentation (minimal)
└── CLAUDE.md          # This file - AI assistant guidelines
```

## Development Status

- **Technology Stack:** Not yet determined
- **Build System:** Not configured
- **Package Manager:** Not configured
- **Testing Framework:** Not configured
- **CI/CD:** Not configured

## Git Workflow

### Branch Naming Convention

- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- Claude Code sessions: `claude/<session-id>`

### Commit Message Format

Use clear, descriptive commit messages:
```
<type>: <short description>

[optional body with more details]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Current Branch

Working branch: `claude/claude-md-mi5527klks3xk7jj-01Ghk1ajEbpg4n9528WBLrs5`

## Conventions for AI Assistants

### Code Quality Standards

When adding code to this repository:

1. **Follow language-specific best practices** for the chosen technology stack
2. **Include appropriate error handling** in all functions
3. **Add docstrings/comments** for public functions and complex logic
4. **Keep functions focused** - single responsibility principle
5. **Use meaningful variable and function names**

### File Organization

When the project structure is established:

- `/src` or `/lib` - Source code
- `/tests` - Test files
- `/docs` - Documentation
- `/scripts` - Utility scripts
- `/config` - Configuration files

### Documentation Requirements

- Update README.md with project setup instructions
- Document all public APIs
- Include usage examples for tools
- Keep CLAUDE.md updated with any structural changes

### Testing Guidelines

- Write tests for all new features
- Maintain test coverage above 80%
- Run tests before committing
- Include both unit and integration tests where appropriate

### Security Considerations

- Never commit sensitive data (API keys, passwords, credentials)
- Use environment variables for configuration
- Add appropriate entries to `.gitignore`
- Review code for common vulnerabilities (OWASP Top 10)

## Setup Instructions

### Initial Setup (To Be Completed)

1. Determine technology stack
2. Initialize package manager
3. Add `.gitignore` for chosen stack
4. Create source directory structure
5. Set up testing framework
6. Configure linting/formatting tools

### Recommended Configuration Files

Once technology stack is chosen, add:

- `.gitignore` - Ignore build artifacts, dependencies, secrets
- `.editorconfig` - Consistent coding style
- `LICENSE` - Open source license if applicable
- Configuration for linter/formatter (e.g., `.eslintrc`, `.prettierrc`, `pyproject.toml`)

## Common Tasks

### Adding a New Tool

1. Create tool file in appropriate directory
2. Add comprehensive docstrings
3. Write unit tests
4. Update documentation
5. Add usage example to README

### Running Tests

```bash
# Commands will vary based on chosen tech stack
# Examples:
# npm test
# pytest
# go test ./...
```

### Building the Project

```bash
# Commands will vary based on chosen tech stack
```

## Dependencies

None configured yet. When added:

- Document all dependencies in appropriate manifest file
- Pin versions for reproducibility
- Prefer well-maintained, secure packages

## Known Issues

None currently - repository in initial setup phase.

## Contact

- **Author:** MWSCORACLE
- **Email:** mark.p.wilson@oracle.com

## Changelog

### 2025-11-18
- Created initial CLAUDE.md with repository guidelines
- Documented empty repository structure
- Established conventions for future development

---

*This document should be updated as the repository evolves and the technology stack is determined.*
