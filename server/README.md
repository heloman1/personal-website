# Personal Website

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Using Systemd

```bash
# Install the service
./add-systemd-user-service.sh

# Run at startup/reboot
systemctl --user enable personal-website.service

# Start
systemctl --user start personal-website.service
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
