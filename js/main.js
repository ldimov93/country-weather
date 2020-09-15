$(document).ready(function () {
    var restCountryNamesList;
    var $countryNamesList = [];
    var $countryNamesMap = new Map();
    var $return = [];
    var isSuggestedSelected = false;
    var pinnedCountriesData = new Map();
    var $pinnedCountriesMap = new Map();

    async function getCountries() {
        let response = await fetch(
            "https://restcountries.eu/rest/v2/all?fields=name;capital;region;subregion;timezones;currencies;alpha3Code"
        );
        restCountryNamesList = await response.json();
        return restCountryNamesList;
    }
    getCountries().then(
        restCountryNamesList => {
            for (i in restCountryNamesList) {
                let country = restCountryNamesList[i].name;
                $countryNamesList.push(country);
                $countryNamesMap.set(restCountryNamesList[i].alpha3Code, i);
            }
            for (const [key, value] of Object.entries(localStorage)) {
                pinnedCountriesData.set(`${key}`, `${value}`);

                pinCountryTag($countryNamesList[`${value}`]);
                addCountryTag($countryNamesList[`${value}`], restCountryNamesList[`${value}`].alpha3Code);

                $('input[name="toggle-pin-' + restCountryNamesList[`${value}`].name + '"]').change(function () {
                    addCountryTile(`${value}`, $(this));
                });
                generateTile(`${value}`);
                
            }
        }
    );
    $countryNamesList.sort();

    function strInArray(str, strArray) {
        if (str.length >= 3) {
            for (var j = 0; j < strArray.length; j++) {
                var match = strArray[j].name.toLowerCase().match(str.toLowerCase());
                if (match) {
                    let countrySubstr = strArray[j].name.substring(match.index, match.index + str.length);
                    const indexes = [...strArray[j].name.matchAll(new RegExp(str, 'gi'))].map(a => a.index);

                    var $h = strArray[j].name.replace(countrySubstr, '<strong>' + countrySubstr + '</strong>');
                    $return.push('<li class="prediction-item"><span class="prediction-text"' + 'data-alpha3Code="' + strArray[j].alpha3Code + '"' + 'data-countryListIndex="' + j + '">' + $h + '</span></li>');
                }
            }
        }
    }

    function nextItem(kp) {
        if ($('.focus').length > 0) {
            var $next = $('.focus').next(),
                $prev = $('.focus').prev();
        }

        if (kp == 38) { // Up

            if ($('.focus').is(':first-child')) {
                $prev = $('.prediction-item:last-child');
            }

            $('.prediction-item').removeClass('focus');
            $prev.addClass('focus');

        } else if (kp == 40) { // Down

            if ($('.focus').is(':last-child')) {
                $next = $('.prediction-item:first-child');
            }

            $('.prediction-item').removeClass('focus');
            $next.addClass('focus');
        }
    }

    $(function () {
        $('#search-bar').keydown(function (e) {
            $key = e.keyCode;
            if ($key == 38 || $key == 40) {
                nextItem($key);
                return;
            }

            setTimeout(function () {
                var $search = $('#search-bar').val();
                $return = [];

                strInArray($search, restCountryNamesList);

                if ($search == '' || !$('input').val) {
                    $('.output').html('').slideUp();
                } else {
                    $('.output').html($return).slideDown();
                }

                $('.prediction-item').on('click', function () {

                    var alpha3Code = $(this).find('.prediction-text').attr('data-alpha3Code');
                    var countryListIndex = $(this).find('.prediction-text').attr('data-countryListIndex');

                    $text = $(this).find('span').text();
                    isSuggestedSelected = true;
                    $('.output').slideUp(function () {
                        $(this).html('');
                    });
                    $('#search-bar').val($text);
                    $('#search-bar').attr('data-alpha3Code', alpha3Code);
                    $('#search-bar').attr('data-countryListIndex', countryListIndex);
                });

                $('.prediction-item:first-child').addClass('focus');

            }, 50);
        });
    });

    $('#search-bar').focus(function () {
        if ($('.prediction-item').length > 0) {
            $('.output').slideDown();
        }
    });

    $('#searchform').submit(function (e) {
        e.preventDefault();
        let countryPinned = $('[pin-data-country="' + $('#search-bar').val() + '"]').length == 1;
        if (!isSuggestedSelected && !$('[pin-data-country="' + $('#search-bar').val() + "]").attr('pin-data-country')) {
            $(".frame").removeClass("d-none");
            $('.error-msg-country-invalid').removeClass("d-none");
            $('.error-msg-country-exists').addClass("d-none");
        } else {
            var inputCountry = $('#search-bar').val();
            if ($("#" + $("#search-bar").attr("data-alpha3code")).length || inputCountry == "" || countryPinned) {
                $(".frame").removeClass("d-none");
                $('.error-msg-country-invalid').addClass("d-none");
                $('.error-msg-country-exists').removeClass("d-none");
            } else {
                isSuggestedSelected = false;
                var countryListIndex = $('#search-bar').attr('data-countrylistindex');
                $('.output').slideUp();
                $('#search-bar').val($text);
                addCountryTag(inputCountry, $("#search-bar").attr("data-alpha3code"));

                $('input[name="toggle-pin-' + inputCountry + '"]').change(function () {
                    addCountryTile(countryListIndex, $(this));
                });
                generateTile(countryListIndex);

                $('#search-bar').val('');
                $('input').blur();
            }
        }
    });

    function pinCountryTag(inputCountry) {
        $('.pinned-country-tags').append('<div id=\"pinned-' + inputCountry
            + '\" pin-data-country=\"' + inputCountry
            + '\" class=\"pinned-item\"><div class="tag unselected material-switch"><p>' + inputCountry
            + '</p></div>'
            + '</div>');
    }

    function addCountryTag(inputCountry, alpha3Code) {
        let countryPinned = $('[pin-data-country="' + inputCountry + '"]').length == 1;

        $('.country-tags').append('<div id=' + alpha3Code + ' data-alpha3=' + alpha3Code
            + ' data-country=\"' + inputCountry
            + '\"><div class="tag unselected material-switch"><p>' + inputCountry
            + '</p><input id=\"pin-' + inputCountry
            + '\" name=\"toggle-pin-' + inputCountry
            + '\"' + (countryPinned ? 'checked ' : ' ') + 'type=\"checkbox\"/><label for=\"pin-' + inputCountry
            + '\" class=\"label-primary\"></label></div>'
            + '</div>');
    }

    function pinCountry(countryCode, countryListIndex) {
        var countryExists = pinnedCountriesData.get(countryCode);
        if (localStorage.getItem(countryCode) === null) {
            if (typeof countryExists === 'undefined') {
                $pinnedCountriesMap.set(countryCode, countryListIndex);
                pinnedCountriesData.set(countryCode, countryListIndex);
                localStorage.setItem(countryCode, countryListIndex);
                alert("Pinned to favorites");
                return;
            } else {
                alert("Country already exists");
            }
        }
    }

    function addCountryTile(countryListIndex, elem) {
        var countryCodeAlpha3 = restCountryNamesList[countryListIndex].alpha3Code;
            var countryName = restCountryNamesList[countryListIndex].name;
            let countryPinned = $('[pin-data-country="' + countryName + '"]').length == 1;
            
            if (elem[0].checked && localStorage.getItem(countryCodeAlpha3) === null && !countryPinned) {
                pinCountry(countryCodeAlpha3, countryListIndex);
                pinCountryTag(countryName);
                
            } else {
                localStorage.removeItem(countryCodeAlpha3);
                pinnedCountriesData.delete(countryCodeAlpha3);

                $("[pin-data-country='" + countryName + "']").remove();
                alert("Unpinned from favorites");
            }
    }

    function generateTile(countryListIndex) {
        // tile html struct
        var htmlTile = "";
        // country information
        var capital = restCountryNamesList[countryListIndex].capital;
        var countryTimeUtcFormatted = restCountryNamesList[countryListIndex].timezones[0].replace(/[a-z]/gi, '');

        // weather information
        var weatherResult = getCapitalWeatherData(capital);
        var mainType = weatherResult.weather[0].main;
        var mainDescription = weatherResult.weather[0].description;
        var temp = weatherResult.main.temp;
        var minTemp = weatherResult.main.temp_min;
        var maxTemp = weatherResult.main.temp_max;
        var humidity = weatherResult.main.humidity;
        var capitalTimeUtcMins = weatherResult.timezone / 60;
        countryTimeUtcFormatted = countryTimeUtcFormatted.replace("-", "");

        htmlTile += "<div class=\"col-12 col-md-6 col-lg-4 card-col\">";
        htmlTile += "<div class=\"card bg-light mb-3\">";
        htmlTile += "<div class=\"card-header\">" + restCountryNamesList[countryListIndex].name + "</div>";
        htmlTile += "<div class=\"card-body\">";
        htmlTile += "<h5 class=\"card-title\">Capital: " + capital + "</h5>";
        htmlTile += "<p class=\"card-text\">Region: " + restCountryNamesList[countryListIndex].region + "</p>";
        htmlTile += "<p class=\"card-text\">Subregion: " + restCountryNamesList[countryListIndex].subregion + "</p>";
        htmlTile += "<p class=\"card-text\">Capital date and time: <span class=\"card-clock\" data-timeUtc=\"" + capitalTimeUtcMins + "\"></span></p>";
        htmlTile += "<p class=\"card-text\">Main type: " + mainType + "</p>";
        htmlTile += "<p class=\"card-text\">Description of the type: " + mainDescription + "</p>";
        htmlTile += "<p class=\"card-text\">Temperature: " + temp + "°C" + "</p>";
        htmlTile += "<p class=\"card-text\">Min. Temperature: " + minTemp + "°C" + "</p>";
        htmlTile += "<p class=\"card-text\">Max. Temperature: " + maxTemp + "°C" + "</p>";
        htmlTile += "<p class=\"card-text\">Humidity: " + humidity + "%" + "</p>";
        htmlTile += "</div>";
        htmlTile += "</div>";
        htmlTile += "</div>";
        $('.card-container').append(htmlTile);
    }

    // Update local time
    setInterval(() => {
        $(".card-clock").each(function () {
            var offsetVal = $(this).attr('data-timeUtc') * 1;
            $(this).html(moment.utc().utcOffset(offsetVal).format('MMMM Do YYYY, h:mm:ss a'));
        });
    }, 1000);

    function getCapitalWeatherData(countryCapital) {
        var capWeatherData = null;
        $.ajax({
            type: "POST",
            url: "http://api.openweathermap.org/data/2.5/weather?q=" + countryCapital + "&appid=90c9eabe982ed70936691714f61c816c&units=metric",
            dataType: "json",
            async: false,
            success: function (result, status, xhr) {
                capWeatherData = result;
            },
            error: function (xhr, status, error) {
                alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
            }
        });
        return capWeatherData;
    }

    $('#search-bar').blur(function () {
        if ($('.prediction-item').length > 0) {
            $('.output').slideUp();
        }
    });

    // Modal
    $('#close').on('click', function () {
        $('.frame').addClass('d-none');
    });

});