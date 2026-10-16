# syntax=docker/dockerfile:1

ARG PHP_VERSION=8.4.24
ARG NODE_VERSION=24.19.0
ARG COMPOSER_VERSION=2.10.2

FROM node:${NODE_VERSION}-trixie-slim AS node
FROM composer:${COMPOSER_VERSION} AS composer

FROM php:${PHP_VERSION}-cli-trixie AS app

ARG HOST_UID=1000
ARG HOST_GID=1000

ENV COMPOSER_ALLOW_SUPERUSER=0 \
    COMPOSER_HOME=/home/oddiary/.composer \
    COMPOSER_MEMORY_LIMIT=-1 \
    NPM_CONFIG_CACHE=/home/oddiary/.npm \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    PATH=/var/www/html/vendor/bin:/var/www/html/node_modules/.bin:$PATH

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        libicu-dev \
        libpq-dev \
        libzip-dev \
        postgresql-client \
        unzip \
    && rm -rf /var/lib/apt/lists/*

ARG PCOV_VERSION=1.0.12
ARG XDEBUG_VERSION=3.5.3

RUN docker-php-ext-configure intl \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        intl \
        opcache \
        pcntl \
        pdo_pgsql \
        zip

RUN pecl install pcov-${PCOV_VERSION} \
    && pecl install xdebug-${XDEBUG_VERSION} \
    && docker-php-ext-enable pcov xdebug

COPY docker/app/php.ini /usr/local/etc/php/conf.d/zz-oddiary.ini
COPY docker/app/xdebug.ini /usr/local/etc/php/conf.d/zz-xdebug.ini

COPY --from=composer /usr/bin/composer /usr/local/bin/composer
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

RUN groupadd --gid "${HOST_GID}" oddiary \
    && useradd --uid "${HOST_UID}" --gid "${HOST_GID}" --create-home --shell /bin/bash oddiary \
    && install -d -o oddiary -g oddiary /var/www/html "${COMPOSER_HOME}" "${NPM_CONFIG_CACHE}"

WORKDIR /var/www/html
USER oddiary

EXPOSE 8000 5180

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000", "--no-reload"]
