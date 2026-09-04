import { DeckRegistry } from '../lib/types';
import easyJson from './indian_actors/easy.json';
import mediumJson from './indian_actors/medium.json';
import hardJson from './indian_actors/hard.json';
import pokemonJson from './pokemon/all.json';
import mcuJson from './mcu/all.json';
import cricketJson from './cricket/all.json';
import teluguMoviesJson from './telugu_movies/all.json';
import animeJson from './anime/all.json';

const indianActorsData = [...easyJson, ...mediumJson, ...hardJson];

export const STARTER_DECKS: DeckRegistry = {
    indian_actors: indianActorsData,
    pokemon: pokemonJson,
    mcu: mcuJson,
    cricket: cricketJson,
    telugu_movies: teluguMoviesJson,
    anime: animeJson,
};
