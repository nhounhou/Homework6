$(document).ready(function() {
    var button=$(".btn");

    button.click(function(){
        var city=$(".form-control").val();
        if (city.length===0) {
            alert("Please type in a city to search");
            return;
        } else {
            // calling function to add to the city search list and save to the localStorage

            // getting the data for the weather of the current city
            var apiKey="a514055f038fdd2161edb41030d73126";
            var queryURL="https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+apiKey;
            console.log(queryURL);
            $.ajax({
                url: queryURL,
                method:"GET"
            }).then(function(reponse){

                // calling function to update the current city weather
                updateCurrent(reponse);

                // calling another .ajax to get the UV index
                var lat=reponse.coord.lat;
                var lon=reponse.coord.lon;
                var queryUV="http://api.openweathermap.org/data/2.5/uvi?lat="+lat+"&lon="+lon+"&appid="+apiKey;
                $.ajax({
                    url: queryUV,
                    method: "GET"
                }).then(function(UV){
                    $("#currentUV").text("UV Index: "+UV.value);
                    //apply the color coded for the UV index
                    //  1-2: low
                    //  3-5: moderate
                    //  6-7: high
                    //  8-10: very high
                    //  >11: extreme

                    // calling for the 5 days forecast
                    var queryForecast="http://api.openweathermap.org/data/2.5/forecast?q="+city+"&cnt=45&appid="+apiKey;
                    $.ajax({
                        url: queryForecast,
                        method: "GET"
                    }).then(function(fiveDay){

                        // calling the function to update the forecast
                        updateForecast(fiveDay);

                    });
                });
            });
        };
    });

    function KtoF(Kdegre){
        var tempC=Kdegre - 273;
        var tempF=Math.floor(tempC * (9/5) + 32);
        return tempF;
    };

    function updateCurrent(city){
        console.log(city);
        var d=new Date();
        var usDate=d.getMonth()+1+"/"+d.getDate()+"/"+d.getFullYear();
        $(".weather").attr("style","display: block;");
        var iconeURL="http://openweathermap.org/img/w/"+city.weather[0].icon+".png";
        $("#currentIcon").attr("src",iconeURL);
        $("#currentCity").text(city.name+" ("+usDate+")");
        
        // var tempK=reponse.main.temp;
        // var tempC=tempK - 273;
        // var tempF=Math.floor(tempC * (9/5) + 32);
        $("#currentTemp").text("Temperature: "+KtoF(city.main.temp)+" F");
        $("#currentHum").text("Humidity: "+city.main.humidity+" %");
        $("#currentWind").text("Wind Speed: "+city.wind.speed+" mph");
    };

    function updateForecast(future){
        console.log(future);
        var forecast=$(".container");
        var forecastArray=[future.list[8],future.list[16],future.list[24],future.list[32],future.list[39]];
        for (i=0;i<5;i++){
            console.log(forecastArray);
            var Date1=forecastArray[i].dt_txt.split(" ");
            var Date2=Date1[0].split("-");
            var futureDate=Date2[1]+"/"+Date2[2]+"/"+Date2[0];
            var fDate=$("<h5>").text(futureDate);
            var iconURL="http://openweathermap.org/img/w/"+forecastArray[i].weather[0].icon+".png";
            console.log(iconURL);
            var fIcon=$("<img>").attr("src",iconURL);
            var fTemp=$("<h5>").text(KtoF(forecastArray[i].main.temp)+" F");
            var fHum=$("<h5>").text(forecastArray[i].main.humidity+" %");
            var div=$("<div>");
            div.append(fDate, $("<p>"), fIcon, $("<p>"), fTemp, $("<p>"), fHum);
            div.attr("style","float: left; margin-left: 20px; border: 1px solid black;");
            div.addClass("divcontainer");
            forecast.append(div);
        };
    };
});