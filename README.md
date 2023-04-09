# Pure Node.js Demo

A refreshing take on using only vanilla Node.js without any runtime dependencies.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [API Endpoints](#api-endpoints)
- [Development](#development)
  - [Running Tests](#running-tests)
  - [Linting](#linting)
- [Deployment](#deployment)
- [Built With](#built-with)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [Authors](#authors)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Getting Started

These instructions will help you set up the project on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed on your machine:

- Node.js (version 19.6.0 or higher)
- npm (version 8.5.0 or higher)

### Installation

1. Clone the repository:
```
git clone https://github.com/AntonPerson/pure-nodejs-demo.git
```

2. Install the dependencies:
```
cd pure-nodejs-demo
npm install
```

3. Start the development server:
```
npm start
```

The server will be running on `http://localhost:8040`.

## Usage

### API Endpoints

- `/ping`: Health check.
- `/version`: Information on the node version, branch, last commit hash and timestamp.
- `/images`: Paginated images with `?size=10&offset=0`
- `/profile`: Aggregated user and posts. Select the user with `?userId=1`
- `/company`: Search for posts written by users who belong to a specific company (`?companyName=Romaguera`).

## Development

### Running Tests

To run the tests, execute the following command:
```
npm test
```

The project is set up to optionally use [Wallaby.js](https://wallabyjs.com/).
Otherwise, the test runner is [Vitest](https://vitest.dev/).

You can see the test coverage with the following command:
```
npm run coverage
```

## Deployment

Instructions for deploying the project to a production environment. (**TODO**)

## Built With

- [Node.js](https://nodejs.org/) - The runtime environment used
- No runtime dependencies at all, no frameworks, no libraries, just pure Node.js

## Contributing

Guidelines for contributing to the project. (**TODO**)

## Versioning

Just a regular git workflow, nothing special yet.

## Authors

- **Anton Person** - *Initial work* - [AntonPerson](https://github.com/AntonPerson)

See also the list of [contributors](https://github.com/AntonPerson/pure-nodejs-demo/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Thanks to everyone who contributed to the project.
- Special thanks to those who inspired and guided the development process.

