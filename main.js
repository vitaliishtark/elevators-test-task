

const FLOOR_HEIGHT   = 70   //px
const FLOOR_PADDING  = 10   //px
const TIME_FOR_FLOOR = 2000 //ms
const TIME_FOR_STOP  = 1000 //ms

class Elevator {
    constructor(id, position) {
        this.id = id;
        this.position = position;
        this.callQueue = [];
        this.moving = false;
    }

    addToQueue(floor, button) {
        if (!this.callQueue.some(call => call.floor === floor)) {
            this.callQueue.push({ floor, button });
        }
        if (!this.moving) {
            this.processQueue();
        }
    }

    calculateMovementTime(currentPosition, targetFloor) {
        const floorsToMove = Math.abs(targetFloor - currentPosition);
        const totalStops = this.callQueue.length - 1;
        return (floorsToMove * TIME_FOR_FLOOR) + (totalStops * TIME_FOR_STOP);
    }

    processQueue() {
        if (this.callQueue.length === 0) {
            this.moving = false;
            return;
        }

        this.moving = true;
        const { floor, button } = this.callQueue[0];
        const movementTime = this.calculateMovementTime(this.position, floor);
        this.startCountdown(button, movementTime);
        this.callElevator(floor, movementTime);
    }

    startCountdown(button, totalTime) {
        let remainingTime = totalTime / TIME_FOR_STOP;
        button.nextElementSibling.style.display = "block"
        button.nextElementSibling.style.left = `${150 * this.id}px`
        button.nextElementSibling.textContent = `${Math.ceil(remainingTime)} s`;

        const intervalId = setInterval(() => {
            remainingTime--;
            button.nextElementSibling.textContent = `${Math.ceil(remainingTime)} s`;

            if (remainingTime <= 0) {
                clearInterval(intervalId);
            }
        }, 1000);
    }

    callElevator(targetFloor, movementTime) {
        const elevatorElement = document.getElementById(`elevator${this.id}`);
        const targetPosition = targetFloor * FLOOR_HEIGHT + FLOOR_PADDING;
        const ico = elevatorElement.querySelector(".ico")

        ico.style.fill = 'red';
        elevatorElement.style.transition = `bottom ${movementTime / TIME_FOR_STOP}s`;
        elevatorElement.style.bottom = targetPosition + 'px';

        setTimeout(() => {
            this.elevatorReachedFloor(targetFloor);
        }, movementTime);
    }

    elevatorReachedFloor(targetFloor) {
        const elevatorElement = document.getElementById(`elevator${this.id}`);
        const button = this.callQueue[0].button;
        const ico = elevatorElement.querySelector(".ico")

        ico.style.fill = 'green'
        button.textContent = 'Arrived';
        button.style.backgroundColor = 'green';
        button.nextElementSibling.style.display = 'none';
        playSound();

        setTimeout(() => {
            button.textContent = 'Call';
            button.style.backgroundColor = 'green';
            ico.style.fill = 'black';

            this.position = targetFloor;
            this.callQueue.shift();
            this.moving = false;
            this.processQueue();
        }, 2000);
    }
}

const elevator1 = new Elevator(1, 0);
const elevator2 = new Elevator(2, 0);
const elevator3 = new Elevator(3, 0);
const elevator4 = new Elevator(4, 0);
const elevator5 = new Elevator(5, 0);

const elevators = [elevator1, elevator2, elevator3, elevator4, elevator5];

document.querySelectorAll('.call-button').forEach(button => {
    button.addEventListener('click', function () {
        const floor = parseInt(this.parentElement.dataset.floor, 10);
        this.style.backgroundColor = 'red';
        this.textContent = 'Waiting';

        callElevator(floor, this);
    });
});

function callElevator(floor, button) {
    const emptyQueueElevators = elevators.filter(elevator => elevator.callQueue.length === 0);
    let nearestElevator;

    if (emptyQueueElevators.length > 0) {
        nearestElevator = findNearestElevator(emptyQueueElevators, floor);
    } else {
        nearestElevator = findNearestElevator(elevators, floor);
    }
    nearestElevator.addToQueue(floor, button);
}

function findNearestElevator(elevators, floor) {
    return elevators.reduce((minElevator, elevator) => {
        const timeToFloor = elevator.calculateMovementTime(elevator.position, floor);

        if (timeToFloor < minElevator.calculateMovementTime(minElevator.position, floor)) {
            return elevator
        } else {
            return minElevator
        }
    });
}

function playSound() {
    const audio = new Audio('elevator-ding.mp3');
    audio.play();
}
