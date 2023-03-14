const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDbObjectToResObjDirec = (eachDirector) => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  };
};

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//API 1
app.get("/movies/", async (request, response) => {
  const getmovieQuery = `
    SELECT movie_name 
    FROM 
    movie;`;
  const movieArray = await db.all(getmovieQuery);
  response.send(
    movieArray.map((eachName) => convertDbObjectToResponseObject(eachName))
  );
});
//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const AddmovieQuery = `
  INSERT INTO
  movie(director_id, movie_name, lead_actor)
  VALUES 
  (
      ${directorId},
      '${movieName}',
      '${leadActor}'
  );`;
  const dbResponse = await db.run(AddmovieQuery);
  response.send("Movie Successfully Added");
});
//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetails = `
    SELECT*
    FROM 
    movie 
    WHERE
    movie_id=${movieId};`;
  const movieDetails = await db.get(getMovieDetails);
  response.send(convertDbObjectToResponseObject(movieDetails));
});
//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieArray = `
    UPDATE 
    movie 
    SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE  
    movie_id=${movieId};`;
  await db.run(updateMovieArray);
  response.send("Movie Details Updated");
});
//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM 
    movie 
    WHERE 
    movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
//API 6
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
   SELECT *
   FROM 
   director;`;
  const directorDetails = await db.all(getDirectorQuery);
  response.send(
    directorDetails.map((eachDirector) =>
      convertDbObjectToResObjDirec(eachDirector)
    )
  );
});
//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getEachMovie = `
    SELECT movie_name
    FROM 
    movie 
    WHERE
    director_id=${directorId};`;
  const movieArray = await db.all(getEachMovie);
  response.send(
    movieArray.map((eachName) => convertDbObjectToResponseObject(eachName))
  );
});

module.exports = app;
