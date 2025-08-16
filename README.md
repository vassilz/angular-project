# Bookstore

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.11.

This is an Angular application representing the frontend of an Online Bookstore web application.

The backend is implemented using Firebase Realtime database and Firebase Storage for storing and providing data, as well as Firebase Authentication, for managing user logins and sessions.

The Angular application is configured to work with the Firebase backend via the proper configuration in the environment\*.ts files.

In order to run the application, you first need to install all needed npm package dependencies locally, by running the command 'npm install' in a terminal, within the root folder of the project. You then need to run the command 'ng serve' within the same folder to start the application.

A potential future enhancement would be to support also a Jetty Java backend.

## Admin access

Login with user 'admin@gmail.com' and password 'admin1' for administrative access.
With that you will be able to see user data, add authors, add/edit/delete books.

## Third party components

The application makes use of several Material icons, see `https://fonts.google.com/icons`.

It also uses the Bulgarian and UK flag icons from the flag icons npm package, see `https://github.com/lipis/flag-icons`.

## Localization

This application has been localized in Bulgarian, and English.

By default it runs with Bulgarian localization, when you start it with `ng serve`.

In order to run it with English localization, or to be able to change the language dynamically at runtime, you first need to build the application with `npm build --localize`.

This will generate localized bundles in the dist/bookstore subdirectory. You then need to deploy and run those bundles in a web server, such as Apache.

You may also want to configure redirects in the web server, to the index.html by default, to enable Angular routing to work properly. See the sample config for Apache in `src/deployment/apache.config`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Other acknowledgements

Some parts and code snippets have been inspired by the workshop of Tsveti Stoyanov given in the SoftUni Angular course October 2024.
