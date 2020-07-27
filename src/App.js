import React from "react";
import "./App.css";
import axios from "axios";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  withRouter,
} from "react-router-dom";
import PokemonList from "./PokemonList";
import TypeList from "./TypeList";
import PokemonDetail from "./PokemonDetail";
import Mypokemons from "./Mypokemons";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      offset: 0,
      pokemons: [],
      myPokemons: [],
    };

    this.handlePokemonListResponse = this.handlePokemonListResponse.bind(this);
    this.handlePokemonDetailsResponse = this.handlePokemonDetailsResponse.bind(this);
    this.handleGetPrev20 = this.handleGetPrev20.bind(this);
    this.handleGetNext20 = this.handleGetNext20.bind(this);
    this.fetchPokemons = this.fetchPokemons.bind(this);
    this.addMyPokemon = this.addMyPokemon.bind(this);
  }

  //convert response to pokemon
  toPokemon(response) {
    return {
      id: response.data.id,
      name: response.data.name,
      image_url: response.data.sprites.front_default,
      abilities: response.data.abilities,
    };
  }

  handlePokemonDetailsResponse(responses) {
    this.setState({
      loaded: true,
      pokemons: responses.map(this.toPokemon),
    });
  }

  handlePokemonListResponse(response) {
    Promise.all(
      response.data.results.map((pokemon) => axios.get(pokemon.url))
    ).then(this.handlePokemonDetailsResponse);
  }

  componentDidMount() {
    this.fetchPokemons(0);
  }

  //next 20 poke
  handleGetNext20() {
    const offset = this.state.offset + 8;
    this.fetchPokemons(offset);
    this.setState({ offset });
  }

  //prev 20 poke
  handleGetPrev20() {
    const offset = this.state.offset - 8;
    this.fetchPokemons(offset);
    this.setState({ offset });
  }

  fetchPokemons(offset) {
    // get the 'offset' amount of pokemons --> api
    axios
      .get(`https://pokeapi.co/api/v2/pokemon?limit=8&offset=${offset}`)
      .then(this.handlePokemonListResponse);
  }

  addMyPokemon(pokemon) {
    this.setState({ myPokemons: [...this.state.myPokemons], pokemon }); //add a single poke to State
  }

  render() {
    if (this.state.loaded) {
      return (
        <Router>
          <img
            id="title-image"
            alt="title"
            src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg"
          />
          <nav id="nav-bar">
            <Link id="pokemon-list-btn" to="/pokemons">
              Pokemons
            </Link>
            <Link id="type-list-btn" to="/types">
              Types
            </Link>
            <Link id="pokemon-list-btn" to="/mypokemons">
              My pokemons
            </Link>
          </nav>
          <Switch>
            <Redirect exact from="/" to="/pokemons" />
            <Route exact path="/pokemons">
              <div id="pokemon-container">
                <PokemonList
                  offset={this.state.offset}
                  pokemons={this.state.pokemons}
                  getPrev20={this.handleGetPrev20}
                  getNext20={this.handleGetNext20}
                  addMyPokemon={this.addMyPokemon}
                />
              </div>
            </Route>
            <Route exact path="/types">
              <TypeList />
            </Route>
            <Route exact path="/mypokemons">
              <Mypokemons pokemons={this.state.myPokemons} />
            </Route>
            <Route
              path="/pokemons/:id"
              children={<PokemonDetail pokemons={this.state.pokemons} />}
            />
          </Switch>
        </Router>
      );
    } else {
      return <div class="loader"></div>;
    }
  }
}

export default App;
