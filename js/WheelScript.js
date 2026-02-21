const MIN_WHEEL_SIZE = 240;
const MAX_WHEEL_SIZE = 520;
let wheelRadius = 400;
let textFontSize = 50;
var timer;
let timerIntervalId;
var timer_running = false;
let divisionCount = 3;  // The number of starting players.
const TOTAL_TIME = 15 * 60; // 15 minutes
var first_10_colors = ['#ef7575','#efbe75','#d7ef75','#8def75','#75efa6','#75efef','#75a6ef','#8d75ef','#d775ef','#ef75be']
var light_gray = '#c0c0c0';
var default_names = ["Player 1", "Player 2", "Player 3"];
var segments = [];
for (let i = 0; i<default_names.length; i++) {
    if (i < 10) {
        segments.push({ fillStyle: first_10_colors[i], text: default_names[i], id: Math.floor(Math.random() * Date.now()) });
    } else {
        segments.push({ fillStyle: light_gray, text: default_names[i], id: Math.floor(Math.random() * Date.now()) });
    }
}

function getWheelSize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const base = Math.min(vw * 0.8, vh * 0.8);
    const size = Math.max(MIN_WHEEL_SIZE, Math.min(MAX_WHEEL_SIZE, Math.floor(base)));
    return size % 2 === 0 ? size : size - 1;
}

function updateWheelSizing() {
    const size = getWheelSize();
    wheelRadius = size / 2;
    textFontSize = Math.max(14, Math.round(size / 16));
    document.documentElement.style.setProperty('--wheel-size', `${size}px`);

    const canvas = document.getElementById('canvas');
    if (canvas) {
        canvas.width = size;
        canvas.height = size;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
    }
}

function buildWheel(segmentsData) {
    return new Winwheel({
        'numSegments': segmentsData.length,     // Specify number of segments.
        'outerRadius': wheelRadius,   // Set outer radius so wheel fits inside the background.
        'textFontSize': textFontSize,    // Set font size as desired.
        'segments': segmentsData,
        'animation':           // Specify the animation to use.
        {
            'type': 'spinToStop',
            'duration': 1,
            'spins': 2,
            'callbackFinished': alertPrize,
        }
    });
}

// Create new wheel object specifying the parameters at creation time.
updateWheelSizing();
let theWheel = buildWheel(segments.sort(() => Math.random() - 0.5));

// -------------------------------------------------------
// Called when the spin animation has finished by the callback feature of the wheel because I specified callback in the parameters
// note the indicated segment is passed in as a parmeter as 99% of the time you will want to know this to inform the user of their prize.
// -------------------------------------------------------
function alertPrize(indicatedSegment) {
    // Do basic alert of the segment text.
    // You would probably want to do something more interesting with this information.
    showNotification("The winner is: " + indicatedSegment.text);
    deleteName(indicatedSegment.id)
    timer = TOTAL_TIME / divisionCount;
    timer_running = true;
    resetWheel();
}


function showNotification(message) {
    // Create a div element for the notification
    var notification = document.createElement("div");
    const wheelSize = getWheelSize();
    const fontSize = Math.max(16, Math.min(32, Math.round(wheelSize / 18)));
    const paddingSize = Math.max(20, Math.min(60, Math.round(wheelSize / 10)));
    notification.style.position = "fixed";
    notification.style.left = "50%";
    notification.style.top = "50%";
    notification.style.transform = "translate(-50%, -50%)";
    notification.style.padding = `${paddingSize}px`;
    notification.style.width = `${wheelSize}px`;
    notification.style.maxWidth = `${wheelSize}px`;
    notification.style.backgroundColor = "#f8d7da";
    notification.style.color = "#721c24";
    notification.style.border = "1px solid #f5c6cb";
    notification.style.borderRadius = "5px";
    notification.style.zIndex = "1000";
    notification.style.fontSize = `${fontSize}px`;
    notification.style.textAlign = "center";
    notification.textContent = message;

    // Append the notification to the body
    document.body.appendChild(notification);

    // Remove the notification after 3 seconds
    setTimeout(function() {
        document.body.removeChild(notification);
    }, 3000);
}

function startTimer(duration, display) {
    var minutes, seconds;
    timer = duration;
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
    }
    timerIntervalId = setInterval(function () {
        --timer;
        if (timer < 0) {
            timer = 0;
        }

        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if ((timer == 0) && (timer_running)) {
            timer_running = false;
            if (!document.body.classList.contains('timer-hidden')) {
                showNotification("Time's up!");
            }
        }
    }, 1000);
}


// =======================================================================================================================
// Code below for the power controls etc which is entirely optional. You can spin the wheel simply by
// calling theWheel.startAnimation();
// =======================================================================================================================
let wheelPower = 2;
let wheelSpinning = false;

// -------------------------------------------------------
// Click handler for spin button.
// -------------------------------------------------------
function startSpin() {
    // Ensure that spinning can't be clicked again while already running.
    if (wheelSpinning == false) {

        // Begin the spin animation by calling startAnimation on the wheel object.
        theWheel.startAnimation();

        // Set to true so that power can't be changed and spin button re-enabled during
        // the current animation. The user will have to reset before spinning again.
        wheelSpinning = true;
    }
}

// -------------------------------------------------------
// Function for reset button.
// -------------------------------------------------------
function resetWheel() {
    theWheel.stopAnimation(false);  // Stop the animation, false as param so does not call callback function.
    theWheel.rotationAngle = 0;     // Re-set the wheel angle to 0 degrees.
    theWheel.draw();                // Call draw to render changes to the wheel.
    wheelSpinning = false;          // Reset to false to power buttons and spin can be clicked again.
}


// -------------------------------------------------------
// Name functionality.
// -------------------------------------------------------

let nameList = theWheel.segments
    .filter(segment => segment != null)
    .sort((a, b) => sortNames(a, b));

// -------------------------------------------------------
// Function for sort the list of names.
// -------------------------------------------------------
function sortNames(a, b) {
    if (a.text < b.text) {
        return -1;
    }
    if (a.text > b.text) {
        return 1;
    }
    return 0;
}

// -------------------------------------------------------
// Function for render the list of names.
// -------------------------------------------------------
function renderNames(todo) {
    localStorage.setItem('nameList', JSON.stringify(nameList));

    const list = document.querySelector('.js-name-list');
    const item = document.querySelector(`[data-key='${todo.id}']`);

    if (todo.deleted) {
        if (item) {
            item.remove();
        }
        if (nameList.length === 0) list.innerHTML = '';
        return
    }

    const isChecked = todo.checked ? 'done' : '';
    const node = document.createElement("li");
    node.setAttribute('class', `todo-item ${isChecked}`);
    node.setAttribute('data-key', todo.id);
    node.innerHTML = `
    <span>${todo.text}</span>
    <input class="delete-todo js-delete-todo" type="image" src="https://img.icons8.com/fluency/48/fa314a/delete-sign.png"/>
    `

    if (item) {
        list.replaceChild(node, item);
    } else {
        list.append(node);
    }
}

// -------------------------------------------------------
// Function for re-render the wheel after changes.
// -------------------------------------------------------
function renderWheel() {
    updateWheelSizing();
    theWheel = buildWheel(nameList);
}

// -------------------------------------------------------
// Function to add a name.
// -------------------------------------------------------
function addName(text) {
    // Calculate the color index based on the current length of nameList
    let fillStyle;
    if (nameList.length < first_10_colors.length) {
        // If we have fewer than 10 names, use corresponding color from the array
        fillStyle = first_10_colors[nameList.length];
    } else {
        // Otherwise, use the light gray default color
        fillStyle = light_gray;
    }
    
    const name = {
        text,
        id: Date.now(),
        fillStyle: fillStyle
    };

    nameList.push(name);
    renderWheel();
    renderNames(name);
}

// -------------------------------------------------------
// Function to delete a name.
// -------------------------------------------------------
function deleteName(key) {
    const index = nameList.findIndex(item => item.id === Number(key));
    const name = {
        deleted: true,
        ...nameList[index]
    };
    nameList = nameList.filter(item => item.id !== Number(key));
    renderNames(name);
    renderWheel();
}

// -------------------------------------------------------
// Event listener for submiting a name from the input.
// -------------------------------------------------------
const form = document.querySelector('.js-form');
form.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.querySelector('.js-name-input');

    const text = input.value.trim();
    if (text !== '') {
        addName(text);
        input.value = '';
        input.focus();
    }
});

// -------------------------------------------------------
// Event listener for deleting a name from the list.
// -------------------------------------------------------
const list = document.querySelector('.js-name-list');
list.addEventListener('click', event => {
    console.log(event.target.classList);
    if (event.target.classList.contains('js-delete-todo')) {
        const itemKey = event.target.parentElement.dataset.key;
        deleteName(itemKey);
    }
});

// -------------------------------------------------------
// Event listener for the page to load.
// -------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    localStorage.setItem('nameList', JSON.stringify(nameList));
    const ref = localStorage.getItem('nameList');
    if (ref) {
        nameList = JSON.parse(ref);
        nameList.forEach(t => {
            renderNames(t);
        });
    }
    renderWheel();
    
    var display = document.querySelector('#time');
    startTimer(0, display);
});

// Toggle button (visual only)
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('timer-toggle');
    if (!toggleButton) return;

    const setTimerEnabled = (enabled) => {
        toggleButton.classList.toggle('is-active', enabled);
        toggleButton.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        document.body.classList.toggle('timer-hidden', !enabled);
    };

    // Default: enabled
    setTimerEnabled(true);

    toggleButton.addEventListener('click', () => {
        setTimerEnabled(!toggleButton.classList.contains('is-active'));
    });
});

// Resize wheel on viewport changes
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (!wheelSpinning) {
            renderWheel();
        } else {
            updateWheelSizing();
        }
    }, 150);
});

// -------------------------------------------------------
// Event listener for opening and closing the collapsible list.
// -------------------------------------------------------
var coll = document.getElementsByClassName("collapsible-button");
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}


// Function to update the label
function update_divided_time_label() {
    const divided_time = TOTAL_TIME / divisionCount;
    const mins = parseInt(divided_time / 60, 10);
    const secs = parseInt(divided_time % 60, 10).toString().padStart(2, '0');
    document.getElementById('timer-division-label').textContent = `${divisionCount} 🧍‍♂️ = ${mins}:${secs} / 🧍‍♂️`;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('add-time-button').addEventListener('click', function() {
        divisionCount += 1; // Increment the global variable
        update_divided_time_label(); // Update the label
    });

    // Initial label update
    update_divided_time_label();
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('less-time-button').addEventListener('click', function() {
        divisionCount -= 1; // Increment the global variable
        update_divided_time_label(); // Update the label
    });

    // Initial label update
    update_divided_time_label();
});

// -------------------------------------------------------
// Presets functionality
// -------------------------------------------------------

// Storage key for presets
const PRESETS_STORAGE_KEY = 'roulettePresets';

// Function to save current list as a preset
function savePreset() {
    const presetName = document.getElementById('preset-name').value.trim();
    if (!presetName) {
        showNotification('Please enter a preset name');
        return;
    }

    // Get current presets from storage or initialize empty object
    const presets = JSON.parse(localStorage.getItem(PRESETS_STORAGE_KEY) || '{}');

    // Save current nameList under the preset name
    presets[presetName] = nameList.map(item => ({
        text: item.text,
        fillStyle: item.fillStyle || light_gray,
        id: item.id
    }));

    // Save to localStorage
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
    
    // Clear input field
    document.getElementById('preset-name').value = '';

    // Update preset list display
    updatePresetList();
    
    showNotification(`Preset "${presetName}" saved successfully`);
}

// Function to load a selected preset
function loadPreset() {
    const presetSelect = document.getElementById('preset-list');
    const selectedPreset = presetSelect.value;
    
    if (!selectedPreset) {
        showNotification('Please select a preset to load');
        return;
    }
    
    // Get presets from storage
    const presets = JSON.parse(localStorage.getItem(PRESETS_STORAGE_KEY) || '{}');
    
    if (presets[selectedPreset]) {
        // Replace current nameList with the preset names
        nameList = presets[selectedPreset];
        
        // Update divisionCount to match the number of names in the preset
        divisionCount = nameList.length;
        update_divided_time_label();
        
        // Clear current list display
        document.querySelector('.js-name-list').innerHTML = '';
        
        // Render each name from the preset
        nameList.forEach(name => {
            renderNames(name);
        });
        
        // Update the wheel with the new names
        renderWheel();
        
        showNotification(`Preset "${selectedPreset}" loaded successfully`);
    }
}

// Function to delete a selected preset
function deletePreset() {
    const presetSelect = document.getElementById('preset-list');
    const selectedPreset = presetSelect.value;
    
    if (!selectedPreset) {
        showNotification('Please select a preset to delete');
        return;
    }
    
    // Get presets from storage
    const presets = JSON.parse(localStorage.getItem(PRESETS_STORAGE_KEY) || '{}');
    
    // Delete the selected preset
    delete presets[selectedPreset];
    
    // Update localStorage
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
    
    // Update preset list display
    updatePresetList();
    
    showNotification(`Preset "${selectedPreset}" deleted successfully`);
}

// Function to clear all presets
function clearAllPresets() {
    if (confirm('Are you sure you want to delete all presets?')) {
        localStorage.removeItem(PRESETS_STORAGE_KEY);
        updatePresetList();
        showNotification('All presets cleared successfully');
    }
}

// Function to update the preset dropdown list
function updatePresetList() {
    const presetSelect = document.getElementById('preset-list');
    presetSelect.innerHTML = '';
    
    // Get presets from storage
    const presets = JSON.parse(localStorage.getItem(PRESETS_STORAGE_KEY) || '{}');
    
    // Add each preset to the select dropdown
    Object.keys(presets).forEach(presetName => {
        const option = document.createElement('option');
        option.value = presetName;
        option.textContent = presetName;
        presetSelect.appendChild(option);
    });
}

// Event listeners for preset buttons
document.addEventListener('DOMContentLoaded', function() {
    // Initial setup of preset list
    updatePresetList();
    
    // Save preset button
    document.getElementById('save-preset-btn').addEventListener('click', savePreset);
    
    // Load preset button
    document.getElementById('load-preset-btn').addEventListener('click', loadPreset);
    
    // Delete preset button
    document.getElementById('delete-preset-btn').addEventListener('click', deletePreset);
    
    // Clear all presets button
    document.getElementById('clear-presets-btn').addEventListener('click', clearAllPresets);
});