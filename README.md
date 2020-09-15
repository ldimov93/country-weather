# Author: Lachezar Dimov

# Project overview:
This is a web-based application from which users have the option to search and select countries. They are able to track current weather conditions for the corresponding country's capital.

The application gives an option to the user to choose if they want to pin/unpin the searched countries on the homepage of the application. 

To pin an item, first search for it, choose from the list of suggested results, hit 'Search country'. Afterwards, you will get the option to use the toggle pin/unpin feature.

# Components:
1. Search field - finds results no matter if the entered search query was lower or upper case
2. List of results
3. Tags representing the selected countries as a list menu
4. Tiles representing the country and its current weather information
    1. Country is defined by:
        * Name
        * Capital
        * Region (along with Subregion)
        * Local time at the country relative to the Users Browser Time
        * Current Weather Information at the Country. Current Weather Information is defined by:
            * Main Type (main)
            * Description of the Type (description)
            * Temperature (represented as Celsius)
            * Min. Temperature (represented as Celsius)
            * Max. Temperature (represented as Celsius)
            * Humidity 

# Assumptions:
* Country search suggestions show up as the user types and when there are 3 or more characters in the input box
* Restcountries.eu API - if a given country observes summer time (DST), then this won't be taken into account. The API does not show time zones with summer time and are not taken into account. This results in incorrect times for countries with DST. So, the time offset given from the OpenWeatherMap API was used.