# DevStash

A Developer knowledge hub for snippets, commands, prompts, notes, files, images, link and custom types.

## Context Files

Read the following to get full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Neon MCP — Database Access Rules

When using the Neon MCP tools in this project, you **MUST** follow these rules:

- **Project:** Always use the `DevStash` Neon project (`projectId: late-leaf-11184430`).
- **Branch:** Always use the `development` branch (`branchId: br-restless-firefly-apz54upc`) by default. Pass this `branchId` explicitly on every Neon MCP call that accepts one (e.g. `run_sql`, `run_sql_transaction`, `describe_branch`, `get_database_tables`, `describe_table_schema`, `prepare_database_migration`, `list_slow_queries`, `get_connection_string`, etc.).
- **Production is off-limits:** Never read from, write to, or reference the `production` branch (`br-purple-unit-ap2qh2a5`) unless I explicitly say "production" (or the branch ID) in the request. This includes schema inspection, SELECTs, migrations, branch deletion, and connection strings.
- **No silent defaults:** If a Neon tool would otherwise fall back to the default/primary branch, do not call it without first setting `branchId` to the development branch.
- **Destructive operations:** Even on the development branch, confirm with me before running `delete_branch`, `delete_project`, `reset_from_parent`, `complete_database_migration`, or any DROP/TRUNCATE/DELETE SQL.
- **If unsure which branch to use:** ask first — do not guess and do not touch production.
