# VERSION_CONTROL.md

- Write clean and descriptive commit messages. Seperate tasks into commits and after mid/big tasks commit the changes.
- Use feature branches for new features and bug fixes, and merge them back to main with pull requests. Follow the conventional commit format for commit messages (e.g., `feat: add new API endpoint`, `fix: resolve authentication bug`, `refactor: improve code structure`). Use worktrees for parallel development when necessary.
- Follow best practices for branching and merging, such as rebasing feature branches onto the latest main branch before merging to keep a clean commit history. Use pull requests for code reviews and discussions before merging changes into the main branch.
- Use tags to mark release points in the commit history, following semantic versioning (e.g., `v1.0.0`, `v1.1.0`, `v2.0.0`). This helps in tracking versions and rolling back if necessary.
- Use .gitignore to exclude files and directories that should not be tracked by version control, such as node_modules, build artifacts, and environment variable files. This keeps the repository clean and prevents sensitive information from being committed.
- Update README.md and other documentation files as needed to reflect changes in the codebase, new features, or updates to the project. This ensures that documentation stays current and useful for developers and users alike.
