let addBtn = document.querySelector(".add");
let body = document.querySelector("body");
let grid = document.querySelector(".grid");
let deleteBtn = document.querySelector(".delete");

let colors = ["highest", "high", "low", "lowest"];
let deleteMode = false;

let allFiltersChildren = document.querySelectorAll(".filter div");

for (let i = 0; i < allFiltersChildren.length; i++) {
  allFiltersChildren[i].addEventListener("click", function (e) {

    if (e.currentTarget.classList.contains("filter-selected")) {
      e.currentTarget.classList.remove("filter-selected");
      loadTasks();
      return;
    } else {
      // if filterMode is off, turn it on and add its class
      e.currentTarget.classList.add("filter-selected");
    }

    let filterColor = e.currentTarget.classList[0];
    loadTasks(filterColor);
    
  });
}

// if in localStorage object of AllTickets is not created, then create one
if (localStorage.getItem("AllTickets") == undefined) {
  // initialization, as an object
  let allTickets = {};

  // convert "{}" to string
  allTickets = JSON.stringify(allTickets);

  // add the string now, because in localStorage, data is always stored in the form of strings
  // and object cannot be stringified automatically like other datatypes, object's properties are lost
  // therefore manual stringification and addition needs to be done
  localStorage.setItem("AllTickets", allTickets);
}

loadTasks();

deleteBtn.addEventListener("click", function (e) {
  // if deleteMode is on, ie already its class is present, then turn it off and remove its class
  if (e.currentTarget.classList.contains("delete-selected")) {
    e.currentTarget.classList.remove("delete-selected");
    deleteMode = false;
  } else {
    // if deleteMode is off, turn it on and add its class
    e.currentTarget.classList.add("delete-selected");
    deleteMode = true;
  }
});

addBtn.addEventListener("click", function () {
  // turn off delete mode
  deleteBtn.classList.remove("delete-selected");
  deleteMode = false;

  // making a new ticket, overlay ticket modal
  let preModal = document.querySelector(".modal");

  // if overlay already opened, do nothing
  if (preModal != null) 
    return;

  // new div created
  let div = document.createElement("div"); //<div></div>

  // added modal class
  div.classList.add("modal"); //<div class="modal"></div>

  // html of the overlay ticket
  div.innerHTML = `<div class="task-section">
  <div class="task-inner-container" contenteditable="true"></div>
  </div>
  <div class="modal-priority-section">
    <div class="priority-inner-container">
      <div class="modal-priority highest"></div>
      <div class="modal-priority high"></div>
      <div class="modal-priority low"></div>
      <div class="modal-priority lowest selected"></div>
    </div>
  </div>`;

  // by default lowest priority is set
  let ticketColor = "lowest";

  let allModalPriority = div.querySelectorAll(".modal-priority");

  // going through the priorities one by one, to check if any is clicked
  for (let i = 0; i < allModalPriority.length; i++) {

    // if we click any priority
    allModalPriority[i].addEventListener("click", function (e) {
      
      // remove the already selected priority
      for (let j = 0; j < allModalPriority.length; j++) {
        allModalPriority[j].classList.remove("selected");
      }

      // add the selected class to the selected/clicked priority
      e.currentTarget.classList.add("selected");

      // and update the ticketColor to the updated priority's ticketColor
      ticketColor = e.currentTarget.classList[1];
    });

  }

  let taskInnerContainer = div.querySelector(".task-inner-container");

  taskInnerContainer.addEventListener("keydown", function (e) {
    if (e.key == "Enter") {

      // will generate a newly created unique id, using ssuid
      let id = uid();

      // will get task's textual content
      let task = e.currentTarget.innerText;

      //------------------------------------------------------//

      //saving to localStorage

      //step 1: localStorage ka data laao
      //in string form -> parse se string to object ho jayega
      let allTickets = JSON.parse(localStorage.getItem("AllTickets")); 

      //step 2: update that data in the object
      let ticketObj = {
        color: ticketColor, //key: value pair
        taskValue: task,
      };

      // store the ticket object with id as its key
      // object of objects
      // allTickets: {
      //   id1: {
      //     color: ticketColor,
      //     taskValue: task,
      //   },
      //   id2: {
      //     color: ticketColor,
      //     taskValue: task,
      //   }
      // }
      allTickets[id] = ticketObj;

      //step 3: updated data to be saved in localStorage
      localStorage.setItem("AllTickets", JSON.stringify(allTickets));

      //------------------------------------------------------//

      let ticketDiv = document.createElement("div"); //<div></div>
      ticketDiv.classList.add("ticket"); //<div class="ticket"></div>
      ticketDiv.setAttribute("data-id", id); //<div data-id="${id}" class="ticket"></div>

      // adding the three sections of ticket to this div; color, id, task
      ticketDiv.innerHTML = `<div data-id="${id}" class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">
          #${id}
        </div>
        <div data-id="${id}" class="actual-task" contenteditable="true">
          ${task}
        </div>`;

      // topmost color part of the ticket
      let ticketColorDiv = ticketDiv.querySelector(".ticket-color");
      // bottom part where task is written
      let actualTaskDiv = ticketDiv.querySelector(".actual-task");

      actualTaskDiv.addEventListener("input", function (e) {
        // getting the updated content of the taskValue because it is editable
        // will work at every instance a letter is typed
        let updatedTask = e.currentTarget.innerText;

        //------------------------------------------------------//

        // step 0: get id that we stored in the data-id attribute
        let currTicketId = e.currentTarget.getAttribute("data-id");

        // step 1: get the ticketObj from localStorage, string to object (parse)
        let allTickets = JSON.parse(localStorage.getItem("AllTickets"));

        // step 2: change taskValue to "updatedTask"
        allTickets[currTicketId].taskValue = updatedTask;

        // step 3: update it in ticketObj, object to string (stringify)
        localStorage.setItem("AllTickets", JSON.stringify(allTickets));

        //------------------------------------------------------//
      });

      ticketColorDiv.addEventListener("click", function (e) {
        // get the current priority/color of the ticket, present at index 1
        let currColor = e.currentTarget.classList[1]; // lowest
        let index = -1;

        // looping over the array of colors, ["highest", "high", "low", "lowest"]
        for (let i = 0; i < colors.length; i++) {
          if (colors[i] == currColor) // colors[3] == "lowest"
            index = i; // index = 3
        }

        // so that looping works over the array
        index++; // index = 4
        index = index % 4; // index = 4 % 4 = 0

        let newColor = colors[index]; // newColor = colors[0] = "highest"

        ticketColorDiv.classList.remove(currColor); // lowest will be removed
        ticketColorDiv.classList.add(newColor); // highest will be added, color changed in ticket

        //------------------------------------------------------//

        //localStorage mein changes as well

        // step 0: get id
        let currTicketId = e.currentTarget.getAttribute("data-id");

        // step 1: get the ticketObj
        let allTickets = JSON.parse(localStorage.getItem("AllTickets"));

        // step 2: change color to "newColor"
        allTickets[currTicketId].color = newColor;

        // step 3: update it in ticketObj
        localStorage.setItem("AllTickets", JSON.stringify(allTickets));

        //------------------------------------------------------//

      });

      ticketDiv.addEventListener("click", function (e) {
        // if deleteMode is on/true
        if (deleteMode) {
          // step 0: get id
          let currTicketId = e.currentTarget.getAttribute("data-id");

          // delete the ticketDiv
          e.currentTarget.remove();

          // step 1: get the ticketObj
          let allTickets = JSON.parse(localStorage.getItem("AllTickets"));

          // step 2: delete that id's ticket
          delete allTickets[currTicketId];

          // step 3: update it in ticketObj
          localStorage.setItem("AllTickets", JSON.stringify(allTickets));
        }
      });

      // in the grid, where tickets are arranged, we'll append our ticketDiv there
      grid.append(ticketDiv);

      // remove the overlay ticket
      div.remove();
    } else if (e.key === "Escape") {
      // just "close" the overlay ticket
      div.remove();
    }
  });

  body.append(div);
});

function loadTasks(color) {
  let ticketsOnUi = document.querySelectorAll(".ticket");

  for (let i = 0; i < ticketsOnUi.length; i++) {
    ticketsOnUi[i].remove();
  }

  //1- fetch alltickets data

  let allTickets = JSON.parse(localStorage.getItem("AllTickets"));

  //2- create ticket UI for each ticket obj
  //3- attach required listeners
  //4- add tickets in the grid section of ui

  for (x in allTickets) {
    let currTicketId = x;
    let singleTicketObj = allTickets[x]; 

    // filter
    if (color) {
      if (color != singleTicketObj.color) 
        continue;
    }

    let ticketDiv = document.createElement("div");
    ticketDiv.classList.add("ticket");

    ticketDiv.setAttribute("data-id", currTicketId);

    ticketDiv.innerHTML = ` <div data-id="${currTicketId}" class="ticket-color ${singleTicketObj.color}"></div>
      <div class="ticket-id">
        #${currTicketId}
      </div>
      <div data-id="${currTicketId}" class="actual-task" contenteditable="true">
        ${singleTicketObj.taskValue}
      </div>`;

    let ticketColorDiv = ticketDiv.querySelector(".ticket-color");

    let actualTaskDiv = ticketDiv.querySelector(".actual-task");

    actualTaskDiv.addEventListener("input", function (e) {
      let updatedTask = e.currentTarget.innerText;

      let currTicketId = e.currentTarget.getAttribute("data-id");
      let allTickets = JSON.parse(localStorage.getItem("AllTickets"));

      allTickets[currTicketId].taskValue = updatedTask;

      localStorage.setItem("AllTickets", JSON.stringify(allTickets));
    });

    ticketColorDiv.addEventListener("click", function (e) {
      
      let currTicketId = e.currentTarget.getAttribute("data-id");

      let currColor = e.currentTarget.classList[1]; 

      let index = -1;
      for (let i = 0; i < colors.length; i++) {
        if (colors[i] == currColor) index = i;
      }

      index++;
      index = index % 4;

      let newColor = colors[index];

      //1- all tickets lana ; 2- update krna ; 3- wapis save krna

      let allTickets = JSON.parse(localStorage.getItem("AllTickets"));

      allTickets[currTicketId].color = newColor;

      localStorage.setItem("AllTickets", JSON.stringify(allTickets));

      ticketColorDiv.classList.remove(currColor);
      ticketColorDiv.classList.add(newColor);
    });

    ticketDiv.addEventListener("click", function (e) {
      if (deleteMode) {
        let currTicketId = e.currentTarget.getAttribute("data-id");

        e.currentTarget.remove();

        let allTickets = JSON.parse(localStorage.getItem("AllTickets"));

        delete allTickets[currTicketId];

        localStorage.setItem("AllTickets", JSON.stringify(allTickets));
      }
    });

    grid.append(ticketDiv);
  }
}