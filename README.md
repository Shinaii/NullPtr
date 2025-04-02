<div id="top">

<!-- HEADER STYLE: CLASSIC -->
<div align="center">

# NULLPTR

Educational purpose only!


<!-- BADGES -->
<img src="https://img.shields.io/github/license/Shinaii/nullptr?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
<img src="https://img.shields.io/github/last-commit/Shinaii/nullptr?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/Shinaii/nullptr?style=default&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/Shinaii/nullptr?style=default&color=0080ff" alt="repo-language-count">

<!-- default option, no dependency badges. -->


<!-- default option, no dependency badges. -->

</div>
<br>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
    - [Project Index](#project-index)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Usage](#usage)
    - [Testing](#testing)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

NullPtr is a cross-platform Bot designed to Upload and Download files to a anonymous storage provider.

**Why NullPtr?**

This project optimizes development workflows and fosters seamless integration. The core features include:

- **🚀 Task Management and Optimization:** Efficiently orchestrates tasks with `turbo`, reducing build times and resource usage.
- **🔗 Modular Development:** Leverages workspaces for scalable and manageable project organization.
- **🌐 Seamless Integration:** Ensures robust communication with Telegram and Discord APIs, enhancing functionality.
- **📊 Database Management:** Utilizes Prisma for efficient schema generation and data integrity.
- **📁 File Handling:** Provides streamlined file uploads and status checks with Axios and FormData.
- **🌍 Open Source Collaboration:** Encourages innovation and contribution through the MIT License.

---

## Features

|      | Component       | Details                              |
| :--- | :-------------- | :----------------------------------- |
| ⚙️  | **Architecture**  | <ul><li>Monorepo structure</li><li>Microservices: Telegram, Discord</li><li>TypeScript-based</li></ul> |
| 🔌 | **Integrations**  | <ul><li>Discord.js with Sapphire.js for Discord bot</li><li>Prisma for database ORM</li><li>Axios for HTTP requests</li></ul> |
| 🧩 | **Modularity**    | <ul><li>Packages: Upload, Database</li><li>Separation of concerns</li><li>Reusable components</li></ul> |
| ⚡️  | **Performance**   | <ul><li>Optimized with TypeScript</li><li>Prisma for efficient DB queries</li></ul> |
| 🛡️ | **Security**      | <ul><li>Environment variables in `.env`</li><li>No explicit security measures</li></ul> |
| 🚀 | **Scalability**   | <ul><li>Microservices architecture</li><li>Prisma for scalable database interactions</li></ul> |


---

## Getting Started

### Prerequisites

This project requires the following dependencies:

- **Package Manager:** Bun

### Installation

Run nullptr from the source and intsall dependencies:

1. **Clone the repository:**

    ```sh
    ❯ git clone https://github.com/Shinaii/nullptr
    ```

2. **Navigate to the project directory:**

    ```sh
    ❯ cd nullptr
    ```

3. **Install the dependencies:**

   ```sh
   ❯ bun install
   ```

### Usage

**Editing .env files**

You'll find several `.env.example` files inside the Project, rename those to `.env` and fill in The
values to your liking after that you can run nullptr.

**Using [bun](https://bun.sh/):**
```sh
❯ bun turbo db:migrate
❯ bun run dev
```

## Contributing

- **🐛 [Report Issues](https://github.com/Shinaii/nullptr/issues)**: Submit bugs found or log feature requests for the `nullptr` project.
- **💡 [Submit Pull Requests](https://github.com/Shinaii/NullPtr/pulls)**: submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/Shinaii/nullptr
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/Shinaii/nullptr/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=Shinaii/nullptr">
   </a>
</p>
</details>

---

## License

Nullptr is protected under the MIT License.
