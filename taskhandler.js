// Global variables
let tasks = []; // To store all tasks fetched from the API
let filteredTasks = []; // To store filtered tasks for rendering
let currentPage = 1; // Track the current page globally
let tasksPerPage = 10; // Number of tasks to display per page

// Fetch and display tasks from the Tarkov API
async function fetchTasks() {
    try {
        // Show the loading message
        const loading = document.getElementById('loading');
        loading.style.display = 'block';

        const response = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: `{
                    tasks {
                        name
                        objectives {
                            description
                            maps {
                                name
                            }
                            optional
                        }
                        restartable
                        startRewards {
                            items {
                                quantity
                                count
                                item {
                                    name
                                    imageLink
                                }
                            }
                            offerUnlock {
                                item {
                                    name
                                    imageLink
                                }
                            }
                            skillLevelReward {
                                name
                                skill {
                                    name
                                }
                                level
                            }
                        }
                        finishRewards {
                            items {
                                item {
                                    name
                                    imageLink
                                }
                                quantity
                                count
                            }
                        }
                        failConditions {
                            description
                        }
                        factionName
                        experience
                        availableDelaySecondsMin
                        kappaRequired
                        lightkeeperRequired
                        taskImageLink
                        trader {
                            name
                            imageLink
                        }
                    }
                }`,
            }),
        });

        const data = await response.json();
        tasks = data.data.tasks; // Save tasks for search and filtering
        filteredTasks = tasks; // Initially, show all tasks
        console.log("Tasks fetched successfully:", tasks);

        // After tasks are fetched, execute the search
        handleSearchOnLoad();

        // Hide the loading message
        loading.style.display = 'none';

    } catch (error) {
        console.error('Error fetching data:', error);
        const tasksContainer = document.getElementById('tasks-container');
        tasksContainer.innerHTML = '<p>Failed to load tasks. Please try again later.</p>';

        // Hide the loading message in case of error
        const loading = document.getElementById('loading');
        loading.style.display = 'none';
    }
}

// Function to handle search after tasks have loaded
function handleSearchOnLoad() {
    const selectedCardId = localStorage.getItem('selectedCardId');

    if (selectedCardId) {
        console.log(`Retrieved ID from localStorage in test.js: ${selectedCardId}`);

        // Set the search input field value to the selectedCardId
        document.getElementById('search-input').value = selectedCardId;

        // Directly trigger the filter function after populating the search input
        filterTasks(); // Call the function to filter tasks using the selectedCardId
        document.getElementById('search-input').value = ""
    } else {
        console.log('No ID found in localStorage.');
    }
}

// Function to render tasks dynamically
function renderTasks(taskList) {
    const tasksContainer = document.getElementById('task-list');
    tasksContainer.innerHTML = ''; // Clear existing tasks

    if (taskList.length === 0) {
        tasksContainer.innerHTML = '<p>No tasks found.</p>';
        return;
    }

    taskList.forEach((task) => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task');

        // Safely access properties
        const traderName = task.trader?.name || 'None';
        const traderImage = task.trader?.imageLink || 'default-trader.png';

        taskElement.innerHTML = `
            <div class="taskheader"><h2>${task.name}</h2></div>
            <div class="questname">
                <div class="questtitle"> 
                    <img src="${task.taskImageLink || 'default-task.png'}" alt="${task.name}" class="task-image">
                </div>
                <div class="trader-giver">
                    <img src="${traderImage}" alt="${traderName}">
                    <h3>Trader</h3>
                    <p>${traderName}</p>
                </div>  
            </div>
            <div class="questplusinfo">
                <p>Faction: ${task.factionName || 'Unknown'}</p>
                <p>Kappa Required: ${task.kappaRequired ? 'Yes' : 'No'}</p>
                <p>Lightkeeper Required: ${task.lightkeeperRequired ? 'Yes' : 'No'}</p>
            </div>
            <div class="objinfo">
                <h3>Objectives</h3>
                <ul>
                    ${task.objectives
                        ?.map(
                            (obj) =>
                                `<li>${obj.description || 'No description available'}${
                                    obj.maps?.length
                                        ? ` (Maps: ${obj.maps.map((map) => map.name).join(', ')})`
                                        : ''
                                }</li>`
                        )
                        .join('') || '<li>No objectives listed.</li>'}
                </ul>
            </div>
            <div class="rewardbox">
                <h3>Rewards</h3>
                <p>Experience: ${task.experience || 0} EXP</p>
                <div>
                    ${
                        task.finishRewards?.items
                            ?.map(
                                (reward) => ` 
                            <div class="reward-item">
                                <img src="${reward.item?.imageLink || 'default-reward.png'}" alt="${reward.item?.name || 'Reward'}">
                                <span>${reward.quantity || 0} x ${reward.item?.name || 'Unknown'}</span>
                            </div>
                        `
                            )
                            .join('') || '<p>No rewards listed.</p>'
                    }
                </div>
            </div>
        `;

        tasksContainer.appendChild(taskElement);
    });
}

// Function to render paginated tasks
function renderPaginatedTasks() {
    const tasksContainer = document.getElementById('task-list');
    tasksContainer.innerHTML = ''; // Clear existing tasks

    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex); // Use filteredTasks for display

    if (paginatedTasks.length === 0) {
        tasksContainer.innerHTML = '<p>No tasks found.</p>';
        return;
    }

    renderTasks(paginatedTasks);

    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = `
        <button class="foward-and-back-butt"${currentPage === 1 ? 'disabled' : ''} onclick="changePage(-1)"> \< </button>
        <span>Page ${currentPage} of ${Math.ceil(filteredTasks.length / tasksPerPage)}</span>
        <button class="foward-and-back-butt"${currentPage === Math.ceil(filteredTasks.length / tasksPerPage) ? 'disabled' : ''} onclick="changePage(1)"> \> </button>
        <label>
            Tasks per page:
            <input type="number" id="tasks-per-page-input" value="${tasksPerPage}" min="1" max="100" onchange="updateTasksPerPage()">
        </label>
    `;
}

// Function to change the page
function changePage(direction) {
    currentPage += direction;
    renderPaginatedTasks();
}

// Function to update the number of tasks displayed per page
function updateTasksPerPage() {
    const input = document.getElementById('tasks-per-page-input');
    const newTasksPerPage = parseInt(input.value, 10);

    if (!isNaN(newTasksPerPage) && newTasksPerPage > 0) {
        tasksPerPage = newTasksPerPage;
        currentPage = 1; // Reset to the first page
        renderPaginatedTasks();
    }
}

// Function to filter tasks
function filterTasks() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const kappaRequired = document.getElementById('filter-kappa').checked;
    const lightkeeperRequired = document.getElementById('filter-lightkeeper').checked;

    // Filter tasks
    filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.name.toLowerCase().includes(searchQuery) ||
            (task.trader?.name.toLowerCase() || '').includes(searchQuery);

        const matchesKappa = kappaRequired ? task.kappaRequired : true;
        const matchesLightkeeper = lightkeeperRequired ? task.lightkeeperRequired : true;

        return matchesSearch && matchesKappa && matchesLightkeeper;
    });

    currentPage = 1; // Reset to the first page
    renderPaginatedTasks(); // Re-render the tasks based on the filtered list
}

// Add event listener for search button
document.getElementById('search-button').addEventListener('click', filterTasks);

// Run the fetch operation and then handle the search
document.addEventListener('DOMContentLoaded', () => {
    fetchTasks(); // Fetch tasks when the page is loaded
});
