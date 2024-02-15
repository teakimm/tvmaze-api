"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

const TVMAZE_BASE_URL = "http://api.tvmaze.com/";
const MISSING_IMAGE_URL = "https://tinyurl.com/tv-missing";



/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const params = new URLSearchParams({q:term});
  const response = await fetch(`${TVMAZE_BASE_URL}search/shows?${params}`);
  const data = await response.json();

  /**Parsing through the data and getting the required information */
  return data.map(entry => {
    return {
      id: entry.show.id,
      name: entry.show.name,
      summary: entry.show.summary,
      image: entry.show.image ? entry.show.image.original : MISSING_IMAGE_URL
    };
  });
}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=Image of "${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm (evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await fetch(`${TVMAZE_BASE_URL}shows/${id}/episodes`);
  const data = await response.json();

  return data.map(episode => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }
  });
 }

/** Empties any prexisting episodes and then populates all the episodes from
 * the given array of episodes into the episodes list. Also shows the list
 * as it is hidden by default.
 */

function displayEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $episodeListItem = $("<li>")
    $episodeListItem.text(`${episode.name} (Season ${episode.season}, Number ${episode.number})`);
    $episodesList.append($episodeListItem);
  }

  $episodesArea.attr("style", "display: block");
 }

/** Controller function that gets the list of episodes and appends them
 * to the episode list div.
 */

async function getEpisodesAndDisplay(showId) {
  const episodeList = await getEpisodesOfShow(showId);
  displayEpisodes(episodeList);
}

/** Event listener that gets the show where the button was clicked so that
 * the current episodes can be populated.
 */
$showsList.on("click", ".Show-getEpisodes", async function(evt) {
  const showID = $(evt.target).closest(".Show").data("show-id");
  await getEpisodesAndDisplay(showID);
});
