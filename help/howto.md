To install:
===========
npm ci

To release:
===========
Checkout on main branch (git checkout main)
Ne pas oublier le git pull
npm version major/minor/patch
git push
git push --tags

For debug:
==========
npm run typecheck
will tun the ts checker

npm run build
build the package with vite

npm run deploy
copy on home assistant
warning: homeassistant server name is `ha` and shall be declared in your ssh config

npm run all
it will check, build and deplay.

Prerequisites:
* card already installed in home assistant
* remove the gz in www

