# Azure Functions Example Project

This project contains Azure Functions for various tasks.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
  - [Install pnpm](#install-pnpm)
- [Usage](#usage)
- [Functions](#functions)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Monorepo for Azure Functions demo

### Install pnpm

To install pnpm, follow these steps:

1. **Using npm**:

```sh
npm install -g pnpm
```

2. **Using Homebrew (macOS)**:

```sh
brew install pnpm
```

3. **Using curl**:

```sh
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

For more installation options and detailed instructions, visit the [official pnpm installation guide](https://pnpm.io/installation).

## Usage

Run pnpm install

```sh
pnpm install
```

Build

```sh
pnpm run build
```

Run

You need to provide the following api keys

```sh
export OPENAI_API_KEY="<your-openai-key>"
export DEEPSEEK_API_KEY="<your-deepseek-key>"
```

```sh
pnpm start
```

Visit

`http://localhost:7071/api/public/index.html`

## Functions

Functions:

1. ChannelService_Join: [POST] http://localhost:7071/api/channels/{channel}/join # Just for testing
1. ChannelService_List: [GET] http://localhost:7071/api/channels/list # Just for testing
1. MessageService_Send: [POST] http://localhost:7071/api/messages/{option}/send # Returns the whole answer from API
1. MessageService_Stream: [POST] http://localhost:7071/api/messages/{option}/stream # Streams the answer using text/event-stream
1. StaticService_GetStaticFile: [GET] http://localhost:7071/api/public/{\*path} # Serves index.html

## Contributing

Guidelines for contributing to this project.

## License

Include the license information for your project.
