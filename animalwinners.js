"use strict";

window.addEventListener("DOMContentLoaded", start);

let allAnimals = [];

// The prototype for all animals:
const Animal = {
  name: "",
  desc: "-unknown animal-",
  type: "",
  age: 0,
  star: false,
  winner: false,
};

const settings = {
  filterBy: "all",
  sortBy: "name",
  sortDir: "asc",
};

function start() {
  console.log("ready");

  // TODO: Add event-listeners to filter and sort buttons
  registerButtons();
  loadJSON();
}

function registerButtons() {
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", selectFilter));

  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
}

async function loadJSON() {
  const response = await fetch("animals.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  allAnimals = jsonData.map(preapareObject);

  // TODO: This might not be the function we want to call first
  // displayList(allAnimals);

  //maybe this we want to call first then - so we filter and sort on the first load
  buildList();
}

function preapareObject(jsonObject) {
  const animal = Object.create(Animal);

  const texts = jsonObject.fullname.split(" ");
  animal.name = texts[0];
  animal.desc = texts[2];
  animal.type = texts[3];
  animal.age = jsonObject.age;

  return animal;
}

// filter
function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`User selected ${filter}`);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {
  // let filteredList = allAnimals;

  if (settings.filterBy === "cat") {
    filteredList = allAnimals.filter(isCat);
  } else if (settings.filterBy === "dog") {
    filteredList = allAnimals.filter(isDog);
  }
  return filteredList;
  // displayList(filteredList);
}

function isCat(animal) {
  console.log("runs");
  if (animal.type === "cat") {
    return true;
  } else {
    return false;
  }
}

function isDog(animal) {
  console.log("runs");
  if (animal.type === "dog") {
    return true;
  } else {
    return false;
  }
}

function buildList() {
  // sort the list by currently elected sorting
  // filter the sorted list by current selected filter
  // display the filtered list
  const currentList = filterList(allAnimals);
  const sortedList = sortList(currentList);

  displayList(sortedList);
}

//generic sort function
function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  //find "old" sortby element and remove .sortBy
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortby");

  //indicate active sort
  event.target.classList.add("sortby");

  //toggle direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }

  console.log(`User selected ${sortBy} - ${sortDir}`);

  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  // let sortedList = allAnimals;

  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    settings.direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(animalA, animalB) {
    // console.log(`sortBy is ${sortBy}`);
    if (animalA[settings.sortBy] < animalB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

//sorting
// function selectSort(event) {
//   const sortBy = event.target.dataset.sort;
//   console.log(`User selected ${sortBy}`);
//   sortList(sortBy);
// }

// function sortList(sortBy) {
//   let sortedList = allAnimals;

//   if (sortBy === "name") {
//     sortedList = sortedList.sort(sortByName);
//   } else if (sortBy === "type") {
//     sortedList = sortedList.sort(sortByType);
//   }

//   displayList(sortedList);
// }

// function sortByName(animalA, animalB) {
//   if (animalA.name < animalB.name) {
//     return -1;
//   } else {
//     return 1;
//   }
// }

// function sortByType(animalA, animalB) {
//   if (animalA.type < animalB.type) {
//     return -1;
//   } else {
//     return 1;
//   }
// }

function displayList(animals) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  animals.forEach(displayAnimal);
}

function displayAnimal(animal) {
  // create clone
  const clone = document.querySelector("template#animal").content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=name]").textContent = animal.name;
  clone.querySelector("[data-field=desc]").textContent = animal.desc;
  clone.querySelector("[data-field=type]").textContent = animal.type;
  clone.querySelector("[data-field=age]").textContent = animal.age;

  if (animal.star === true) {
    clone.querySelector("[data-field=star]").textContent = "⭐";
  } else {
    clone.querySelector("[data-field=star]").textContent = "☆";
  }

  clone.querySelector("[data-field=star]").addEventListener("click", clickStar);

  function clickStar() {
    if (animal.star === true) {
      animal.star = false;
    } else {
      animal.star = true;
    }

    buildList();
  }

  //winners
  clone.querySelector("[data-field=winner]").dataset.winner = animal.winner;
  clone.querySelector("[data-field=winner]").addEventListener("click", clickWinner);

  function clickWinner() {
    if (animal.winner === true) {
      animal.winner = false;
    } else {
      //there should be a rule here
      tryToMakeAWinner(animal);
      // animal.winner = true;
    }

    buildList();
  }

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

function tryToMakeAWinner(selectedAnimal) {
  const winners = allAnimals.filter((animal) => animal.winner);
  const numberOfWinners = winners.length;
  const other = winners.filter((animal) => animal.type === selectedAnimal.type).shift();

  //if there is another of the same type
  if (other !== undefined) {
    console.log("there can be only one winner of each type!");
    removeOther(other);
  } else if (numberOfWinners >= 2) {
    console.log("there can only be 2 winners");
    removeAorB(winners[0], winners[1]);
  } else {
    makeWinner(selectedAnimal);
  }

  // console.log(`there are ${numberOfWinners} winners`);
  // console.log(`the other winner of this is ${other.name}`);
  // console.log(other);

  //just for testing
  // makeWinner(selectedAnimal);

  function removeOther(other) {
    //ask the user to ignore or remove the other
    document.querySelector("#removeother").classList.remove("hide");
    //if user ignore - do nothing
    document.querySelector("#removeother .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#removeother_button").addEventListener("click", clickRemoveOther);

    document.querySelector("#removeother [data-field=otherwinner]").textContent = other.name;

    function closeDialog() {
      document.querySelector("#removeother").classList.add("hide");
      document.querySelector("#removeother .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#removeother_button").removeEventListener("click", clickRemoveOther);
    }

    function clickRemoveOther() {
      //if remove other, do:
      removeWinner(other);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }
  }

  function removeAorB(winnerA, winnerB) {
    //ask the user to ignore, or remove A or B
    document.querySelector("#removeaorb").classList.remove("hide");
    document.querySelector("#removeaorb .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#removeaorb #removea_button").addEventListener("click", clickRemoveA);
    document.querySelector("#removeaorb #removeb_button").addEventListener("click", clickRemoveB);

    //show name on buttons
    document.querySelector("#removeaorb [data-field=winnerA]").textContent = winnerA.name;
    document.querySelector("#removeaorb [data-field=winnerB]").textContent = winnerB.name;

    //if user ignore - do nothing
    function closeDialog() {
      document.querySelector("#removeaorb").classList.add("hide");
      document.querySelector("#removeaorb .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#removeaorb #removea_button").removeEventListener("click", clickRemoveA);
      document.querySelector("#removeaorb #removeb_button").removeEventListener("click", clickRemoveB);
    }

    //if remove A
    function clickRemoveA() {
      removeWinner(winnerA);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }

    //if remove B
    function clickRemoveB() {
      removeWinner(winnerB);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }
  }

  function removeWinner(winnerAnimal) {
    winnerAnimal.winner = false;
  }

  function makeWinner(animal) {
    animal.winner = true;
  }
}
