$(document).ready(function() {
    var button=$("#btnSearch");
    var arrayHistory=[];

    // creating the search city list history if data are save in the localStorage
    if (!(localStorage.getItem("weather")===null)){
        arrayHistory=JSON.parse(localStorage.getItem("weather"));
        displayHistory();
    };

    button.click(function(){
        getCity();
    });

    $("#btnClear").click(function(){
        console.log("Clear clicked");
        $(".btnHistory").remove();
        $(".form-control").val("");
        localStorage.removeItem("weather");
        arrayHistory=[];
        $(".weather").attr("style","display: none;");
    });

    function getCity(){
        var city=$(".form-control").val();
        if (city.length===0) {
            alert("Please type in a city to search");
            return;
        } else {
            // getting the data for the weather of the current city
            var apiKey="a514055f038fdd2161edb41030d73126";
            var queryURL="https://api.openweathermap.org/data/2.5/weather?q="+city+"&units=standard&appid="+apiKey;
            // console.log(queryURL);
            $.ajax({
                url: queryURL,
                method:"GET"
            }).then(function(reponse){

                // calling function to update the current city weather
                // console.log("current: "+reponse);
                updateCurrent(reponse);

                //get a random picture of the city
                getPicture(city);

                // calling another .ajax to get the UV index
                var lat=reponse.coord.lat;
                var lon=reponse.coord.lon;
                var queryUV="https://api.openweathermap.org/data/2.5/uvi?lat="+lat+"&lon="+lon+"&appid="+apiKey;
                $.ajax({
                    url: queryUV,
                    method: "GET"
                }).then(function(UV){
                    $("#currentUV").text("UV Index: ");
                    $("#UVIndex").text(UV.value);
                    //apply the color coded for the UV index
                    //  1-2: low
                    //  3-5: moderate
                    //  6-7: high
                    //  8-10: very high
                    //  >11: extreme
                    var numUV=parseInt(UV.value);
                    $("#UVIndex").removeClass();
                    switch (true) {
                        case (numUV >= 0 && numUV <= 2):
                            $("#UVIndex").addClass("UVlow");
                            break;
                        case (numUV >= 3 && numUV <= 5):
                            $("#UVIndex").addClass("UVmod");
                            break;
                        case (numUV >= 6 && numUV <= 7):
                            $("#UVIndex").addClass("UVhigh");
                            break;
                        case (numUV >= 8 && numUV <= 10):
                            $("#UVIndex").addClass("UVvhigh");
                            break;
                        default:
                            $("#UVIndex").addClass("UVext");
                            break;
                    };

                    // calling for the 5 days forecast
                    var queryForecast="https://api.openweathermap.org/data/2.5/forecast?q="+city+"&cnt=45&appid="+apiKey;
                    $.ajax({
                        url: queryForecast,
                        method: "GET"
                    }).then(function(fiveDay){

                        // calling the function to update the forecast
                        updateForecast(fiveDay);

                    });
                });
            });
            // calling function to add to the city search list and save to the localStorage
            addHistory(city);
        };

        // $(".btnHistory").click(function(){
        //     // event.preventDefault();
        //     console.log($(this).attr("value"));
        //     $(".form-control").val($(this).attr("value"));
        //     getCity();
        // });    
    };

    function getPicture(commune) {
        // var commune=prompt("name of the city?");
        console.log("get picture for "+commune);
        var apiKey="19788868-06966a58fd331eafcc5fbc91d";
        var queryURL="https://pixabay.com/api/?key="+apiKey+"&q="+commune+"&image_type=photo";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response){
            console.log("getPicture");
            console.log(response);
            var randPic=Math.floor(Math.random() * (response.hits.length-1));
            console.log(randPic);
            if (response.total>0){
                var img=$("<img>");
                var imgURL=response.hits[randPic].largeImageURL;
                var imgDesc=response.hits[randPic].tags;
                var p=$("<p>");
                $(".cityPicture").empty();
                p.text(imgDesc);
                img.attr("src",imgURL);
                img.attr("alt",imgDesc);
                img.attr("id","cityPicture");
                $(".cityPicture").append(img, p);
            };
        });        
    };

    function KtoF(Kdegre){
        var tempC=Kdegre - 273.15;
        var tempF=Math.floor(tempC * (9/5) + 32);
        return tempF;
    };

    function FtoC(Fdegre){
        return ((Fdegre - 32) * 5/9).toFixed(2);
    };

    function CtoF(Cdegre){
        return ((Cdegre * 9/5) + 32).toFixed(2);
    };

    $("#btnTemp").click(function(){
        var tempUnit=$("#btnTemp").attr("data-value");
        var currTemp=$("#currentTemp").text().split(" ");
        var fore1=$("#forecastTemp0").text().split(" ");
        var fore2=$("#forecastTemp1").text().split(" ");
        var fore3=$("#forecastTemp2").text().split(" ");
        var fore4=$("#forecastTemp3").text().split(" ");
        var fore5=$("#forecastTemp4").text().split(" ");

        console.log("conversion: "+currTemp);

        if (tempUnit==="F"){
            var unit=" °C";
            $("#currentTemp").text("Temperature "+FtoC(currTemp[1])+unit); 
            $("#forecastTemp0").text("Temp: "+FtoC(fore1[1])+unit);
            $("#forecastTemp1").text("Temp: "+FtoC(fore2[1])+unit);
            $("#forecastTemp2").text("Temp: "+FtoC(fore3[1])+unit);
            $("#forecastTemp3").text("Temp: "+FtoC(fore4[1])+unit);
            $("#forecastTemp4").text("Temp: "+FtoC(fore5[1])+unit);
            $("#btnTemp").attr("data-value","C");
            $("#btnTemp").text("Temp to °F");
        } else {
            var unit=" °F";
            $("#currentTemp").text("Temperature "+CtoF(currTemp[1])+unit); 
            $("#forecastTemp0").text("Temp: "+CtoF(fore1[1])+unit);
            $("#forecastTemp1").text("Temp: "+CtoF(fore2[1])+unit);
            $("#forecastTemp2").text("Temp: "+CtoF(fore3[1])+unit);
            $("#forecastTemp3").text("Temp: "+CtoF(fore4[1])+unit);
            $("#forecastTemp4").text("Temp: "+CtoF(fore5[1])+unit);
            $("#btnTemp").attr("data-value","F");
            $("#btnTemp").text("Temp to °C");
        };
    });

    function updateCurrent(city){
        // console.log("current: "+$(city));
        var d=new Date();
        var usDate=d.getMonth()+1+"/"+d.getDate()+"/"+d.getFullYear();
        $(".weather").attr("style","display: block;");
        var iconeURL="https://openweathermap.org/img/w/"+city.weather[0].icon+".png";
        $("#currentIcon").attr("src",iconeURL);
        $("#currentCity").text(city.name+" ("+usDate+")");
        
        // var tempK=reponse.main.temp;
        // var tempC=tempK - 273;
        // var tempF=Math.floor(tempC * (9/5) + 32);
        $("#currentTemp").text("Temperature: "+KtoF(city.main.temp).toFixed(2)+" °F");
        $("#btnTemp").attr("data-value","F");
        $("#btnTemp").text("Temp to °C");
        $("#currentHum").text("Humidity: "+city.main.humidity+" %");
        $("#currentWind").text("Wind Speed: "+city.wind.speed+" m/s");
    };

    function updateForecast(future){
        // console.log(future);
        var forecast=$(".container");
        forecast.empty();
        var forecastArray=[future.list[8],future.list[16],future.list[24],future.list[32],future.list[39]];
        for (i=0;i<5;i++){
            // console.log(forecastArray);
            var Date1=forecastArray[i].dt_txt.split(" ");
            var Date2=Date1[0].split("-");
            var futureDate=Date2[1]+"/"+Date2[2]+"/"+Date2[0];
            var fDate=$("<h5>").text("Date: "+futureDate);
            var iconURL="https://openweathermap.org/img/w/"+forecastArray[i].weather[0].icon+".png";
            // console.log(iconURL);
            var fIcon=$("<img>").attr("src",iconURL);
            var fTemp=$("<h5>").text("Temp: "+KtoF(forecastArray[i].main.temp).toFixed(2)+" °F");
            fTemp.attr("id","forecastTemp"+i);
            var fHum=$("<h5>").text("Humidity: "+forecastArray[i].main.humidity+" %");
            var div=$("<div>");
            div.append(fDate, $("<p>"), fIcon, $("<p>"), fTemp, $("<p>"), fHum);
            div.attr("style","float: left; margin-left: 20px; border: 1px solid black;");
            div.addClass("divcontainer");
            forecast.append(div);
        };
    };

    function addHistory(ville){
        if (!(localStorage.getItem("weather")===null)){
            arrayHistory=JSON.parse(localStorage.getItem("weather"));
        };

        // save the city only if not already saved
        if (arrayHistory.indexOf(ville)<0){
            arrayHistory.push(ville);
            localStorage.setItem("weather",JSON.stringify(arrayHistory));
        };
        displayHistory();
    };

    function displayHistory(){
        var div=$("#search");
        $(".btnHistory").remove();
        for (var i=0;i<arrayHistory.length;i++) {
            // console.log("displayHistory: "+arrayHistory[i]);
            var btn=$("<button>").attr("value",arrayHistory[i]);
            btn.addClass("btn btn-md btn-outline-secondary btnHistory");
            btn.text(arrayHistory[i]);
            div.append(btn);
        };

        $(".btnHistory").click(function(){
            // event.preventDefault();
            console.log($(this).attr("value"));
            $(".form-control").val($(this).attr("value"));
            getCity();
        });    
    };
});