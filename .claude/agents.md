# Agent Development Guidelines

## Code Search Priority
1. **First**: Always use `claude-context_search_code` for semantic code search
2. **Then**: Use `grep` for pattern-based content search
3. **Finally**: Use `glob` for filename pattern matching

## Build/Lint/Test Commands
- **Lint**: `make style.run-check`
- **Format**: `make style.format`
- **Tests**: No test framework configured - tests appear to be run via CI (`make test.run-ci`)

## Code Style Guidelines
- **Line length**: 150 characters (ruff config)
- **Quotes**: Double quotes for strings
- **Indentation**: Spaces (4 spaces for Python, 2 for YAML/JSON)
- **Import style**: Standard Python imports, langchain ecosystem heavily used
- **Type hints**: Use typing_extensions, pydantic for data models
- **Error handling**: Use structured logging via utils.logger, custom metrics for errors
- **Naming**: snake_case for variables/functions, PascalCase for classes
- **Dependencies**: FastAPI, LangChain/LangGraph ecosystem, Redis, Docker-based development

## When to use the think tool
Before taking any action or responding to the user after receiving tool results, use the think tool as a scratchpad to:
- List the specific rules that apply to the current request
- Check if all required information is collected
- Verify that the planned action complies with all policies
- Iterate over tool results for correctness
- Analyze complex information from web searches or other tools
- Plan multi-step approaches before executing them

## How to use the think tool effectively
When using the think tool:
1. Break down complex problems into clearly defined steps
2. Identify key facts, constraints, and requirements
3. Check for gaps in information and plan how to fill them
4. Evaluate multiple approaches before choosing one
5. Verify your reasoning for logical errors or biases
