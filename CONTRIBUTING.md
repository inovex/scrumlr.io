# Contributing
Thank you for considering contributing to Scrumlr and taking the time to explore our contribution guide. We greatly appreciate your interest and willingness to help improve Scrumlr with your valuable contributions. Your involvement and contributions play a significant role in enhancing Scrumlr and making it even better. We warmly welcome pull requests from all contributors, big or small. For major changes, we kindly request [open a discussion](https://github.com/inovex/scrumlr.io/discussions) first, allowing us to collaborate and discuss your ideas and proposed changes. Once again, we extend our heartfelt gratitude for your dedication and passion in helping us shape the future of Scrumlr.

- [Prerequisites](#prerequisites)
- [Development](#development)
- [Testing](#testing)
- [Translating](#translating)
- [Definition of Done](#definition-of-done)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Review](#code-review)
- [Contact and Communication](#contact-and-communication)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## Prerequisites
Before you start contributing to our web application, please ensure that you have the following prerequisites set up on your development environment. On the front-end, you'll need to have **Node.js** installed, as well as **Yarn** (a fast and reliable package manager) to work with **React** and **TypeScript**. For the back-end, make sure you have **Go** installed, which will be used to build and run the back-end. Additionally, **Docker** is required to run the database locally. You can install Docker by following the official installation instructions for your operating system. Having these prerequisites in place will enable you to seamlessly set up and contribute to our web application. If you have any questions or need assistance with the setup, feel free to reach out for support.

## Development
1. Fork and clone the repository
2. Create a branch for your pull request with `git checkout -b your-branch-name`

### Client
1. Run `yarn` to install the Front-end dependencies
2. Run `yarn start` to start the Front-end in development mode. 
3. Open http://localhost:3000 to view it in the browser. The page will automatically reload if you make changes to the code. You will see the build errors and lint warnings in the console.

### Server
#### Option 1: Run the Back-end & Database with Docker
```bash
$ docker compose --project-directory server/ --profile build up -d
```

#### Option 2: Run the Back-end from your CLI & the Database with Docker
```bash
$ docker compose --project-directory server/ --profile dev up -d
$ go run . -d "postgres://admin:supersecret@localhost:5432/scrumlr?sslmode=disable" -v --disable-check-origin --insecure
```
## Testing
To run the tests locally, you can use the following command in your terminal:
```bash
yarn test
```

This command will execute the test suite and provide you with detailed feedback on the test results, including any failures or errors encountered. Running tests locally helps you verify that your changes have not introduced any regressions and ensures that the existing functionality remains intact.

In addition to local testing, we utilize GitHub Actions to automate the testing process for every pull request. GitHub Actions automatically runs the test suite against the proposed changes, providing a clear indication of whether the tests pass or not. This ensures that all tests are passing before merging any changes into the main branch, maintaining the stability and integrity of our codebase.

We strongly encourage contributors to write new tests when introducing new features or modifying existing functionality. These tests help validate the behavior and correctness of the code, making it easier to identify and fix issues early on.

## Translating
If you want to add support for another language, just copy the base configuration `public/locales/en/translation.json` into a new directory with your language code `public/locales/{language code}/translation.json` and translate all values of the JSON properly. Once you're done you can open a pull request, and we will try to review your translation by a few samples.

## Definition of Done
Behold our Definition of Done, an agreement we have established to ensure the quality and completeness of our work:

- If the pull request is based on an issue:
  - All (sub-) tasks have been diligently completed.
  - Every acceptance criterion has been successfully met.
- The code is meticulously implemented, satisfying these criteria:
  - It seamlessly passes the lint tests, showcasing our commitment to clean code.
  - BEM-CSS methodology is employed, promoting a modular and maintainable codebase.
- Variable names are thoughtfully chosen, conveying clear meaning and intent.
- Documentation within the codebase is present where necessary, empowering future developers.
- Both light and dark themes are gracefully supported and extensively tested.
- The design implementation is exemplary, exhibiting responsiveness across all devices and screen sizes.
- Rigorous testing has been conducted across commonly used browsers, including Chrome, Firefox, and Safari.
- All existing tests continue to pass, assuring the preservation of expected functionality.
- New tests have been meticulously introduced to cover newly implemented features.
- Prior to merging into our main branch, a diligent code review by a fellow team member has been undertaken, ensuring quality, adherence to best practices, and fostering collaborative growth.

## Pull Request Guidelines
This section outlines the typical structure and guidelines followed for pull requests in our repositories. This section provides a set of instructions and recommendations to ensure consistency and clarity when submitting pull requests. It covers the expected format, information, and steps to follow when creating a pull request.

### Title
Make sure the title starts with a semantic prefix:
-   **feat**: A new feature.
-   **fix**: A bug fix.
-   **docs**: Documentation only changes.
-   **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
-   **refactor**: A code change that neither fixes a bug nor adds a feature.
-   **perf**: A code change that improves performance.
-   **test**: Adding missing tests or correcting existing tests.
-   **build**: Changes that affect the build system.
-   **chore**: Other changes that don't modify src or test files.
-   **revert**: Reverts a previous commit.

### Description
The description section serves as a crucial component of a pull request, providing an overview of the changes made and explaining the purpose and context of the proposed modifications. It should clearly articulate the problem being addressed or the feature being added, along with a concise explanation of how the changes solve the issue. A well-written description is informative, organized, and easy to comprehend, allowing reviewers to assess the impact and significance of the proposed changes. It should be concise and to the point while still providing enough information to convey the purpose and significance of the pull request.

If your pull request refers to or fixes an issue, be sure to add refs #XXX or fixes #XXX to the PR description. Replacing XXX with the respective issue number. See more about Linking a pull request to an issue.

### Changelog
The Changelog section of a pull request provides a concise and organized summary of the changes made to the code base, documentation, or any other relevant components. It is typically presented as a bullet point list, highlighting the specific modifications introduced by the pull request. The Changelog serves as a valuable reference for developers and project maintainers, enabling them to quickly grasp the nature and extent of the changes. Each bullet point in the Changelog should focus on a specific alteration or addition, providing a clear and brief description of the corresponding update. 

### Visual Changes
The 'Visual Changes' section of a pull request focuses on documenting any alterations to the user interface or visual appearance of a component or part of the web application. This section is particularly useful when there are noticeable visual modifications resulting from the pull request, such as changes to the design, layout, or styling. It is common practice to include 'Before' and 'After' screenshots to clearly illustrate the visual differences. If a new feature or part of the web app has been implemented, a screenshot showcasing the new addition should be included as well. 

## Code Review
Code reviews are mandatory in our project. While it may add overhead to each change, it plays a crucial role in maintaining code quality. Code reviews ensure that simple yet often overlooked problems are identified and resolved early on, reducing the likelihood of bugs and technical debt. By engaging in code reviews, team members can leverage their collective expertise, identify potential improvements, and maintain consistent coding standards. 

## Contact and Communication

If you have any questions, need assistance, or would like to discuss any aspect of Scrumlr, we encourage you to reach out to us. The [GitHub Discussions](https://github.com/inovex/scrumlr.io/discussions) section is a great place for community engagement.
- **Q&A**: The Discussions Q&A section is the appropriate place to ask questions, seek clarifications, and engage in technical discussions. Please make sure to search for existing discussions and questions before starting a new thread to avoid duplicates and find relevant information.
- **Proposals**: If you have a feature request or would like to propose an idea for Scrumlr, the Discussions Proposal section is the right place. This section enables you to suggest new features, improvements, or changes to Scrumlr.

Additionally, you can use the issue tracker for reporting bugs. Our team actively monitors the issue tracker and will respond as soon as possible.

We value your input, feedback, and contributions, and we're here to support you throughout your journey with Scrumlr. Don't hesitate to engage in discussions, propose ideas, or raise questions – together, we can shape the future of Scrumlr!

## Code of Conduct
See the [Code of Conduct](./CODE_OF_CONDUCT.md) file.

## License
See the [LICENSE](./LICENSE) file for licensing information.