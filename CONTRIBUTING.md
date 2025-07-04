# Contributing to WhiteRoom.exe

Welcome to the recursive reality matrix! We're excited to have you contribute to WhiteRoom.exe.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/whiteroom-exe.git`
3. Install dependencies: `npm run setup`
4. Configure environment: Copy `.env.example` to `.env` and fill in your credentials
5. Set up databases: `createdb whiteroom_db` and start Redis
6. Run tests: `npm test`
7. Start development: `npm run dev`

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Use meaningful commit messages

### Testing
- Write tests for new features
- Ensure all tests pass before submitting PR
- Test both backend API and frontend components

### AI Integration
- Be mindful of OpenAI API costs during development
- Mock AI responses in tests
- Document any new AI integration patterns

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes and add tests
3. Ensure all tests pass: `npm test`
4. Commit with clear messages
5. Push to your fork: `git push origin feature/amazing-feature`
6. Create a Pull Request

## Reporting Issues

Please use GitHub Issues to report bugs or request features. Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)

## Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge about AI, game design, and recursive narratives
- Remember: we're all here to break the fourth wall together!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.