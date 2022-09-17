import React, { Component } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

import MainLocation from "./LocationComponents/MainLocationComponent";
import MainWeather from "./WeatherComponents/MainWeatherComponent";
import MainMovies from "./MoviesComponents/MainMoviesComponent";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      display_name: "",
      lat: "",
      lon: "",
      location: "",
      LocationError: "",
      WeatherError: "",
      weatherData: null,
    };
  }

  getLocationData = async (location) => {
    let URL = `https://us1.locationiq.com/v1/search?`;
    let key = "pk.5d9f233e3043384cb2a2d0f5932f67be";
    URL += "key=" + key;
    let query = "&q=" + location;
    URL += query;
    let format = "&format=json";
    URL += format;

    try {
      await axios.get(URL).then((res) => {
        let resResult = res;
        let lat = resResult.data[0].lat;
        let lon = resResult.data[0].lon;
        this.setState({
          display_name: resResult.data[0].display_name,
          lat: lat,
          lon: lon,
          location: location,
          LocationError: "",
          MoviesData: [],
          hotels: [],
        });
        this.getWeatherData(location, lat, lon);
        this.getMovies(location);
        this.getHotelsData(location);
      });
    } catch (e) {
      this.setState({
        LocationError: e.message,
      });
    }
  };

  getWeatherData = async (location, lat, long) => {
    let URL = `https://api.weatherbit.io/v2.0/forecast/daily?key=c3b776200a1945b28700eb8f0426f86b&city=${location}`;

    console.log(URL);
    try {
      await axios.get(URL).then((res) => {
        let weatherResult = res.data;
        console.log(weatherResult);
        let foreCast = weatherResult.data.map((info) => {
          return new WeatherModel(
            info.low_temp,
            info.max_temp,
            info.weather.description,
            info.datetime
          );
        });
        console.log("NEW WEATHER");
        console.log(foreCast);
        this.setState({
          weatherData: foreCast,
          WeatherError: "",
        });
      });
    } catch (e) {
      console.log("err");
      this.setState({
        WeatherError: e.message,
      });
    }
  };

  getHotelsData = async (location) => {
    const options = {
      method: "GET",
      url: "https://hotels4.p.rapidapi.com/locations/v2/search",
      params: { query: location, locale: "en_US", currency: "USD" },
      headers: {
        "X-RapidAPI-Key": "b686b649ffmsh1d3a782151eccafp1575b6jsn674640f1ada5",
        "X-RapidAPI-Host": "hotels4.p.rapidapi.com",
      },
    };

    /*
    latitude
    longitude
    name
    let URL = "https://maps.locationiq.com/v3/staticmap?";

    let key = "key=" + "pk.5d9f233e3043384cb2a2d0f5932f67be";
    let center = "&center=" + this.props.Data.lat + "," + this.props.Data.lon;
    let FullUrl = URL + key + center;

    */
    axios
      .request(options)
      .then((response) => {
        console.log(response.data);
        let result = response.data.suggestions[1].entities;

        let ui = result.map((i) => {
          let URL = "https://maps.locationiq.com/v3/staticmap?";

          let key = "key=" + "pk.5d9f233e3043384cb2a2d0f5932f67be";
          let center = "&center=" + i.latitude + "," + i.longitude;
          let FullUrl = URL + key + center;

          return (
            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
              <h1 style={{ minWidth: "100px" }}>{i.name}</h1>
              <img src={FullUrl} width={"300px"} />
            </div>
          );
        });

        this.setState({
          hotels: ui,
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  getMovies = async (location) => {
    let URL = `https://api.themoviedb.org/3/search/multi?api_key=dcf29acd0a12641244026c1b3bff83ae&language=en-US&include_adult=false&page=1`;
    let query = "&query=" + location;
    URL += query;
    console.log(URL);
    try {
      await axios.get(URL).then((res) => {
        let moviesData = res.data;

        let result = [];
        let filterdResults = moviesData.results.filter((i) => {
          if (
            i.original_title !== undefined &&
            i.overview !== undefined &&
            i.vote_average !== undefined &&
            i.vote_count !== undefined &&
            i.poster_path !== undefined &&
            i.popularity !== undefined &&
            i.release_date !== undefined
          )
            return true;
          else return false;
        });
        result = filterdResults.map((movie) => {
          console.log(movie);
          return new MovieModel(
            movie.original_title,
            movie.overview,
            movie.vote_average,
            movie.vote_count,
            movie.poster_path,
            movie.popularity,
            movie.release_date
          );
        });

        console.log(result);
        this.setState({
          MoviesData: result,
        });
      });
    } catch {
      console.log("movies api error");
    }
  };

  render() {
    return (
      <div>
        <MainLocation submitHandler={this.getLocationData} Data={this.state} />
        <div>
          <MainWeather Data={this.state} />
        </div>

        <div>
          <MainMovies Data={this.state} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "50px" }}>
          {this.state.hotels}
        </div>
      </div>
    );
  }
}

class WeatherModel {
  constructor(low, high, desc, date) {
    this.description = `Low of ${low}, high of ${high} with ${desc}`;
    this.date = date;
  }
}

class MovieModel {
  constructor(
    title,
    desc,
    avgVotes,
    totalVotes,
    poster,
    populartiy,
    relaseDate
  ) {
    this.title = title;
    this.overview = desc;
    this.average_votes = avgVotes;
    this.total_votes = totalVotes;
    this.image_url = poster;
    this.popularity = populartiy;
    this.released_on = relaseDate;
  }
}

export default Main;

/*
          style={{
            marginTop: "150px",
            marginBottom: "150px",
            background: "red",
          }}

*/
