
const skillNames = [
  "Serving",
  "Passing / Reception",
  "Attacking",
  "Blocking",
  "Defense / Digs",
  "Setting"
];

const madeInputIds = [
  "serveMade",
  "passMade",
  "attackMade",
  "blockMade",
  "defenseMade",
  "setMade"
];

const attemptInputIds = [
  "serveTotal",
  "passTotal",
  "attackTotal",
  "blockTotal",
  "defenseTotal",
  "setTotal"
];

const positionNames = ["Outside Hitter", "Setter", "Libero"];

const weights = [
  [15, 25, 35, 10, 15, 0],
  [15, 0, 0, 10, 20, 55],
  [10, 45, 0, 0, 35, 10]
];

const players = [];

function calculateRating(player) {
  let weightedTotal = 0;
  let usedWeight = 0;
  let missingSkill = false;

  for (let i = 0; i < skillNames.length; i++) {
    const weight = weights[player.position][i];
    const rate = player.rates[i];

    if (weight > 0) {
      if (rate === null) {
        missingSkill = true;
      } else {
        weightedTotal = weightedTotal + rate * weight;
        usedWeight = usedWeight + weight;
      }
    }
  }

  if (usedWeight === 0) {
    return { score: null, complete: false };
  }

  return {
    score: weightedTotal / usedWeight,
    complete: !missingSkill
  };
}

function comparePlayers(firstPlayer, secondPlayer) {
  return calculateRating(secondPlayer).score - calculateRating(firstPlayer).score;
}

function showPlayers() {
  const ratingsArea = document.getElementById("playerRatings");
  const leaderboardsArea = document.getElementById("leaderboards");

  ratingsArea.replaceChildren();
  leaderboardsArea.replaceChildren();

  if (players.length === 0) {
    ratingsArea.textContent = "No players have been added yet.";
    leaderboardsArea.textContent = "Add players to create position leaderboards.";
    return;
  }

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const rating = calculateRating(player);
    const card = document.createElement("article");
    const heading = document.createElement("h3");
    heading.textContent = player.name + " — " + positionNames[player.position];
    card.appendChild(heading);

    const summary = document.createElement("p");
    if (rating.score === null) {
      summary.textContent = "Overall rating: Not enough data.";
    } else if (rating.complete) {
      summary.textContent = "Overall rating: " + rating.score.toFixed(1) + " / 100";
    } else {
      summary.textContent = "Overall rating: " + rating.score.toFixed(1) + " / 100 (Provisional)";
    }
    card.appendChild(summary);

    const skillList = document.createElement("ul");
    for (let j = 0; j < skillNames.length; j++) {
      const item = document.createElement("li");
      if (player.rates[j] === null) {
        item.textContent = skillNames[j] + ": N/A";
      } else {
        item.textContent = skillNames[j] + ": " + player.rates[j].toFixed(1) + "%";
      }
      skillList.appendChild(item);
    }
    card.appendChild(skillList);
    ratingsArea.appendChild(card);
  }

  for (let position = 0; position < positionNames.length; position++) {
    const rankedPlayers = [];

    for (let i = 0; i < players.length; i++) {
      const rating = calculateRating(players[i]);
      if (players[i].position === position && rating.complete) {
        rankedPlayers.push(players[i]);
      }
    }

    rankedPlayers.sort(comparePlayers);

    if (rankedPlayers.length > 0) {
      const heading = document.createElement("h3");
      heading.textContent = positionNames[position];
      leaderboardsArea.appendChild(heading);

      const rankingList = document.createElement("ol");
      for (let i = 0; i < rankedPlayers.length; i++) {
        const item = document.createElement("li");
        const rating = calculateRating(rankedPlayers[i]);
        item.textContent = rankedPlayers[i].name + " — " + rating.score.toFixed(1) + " / 100";
        rankingList.appendChild(item);
      }
      leaderboardsArea.appendChild(rankingList);
    }
  }

  if (leaderboardsArea.children.length === 0) {
    leaderboardsArea.textContent = "No players have complete statistics for their position yet.";
  }
}

document.getElementById("playerForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("playerName").value.trim();
  const position = document.getElementById("position").selectedIndex;
  const message = document.getElementById("message");
  const rates = [];

  if (name === "") {
    message.textContent = "Enter a player name.";
    return;
  }

  for (let i = 0; i < skillNames.length; i++) {
    const madeText = document.getElementById(madeInputIds[i]).value;
    const attemptsText = document.getElementById(attemptInputIds[i]).value;

    if (madeText === "" && attemptsText === "") {
      rates.push(null);
    } else if (madeText === "" || attemptsText === "") {
      message.textContent = "Enter both counts for " + skillNames[i] + ", or leave both blank.";
      return;
    } else {
      const made = Number(madeText);
      const attempts = Number(attemptsText);

      if (made < 0 || attempts < 0 || made % 1 !== 0 || attempts % 1 !== 0) {
        message.textContent = "Counts must be non-negative whole numbers.";
        return;
      }

      if (made > attempts) {
        message.textContent = "Successful " + skillNames[i] + " cannot exceed attempts.";
        return;
      }

      if (attempts === 0) {
        rates.push(null);
      } else {
        rates.push((made / attempts) * 100);
      }
    }
  }

  players.push({
    name: name,
    position: position,
    rates: rates
  });

  document.getElementById("playerForm").reset();
  message.textContent = name + " was added.";
  showPlayers();
});

showPlayers();
