# [Unimarklet](https://thaumicmekanism.github.io/Unimarklet)
This is a javascript bookmarklet manager to check for bookmarklets for the current site.

## Unimarklet Client
Here are the required things for the client. You can view an example client here [unimarklet_client.js](https://github.com/ThaumicMekanism/Unimarklet/blob/master/unimarklet_client.js). You can also go to the [website](https://thaumicmekanism.github.io/Unimarklet) to customize it as well.

## Unimarklet Repo
This script is for if you want to make your own repo for bookmarklets. Please follow the example script and this readme to ensure your repo will work as expected. [An example script can be found here](https://github.com/ThaumicMekanism/Unimarklet/blob/master/bookmarklets_repo.js)

## Unimarklet Site Script
This is the script which is in a url. It should be in the format described below or things may break. [An example script can be found here](https://github.com/ThaumicMekanism/Unimarklet/blob/master/repo/thaumicmekanism.github.io.js)


## Unimarklet Manager
This is the main script which the client calls. It will be the main execution script. You SHOULD ALWAYS call this script from the client and only from this repo otherwise it will not have all the up to date features and may not be legitimate. Because of this, there is nothing you have to do with this script. You do not need to copy it into your repo since it will load your repo if specified in the client.