# Memarya

A modern web application built with Next.js, React, and TypeScript.

## About The Project

Memarya is a full-stack web application that leverages the power of Next.js 15 for server-side rendering and modern React features. The project is built with TypeScript for type safety and includes authentication, database integration with Drizzle ORM, and a comprehensive UI component library using Radix UI.

### Built With

* [Next.js 15](https://nextjs.org/) - The React Framework for Production
* [React 19](https://react.dev/) - JavaScript library for building user interfaces
* [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
* [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
* [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM for SQL databases
* [Better Auth](https://www.better-auth.com/) - Authentication library for Next.js
* [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components
* [PostgreSQL](https://www.postgresql.org/) - Open source relational database

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

Before you begin, ensure you have the following installed:

* Node.js (version 20 or higher)
* pnpm (recommended) or npm
  ```sh
  npm install -g pnpm
  ```
* PostgreSQL database

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/Dawaman43/Memarya.git
   ```

2. Navigate to the project directory
   ```sh
   cd Memarya
   ```

3. Install dependencies
   ```sh
   pnpm install
   ```

4. Set up environment variables
   ```sh
   cp .env.example .env
   ```
   Then edit `.env` and add your database connection string and other required environment variables.

5. Run database migrations
   ```sh
   pnpm drizzle-kit push
   ```

6. Start the development server
   ```sh
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

This section provides examples and instructions on how to use the application. You can add screenshots, code examples, and step-by-step guides here.

### Development

To run the development server:
```sh
pnpm dev
```

### Building for Production

To create an optimized production build:
```sh
pnpm build
```

To start the production server:
```sh
pnpm start
```

### Linting

To run the linter:
```sh
pnpm lint
```

### Testing

To run tests:
```sh
pnpm test
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` file for more information.

## Contact

Project Link: [https://github.com/Dawaman43/Memarya](https://github.com/Dawaman43/Memarya)
